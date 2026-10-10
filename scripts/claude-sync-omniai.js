/**
 * OmniAI Hub - Claude Scheduled Sync Worker
 * 
 * Runs daily at 7:15 AM via Windows Task Scheduler ('OmniAI-Claude-Sync').
 * Inspects active repositories and Claude Code workspaces, formulates high-priority
 * architecture and refactoring tasks, and synchronizes them into OmniAI Hub.
 */

const fs = require('fs');
const path = require('path');
const os = require('os');
const { execSync } = require('child_process');
const http = require('http');

const USER_HOME = os.homedir();
const DB_FILE = process.env.DB_FILE || path.join(__dirname, '..', 'data', 'db.json');
const SERVER_PORT = process.env.PORT || 3456;

console.log('🤖 Starting OmniAI Hub — Claude Scheduled Task Sync Worker...');

// 1. Discover Projects
const projectsDir = path.join(USER_HOME, 'Projects');
const claudeBase = path.join(USER_HOME, '.claude', 'projects');

const activeProjects = [];

if (fs.existsSync(projectsDir)) {
  try {
    const items = fs.readdirSync(projectsDir, { withFileTypes: true });
    for (const item of items) {
      if (item.isDirectory() && !item.name.startsWith('.')) {
        const fullPath = path.join(projectsDir, item.name);
        const isGit = fs.existsSync(path.join(fullPath, '.git'));
        let latestCommit = '';
        if (isGit) {
          try {
            latestCommit = execSync('git log -1 --oneline', {
              cwd: fullPath,
              encoding: 'utf8',
              stdio: ['ignore', 'pipe', 'ignore']
            }).trim();
          } catch (e) {}
        }
        activeProjects.push({
          name: item.name,
          directory: fullPath,
          latestCommit,
          isGit
        });
      }
    }
  } catch (e) {}
}

console.log(`🔍 Discovered ${activeProjects.length} candidate projects on disk.`);

// 2. Read local db
let db = { projects: [], tasks: [], quickNotes: [], sessions: [] };
if (fs.existsSync(DB_FILE)) {
  try {
    db = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
  } catch (e) {}
}

let tasksAdded = 0;

// 3. For each active project, ensure Claude architecture tasks exist
activeProjects.forEach(proj => {
  // Find matching project in DB
  let matchedProj = (db.projects || []).find(p => 
    p.name.toLowerCase() === proj.name.toLowerCase() || 
    (p.directory && p.directory.toLowerCase() === proj.directory.toLowerCase())
  );

  if (!matchedProj) {
    matchedProj = {
      id: `proj_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      name: proj.name,
      description: `Discovered local project at ${proj.directory}`,
      status: 'in_progress',
      priority: 'high',
      category: 'Software Development',
      directory: proj.directory,
      aiRoles: {
        claude: 'Core architecture, algorithm logic & deep code audits',
        chatgpt: 'Documentation, user flows & copy',
        antigravity: 'Autonomous test execution & file scaffolding',
        grok: 'Market intelligence & technical research'
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    if (!db.projects) db.projects = [];
    db.projects.push(matchedProj);
  }

  // Check if Claude already has pending tasks for this project
  const existingClaudeTasks = (db.tasks || []).filter(t => 
    t.projectId === matchedProj.id && 
    t.assignedAi === 'claude' && 
    (t.status === 'todo' || t.status === 'in_progress')
  );

  // If Claude has no pending tasks, add a grounded technical next step
  if (existingClaudeTasks.length === 0) {
    const sampleTaskTitle = proj.latestCommit 
      ? `Review and refine: ${proj.latestCommit.substring(0, 50)}`
      : `Code audit and modular architecture review for ${proj.name}`;

    const newTask = {
      id: `task_claude_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      projectId: matchedProj.id,
      title: sampleTaskTitle,
      description: `Analyze codebase structure, verify TypeScript/Python types, and eliminate technical debt in ${proj.directory}.`,
      assignedAi: 'claude',
      status: 'todo',
      priority: 'high',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    if (!db.tasks) db.tasks = [];
    db.tasks.push(newTask);
    tasksAdded++;
  }
});

// 4. Save updated database
try {
  fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf8');
  console.log(`✅ Synced Claude tasks. Added ${tasksAdded} new task(s). Total active projects: ${db.projects.length}.`);
} catch (e) {
  console.error('⚠️ Failed to save database:', e.message);
}

// 5. If server is active, ping dashboard to refresh
const req = http.get(`http://localhost:${SERVER_PORT}/api/dashboard`, (res) => {
  console.log(`⚡ Connected to live OmniAI Hub server (HTTP ${res.statusCode}). Cache warmed.`);
});
req.on('error', () => {
  console.log('ℹ️ OmniAI server is not running locally right now (updates saved directly to db.json).');
});
