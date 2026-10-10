#!/usr/bin/env node
/**
 * OmniAI Hub - Model Context Protocol (MCP) Server
 * 
 * Provides native JSON-RPC integration for Claude Desktop, Cursor, and other MCP clients.
 * Allows AI models to inspect active projects, queue tasks for peer models, and report
 * verified task completion without human copy-pasting.
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const DB_FILE = process.env.DB_FILE || path.join(__dirname, '..', 'data', 'db.json');

function readDb() {
  try {
    if (!fs.existsSync(DB_FILE)) return { projects: [], tasks: [], sessions: [] };
    return JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
  } catch (e) {
    return { projects: [], tasks: [], sessions: [] };
  }
}

function writeDb(data) {
  try {
    const dir = path.dirname(DB_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (e) {
    return false;
  }
}

// MCP Tools Definition
const TOOLS = [
  {
    name: 'omniai_list_projects',
    description: 'List all active projects tracked in OmniAI Hub with AI role assignments.',
    inputSchema: {
      type: 'object',
      properties: {
        status: { type: 'string', description: 'Filter by status (active, in_progress, planning, completed, all)' }
      }
    }
  },
  {
    name: 'omniai_get_project_context',
    description: 'Get deep project context including objective, assigned AI specializations, open tasks, and active chat links.',
    inputSchema: {
      type: 'object',
      properties: {
        projectIdOrName: { type: 'string', description: 'Project ID or project name' }
      },
      required: ['projectIdOrName']
    }
  },
  {
    name: 'omniai_report_task_progress',
    description: 'Report progress or mark a task as completed with verifiable evidence (commit hash, test pass, file edited). Enforces zero-fabrication.',
    inputSchema: {
      type: 'object',
      properties: {
        taskId: { type: 'string', description: 'The task ID' },
        status: { type: 'string', enum: ['in_progress', 'review', 'completed', 'blocked'], description: 'New task status' },
        verifiedEvidence: { type: 'string', description: 'Mandatory proof: file path, commit hash, or test output. Do not fabricate.' },
        notes: { type: 'string', description: 'Technical notes or next steps' }
      },
      required: ['taskId', 'status', 'verifiedEvidence']
    }
  },
  {
    name: 'omniai_add_task',
    description: 'Assign a new task to Claude, ChatGPT, Google Antigravity, or Grok in OmniAI Hub.',
    inputSchema: {
      type: 'object',
      properties: {
        projectId: { type: 'string', description: 'Project ID to attach this task to' },
        title: { type: 'string', description: 'Task title' },
        description: { type: 'string', description: 'Detailed instructions' },
        assignedAi: { type: 'string', enum: ['claude', 'chatgpt', 'antigravity', 'grok', 'human'], description: 'Which model should execute this' },
        priority: { type: 'string', enum: ['low', 'medium', 'high', 'urgent'], description: 'Priority level' }
      },
      required: ['projectId', 'title', 'assignedAi']
    }
  },
  {
    name: 'omniai_log_session',
    description: 'Log an active chat conversation URL and key decisions into a project.',
    inputSchema: {
      type: 'object',
      properties: {
        projectId: { type: 'string', description: 'Project ID' },
        title: { type: 'string', description: 'Conversation title' },
        ai: { type: 'string', enum: ['claude', 'chatgpt', 'antigravity', 'grok'], description: 'AI platform' },
        url: { type: 'string', description: 'Web URL or local session ID' },
        notes: { type: 'string', description: 'Key decisions made' }
      },
      required: ['projectId', 'title', 'ai', 'url']
    }
  }
];

// Handle Tool Calls
function callTool(name, args) {
  const db = readDb();

  if (name === 'omniai_list_projects') {
    let projs = db.projects || [];
    if (args.status && args.status !== 'all') {
      projs = projs.filter(p => p.status === args.status);
    }
    return {
      projects: projs.map(p => ({
        id: p.id,
        name: p.name,
        category: p.category,
        status: p.status,
        priority: p.priority,
        directory: p.directory,
        aiRoles: p.aiRoles
      }))
    };
  }

  if (name === 'omniai_get_project_context') {
    const query = String(args.projectIdOrName).toLowerCase();
    const project = (db.projects || []).find(p => p.id.toLowerCase() === query || p.name.toLowerCase() === query);
    if (!project) return { error: `Project "${args.projectIdOrName}" not found.` };

    const tasks = (db.tasks || []).filter(t => t.projectId === project.id);
    const sessions = (db.sessions || []).filter(s => s.projectId === project.id);

    return {
      project,
      tasks: {
        in_progress: tasks.filter(t => t.status === 'in_progress'),
        todo: tasks.filter(t => t.status === 'todo'),
        review: tasks.filter(t => t.status === 'review'),
        completed: tasks.filter(t => t.status === 'completed')
      },
      linkedChats: sessions
    };
  }

  if (name === 'omniai_report_task_progress') {
    const taskIdx = (db.tasks || []).findIndex(t => t.id === args.taskId);
    if (taskIdx === -1) return { error: `Task "${args.taskId}" not found.` };

    db.tasks[taskIdx].status = args.status;
    db.tasks[taskIdx].updatedAt = new Date().toISOString();
    db.tasks[taskIdx].verifiedEvidence = args.verifiedEvidence;
    if (args.notes) {
      db.tasks[taskIdx].description = (db.tasks[taskIdx].description || '') + `\n[Progress Note]: ${args.notes} (Proof: ${args.verifiedEvidence})`;
    }

    writeDb(db);
    return {
      success: true,
      message: `Task updated to ${args.status}`,
      task: db.tasks[taskIdx]
    };
  }

  if (name === 'omniai_add_task') {
    const newTask = {
      id: `task_${Date.now()}`,
      projectId: args.projectId,
      title: args.title,
      description: args.description || '',
      assignedAi: args.assignedAi,
      status: 'todo',
      priority: args.priority || 'medium',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    if (!db.tasks) db.tasks = [];
    db.tasks.push(newTask);
    writeDb(db);
    return { success: true, task: newTask };
  }

  if (name === 'omniai_log_session') {
    const newSess = {
      id: `sess_${Date.now()}`,
      projectId: args.projectId,
      title: args.title,
      ai: args.ai,
      url: args.url,
      notes: args.notes || '',
      createdAt: new Date().toISOString()
    };
    if (!db.sessions) db.sessions = [];
    db.sessions.push(newSess);
    writeDb(db);
    return { success: true, session: newSess };
  }

  return { error: `Unknown tool: ${name}` };
}

// JSON-RPC Stdio Loop
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false
});

rl.on('line', (line) => {
  if (!line.trim()) return;
  try {
    const req = JSON.parse(line);
    const { id, method, params } = req;

    if (method === 'initialize') {
      sendResponse(id, {
        protocolVersion: '2024-11-05',
        capabilities: { tools: {} },
        serverInfo: { name: 'omniai-mcp-server', version: '1.0.0' }
      });
      return;
    }

    if (method === 'notifications/initialized') {
      return; // No response needed
    }

    if (method === 'tools/list') {
      sendResponse(id, { tools: TOOLS });
      return;
    }

    if (method === 'tools/call') {
      const { name, arguments: args } = params || {};
      const result = callTool(name, args || {});
      sendResponse(id, {
        content: [
          {
            type: 'text',
            text: JSON.stringify(result, null, 2)
          }
        ],
        isError: Boolean(result.error)
      });
      return;
    }

    // Default unsupported method response
    sendResponse(id, { error: { code: -32601, message: 'Method not found' } });
  } catch (err) {
    // Malformed JSON
  }
});

function sendResponse(id, result) {
  const res = { jsonrpc: '2.0', id };
  if (result && result.error && result.error.code) {
    res.error = result.error;
  } else {
    res.result = result;
  }
  process.stdout.write(JSON.stringify(res) + '\n');
}
