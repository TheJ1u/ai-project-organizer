# ⚡ OmniAI Hub — AI Project & Task Organizer

> **A morning command dashboard and cross-AI orchestrator designed for managing multi-agent engineering across Claude, ChatGPT, Google Antigravity, and Grok.**

---

## 🌅 Overview

**OmniAI Hub** solves the multi-AI coordination problem. When you distribute your work across different state-of-the-art AI engines — using Claude for software architecture and code audits, Google Antigravity for autonomous local file execution and test harnesses, ChatGPT for product copywriting and documentation, and Grok for real-time market sentiment and X search — it becomes difficult to track who is working on what.

OmniAI Hub provides a central mission control dashboard that you can open every morning to instantly see:
- What projects are active
- Which AI is responsible for each component
- What tasks are currently in-flight
- Direct links to active AI chat sessions and local workspace directories

---

## 🚀 Key Features

### 1. 🌅 Morning Briefing View
- **Executive Pulse**: High-level counts of active projects, queued backlog items, and completed tasks.
- **AI Fleet Breakdown**: Visual workload metrics for Claude, ChatGPT, Google Antigravity, and Grok.
- **In-Flight Operations**: Real-time list of work currently in progress with 1-click "Mark Done" buttons.
- **Morning Scratchpad**: Frictionless persistent notes to jot down daily reminders and priority focus areas.
- **Recent Chat Threads**: Instant launcher for linked browser chats (Claude.ai, ChatGPT, Grok) and local Antigravity sessions.

### 2. 📁 Projects Portfolio & AI Role Matrix
- View all active, planning, and completed projects.
- **Per-Project AI Assignments**: Explicitly define what each AI model is assigned to do:
  - **Claude (Anthropic)**: Core architecture, refactoring, algorithms, and deep logic.
  - **Google Antigravity**: Autonomous code execution, local test runners, directory scaffolding.
  - **ChatGPT (OpenAI)**: Marketing copy, user documentation, course curriculum, and customer replies.
  - **Grok (xAI)**: Live web search, social sentiment on X, real-time news, and trend research.
- Progress bars reflecting completed vs. total tasks.
- Edit project details, directories, and category tags.

### 3. 🤖 AI Fleet View
- Dedicated side-by-side columns for **Claude**, **Google Antigravity**, **ChatGPT**, and **Grok**.
- See every task assigned to a particular model.
- Update task status or delete completed items inline.

### 4. 📋 Unified Kanban Board
- 4-column drag-or-select workflow: **To Do**, **In Progress**, **Needs Review**, **Completed**.
- Filter by Project or by assigned AI model.
- Instant global search across task titles, descriptions, and projects.

### 5. 🔀 Cross-AI Context Handoff Studio
- Generate structured, zero-loss prompt templates to transition work between models.
- Transfers executive summary, project status, working directory, completed items, active blockers, and immediate objectives.
- Includes a 1-click "Copy Prompt" button and direct link to launch the target AI web app or local tool.

### 6. 🔄 Local Disk & AI Session Auto-Scanner
- Scans `C:\Users\jordy\Projects` to discover existing local repositories on your computer.
- Scans `~/.claude/projects` to detect local Claude Code workspaces.
- Scans `~/.gemini/antigravity/brain` to detect autonomous Antigravity agent sessions.
- 1-click "+ Track" button to import any detected folder directly into your dashboard.

### 7. 📥 1-Click Browser Quick-Capture Bookmarklet
- Drag the bookmarklet button to your browser bookmarks bar.
- While browsing [Claude.ai](https://claude.ai), [ChatGPT](https://chatgpt.com), or [Grok](https://grok.com), click the bookmarklet to immediately log the conversation URL, title, and auto-detected AI into your morning hub.

### 8. 💾 Zero-Config Persistent Storage & Backup
- Lightweight local JSON database stored in `data/db.json`.
- Automatic pre-seeding with Jordan's real projects (MassMailer, ai-for-life, Trading-ALGO, moms-woodworking-business, LandScout).
- 1-click JSON backup export via `/api/export`.

---

## 🏃 Quick Start

### Option A: Windows 1-Click Launch (Recommended)
Double-click `start.bat` in the project folder, or run in PowerShell:
```powershell
.\start.ps1
```
This automatically verifies dependencies, starts the Express server, and opens your default browser to `http://localhost:3456`.

### Option B: Manual CLI
```bash
# 1. Install dependencies
npm install

# 2. Start the server
npm start

# 3. Open browser
http://localhost:3456
```

For auto-reloading during development:
```bash
npm run dev
```

---

## ☕ The Recommended Morning Routine

1. **8:00 AM — Launch Dashboard**: Run `start.bat` or open `http://localhost:3456`.
2. **Review In-Flight Operations**: Look at the Morning Briefing hero section to see what tasks are currently in progress or waiting for review.
3. **Check the Fleet Matrix**: Click the **AI Fleet View** tab to see what Claude, ChatGPT, Antigravity, and Grok have queued up.
4. **Launch AI Tools**: Use the Quick Launch bar at the top of the morning dashboard:
   - Click **Claude** to review deep code refactors or pull requests.
   - Click **ChatGPT** to review drafted email copy or documentation.
   - Click **Grok** to run live market or trend queries.
   - Check local terminal or IDE for **Google Antigravity** test results.
5. **Cross-AI Handoff**: When one AI finishes a phase (e.g., Claude designs a database schema), open the **AI Handoff Studio**, select Source (Claude) and Target (Google Antigravity), generate the prompt, and paste it into Antigravity to write and execute the code.

---

## 🤖 Multi-AI Fleet Matrix

| AI Platform | Typical Strengths in Workflow | Assigned Project Roles |
|---|---|---|
| 🟣 **Claude** (Anthropic) | Complex architectural reasoning, nuanced code review, TypeScript/Python logic | System architecture, algorithms, API integration, refactoring |
| 🔵 **Google Antigravity** | Autonomous multi-file execution, sandbox test runs, terminal orchestration | Automated unit tests, file generation, CLI mocks, test harnesses |
| 🟢 **ChatGPT** (OpenAI) | Copywriting, user onboarding, curriculum, customer service | Sales copy, email sequences, explanations, documentation |
| ⚪ **Grok** (xAI) | Real-time X/Twitter pulse, web search, breaking regulatory/tech updates | Market sentiment analysis, trend tracking, spam filter rule checks |

---

## 📥 Browser Bookmarklet Installation

To capture chat threads while browsing on Claude, ChatGPT, or Grok:

1. Click **📥 Quick Capture** in the top navigation bar of OmniAI Hub.
2. Drag the **⚡ Quick-Add to AI Hub** button to your browser's Bookmarks Bar.
3. *Alternatively*, create a new bookmark manually and set the URL to:
```javascript
javascript:(function(){const title=document.title;const url=window.location.href;fetch('http://localhost:3456/api/capture',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({title,url,notes:'Saved via Bookmarklet'})}).then(r=>r.json()).then(d=>alert('⚡ Saved chat to OmniAI Hub!')).catch(e=>alert('Hub not reachable. Make sure it is running on localhost:3456'));})();
```
4. Whenever you have an active chat session you want to remember, click the bookmark. It will automatically detect the AI provider and attach the link to your dashboard.

---

## 🧪 Automated Testing & Verification

An end-to-end integration test suite is included in `test/test-endpoints.js`. It validates all static assets, CRUD routes, search filters, context prompt handoff generators, local scanner paths, and backup exports against an ephemeral test server:

```bash
npm test
```

Expected output:
```
🧪 Test server running on ephemeral port...
1. Testing Static Assets: ✓
2. Testing Dashboard API: ✓
3. Testing Projects API: ✓
4. Testing Tasks API: ✓
5. Testing Cross-AI Handoff API: ✓
6. Testing Quick Capture API: ✓
7. Testing Local Disk Scanner: ✓
8. Testing Scan Import: ✓
9. Testing Quick Notes API: ✓
10. Testing Backup Export: ✓
🎉 ALL INTEGRATION TESTS PASSED CLEANLY!
```

---

## 🐙 Pushing to GitHub

To push this repository to GitHub under a new repo:

### Method 1: Using GitHub CLI (`gh`)
```bash
# Navigate to the project directory
cd C:\Users\jordy\Projects\ai-project-organizer

# Create a new repository on GitHub and push
gh repo create ai-project-organizer --public --source=. --remote=origin --push
```

### Method 2: Using Standard Git & GitHub Web
1. Create a new empty repository on [GitHub](https://github.com/new) named `ai-project-organizer`.
2. In your terminal:
```bash
cd C:\Users\jordy\Projects\ai-project-organizer
git remote add origin https://github.com/<YOUR_GITHUB_USERNAME>/ai-project-organizer.git
git branch -M main
git push -u origin main
```

---

## 📂 Project Architecture

```
ai-project-organizer/
├── package.json          # Node.js project manifest & dependencies (Express, Cors)
├── server.js             # Express API backend & local file scanner
├── start.bat             # 1-click Windows Batch startup script
├── start.ps1             # 1-click PowerShell startup script
├── README.md             # Complete documentation and usage guide
├── .gitignore            # Git exclusion rules (node_modules, logs, etc.)
├── data/
│   └── db.json           # Persistent JSON data store (projects, tasks, sessions)
├── public/
│   ├── index.html        # Single-page application HTML & accessible modal markup
│   ├── styles.css        # Premium dark mode UI styling & responsive layout
│   └── app.js            # Reactive frontend state controller & API client
└── test/
    └── test-endpoints.js # End-to-end integration test suite
```

---

## 📜 License
MIT License. Built for multi-AI workflows.
