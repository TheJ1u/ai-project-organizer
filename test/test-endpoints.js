const path = require('path');
const fs = require('fs');

const testDbPath = path.join(__dirname, 'test-db.json');
process.env.DB_FILE = testDbPath;
if (fs.existsSync(testDbPath)) {
  try { fs.unlinkSync(testDbPath); } catch (e) {}
}

const http = require('http');
const assert = require('assert');
const app = require('../server');

function request(server, method, path, body = null) {
  return new Promise((resolve, reject) => {
    const addr = server.address();
    const options = {
      hostname: '127.0.0.1',
      port: addr.port,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        let json = null;
        try {
          json = JSON.parse(data);
        } catch (e) {
          json = null;
        }
        resolve({
          status: res.statusCode,
          headers: res.headers,
          data,
          json
        });
      });
    });

    req.on('error', reject);

    if (body) {
      req.write(typeof body === 'string' ? body : JSON.stringify(body));
    }
    req.end();
  });
}

async function runTests() {
  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const port = server.address().port;
  console.log(`\n🧪 Test server running on ephemeral port ${port}...\n`);

  try {
    // 1. Static Files
    console.log('1. Testing Static Assets:');
    const indexRes = await request(server, 'GET', '/');
    assert.strictEqual(indexRes.status, 200, 'GET / should return 200');
    assert(indexRes.data.includes('OmniAI Hub'), 'index.html should include OmniAI Hub');
    console.log('   ✓ GET / (index.html) -> 200 OK');

    const cssRes = await request(server, 'GET', '/styles.css');
    assert.strictEqual(cssRes.status, 200, 'GET /styles.css should return 200');
    assert(cssRes.headers['content-type'].includes('text/css'), 'styles.css should have text/css content type');
    console.log('   ✓ GET /styles.css -> 200 OK');

    const jsRes = await request(server, 'GET', '/app.js');
    assert.strictEqual(jsRes.status, 200, 'GET /app.js should return 200');
    assert(jsRes.headers['content-type'].includes('javascript'), 'app.js should have javascript content type');
    console.log('   ✓ GET /app.js -> 200 OK');

    // 2. Dashboard API
    console.log('\n2. Testing Dashboard API:');
    const dashRes = await request(server, 'GET', '/api/dashboard');
    assert.strictEqual(dashRes.status, 200, 'GET /api/dashboard should return 200');
    assert(dashRes.json.metrics, 'Dashboard should have metrics');
    assert(dashRes.json.aiStats, 'Dashboard should have aiStats');
    assert(Array.isArray(dashRes.json.inFlightTasks), 'Dashboard should have inFlightTasks');
    console.log(`   ✓ GET /api/dashboard -> 200 OK (Projects: ${dashRes.json.metrics.totalProjects}, Tasks: ${dashRes.json.metrics.totalTasks})`);
    console.log(`     AI Stats: Claude: ${dashRes.json.aiStats.claude.total}, ChatGPT: ${dashRes.json.aiStats.chatgpt.total}, Antigravity: ${dashRes.json.aiStats.antigravity.total}, Grok: ${dashRes.json.aiStats.grok.total}`);

    // 3. Projects API
    console.log('\n3. Testing Projects API:');
    const projRes = await request(server, 'GET', '/api/projects');
    assert.strictEqual(projRes.status, 200, 'GET /api/projects should return 200');
    assert(Array.isArray(projRes.json), 'Projects should be an array');
    console.log(`   ✓ GET /api/projects -> 200 OK (${projRes.json.length} projects retrieved)`);

    const createProj = await request(server, 'POST', '/api/projects', {
      name: 'Automated Test Project',
      description: 'Temporary project created for automated verification',
      category: 'Testing',
      status: 'in_progress',
      priority: 'high',
      aiRoles: {
        claude: 'Unit test verifier',
        antigravity: 'Automated runner'
      }
    });
    assert.strictEqual(createProj.status, 201, 'POST /api/projects should return 201');
    const testProjId = createProj.json.id;
    console.log(`   ✓ POST /api/projects -> 201 Created (ID: ${testProjId})`);

    const updateProj = await request(server, 'PUT', `/api/projects/${testProjId}`, {
      priority: 'urgent',
      description: 'Updated test description'
    });
    assert.strictEqual(updateProj.status, 200, 'PUT /api/projects/:id should return 200');
    assert.strictEqual(updateProj.json.priority, 'urgent');
    console.log('   ✓ PUT /api/projects/:id -> 200 OK (Updated priority)');

    // 4. Tasks API
    console.log('\n4. Testing Tasks API:');
    const tasksRes = await request(server, 'GET', '/api/tasks');
    assert.strictEqual(tasksRes.status, 200, 'GET /api/tasks should return 200');
    assert(Array.isArray(tasksRes.json), 'Tasks should be an array');
    console.log(`   ✓ GET /api/tasks -> 200 OK (${tasksRes.json.length} tasks)`);

    const filterTasks = await request(server, 'GET', '/api/tasks?ai=claude');
    assert.strictEqual(filterTasks.status, 200);
    assert(filterTasks.json.every(t => t.assignedAi === 'claude'));
    console.log(`   ✓ GET /api/tasks?ai=claude -> 200 OK (${filterTasks.json.length} Claude tasks)`);

    const createTask = await request(server, 'POST', '/api/tasks', {
      projectId: testProjId,
      title: 'Run end-to-end integration verification',
      description: 'Verify all backend routes and UI assets',
      assignedAi: 'antigravity',
      status: 'in_progress',
      priority: 'urgent'
    });
    assert.strictEqual(createTask.status, 201, 'POST /api/tasks should return 201');
    const testTaskId = createTask.json.id;
    console.log(`   ✓ POST /api/tasks -> 201 Created (ID: ${testTaskId})`);

    const updateTask = await request(server, 'PUT', `/api/tasks/${testTaskId}`, {
      status: 'completed'
    });
    assert.strictEqual(updateTask.status, 200, 'PUT /api/tasks/:id should return 200');
    assert.strictEqual(updateTask.json.status, 'completed');
    console.log('   ✓ PUT /api/tasks/:id -> 200 OK (Status marked completed)');

    // 5. Cross-AI Handoff API
    console.log('\n5. Testing Cross-AI Handoff API:');
    const handoffRes = await request(server, 'POST', '/api/handoff', {
      projectId: testProjId,
      sourceAi: 'claude',
      targetAi: 'antigravity',
      specificInstruction: 'Execute full automated test run and output results.'
    });
    assert.strictEqual(handoffRes.status, 200, 'POST /api/handoff should return 200');
    assert(handoffRes.json.prompt.includes('PROJECT CONTEXT HANDOFF'), 'Handoff prompt should include header');
    assert(handoffRes.json.prompt.includes('Claude (Anthropic) ➔ Google Antigravity'), 'Handoff should show channel');
    assert(handoffRes.json.prompt.includes('Execute full automated test run'), 'Handoff prompt should include instruction');
    console.log('   ✓ POST /api/handoff -> 200 OK (Generated markdown context prompt)');

    // 6. Quick Capture API (Browser Bookmarklet target)
    console.log('\n6. Testing Quick Capture API:');
    const captureRes = await request(server, 'POST', '/api/capture', {
      title: 'Researching prompt caching techniques on Grok',
      url: 'https://grok.com/share/test1234',
      notes: 'Captured via bookmarklet test',
      projectId: testProjId
    });
    assert.strictEqual(captureRes.status, 201, 'POST /api/capture should return 201');
    assert.strictEqual(captureRes.json.session.ai, 'grok', 'Capture should auto-detect Grok AI from URL');
    console.log('   ✓ POST /api/capture -> 201 Created (Auto-detected AI: grok)');

    // 6b. Testing GET /capture popup endpoint (for browser bookmarklet)
    const popupRes = await request(server, 'GET', '/capture?url=https%3A%2F%2Fclaude.ai%2Fchat%2Ftest123&title=TestClaudeChat');
    assert.strictEqual(popupRes.status, 200, 'GET /capture should return 200');
    assert(popupRes.data.includes('Captured to OmniAI Hub'), 'Popup should render success page');
    assert(popupRes.data.includes('Claude (Anthropic)'), 'Popup should auto-detect Claude AI');
    console.log('   ✓ GET /capture (Bookmarklet Popup) -> 200 OK (Rendered confirmation HTML)');

    // 7. Local Disk Scanner API
    console.log('\n7. Testing Local Disk Scanner:');
    const scanRes = await request(server, 'GET', '/api/scan/local');
    assert.strictEqual(scanRes.status, 200, 'GET /api/scan/local should return 200');
    assert(scanRes.json.projectsDir, 'Scanner should identify projects directory');
    assert(Array.isArray(scanRes.json.foundProjects), 'Scanner should return foundProjects array');
    assert(Array.isArray(scanRes.json.claudeCodeProjects), 'Scanner should return claudeCodeProjects array');
    assert(Array.isArray(scanRes.json.antigravitySessions), 'Scanner should return antigravitySessions array');
    console.log(`   ✓ GET /api/scan/local -> 200 OK:`);
    console.log(`     - Found ${scanRes.json.foundProjects.length} Projects in ${scanRes.json.projectsDir}`);
    console.log(`     - Found ${scanRes.json.claudeCodeProjects.length} Claude Code workspaces`);
    console.log(`     - Found ${scanRes.json.antigravitySessions.length} Antigravity sessions`);

    // 8. Import Scanned Project
    console.log('\n8. Testing Scan Import:');
    const importRes = await request(server, 'POST', '/api/scan/import', {
      name: 'ImportedTestProject',
      directory: 'C:\\Users\\jordy\\Projects\\ImportedTestProject',
      category: 'Scanned Imports'
    });
    assert.strictEqual(importRes.status, 201, 'POST /api/scan/import should return 201');
    console.log(`   ✓ POST /api/scan/import -> 201 Created (ID: ${importRes.json.id})`);

    // Clean up imported test project
    await request(server, 'DELETE', `/api/projects/${importRes.json.id}`);

    // 9. Quick Notes API
    console.log('\n9. Testing Quick Notes API:');
    const noteRes = await request(server, 'POST', '/api/notes', {
      text: 'Morning test scratchpad note'
    });
    assert.strictEqual(noteRes.status, 201);
    const noteId = noteRes.json.id;
    console.log('   ✓ POST /api/notes -> 201 Created');

    const delNote = await request(server, 'DELETE', `/api/notes/${noteId}`);
    assert.strictEqual(delNote.status, 200);
    console.log('   ✓ DELETE /api/notes/:id -> 200 OK');

    // 10. Backup / Export API
    console.log('\n10. Testing Backup Export:');
    const exportRes = await request(server, 'GET', '/api/export');
    assert.strictEqual(exportRes.status, 200);
    assert(exportRes.headers['content-type'].includes('application/json'));
    assert(exportRes.json.projects && exportRes.json.tasks);
    console.log('   ✓ GET /api/export -> 200 OK (Full database backup JSON)');

    // 11. Cleanup test task & test project
    console.log('\n11. Cleaning Up Test Entities:');
    const delTask = await request(server, 'DELETE', `/api/tasks/${testTaskId}`);
    assert.strictEqual(delTask.status, 200);
    console.log(`   ✓ DELETE /api/tasks/${testTaskId} -> 200 OK`);

    const delProj = await request(server, 'DELETE', `/api/projects/${testProjId}`);
    assert.strictEqual(delProj.status, 200);
    console.log(`   ✓ DELETE /api/projects/${testProjId} -> 200 OK`);

    console.log('\n========================================');
    console.log('🎉 ALL INTEGRATION TESTS PASSED CLEANLY!');
    console.log('========================================\n');
  } finally {
    server.close();
    if (fs.existsSync(testDbPath)) {
      try { fs.unlinkSync(testDbPath); } catch (e) {}
    }
  }
}

runTests().catch(err => {
  console.error('\n❌ TEST FAILED:', err);
  process.exit(1);
});
