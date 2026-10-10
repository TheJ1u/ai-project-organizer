/* Local, rule-based recommendations. No source code or credentials leave this PC. */
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const http = require('node:http');
const crypto = require('node:crypto');
const { execFileSync } = require('node:child_process');

const norm = p => path.resolve(p).toLowerCase();
const hash = s => crypto.createHash('sha256').update(s).digest('hex').slice(0, 20);
const excluded = new Set(['node_modules', 'vendor', 'dist', 'build', '.git', '.venv', 'venv', 'data']);
const relevant = f => !/(^|[/\\])(\.env|credentials|secrets?)([./\\]|$)/i.test(f) &&
  !/^data[/\\](db\.json($|\.)|codex-sync-last-run\.json|codex-preview\.)/i.test(f);
function git(dir, args) {
  return execFileSync('git', ['-c', 'core.quotepath=false', '-C', dir, ...args], {
    encoding: 'utf8', timeout: 15000, maxBuffer: 4 * 1024 * 1024,
    windowsHide: true, stdio: ['ignore', 'pipe', 'pipe']
  }).trimEnd();
}
function discover(root, days = 30) {
  const repos = [], cutoff = Date.now() - days * 86400000;
  function walk(dir, depth) {
    if (fs.existsSync(path.join(dir, '.git'))) {
      try {
        let epoch = 0, revision = 'unborn', changed = [];
        if (git(dir, ['rev-parse', '--verify', '--quiet', 'HEAD']).length) {
          epoch = Number(git(dir, ['log', '-1', '--format=%ct'])) * 1000;
          revision = git(dir, ['rev-parse', 'HEAD']);
          changed = git(dir, ['log', '-5', '--format=', '--name-only']).split('\n').filter(Boolean);
        }
        inspect(epoch, revision, changed);
      } catch (e) {
        // A new repository can have no HEAD; other Git failures must remain visible.
        try {
          if (git(dir, ['rev-parse', '--is-inside-work-tree']) === 'true' &&
              !fs.existsSync(path.join(dir, '.git', 'refs', 'heads', 'main'))) {
            git(dir, ['symbolic-ref', 'HEAD']);
            let count = git(dir, ['rev-list', '--all', '--count']);
            if (Number(count) === 0) { inspect(0, 'unborn', []); return; }
          }
        } catch (_) { /* reported below */ }
        console.error(`Skipped unreadable repository ${dir}: ${e.message.split('\n')[0]}`);
      }
      function inspect(epoch, revision, changed) {
        const dirty = git(dir, ['status', '--porcelain', '--untracked-files=normal']);
        const dirtyFiles = dirty.split('\n').filter(Boolean).map(s => s.slice(3)).filter(relevant);
        const recentDirty = dirtyFiles.some(f => {
          try { return fs.statSync(path.join(dir, f.replace(/^"|"$/g, ''))).mtimeMs >= cutoff; }
          catch (_) { return epoch >= cutoff; }
        });
        if (epoch < cutoff && !recentDirty) return;
        const files = git(dir, ['ls-files', '--cached', '--others', '--exclude-standard']).split('\n').filter(Boolean).filter(relevant);
        repos.push({ name: path.basename(dir), directory: dir, revision, files,
          changed: [...new Set([...dirtyFiles, ...changed])].filter(relevant).slice(0, 12) });
      }
      return;
    }
    if (depth >= 4) return;
    for (const item of fs.readdirSync(dir, { withFileTypes: true })) {
      if (item.isDirectory() && !item.isSymbolicLink() && !item.name.startsWith('.') && !excluded.has(item.name)) {
        walk(path.join(dir, item.name), depth + 1);
      }
    }
  }
  walk(root, 0);
  return repos;
}
function recommend(repo, projectId) {
  const files = repo.files.join('\n');
  const evidence = `Review scope: ${repo.changed.length ? repo.changed.slice(0, 6).join(', ') : 'current tracked project files'}. Git revision: ${repo.revision.slice(0, 12)}. `;
  const choices = [];
  const add = (key, title, description) => choices.push({ projectId, title,
    description: `${evidence}${description}\n[omniai-codex:${hash(norm(repo.directory) + ':' + key)}] Rule-based recommendation; verify the gap before changing code.`,
    assignedAi: 'chatgpt', status: 'todo', priority: 'medium' });
  if (/(api|routes?|server|schema)/i.test(repo.changed.join('\n') || files)) {
    add('api-contract', `Validate API contracts for ${repo.name}`, 'Deliver a request/response checklist for the changed endpoints, including required fields, malformed input, missing records, and error responses. Acceptance: document expected status codes and add or identify passing regression checks. Purpose: prevent client integration failures.');
  }
  if (/(public\/|src\/.*\.(tsx|jsx|vue)|pages\/|components\/|index\.html)/i.test(files)) {
    add('onboarding', `Review first-use flow in ${repo.name}`, 'Deliver a first-use walkthrough and proposed copy for empty, loading, success, and error states. Acceptance: a new user can identify the next action; check keyboard access, form labels, and visible focus. Purpose: reduce onboarding friction and support requests.');
  }
  if (!/(^|\n)readme(\.[^\n]+)?($|\n)/i.test(files) || choices.length < 2) {
    add('setup-docs', `Verify setup instructions for ${repo.name}`, 'Deliver verified prerequisites, setup commands, configuration variable names with placeholder values, and one smoke-test command. Acceptance: complete the documented path in a clean environment and record any blocked steps. Purpose: reduce setup time and reliance on the original author.');
  }
  add('regression', `Define regression checks for ${repo.name}`, `Deliver a focused test checklist for the recent files, covering one normal case, one boundary case, and one failure case. ${/(test|spec)/i.test(files) ? 'Map checks to the existing test suite.' : 'Identify the smallest practical test harness.'} Acceptance: record commands, observed results, and remaining gaps; do not claim tests passed without running them. Purpose: catch regressions before release.`);
  return choices.slice(0, 3);
}
function request(base, method, route, body) {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : undefined;
    const req = http.request(new URL(route, base), { method, headers: data ? {
      'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data)
    } : {} }, res => {
      let text = '';
      res.setEncoding('utf8');
      res.on('data', c => { text += c; if (text.length > 16 * 1024 * 1024) req.destroy(new Error('Response too large')); });
      res.on('end', () => {
        if (res.statusCode < 200 || res.statusCode >= 300) return reject(new Error(`HTTP ${res.statusCode} ${route}`));
        try { resolve(JSON.parse(text)); } catch (_) { reject(new Error('Invalid API JSON')); }
      });
      res.on('error', reject);
    });
    req.setTimeout(5000, () => req.destroy(new Error('API timeout; refusing unsafe fallback')));
    req.on('error', reject);
    req.end(data);
  });
}
const refused = e => e.code === 'ECONNREFUSED' ||
  (Array.isArray(e.errors) && e.errors.length > 0 && e.errors.every(refused));
function validate(db) {
  if (!db || !Array.isArray(db.projects) || !Array.isArray(db.tasks)) throw new Error('Invalid DB schema; no changes made');
  for (const type of ['projects', 'tasks']) {
    const ids = new Set();
    for (const item of db[type]) {
      if (!item || typeof item.id !== 'string' || ids.has(item.id)) throw new Error(`Invalid or duplicate ${type} ID`);
      ids.add(item.id);
    }
  }
  return db;
}
function newProject(repo) {
  const now = new Date().toISOString();
  return { id: `proj_codex_${hash(norm(repo.directory))}`, name: repo.name, directory: repo.directory,
    description: 'Discovered active local Git repository.', status: 'in_progress', priority: 'medium',
    category: 'Software Development', aiRoles: { chatgpt: 'Product, documentation, and validation' }, createdAt: now, updatedAt: now };
}
function duplicate(tasks, candidate) {
  const marker = candidate.description.match(/\[omniai-codex:[^\]]+\]/)[0];
  return tasks.some(t => t.projectId === candidate.projectId && t.assignedAi === 'chatgpt' &&
    (t.title === candidate.title || (t.description || '').includes(marker)));
}
async function sync(options = {}) {
  const root = options.root || path.join(os.homedir(), 'Projects');
  const dbFile = options.dbFile || path.join(__dirname, '..', 'data', 'db.json');
  const base = options.base || 'http://localhost:3456';
  const url = new URL(base);
  if (url.protocol !== 'http:' || !['localhost', '127.0.0.1', '[::1]'].includes(url.hostname)) throw new Error('Only local HTTP endpoints are allowed');
  const lock = dbFile + '.codex-sync.lock';
  let fd;
  try { fd = fs.openSync(lock, 'wx'); }
  catch (e) { if (e.code === 'EEXIST') throw new Error(`Another sync is running or a stale lock needs inspection: ${lock}`); throw e; }
  fs.writeFileSync(fd, `${process.pid}\n`);
  try {
    const repos = options.repos || discover(root, options.days || 30);
    let db, original, offline = false;
    try {
      db = validate({ projects: await request(base, 'GET', '/api/projects'), tasks: await request(base, 'GET', '/api/tasks') });
    } catch (e) {
      if (!refused(e)) throw e;
      offline = true;
      original = fs.readFileSync(dbFile, 'utf8');
      db = validate(JSON.parse(original.replace(/^\uFEFF/, '')));
    }
    const report = { mode: offline ? 'file' : 'api', activeRepositories: repos.length, projectsAdded: 0, tasksAdded: 0, tasks: [] };
    for (const repo of repos) {
      let project = db.projects.find(p => p.directory && norm(p.directory) === norm(repo.directory));
      if (!project) project = db.projects.find(p => !p.directory && p.name.toLowerCase() === repo.name.toLowerCase());
      if (project && ['completed', 'archived', 'paused', 'on_hold'].includes(project.status)) continue;
      if (!project) {
        project = newProject(repo);
        if (!offline && !options.dryRun) project = await request(base, 'POST', '/api/projects', project);
        if (!project.id) throw new Error('Project API returned no ID');
        db.projects.push(project);
        report.projectsAdded++;
      }
      for (const candidate of recommend(repo, project.id)) {
        if (duplicate(db.tasks, candidate)) continue;
        const now = new Date().toISOString();
        let record = { ...candidate, id: `task_codex_${crypto.randomUUID()}`, createdAt: now, updatedAt: now };
        if (!offline && !options.dryRun) {
          // The existing API uses millisecond IDs. Space this worker's writes.
          await new Promise(r => setTimeout(r, 5));
          record = await request(base, 'POST', '/api/tasks', candidate);
          if (!record.id) throw new Error('Task API returned no ID');
        }
        db.tasks.push(record);
        report.tasksAdded++;
        report.tasks.push({ project: repo.name, title: record.title });
      }
    }
    if (!options.dryRun && offline && (report.projectsAdded || report.tasksAdded)) {
      // Never fall back on timeouts/HTTP errors or after an uncertain POST.
      try { await request(base, 'GET', '/api/tasks'); throw new Error('Server started; retry using API'); }
      catch (e) { if (!refused(e)) throw e; }
      validate(db);
      const tmp = dbFile + '.' + crypto.randomUUID() + '.tmp';
      try {
        const out = fs.openSync(tmp, 'wx');
        try { fs.writeFileSync(out, JSON.stringify(db, null, 2) + '\n'); fs.fsyncSync(out); }
        finally { fs.closeSync(out); }
        if (fs.readFileSync(dbFile, 'utf8') !== original) throw new Error('DB changed during sync; retry later');
        fs.copyFileSync(dbFile, dbFile + '.codex-backup-' + Date.now() + '.json', fs.constants.COPYFILE_EXCL);
        fs.renameSync(tmp, dbFile);
      } finally { if (fs.existsSync(tmp)) fs.unlinkSync(tmp); }
    }
    // The Hub API can return success even if its disk write fails. Verify persistence.
    if (!options.dryRun) {
      const persisted = validate(JSON.parse(fs.readFileSync(dbFile, 'utf8').replace(/^\uFEFF/, '')));
      for (const task of db.tasks.filter(t => (t.description || '').includes('[omniai-codex:'))) {
        if (!persisted.tasks.some(t => t.id === task.id && t.title === task.title && t.projectId === task.projectId)) throw new Error('Task persistence verification failed');
      }
    }
    return report;
  } finally { fs.closeSync(fd); fs.unlinkSync(lock); }
}
if (require.main === module) {
  const dryRun = process.argv.includes('--dry-run');
  sync({ dryRun }).then(report => {
    const result = { at: new Date().toISOString(), dryRun, ...report };
    console.log(JSON.stringify(result, null, 2));
    if (!dryRun) fs.writeFileSync(path.join(__dirname, '..', 'data', 'codex-sync-last-run.json'), JSON.stringify(result, null, 2));
  }).catch(e => { console.error(`Codex sync failed: ${e.message}`); process.exitCode = 1; });
}
module.exports = { discover, recommend, sync, validate };
