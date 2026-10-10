/**
 * OmniAI Hub - Morning Scheduled Intelligence Runner
 * 
 * Runs every morning at e.g. 7:30 AM via Windows Task Scheduler or Antigravity Automation.
 * Gathers verifiable telemetry across git repositories, Claude Code sessions, and Antigravity logs.
 * Pushes a morning briefing alert directly to your phone via NTFY.
 */

const fs = require('fs');
const path = require('path');
const os = require('os');
const { execSync } = require('child_process');
const https = require('https');

const USER_HOME = os.homedir();
const DB_FILE = process.env.DB_FILE || path.join(__dirname, '..', 'data', 'db.json');
const NTFY_TOPIC = process.env.NTFY_TOPIC || 'jordy-omni-ai-hub';

console.log('🌅 Starting OmniAI Hub Morning Grounded Telemetry Scan...');

const candidateRoots = [
  path.join(USER_HOME, 'Projects'),
  path.join(USER_HOME, 'OneDrive', 'Desktop'),
  path.join(USER_HOME, 'OneDrive', 'Desktop', 'AI and Code'),
  path.join(USER_HOME, 'OneDrive', 'Insurance'),
  path.join(USER_HOME, 'Desktop')
];

const gitActivity = [];

// 1. Scan for verified Git commits in the last 24 hours
candidateRoots.forEach(root => {
  if (fs.existsSync(root)) {
    try {
      const items = fs.readdirSync(root, { withFileTypes: true });
      for (const item of items) {
        if (item.isDirectory() && !item.name.startsWith('.')) {
          const repoDir = path.join(root, item.name);
          const gitDir = path.join(repoDir, '.git');
          if (fs.existsSync(gitDir)) {
            try {
              const log = execSync('git log --since="24 hours ago" --oneline -3', {
                cwd: repoDir,
                encoding: 'utf8',
                stdio: ['ignore', 'pipe', 'ignore']
              }).trim();
              if (log) {
                const commits = log.split('\n').filter(Boolean);
                gitActivity.push({
                  project: item.name,
                  commits
                });
              }
            } catch (e) {}
          }
        }
      }
    } catch (e) {}
  }
});

// 2. Scan recent Claude Code sessions
let recentClaudeWorkspaces = 0;
const claudeBase = path.join(USER_HOME, '.claude', 'projects');
if (fs.existsSync(claudeBase)) {
  try {
    const items = fs.readdirSync(claudeBase, { withFileTypes: true });
    const yesterday = Date.now() - 24 * 60 * 60 * 1000;
    for (const item of items) {
      if (item.isDirectory()) {
        const stats = fs.statSync(path.join(claudeBase, item.name));
        if (stats.mtimeMs > yesterday) {
          recentClaudeWorkspaces++;
        }
      }
    }
  } catch (e) {}
}

// 3. Scan recent Antigravity sessions
let recentAntigravitySessions = 0;
const antigravityBase = path.join(USER_HOME, '.gemini', 'antigravity', 'brain');
if (fs.existsSync(antigravityBase)) {
  try {
    const items = fs.readdirSync(antigravityBase, { withFileTypes: true });
    const yesterday = Date.now() - 24 * 60 * 60 * 1000;
    for (const item of items) {
      if (item.isDirectory()) {
        const stats = fs.statSync(path.join(antigravityBase, item.name));
        if (stats.mtimeMs > yesterday) {
          recentAntigravitySessions++;
        }
      }
    }
  } catch (e) {}
}

// 4. Formulate the Grounded Morning Briefing
console.log('\n📊 Grounded Telemetry Found:');
console.log(`- Repos with commits in last 24h: ${gitActivity.length}`);
gitActivity.forEach(g => {
  console.log(`  * ${g.project}: ${g.commits.length} commit(s)`);
});
console.log(`- Active Claude Code workspaces (last 24h): ${recentClaudeWorkspaces}`);
console.log(`- Active Antigravity sessions (last 24h): ${recentAntigravitySessions}`);

// 5. Update local database quick note with morning briefing & read latest AI Daily Watch
let dailyWatchHighlight = '';
if (fs.existsSync(DB_FILE)) {
  try {
    const db = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
    if (!db.quickNotes) db.quickNotes = [];

    // Check for recent AI Daily Watch note
    const watchNote = db.quickNotes.find(n => n.text && n.text.includes('AI Daily Watch'));
    if (watchNote) {
      dailyWatchHighlight = watchNote.text.replace(/^📰 AI Daily Watch \([^)]+\):\s*/, '').trim();
    }

    const dateStr = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const note = {
      id: `note_${Date.now()}`,
      text: `🌅 Morning Briefing (${dateStr}): ${gitActivity.length} repo(s) committed, ${recentClaudeWorkspaces} Claude sessions, ${recentAntigravitySessions} Antigravity runs.`,
      createdAt: new Date().toISOString()
    };
    db.quickNotes.unshift(note);
    if (db.quickNotes.length > 20) db.quickNotes.pop();
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf8');
  } catch (e) {
    console.error('Error updating DB:', e.message);
  }
}

// 6. Push Notification to Phone via NTFY
let summaryMessage = gitActivity.length > 0 
  ? `Good morning Jordan! Active work on ${gitActivity.map(g => g.project).join(', ')}. ${recentClaudeWorkspaces} Claude sessions active.`
  : `Good morning Jordan! 0 commits in last 24h. Your AI Fleet is ready for today's tasks.`;

if (dailyWatchHighlight) {
  // Truncate to reasonable notification length if needed
  const shortHighlight = dailyWatchHighlight.length > 140 
    ? dailyWatchHighlight.substring(0, 137) + '...'
    : dailyWatchHighlight;
  summaryMessage += `\n\n📰 AI Watch: ${shortHighlight}`;
}

console.log(`\n📲 Dispatching phone notification to topic "${NTFY_TOPIC}"...`);

const ntfyReq = https.request(`https://ntfy.sh/${encodeURIComponent(NTFY_TOPIC)}`, {
  method: 'POST',
  headers: {
    'Title': 'OmniAI Morning Briefing',
    'Priority': 'default',
    'Tags': 'sunrise,robot',
    'Click': 'https://thej1u.github.io/ai-project-organizer/'
  }
}, (res) => {
  console.log(`✅ Push notification sent (HTTP ${res.statusCode}). Check your phone!`);
});

ntfyReq.on('error', (e) => {
  console.log('⚠️ Notification error:', e.message);
});

ntfyReq.write(summaryMessage);
ntfyReq.end();
