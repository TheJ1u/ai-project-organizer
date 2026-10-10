const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const os = require('os');
const { exec } = require('child_process');

const app = express();
const PORT = process.env.PORT || 3456;
const DATA_DIR = path.join(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');
const USER_HOME = os.homedir();

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Initial seed data
const initialDb = {
  projects: [
    {
      id: "proj_massmailer",
      name: "MassMailer",
      description: "High-volume email outreach automation system with SMTP rotation and deliverability tracking.",
      status: "in_progress",
      priority: "high",
      category: "Automation & Outreach",
      directory: "C:\\Users\\jordy\\Projects\\MassMailer",
      aiRoles: {
        claude: "Core TypeScript/Node architecture, queue workers & retry policies",
        chatgpt: "Cold outreach copy, A/B test email variants, follow-up sequences",
        antigravity: "Autonomous test runner, bulk test mocks & CLI tools",
        grok: "Inbox deliverability news, spam filter algo updates & blacklist research"
      },
      createdAt: "2026-10-08T18:00:00.000Z",
      updatedAt: "2026-10-09T20:30:00.000Z"
    },
    {
      id: "proj_aiforlife",
      name: "ai-for-life",
      description: "AI education platform & interactive portal helping students master generative tools.",
      status: "in_progress",
      priority: "high",
      category: "EdTech & Web",
      directory: "C:\\Users\\jordy\\Projects\\ai-for-life",
      aiRoles: {
        claude: "Interactive demo video player, student discount flows & frontend UI",
        chatgpt: "Curriculum design, quiz generation & beginner explainers",
        antigravity: "Codebase structuring, asset pipelines & deployment automation",
        grok: "Competitor course benchmarks, viral tech trends & community Q&A"
      },
      createdAt: "2026-10-07T14:00:00.000Z",
      updatedAt: "2026-10-09T13:14:00.000Z"
    },
    {
      id: "proj_tradingalgo",
      name: "Trading-ALGO",
      description: "Quantitative trading strategies, backtesting framework and market signal processors.",
      status: "active",
      priority: "urgent",
      category: "FinTech & Quant",
      directory: "C:\\Users\\jordy\\Projects\\Trading-ALGO",
      aiRoles: {
        claude: "Mathematical strategy formulation, indicator vectorization & code audit",
        chatgpt: "Strategy documentation, trading journal summaries & risk checklists",
        antigravity: "Fast execution engine, historical bar data ingestion & unit tests",
        grok: "Real-time market sentiment on X, macro breaking news & regulatory alerts"
      },
      createdAt: "2026-10-05T10:00:00.000Z",
      updatedAt: "2026-10-08T12:54:00.000Z"
    },
    {
      id: "proj_momswoodworking",
      name: "moms-woodworking-business",
      description: "E-commerce catalog and customer portal for artisanal handcrafted woodworking.",
      status: "active",
      priority: "medium",
      category: "E-Commerce",
      directory: "C:\\Users\\jordy\\Projects\\moms-woodworking-business",
      aiRoles: {
        claude: "Storefront UI components, shopping cart state & checkout logic",
        chatgpt: "Engaging product stories, dimensions descriptions & customer email templates",
        antigravity: "Image optimization scripts & catalog schema validations",
        grok: "Etsy trending wood finishes, holiday gift demand & local artisan pricing"
      },
      createdAt: "2026-10-08T19:00:00.000Z",
      updatedAt: "2026-10-09T21:27:00.000Z"
    },
    {
      id: "proj_landscout",
      name: "LandScout",
      description: "Automated real estate land finder with zoning verification and tax parcel scraping.",
      status: "planning",
      priority: "medium",
      category: "PropTech & Scraping",
      directory: "C:\\Users\\jordy\\Projects\\LandScout",
      aiRoles: {
        claude: "GIS mapping data pipelines, parcel boundaries & API integration",
        chatgpt: "Zoning summary generator & landowner outreach letter drafts",
        antigravity: "Scraper resilience, rate limit handling & SQLite caching",
        grok: "Municipal zoning law updates, commercial land demand & satellite analysis"
      },
      createdAt: "2026-09-29T15:00:00.000Z",
      updatedAt: "2026-10-08T16:00:00.000Z"
    }
  ],
  tasks: [
    {
      id: "task_1",
      projectId: "proj_massmailer",
      title: "Refactor SMTP queue worker retry mechanism",
      description: "Fix exponential backoff and connection timeout handling for high-concurrency sending.",
      assignedAi: "claude",
      status: "in_progress",
      priority: "high",
      createdAt: "2026-10-09T18:00:00.000Z",
      updatedAt: "2026-10-09T20:00:00.000Z"
    },
    {
      id: "task_2",
      projectId: "proj_massmailer",
      title: "Draft 5 personalized B2B cold outreach email templates",
      description: "Write compelling 3-step sequence focusing on deliverability pain points.",
      assignedAi: "chatgpt",
      status: "in_progress",
      priority: "medium",
      createdAt: "2026-10-09T19:00:00.000Z",
      updatedAt: "2026-10-09T21:00:00.000Z"
    },
    {
      id: "task_3",
      projectId: "proj_massmailer",
      title: "Implement autonomous CLI test mock harness",
      description: "Generate end-to-end sandbox runner to simulate 10,000 sent emails without hitting live endpoints.",
      assignedAi: "antigravity",
      status: "todo",
      priority: "high",
      createdAt: "2026-10-09T19:30:00.000Z",
      updatedAt: "2026-10-09T19:30:00.000Z"
    },
    {
      id: "task_4",
      projectId: "proj_massmailer",
      title: "Investigate October 2026 Gmail/Yahoo DMARC enforcement updates",
      description: "Check latest spam threshold rules and DKIM rotation requirements.",
      assignedAi: "grok",
      status: "completed",
      priority: "medium",
      createdAt: "2026-10-09T16:00:00.000Z",
      updatedAt: "2026-10-09T17:30:00.000Z"
    },
    {
      id: "task_5",
      projectId: "proj_aiforlife",
      title: "Finalize tour video & interactive preview embeds",
      description: "Polish responsive player container and interactive student code sandbox.",
      assignedAi: "claude",
      status: "review",
      priority: "high",
      createdAt: "2026-10-09T12:00:00.000Z",
      updatedAt: "2026-10-09T13:14:00.000Z"
    },
    {
      id: "task_6",
      projectId: "proj_aiforlife",
      title: "Create interactive module quiz questions for Antigravity & Claude Code",
      description: "Draft 15 scenario-based questions evaluating tool choices and multi-agent setup.",
      assignedAi: "chatgpt",
      status: "todo",
      priority: "medium",
      createdAt: "2026-10-09T14:00:00.000Z",
      updatedAt: "2026-10-09T14:00:00.000Z"
    },
    {
      id: "task_7",
      projectId: "proj_tradingalgo",
      title: "Optimize Mean Reversion vector calculations in NumPy",
      description: "Profile 5-minute bar calculations to reduce CPU bottleneck by 40%.",
      assignedAi: "claude",
      status: "in_progress",
      priority: "urgent",
      createdAt: "2026-10-09T17:00:00.000Z",
      updatedAt: "2026-10-09T20:15:00.000Z"
    },
    {
      id: "task_8",
      projectId: "proj_tradingalgo",
      title: "Build live test suite for broker order gateway",
      description: "Automate edge cases: partial fills, slippage safeguards, and killswitch trigger.",
      assignedAi: "antigravity",
      status: "in_progress",
      priority: "urgent",
      createdAt: "2026-10-09T18:30:00.000Z",
      updatedAt: "2026-10-09T21:10:00.000Z"
    },
    {
      id: "task_9",
      projectId: "proj_tradingalgo",
      title: "Scan crypto & tech stock sentiment trends on X (Twitter)",
      description: "Aggregate key ticker mentions ($NVDA, $BTC, $ETH) and highlight unusual spikes.",
      assignedAi: "grok",
      status: "todo",
      priority: "high",
      createdAt: "2026-10-09T20:00:00.000Z",
      updatedAt: "2026-10-09T20:00:00.000Z"
    },
    {
      id: "task_10",
      projectId: "proj_momswoodworking",
      title: "Write rich descriptions for walnut live-edge dining tables",
      description: "Focus on craftsmanship, dimensions, wood origins, and protective finish care.",
      assignedAi: "chatgpt",
      status: "todo",
      priority: "medium",
      createdAt: "2026-10-09T15:00:00.000Z",
      updatedAt: "2026-10-09T15:00:00.000Z"
    },
    {
      id: "task_11",
      projectId: "proj_momswoodworking",
      title: "Research top holiday search trends for custom wood gifts",
      description: "Identify high-converting keywords and popular price points on Etsy & Pinterest.",
      assignedAi: "grok",
      status: "review",
      priority: "medium",
      createdAt: "2026-10-09T16:00:00.000Z",
      updatedAt: "2026-10-09T19:30:00.000Z"
    }
  ],
  sessions: [
    {
      id: "sess_1",
      projectId: "proj_massmailer",
      title: "Queue Worker & SMTP Concurrency Refactor",
      ai: "claude",
      url: "https://claude.ai/code/session_01XiDHetDPp1L3TAw3VP1Rjd",
      notes: "Architected backoff retries and connection pool balancing.",
      createdAt: "2026-10-09T18:00:00.000Z"
    },
    {
      id: "sess_2",
      projectId: "proj_massmailer",
      title: "Outreach Copy & Cold Sequence Ideation",
      ai: "chatgpt",
      url: "https://chatgpt.com/c/66fb9c00-2d88-8005-9a80-bfd8b8772a91",
      notes: "Generated 3 variants of pitch email for SaaS founders.",
      createdAt: "2026-10-09T19:00:00.000Z"
    },
    {
      id: "sess_3",
      projectId: "proj_tradingalgo",
      title: "Real-time Order Execution & Risk Engine",
      ai: "antigravity",
      url: "local://antigravity/session/120f4050-6f6d-43e3-8cc5-d4cc4e070268",
      notes: "Antigravity agent executing local code improvements and unit tests.",
      createdAt: "2026-10-09T21:00:00.000Z"
    },
    {
      id: "sess_4",
      projectId: "proj_tradingalgo",
      title: "Grok Market Pulse & Sentiment Analysis",
      ai: "grok",
      url: "https://grok.com/share/b81f9a2b",
      notes: "Queried Grok DeepSearch for overnight geopolitical risk factors.",
      createdAt: "2026-10-09T20:00:00.000Z"
    }
  ],
  quickNotes: [
    {
      id: "note_1",
      text: "Morning routine: Check Grok sentiment scan -> Review Claude code PRs -> Let Antigravity run test suites -> Use ChatGPT for customer replies.",
      createdAt: "2026-10-09T21:00:00.000Z"
    }
  ]
};

// Database helper functions
function readDb() {
  try {
    if (!fs.existsSync(DB_FILE)) {
      fs.writeFileSync(DB_FILE, JSON.stringify(initialDb, null, 2), 'utf8');
      return JSON.parse(JSON.stringify(initialDb));
    }
    const data = fs.readFileSync(DB_FILE, 'utf8');
    const parsed = JSON.parse(data);
    if (!parsed.projects) parsed.projects = [];
    if (!parsed.tasks) parsed.tasks = [];
    if (!parsed.sessions) parsed.sessions = [];
    if (!parsed.quickNotes) parsed.quickNotes = [];
    return parsed;
  } catch (err) {
    console.error('Error reading DB:', err);
    return JSON.parse(JSON.stringify(initialDb));
  }
}

function writeDb(data) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (err) {
    console.error('Error writing DB:', err);
    return false;
  }
}

// ------------------- API ROUTES -------------------

// Morning Briefing / Dashboard Summary
app.get('/api/dashboard', (req, res) => {
  const db = readDb();
  const projects = db.projects || [];
  const tasks = db.tasks || [];
  const sessions = db.sessions || [];

  // Count tasks by AI and status
  const aiStats = {
    claude: { total: 0, in_progress: 0, todo: 0, review: 0, completed: 0 },
    chatgpt: { total: 0, in_progress: 0, todo: 0, review: 0, completed: 0 },
    antigravity: { total: 0, in_progress: 0, todo: 0, review: 0, completed: 0 },
    grok: { total: 0, in_progress: 0, todo: 0, review: 0, completed: 0 },
    human: { total: 0, in_progress: 0, todo: 0, review: 0, completed: 0 }
  };

  tasks.forEach(t => {
    const ai = t.assignedAi || 'claude';
    if (!aiStats[ai]) {
      aiStats[ai] = { total: 0, in_progress: 0, todo: 0, review: 0, completed: 0 };
    }
    aiStats[ai].total++;
    if (aiStats[ai][t.status] !== undefined) {
      aiStats[ai][t.status]++;
    }
  });

  // Active in-flight operations (tasks in_progress or review)
  const inFlightTasks = tasks.filter(t => t.status === 'in_progress' || t.status === 'review');

  res.json({
    date: new Date().toISOString(),
    metrics: {
      totalProjects: projects.length,
      activeProjects: projects.filter(p => p.status === 'in_progress' || p.status === 'active').length,
      totalTasks: tasks.length,
      inFlightTasksCount: inFlightTasks.length,
      completedTasksCount: tasks.filter(t => t.status === 'completed').length,
      totalSessions: sessions.length
    },
    aiStats,
    inFlightTasks: inFlightTasks.map(t => {
      const proj = projects.find(p => p.id === t.projectId);
      return {
        ...t,
        projectName: proj ? proj.name : 'Unknown Project'
      };
    }),
    recentSessions: sessions.slice(-5).reverse(),
    quickNotes: db.quickNotes || []
  });
});

// Projects CRUD
app.get('/api/projects', (req, res) => {
  const db = readDb();
  const tasks = db.tasks || [];
  const sessions = db.sessions || [];

  const enhancedProjects = (db.projects || []).map(p => {
    const projTasks = tasks.filter(t => t.projectId === p.id);
    const projSessions = sessions.filter(s => s.projectId === p.id);
    return {
      ...p,
      tasksCount: projTasks.length,
      completedTasksCount: projTasks.filter(t => t.status === 'completed').length,
      inProgressTasksCount: projTasks.filter(t => t.status === 'in_progress').length,
      sessionsCount: projSessions.length,
      tasks: projTasks,
      sessions: projSessions
    };
  });

  res.json(enhancedProjects);
});

app.post('/api/projects', (req, res) => {
  const db = readDb();
  const newProj = {
    id: `proj_${Date.now()}`,
    name: req.body.name || 'Untitled Project',
    description: req.body.description || '',
    status: req.body.status || 'in_progress',
    priority: req.body.priority || 'medium',
    category: req.body.category || 'General',
    directory: req.body.directory || '',
    aiRoles: req.body.aiRoles || {
      claude: '',
      chatgpt: '',
      antigravity: '',
      grok: ''
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  db.projects.unshift(newProj);
  writeDb(db);
  res.status(201).json(newProj);
});

app.put('/api/projects/:id', (req, res) => {
  const db = readDb();
  const index = db.projects.findIndex(p => p.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Project not found' });

  db.projects[index] = {
    ...db.projects[index],
    ...req.body,
    updatedAt: new Date().toISOString()
  };

  writeDb(db);
  res.json(db.projects[index]);
});

app.delete('/api/projects/:id', (req, res) => {
  const db = readDb();
  db.projects = db.projects.filter(p => p.id !== req.params.id);
  // Also clean up linked tasks and sessions
  db.tasks = db.tasks.filter(t => t.projectId !== req.params.id);
  db.sessions = db.sessions.filter(s => s.projectId !== req.params.id);
  writeDb(db);
  res.json({ success: true, id: req.params.id });
});

// Tasks CRUD
app.get('/api/tasks', (req, res) => {
  const db = readDb();
  let tasks = db.tasks || [];
  const { ai, status, projectId } = req.query;

  if (ai) tasks = tasks.filter(t => t.assignedAi === ai);
  if (status) tasks = tasks.filter(t => t.status === status);
  if (projectId) tasks = tasks.filter(t => t.projectId === projectId);

  const projects = db.projects || [];
  const enhancedTasks = tasks.map(t => {
    const proj = projects.find(p => p.id === t.projectId);
    return {
      ...t,
      projectName: proj ? proj.name : 'Unknown Project'
    };
  });

  res.json(enhancedTasks);
});

app.post('/api/tasks', (req, res) => {
  const db = readDb();
  const newTask = {
    id: `task_${Date.now()}`,
    projectId: req.body.projectId,
    title: req.body.title || 'New Task',
    description: req.body.description || '',
    assignedAi: req.body.assignedAi || 'claude',
    status: req.body.status || 'todo',
    priority: req.body.priority || 'medium',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  db.tasks.push(newTask);
  writeDb(db);
  res.status(201).json(newTask);
});

app.put('/api/tasks/:id', (req, res) => {
  const db = readDb();
  const index = db.tasks.findIndex(t => t.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Task not found' });

  db.tasks[index] = {
    ...db.tasks[index],
    ...req.body,
    updatedAt: new Date().toISOString()
  };

  writeDb(db);
  res.json(db.tasks[index]);
});

app.delete('/api/tasks/:id', (req, res) => {
  const db = readDb();
  db.tasks = db.tasks.filter(t => t.id !== req.params.id);
  writeDb(db);
  res.json({ success: true, id: req.params.id });
});

// Sessions CRUD (linked threads)
app.get('/api/sessions', (req, res) => {
  const db = readDb();
  res.json(db.sessions || []);
});

app.post('/api/sessions', (req, res) => {
  const db = readDb();
  const newSession = {
    id: `sess_${Date.now()}`,
    projectId: req.body.projectId,
    title: req.body.title || 'Untitled Session',
    ai: req.body.ai || 'claude',
    url: req.body.url || '',
    notes: req.body.notes || '',
    createdAt: new Date().toISOString()
  };

  db.sessions.push(newSession);
  writeDb(db);
  res.status(201).json(newSession);
});

app.delete('/api/sessions/:id', (req, res) => {
  const db = readDb();
  db.sessions = db.sessions.filter(s => s.id !== req.params.id);
  writeDb(db);
  res.json({ success: true, id: req.params.id });
});

// Quick Notes CRUD
app.post('/api/notes', (req, res) => {
  const db = readDb();
  const note = {
    id: `note_${Date.now()}`,
    text: req.body.text || '',
    createdAt: new Date().toISOString()
  };
  if (!db.quickNotes) db.quickNotes = [];
  db.quickNotes.unshift(note);
  writeDb(db);
  res.status(201).json(note);
});

app.delete('/api/notes/:id', (req, res) => {
  const db = readDb();
  if (db.quickNotes) {
    db.quickNotes = db.quickNotes.filter(n => n.id !== req.params.id);
    writeDb(db);
  }
  res.json({ success: true, id: req.params.id });
});

// ------------------- CROSS-AI CONTEXT HANDOFF -------------------
app.post('/api/handoff', (req, res) => {
  const { projectId, sourceAi, targetAi, specificInstruction } = req.body;
  const db = readDb();
  const project = (db.projects || []).find(p => p.id === projectId);

  if (!project) {
    return res.status(404).json({ error: 'Project not found' });
  }

  const projTasks = (db.tasks || []).filter(t => t.projectId === projectId);
  const projSessions = (db.sessions || []).filter(s => s.projectId === projectId);

  const completed = projTasks.filter(t => t.status === 'completed');
  const inProgress = projTasks.filter(t => t.status === 'in_progress');
  const todo = projTasks.filter(t => t.status === 'todo');

  const sourceName = formatAiName(sourceAi);
  const targetName = formatAiName(targetAi);

  const prompt = `### 🚀 PROJECT CONTEXT HANDOFF: ${project.name}
**Handoff Channel:** ${sourceName} ➔ ${targetName}
**Project Status:** ${project.status.toUpperCase()} | **Priority:** ${project.priority.toUpperCase()}
**Working Directory:** \`${project.directory || 'Not specified'}\`

---

#### 🎯 Executive Summary & Objective
${project.description || 'No description provided.'}

#### 👥 AI Team Role Assignments
- **Claude:** ${project.aiRoles?.claude || 'Architecture, code refinement & deep logic'}
- **ChatGPT:** ${project.aiRoles?.chatgpt || 'Copywriting, customer communication & documentation'}
- **Google Antigravity:** ${project.aiRoles?.antigravity || 'Autonomous coding, test runner & directory operations'}
- **Grok:** ${project.aiRoles?.grok || 'Live web research, market pulse & reality checks'}

---

#### ✅ What Has Been Accomplished So Far
${completed.length > 0 ? completed.map(t => `- [x] **${t.title}** (${formatAiName(t.assignedAi)}): ${t.description}`).join('\n') : '- No tasks marked completed yet.'}

#### 🔄 In-Flight Work
${inProgress.length > 0 ? inProgress.map(t => `- [ ] **${t.title}** (${formatAiName(t.assignedAi)}): ${t.description}`).join('\n') : '- No active tasks currently in progress.'}

#### 📋 Queued Backlog
${todo.length > 0 ? todo.slice(0, 5).map(t => `- ⏳ **${t.title}** (${formatAiName(t.assignedAi)})`).join('\n') : '- Backlog is clear.'}

---

#### ⚡ YOUR IMMEDIATE TASK AS ${targetName.toUpperCase()}:
${specificInstruction || project.aiRoles?.[targetAi] || `Review the project context above and proceed with the highest priority items assigned to you.`}

${projSessions.length > 0 ? `\n#### 🔗 Linked AI Thread References:\n` + projSessions.map(s => `- [${formatAiName(s.ai)}] ${s.title}: ${s.url}`).join('\n') : ''}
`;

  res.json({
    project: project.name,
    sourceAi,
    targetAi,
    prompt
  });
});

function formatAiName(ai) {
  switch (ai) {
    case 'claude': return 'Claude (Anthropic)';
    case 'chatgpt': return 'ChatGPT (OpenAI)';
    case 'antigravity': return 'Google Antigravity';
    case 'grok': return 'Grok (xAI)';
    case 'human': return 'Human / You';
    default: return ai || 'AI';
  }
}

// ------------------- QUICK CAPTURE API -------------------
// Called by browser bookmarklet or frontend
app.post('/api/capture', (req, res) => {
  const { title, url, notes, projectId, ai: rawAi } = req.body;
  const db = readDb();

  // Auto-detect AI platform from URL if not specified
  let detectedAi = rawAi || 'claude';
  if (url) {
    const low = url.toLowerCase();
    if (low.includes('claude.ai')) detectedAi = 'claude';
    else if (low.includes('chatgpt.com') || low.includes('openai.com')) detectedAi = 'chatgpt';
    else if (low.includes('grok.com') || low.includes('x.com/i/grok')) detectedAi = 'grok';
    else if (low.includes('gemini.google.com') || low.includes('antigravity')) detectedAi = 'antigravity';
  }

  // Find or default project
  let targetProjectId = projectId;
  if (!targetProjectId && db.projects.length > 0) {
    targetProjectId = db.projects[0].id; // default to first project
  }

  const session = {
    id: `sess_${Date.now()}`,
    projectId: targetProjectId,
    title: title || `Chat on ${formatAiName(detectedAi)}`,
    ai: detectedAi,
    url: url || '',
    notes: notes || 'Captured from browser',
    createdAt: new Date().toISOString()
  };

  db.sessions.push(session);
  writeDb(db);

  res.status(201).json({
    success: true,
    message: 'Captured successfully',
    session
  });
});

// ------------------- LOCAL DISK SCANNER -------------------
// Scans ~/Projects, Claude Code projects, and Google Antigravity sessions
app.get('/api/scan/local', (req, res) => {
  const db = readDb();
  const existingDirs = new Set((db.projects || []).map(p => (p.directory || '').toLowerCase()));
  const existingNames = new Set((db.projects || []).map(p => p.name.toLowerCase()));

  const projectsBase = path.join(USER_HOME, 'Projects');
  const claudeBase = path.join(USER_HOME, '.claude', 'projects');
  const antigravityBase = path.join(USER_HOME, '.gemini', 'antigravity', 'brain');

  const detected = {
    projectsDir: projectsBase,
    foundProjects: [],
    claudeCodeProjects: [],
    antigravitySessions: []
  };

  // 1. Scan Projects Directory
  try {
    if (fs.existsSync(projectsBase)) {
      const items = fs.readdirSync(projectsBase, { withFileTypes: true });
      for (const item of items) {
        if (item.isDirectory() && !item.name.startsWith('.')) {
          const fullPath = path.join(projectsBase, item.name);
          const isImported = existingDirs.has(fullPath.toLowerCase()) || existingNames.has(item.name.toLowerCase());
          detected.foundProjects.push({
            name: item.name,
            path: fullPath,
            isImported
          });
        }
      }
    }
  } catch (err) {
    console.error('Scan projects error:', err);
  }

  // 2. Scan Claude Code local projects
  try {
    if (fs.existsSync(claudeBase)) {
      const items = fs.readdirSync(claudeBase, { withFileTypes: true });
      for (const item of items) {
        if (item.isDirectory()) {
          detected.claudeCodeProjects.push({
            name: item.name.replace(/^C--Users-[^-]+-Projects-?/, '').replace(/--/g, '/'),
            rawName: item.name,
            path: path.join(claudeBase, item.name)
          });
        }
      }
    }
  } catch (err) {
    console.error('Scan Claude error:', err);
  }

  // 3. Scan Google Antigravity sessions
  try {
    if (fs.existsSync(antigravityBase)) {
      const items = fs.readdirSync(antigravityBase, { withFileTypes: true });
      for (const item of items) {
        if (item.isDirectory() && !item.name.startsWith('.')) {
          detected.antigravitySessions.push({
            sessionId: item.name,
            path: path.join(antigravityBase, item.name)
          });
        }
      }
    }
  } catch (err) {
    console.error('Scan Antigravity error:', err);
  }

  res.json(detected);
});

// Import scanned local project
app.post('/api/scan/import', (req, res) => {
  const { name, directory, category } = req.body;
  if (!name) return res.status(400).json({ error: 'Name is required' });

  const db = readDb();
  const newProj = {
    id: `proj_${Date.now()}`,
    name,
    description: `Auto-imported local project from ${directory || name}`,
    status: 'in_progress',
    priority: 'medium',
    category: category || 'Local Project',
    directory: directory || '',
    aiRoles: {
      claude: 'Full stack architecture & code reviews',
      chatgpt: 'Documentation & communication',
      antigravity: 'Agentic testing & execution',
      grok: 'Real-time research'
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  db.projects.push(newProj);
  writeDb(db);
  res.status(201).json(newProj);
});

// Export / Backup
app.get('/api/export', (req, res) => {
  const db = readDb();
  res.setHeader('Content-disposition', 'attachment; filename=ai-projects-backup.json');
  res.setHeader('Content-type', 'application/json');
  res.send(JSON.stringify(db, null, 2));
});

// Launch server if run directly
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`=======================================================`);
    console.log(`🚀 AI Project Organizer running at: http://localhost:${PORT}`);
    console.log(`   - Cross-AI Tracker: Claude, ChatGPT, Antigravity, Grok`);
    console.log(`   - Data store: ${DB_FILE}`);
    console.log(`=======================================================`);
  });
}

module.exports = app;
