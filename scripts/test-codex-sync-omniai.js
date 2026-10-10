'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const http = require('node:http');
const { execFileSync } = require('node:child_process');
const { sync, discover, recommend } = require('./codex-sync-omniai');
function fixture(t) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'omniai-codex-test-'));
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
  const dbFile = path.join(dir, 'db.json');
  const db = { projects: [], tasks: [{ id: 'existing', title: 'Keep me', assignedAi: 'claude' }], notes: { keep: true } };
  fs.writeFileSync(dbFile, JSON.stringify(db));
  return { dir, dbFile, db, repos: [{ name: 'Example', directory: dir, revision: 'abc123', files: ['server.js', 'public/index.html'], changed: ['server.js'] }] };
}
async function serve(t, handler) {
  const server = http.createServer(handler);
  await new Promise(r => server.listen(0, '127.0.0.1', r));
  t.after(() => new Promise(r => server.close(r)));
  return `http://127.0.0.1:${server.address().port}`;
}
async function closedPort() {
  const server = http.createServer();
  await new Promise(r => server.listen(0, '127.0.0.1', r));
  const base = `http://127.0.0.1:${server.address().port}`;
  await new Promise(r => server.close(r));
  return base;
}
test('offline append preserves records, backs up, and deduplicates including completed tasks', async t => {
  const f = fixture(t), base = await closedPort();
  const first = await sync({ ...f, base });
  assert.equal(first.tasksAdded, 3);
  const db = JSON.parse(fs.readFileSync(f.dbFile));
  assert.deepEqual(db.notes, f.db.notes);
  assert.deepEqual(db.tasks[0], f.db.tasks[0]);
  db.tasks[1].status = 'completed';
  fs.writeFileSync(f.dbFile, JSON.stringify(db));
  assert.equal((await sync({ ...f, base })).tasksAdded, 0);
  assert.equal(fs.readdirSync(f.dir).filter(n => n.includes('backup')).length, 1);
});
test('invalid DB and existing lock leave file untouched', async t => {
  const f = fixture(t), base = await closedPort();
  fs.writeFileSync(f.dbFile, '{broken');
  await assert.rejects(sync({ ...f, base }));
  assert.equal(fs.readFileSync(f.dbFile, 'utf8'), '{broken');
  fs.writeFileSync(f.dbFile + '.codex-sync.lock', 'other process');
  await assert.rejects(sync({ ...f, base }), /lock/);
});
test('HTTP errors never trigger file fallback', async t => {
  const f = fixture(t), before = fs.readFileSync(f.dbFile, 'utf8');
  const base = await serve(t, (_, res) => { res.writeHead(500); res.end('{}'); });
  await assert.rejects(sync({ ...f, base }), /HTTP 500/);
  assert.equal(fs.readFileSync(f.dbFile, 'utf8'), before);
});
test('API creates projects and tasks and repeat run adds nothing', async t => {
  const f = fixture(t);
  let seq = 0;
  const base = await serve(t, (req, res) => {
    let body = '';
    req.on('data', c => body += c);
    req.on('end', () => {
      const db = JSON.parse(fs.readFileSync(f.dbFile));
      const collection = req.url.slice(5);
      if (req.method === 'GET') return res.end(JSON.stringify(db[collection]));
      const record = { ...JSON.parse(body), id: String(++seq) };
      db[collection].push(record);
      fs.writeFileSync(f.dbFile, JSON.stringify(db));
      res.writeHead(201); res.end(JSON.stringify(record));
    });
  });
  assert.equal((await sync({ ...f, base })).tasksAdded, 3);
  assert.equal((await sync({ ...f, base })).tasksAdded, 0);
});
test('dry run does not alter DB; paused project receives nothing', async t => {
  const f = fixture(t), base = await closedPort(), before = fs.readFileSync(f.dbFile, 'utf8');
  assert.equal((await sync({ ...f, base, dryRun: true })).tasksAdded, 3);
  assert.equal(fs.readFileSync(f.dbFile, 'utf8'), before);
  f.db.projects.push({ id: 'paused', directory: f.dir, status: 'paused' });
  fs.writeFileSync(f.dbFile, JSON.stringify(f.db));
  assert.equal((await sync({ ...f, base })).tasksAdded, 0);
});
test('discovers nested active Git repositories and produces actionable schema', t => {
  const f = fixture(t), repo = path.join(f.dir, 'group', 'repo');
  fs.mkdirSync(repo, { recursive: true });
  execFileSync('git', ['init', repo], { windowsHide: true, stdio: 'ignore' });
  fs.writeFileSync(path.join(repo, 'README.md'), 'Example');
  const found = discover(f.dir);
  assert.equal(found.length, 1);
  const tasks = recommend(found[0], 'p');
  assert.ok(tasks.length >= 2 && tasks.length <= 3);
  assert.ok(tasks.every(t => t.assignedAi === 'chatgpt' && t.description.includes('Acceptance:')));
});
