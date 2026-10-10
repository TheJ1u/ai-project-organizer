// OmniAI Project Organizer - Frontend Application
document.addEventListener('DOMContentLoaded', () => {
  // Global State
  let state = {
    projects: [],
    tasks: [],
    sessions: [],
    dashboard: null,
    currentView: 'morning',
    selectedProjectId: null,
    searchQuery: ''
  };

  // DOM Elements
  const navTabs = document.querySelectorAll('.nav-tab');
  const viewPanels = document.querySelectorAll('.view-panel');
  const currentDateStr = document.getElementById('current-date-str');
  const toastEl = document.getElementById('toast');
  const globalSearch = document.getElementById('global-search');

  // Modals
  const modalProject = document.getElementById('modal-project');
  const modalTask = document.getElementById('modal-task');
  const modalSession = document.getElementById('modal-session');
  const modalHandoff = document.getElementById('modal-handoff');
  const modalScanner = document.getElementById('modal-scanner');
  const modalCapture = document.getElementById('modal-capture');

  // Buttons
  const btnCreateProject = document.getElementById('btn-create-project');
  const btnCreateProject2 = document.getElementById('btn-create-project-2');
  const btnOpenHandoff = document.getElementById('btn-open-handoff');
  const btnOpenHandoff2 = document.getElementById('btn-open-handoff-2');
  const btnOpenScanner = document.getElementById('btn-open-scanner');
  const btnOpenCapture = document.getElementById('btn-open-capture');
  const btnAddTaskMorning = document.getElementById('btn-add-task-morning');
  const btnAddFleetTask = document.getElementById('btn-add-fleet-task');
  const btnAddBoardTask = document.getElementById('btn-add-board-task');
  const btnQuickAddLink = document.getElementById('btn-quick-add-link');
  const btnSaveNote = document.getElementById('btn-save-note');
  const scratchpadInput = document.getElementById('scratchpad-input');

  // Filters
  const projectFilterStatus = document.getElementById('project-filter-status');
  const boardProjectFilter = document.getElementById('board-project-filter');
  const boardAiFilter = document.getElementById('board-ai-filter');

  // Set today's date formatted nicely
  function initDate() {
    const now = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    currentDateStr.textContent = now.toLocaleDateString('en-US', options);
  }

  // Toast Notification
  function showToast(message) {
    toastEl.textContent = message;
    toastEl.style.display = 'block';
    setTimeout(() => {
      toastEl.style.display = 'none';
    }, 3200);
  }

  // View Navigation
  function switchView(viewName) {
    state.currentView = viewName;
    navTabs.forEach(t => t.classList.toggle('active', t.dataset.view === viewName));
    viewPanels.forEach(p => p.classList.toggle('active', p.id === `view-${viewName}`));

    if (viewName === 'morning') loadDashboard();
    if (viewName === 'projects') loadProjects();
    if (viewName === 'fleet') loadFleet();
    if (viewName === 'board') loadBoard();
  }

  navTabs.forEach(tab => {
    tab.addEventListener('click', () => switchView(tab.dataset.view));
  });

  // Modal Helpers
  function openModal(modal) {
    modal.classList.add('active');
  }

  function closeModal(modal) {
    modal.classList.remove('active');
  }

  document.querySelectorAll('.btn-close-modal, .btn-cancel').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const modal = e.target.closest('.modal-overlay');
      if (modal) closeModal(modal);
    });
  });

  window.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal-overlay')) {
      closeModal(e.target);
    }
  });

  // Global Search Handler
  globalSearch.addEventListener('input', (e) => {
    state.searchQuery = e.target.value.toLowerCase().trim();
    if (state.currentView === 'morning') renderInFlightTasks();
    if (state.currentView === 'projects') renderProjects();
    if (state.currentView === 'fleet') renderFleet();
    if (state.currentView === 'board') renderBoard();
  });

  // Helper AI Info Formatter
  function getAiInfo(ai) {
    switch (ai) {
      case 'claude':
        return { name: 'Claude', icon: '🟣', class: 'claude', color: '#d97706', role: 'Architect' };
      case 'chatgpt':
        return { name: 'ChatGPT', icon: '🟢', class: 'chatgpt', color: '#10a37f', role: 'Copy & Product' };
      case 'antigravity':
        return { name: 'Google Antigravity', icon: '🔵', class: 'antigravity', color: '#3b82f6', role: 'Autonomous Engine' };
      case 'grok':
        return { name: 'Grok', icon: '⚪', class: 'grok', color: '#e2e8f0', role: 'DeepSearch & Intel' };
      case 'human':
        return { name: 'Jordan', icon: '👤', class: 'human', color: '#a855f7', role: 'Lead Director' };
      default:
        return { name: ai || 'AI', icon: '🤖', class: 'default', color: '#94a3b8', role: 'Assistant' };
    }
  }

  // ================= DATA FETCHING =================

  // 1. Load Dashboard (Morning Briefing)
  async function loadDashboard() {
    try {
      const res = await fetch('/api/dashboard');
      const data = await res.json();
      state.dashboard = data;

      // Update Metrics
      document.getElementById('stat-active-projects').textContent = data.metrics.activeProjects;
      document.getElementById('stat-total-projects-sub').textContent = `of ${data.metrics.totalProjects} total projects`;

      // AI Stats
      const ai = data.aiStats;
      document.getElementById('stat-claude-tasks').textContent = ai.claude?.total || 0;
      document.getElementById('stat-claude-sub').textContent = `${(ai.claude?.in_progress || 0) + (ai.claude?.review || 0)} in-flight operations`;

      document.getElementById('stat-antigravity-tasks').textContent = ai.antigravity?.total || 0;
      document.getElementById('stat-antigravity-sub').textContent = `${(ai.antigravity?.in_progress || 0) + (ai.antigravity?.review || 0)} active code executions`;

      document.getElementById('stat-chatgpt-tasks').textContent = ai.chatgpt?.total || 0;
      document.getElementById('stat-chatgpt-sub').textContent = `${(ai.chatgpt?.in_progress || 0) + (ai.chatgpt?.review || 0)} in-flight tasks`;

      document.getElementById('stat-grok-tasks').textContent = ai.grok?.total || 0;
      document.getElementById('stat-grok-sub').textContent = `${(ai.grok?.in_progress || 0) + (ai.grok?.review || 0)} research queries`;

      // Top pill badges
      document.getElementById('badge-claude-count').textContent = `${(ai.claude?.in_progress || 0) + (ai.claude?.review || 0)} in flight`;
      document.getElementById('badge-chatgpt-count').textContent = `${(ai.chatgpt?.in_progress || 0) + (ai.chatgpt?.review || 0)} in flight`;
      document.getElementById('badge-antigravity-count').textContent = `${(ai.antigravity?.in_progress || 0) + (ai.antigravity?.review || 0)} in flight`;
      document.getElementById('badge-grok-count').textContent = `${(ai.grok?.in_progress || 0) + (ai.grok?.review || 0)} in flight`;

      // Render In Flight list
      renderInFlightTasks();
      renderScratchpad(data.quickNotes);
      renderRecentThreads(data.recentSessions);

      // Refresh project list in background to populate selectors
      loadProjectsSilently();
    } catch (err) {
      console.error('Error loading dashboard:', err);
    }
  }

  function renderInFlightTasks() {
    const container = document.getElementById('in-flight-container');
    if (!state.dashboard || !state.dashboard.inFlightTasks) return;

    let tasks = state.dashboard.inFlightTasks;
    if (state.searchQuery) {
      tasks = tasks.filter(t => 
        t.title.toLowerCase().includes(state.searchQuery) ||
        t.description.toLowerCase().includes(state.searchQuery) ||
        t.projectName.toLowerCase().includes(state.searchQuery) ||
        t.assignedAi.toLowerCase().includes(state.searchQuery)
      );
    }

    if (tasks.length === 0) {
      container.innerHTML = `
        <div class="card" style="text-align: center; padding: 2.5rem; color: var(--text-muted);">
          <p style="font-size: 1.1rem; margin-bottom: 0.5rem;">🎉 All AI workloads completed or queued!</p>
          <p style="font-size: 0.85rem;">Click "➕ Assign Task" to delegate new work to Claude, ChatGPT, Antigravity, or Grok.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = tasks.map(task => {
      const ai = getAiInfo(task.assignedAi);
      return `
        <div class="in-flight-item">
          <div class="in-flight-left">
            <div class="ai-icon-large" title="${ai.name}">${ai.icon}</div>
            <div>
              <div class="in-flight-meta">
                <span class="project-pill">${escapeHtml(task.projectName)}</span>
                <span class="ai-badge ${ai.class}">${ai.name}</span>
                <span class="text-muted" style="font-size: 0.7rem; font-weight: 600;">Priority: ${task.priority.toUpperCase()}</span>
              </div>
              <div class="in-flight-title">${escapeHtml(task.title)}</div>
              <div class="in-flight-desc">${escapeHtml(task.description || 'No additional instructions.')}</div>
            </div>
          </div>
          <div class="in-flight-right">
            <span class="status-badge ${task.status}">${task.status.replace('_', ' ')}</span>
            <button class="btn btn-xs btn-secondary btn-mark-done" data-id="${task.id}" title="Mark completed">
              ✓ Done
            </button>
          </div>
        </div>
      `;
    }).join('');

    // Attach Done buttons
    container.querySelectorAll('.btn-mark-done').forEach(btn => {
      btn.addEventListener('click', async () => {
        await updateTaskStatus(btn.dataset.id, 'completed');
        loadDashboard();
      });
    });
  }

  function renderScratchpad(notes) {
    const list = document.getElementById('scratchpad-list');
    if (!notes || notes.length === 0) {
      list.innerHTML = `<div class="text-muted" style="font-size: 0.8rem; padding: 0.5rem;">No scratchpad notes yet.</div>`;
      return;
    }

    list.innerHTML = notes.map(n => `
      <div class="note-item">
        <span>${escapeHtml(n.text)}</span>
        <button class="btn-close-modal btn-delete-note" data-id="${n.id}" style="font-size: 1rem;">&times;</button>
      </div>
    `).join('');

    list.querySelectorAll('.btn-delete-note').forEach(btn => {
      btn.addEventListener('click', async () => {
        await fetch(`/api/notes/${btn.dataset.id}`, { method: 'DELETE' });
        loadDashboard();
      });
    });
  }

  function renderRecentThreads(sessions) {
    const list = document.getElementById('morning-threads-container');
    if (!sessions || sessions.length === 0) {
      list.innerHTML = `<div class="text-muted" style="font-size: 0.8rem; padding: 0.5rem;">No active chat threads linked yet.</div>`;
      return;
    }

    list.innerHTML = sessions.map(s => {
      const ai = getAiInfo(s.ai);
      const isWeb = s.url.startsWith('http');
      return `
        <a href="${escapeHtml(s.url)}" target="_blank" rel="noreferrer" class="thread-item">
          <div class="thread-item-title">
            <span>${ai.icon}</span>
            <span>${escapeHtml(s.title)}</span>
          </div>
          <span class="text-muted" style="font-size: 0.7rem;">${isWeb ? 'Open ↗' : 'Local 📂'}</span>
        </a>
      `;
    }).join('');
  }

  // 2. Load Projects
  async function loadProjects() {
    try {
      const res = await fetch('/api/projects');
      state.projects = await res.json();
      document.getElementById('nav-project-count').textContent = state.projects.length;
      populateProjectSelects();
      renderProjects();
    } catch (err) {
      console.error('Error loading projects:', err);
    }
  }

  async function loadProjectsSilently() {
    try {
      const res = await fetch('/api/projects');
      state.projects = await res.json();
      document.getElementById('nav-project-count').textContent = state.projects.length;
      populateProjectSelects();
    } catch (e) {}
  }

  function renderProjects() {
    const container = document.getElementById('projects-grid-container');
    const filterStatus = projectFilterStatus.value;

    let list = state.projects;
    if (filterStatus !== 'all') {
      list = list.filter(p => p.status === filterStatus);
    }
    if (state.searchQuery) {
      list = list.filter(p => 
        p.name.toLowerCase().includes(state.searchQuery) ||
        p.description.toLowerCase().includes(state.searchQuery) ||
        (p.category && p.category.toLowerCase().includes(state.searchQuery))
      );
    }

    if (list.length === 0) {
      container.innerHTML = `
        <div style="grid-column: 1/-1; text-align: center; padding: 4rem; color: var(--text-muted);">
          <h3>No matching projects found</h3>
          <p style="margin-top: 0.5rem;">Create a new project or click "Scan Local" to discover projects from your computer.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = list.map(proj => {
      const total = proj.tasksCount || 0;
      const completed = proj.completedTasksCount || 0;
      const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

      return `
        <div class="project-card" data-id="${proj.id}">
          <div class="proj-card-top">
            <div>
              <div class="proj-card-category">${escapeHtml(proj.category || 'General Project')}</div>
              <h2 class="proj-card-title">${escapeHtml(proj.name)}</h2>
            </div>
            <span class="status-badge ${proj.status}">${proj.status.replace('_', ' ')}</span>
          </div>

          <p class="proj-card-desc">${escapeHtml(proj.description || 'No description.')}</p>

          <div class="proj-ai-roles">
            <div class="proj-role-row">
              <span class="proj-role-label"><span class="ai-dot claude"></span> Claude:</span>
              <span class="proj-role-val" title="${escapeHtml(proj.aiRoles?.claude || 'Architecture & Refactoring')}">${escapeHtml(proj.aiRoles?.claude || 'Architecture & Refactoring')}</span>
            </div>
            <div class="proj-role-row">
              <span class="proj-role-label"><span class="ai-dot antigravity"></span> Antigravity:</span>
              <span class="proj-role-val" title="${escapeHtml(proj.aiRoles?.antigravity || 'Autonomous Execution')}">${escapeHtml(proj.aiRoles?.antigravity || 'Autonomous Execution')}</span>
            </div>
            <div class="proj-role-row">
              <span class="proj-role-label"><span class="ai-dot chatgpt"></span> ChatGPT:</span>
              <span class="proj-role-val" title="${escapeHtml(proj.aiRoles?.chatgpt || 'Copy & Product specs')}">${escapeHtml(proj.aiRoles?.chatgpt || 'Copy & Product specs')}</span>
            </div>
            <div class="proj-role-row">
              <span class="proj-role-label"><span class="ai-dot grok"></span> Grok:</span>
              <span class="proj-role-val" title="${escapeHtml(proj.aiRoles?.grok || 'Live Search & Trend intel')}">${escapeHtml(proj.aiRoles?.grok || 'Live Search & Trend intel')}</span>
            </div>
          </div>

          <div class="proj-progress-bar">
            <div class="proj-progress-fill" style="width: ${pct}%;"></div>
          </div>

          <div class="proj-card-footer">
            <div class="proj-stats-summary">
              <strong>${completed}/${total}</strong> tasks (${pct}%) • <strong>${proj.sessionsCount || 0}</strong> chats
            </div>
            <div class="proj-card-actions">
              <button class="btn btn-xs btn-secondary btn-proj-handoff" data-id="${proj.id}" title="Generate Cross-AI prompt">
                🔀 Handoff
              </button>
              <button class="btn btn-xs btn-secondary btn-proj-add-task" data-id="${proj.id}" title="Assign task">
                ➕ Task
              </button>
              <button class="btn btn-xs btn-secondary btn-proj-edit" data-id="${proj.id}" title="Edit project">
                ✏️
              </button>
            </div>
          </div>
        </div>
      `;
    }).join('');

    // Attach Project Actions
    container.querySelectorAll('.btn-proj-handoff').forEach(btn => {
      btn.addEventListener('click', () => {
        openHandoffStudioForProject(btn.dataset.id);
      });
    });

    container.querySelectorAll('.btn-proj-add-task').forEach(btn => {
      btn.addEventListener('click', () => {
        openTaskModalForProject(btn.dataset.id);
      });
    });

    container.querySelectorAll('.btn-proj-edit').forEach(btn => {
      btn.addEventListener('click', () => {
        openEditProjectModal(btn.dataset.id);
      });
    });
  }

  // 3. Load Fleet View
  async function loadFleet() {
    try {
      const res = await fetch('/api/tasks');
      state.tasks = await res.json();
      renderFleet();
    } catch (err) {
      console.error('Error loading fleet:', err);
    }
  }

  function renderFleet() {
    const ais = ['claude', 'antigravity', 'chatgpt', 'grok'];
    
    ais.forEach(ai => {
      const colContainer = document.getElementById(`fleet-tasks-${ai}`);
      const countPill = document.getElementById(`fleet-count-${ai}`);
      if (!colContainer) return;

      let tasks = state.tasks.filter(t => t.assignedAi === ai);
      if (state.searchQuery) {
        tasks = tasks.filter(t => 
          t.title.toLowerCase().includes(state.searchQuery) ||
          t.projectName.toLowerCase().includes(state.searchQuery) ||
          t.description.toLowerCase().includes(state.searchQuery)
        );
      }

      countPill.textContent = tasks.length;

      if (tasks.length === 0) {
        colContainer.innerHTML = `
          <div style="text-align: center; padding: 2rem; color: var(--text-muted); font-size: 0.8rem;">
            No tasks assigned yet.
          </div>
        `;
        return;
      }

      colContainer.innerHTML = tasks.map(task => `
        <div class="task-card" data-id="${task.id}">
          <div class="task-card-meta">
            <span class="project-pill">${escapeHtml(task.projectName)}</span>
            <span class="text-muted" style="font-size: 0.65rem; font-weight: 700;">${task.priority.toUpperCase()}</span>
          </div>
          <div class="task-card-title">${escapeHtml(task.title)}</div>
          <div class="task-card-desc">${escapeHtml(task.description || '')}</div>
          <div class="task-card-footer">
            <select class="task-status-select" data-id="${task.id}">
              <option value="todo" ${task.status === 'todo' ? 'selected' : ''}>To Do</option>
              <option value="in_progress" ${task.status === 'in_progress' ? 'selected' : ''}>In Progress</option>
              <option value="review" ${task.status === 'review' ? 'selected' : ''}>Needs Review</option>
              <option value="completed" ${task.status === 'completed' ? 'selected' : ''}>Completed</option>
            </select>
            <div style="display: flex; gap: 0.25rem; align-items: center;">
              <button class="btn btn-xs btn-secondary btn-edit-task" data-id="${task.id}" title="Edit task">✏️</button>
              <button class="btn-close-modal btn-delete-task" data-id="${task.id}" style="font-size: 1rem;" title="Delete task">&times;</button>
            </div>
          </div>
        </div>
      `).join('');

      // Attach status change events
      colContainer.querySelectorAll('.task-status-select').forEach(sel => {
        sel.addEventListener('change', async (e) => {
          await updateTaskStatus(sel.dataset.id, e.target.value);
          loadFleet();
        });
      });

      // Attach edit task events
      colContainer.querySelectorAll('.btn-edit-task').forEach(btn => {
        btn.addEventListener('click', () => openEditTaskModal(btn.dataset.id));
      });

      // Attach delete task events
      colContainer.querySelectorAll('.btn-delete-task').forEach(btn => {
        btn.addEventListener('click', async () => {
          await fetch(`/api/tasks/${btn.dataset.id}`, { method: 'DELETE' });
          showToast('Task removed');
          loadFleet();
        });
      });
    });
  }

  // 4. Load Kanban Board
  async function loadBoard() {
    try {
      const res = await fetch('/api/tasks');
      state.tasks = await res.json();
      renderBoard();
    } catch (err) {
      console.error('Error loading board:', err);
    }
  }

  function renderBoard() {
    const statuses = ['todo', 'in_progress', 'review', 'completed'];
    const projectFilter = boardProjectFilter.value;
    const aiFilter = boardAiFilter.value;

    let filtered = state.tasks;
    if (projectFilter !== 'all') {
      filtered = filtered.filter(t => t.projectId === projectFilter);
    }
    if (aiFilter !== 'all') {
      filtered = filtered.filter(t => t.assignedAi === aiFilter);
    }
    if (state.searchQuery) {
      filtered = filtered.filter(t => 
        t.title.toLowerCase().includes(state.searchQuery) ||
        t.projectName.toLowerCase().includes(state.searchQuery) ||
        t.description.toLowerCase().includes(state.searchQuery)
      );
    }

    statuses.forEach(st => {
      const colItems = document.getElementById(`kanban-${st}`);
      const countEl = document.getElementById(`count-${st}`);
      const tasksInLane = filtered.filter(t => t.status === st);

      countEl.textContent = tasksInLane.length;

      if (tasksInLane.length === 0) {
        colItems.innerHTML = `<div style="text-align: center; padding: 2rem; color: var(--text-muted); font-size: 0.8rem;">Empty</div>`;
        return;
      }

      colItems.innerHTML = tasksInLane.map(task => {
        const ai = getAiInfo(task.assignedAi);
        return `
          <div class="task-card" data-id="${task.id}" draggable="true">
            <div class="task-card-meta">
              <span class="project-pill">${escapeHtml(task.projectName)}</span>
              <span class="ai-badge ${ai.class}" style="font-size: 0.65rem;">${ai.name}</span>
            </div>
            <div class="task-card-title">${escapeHtml(task.title)}</div>
            <div class="task-card-desc">${escapeHtml(task.description || '')}</div>
            <div class="task-card-footer">
              <select class="task-status-select" data-id="${task.id}">
                <option value="todo" ${task.status === 'todo' ? 'selected' : ''}>To Do</option>
                <option value="in_progress" ${task.status === 'in_progress' ? 'selected' : ''}>In Progress</option>
                <option value="review" ${task.status === 'review' ? 'selected' : ''}>Needs Review</option>
                <option value="completed" ${task.status === 'completed' ? 'selected' : ''}>Completed</option>
              </select>
              <div style="display: flex; gap: 0.25rem; align-items: center;">
                <button class="btn btn-xs btn-secondary btn-edit-task" data-id="${task.id}" title="Edit task">✏️</button>
                <button class="btn-close-modal btn-delete-task" data-id="${task.id}" style="font-size: 1rem;" title="Delete task">&times;</button>
              </div>
            </div>
          </div>
        `;
      }).join('');

      colItems.querySelectorAll('.task-card').forEach(card => {
        card.addEventListener('dragstart', (e) => {
          e.dataTransfer.setData('text/plain', card.dataset.id);
          card.classList.add('is-dragging');
        });
        card.addEventListener('dragend', () => {
          card.classList.remove('is-dragging');
        });
      });

      const parentCol = colItems.closest('.kanban-col');
      if (parentCol) {
        parentCol.dataset.laneStatus = st;
        if (!parentCol.dataset.dndBound) {
          parentCol.dataset.dndBound = 'true';
          parentCol.addEventListener('dragover', (e) => {
            e.preventDefault();
            parentCol.classList.add('dragover');
          });
          parentCol.addEventListener('dragleave', (e) => {
            if (!parentCol.contains(e.relatedTarget)) {
              parentCol.classList.remove('dragover');
            }
          });
          parentCol.addEventListener('drop', async (e) => {
            e.preventDefault();
            parentCol.classList.remove('dragover');
            const droppedTaskId = e.dataTransfer.getData('text/plain');
            const targetStatus = parentCol.dataset.laneStatus;
            if (droppedTaskId && targetStatus) {
              await updateTaskStatus(droppedTaskId, targetStatus);
              loadBoard();
            }
          });
        }
      }

      colItems.querySelectorAll('.task-status-select').forEach(sel => {
        sel.addEventListener('change', async (e) => {
          await updateTaskStatus(sel.dataset.id, e.target.value);
          loadBoard();
        });
      });

      colItems.querySelectorAll('.btn-edit-task').forEach(btn => {
        btn.addEventListener('click', () => openEditTaskModal(btn.dataset.id));
      });

      colItems.querySelectorAll('.btn-delete-task').forEach(btn => {
        btn.addEventListener('click', async () => {
          await fetch(`/api/tasks/${btn.dataset.id}`, { method: 'DELETE' });
          showToast('Task removed');
          loadBoard();
        });
      });
    });
  }

  // Populate Select Boxes
  function populateProjectSelects() {
    const selects = [
      document.getElementById('task-project'),
      document.getElementById('sess-project'),
      document.getElementById('handoff-project'),
      boardProjectFilter
    ];

    selects.forEach(sel => {
      if (!sel) return;
      const isFilter = sel.id === 'board-project-filter';
      const curVal = sel.value;

      sel.innerHTML = isFilter ? '<option value="all">All Projects</option>' : '';
      state.projects.forEach(p => {
        const opt = document.createElement('option');
        opt.value = p.id;
        opt.textContent = p.name;
        sel.appendChild(opt);
      });

      if (curVal) sel.value = curVal;
    });
  }

  // Task Status Update helper
  async function updateTaskStatus(taskId, newStatus) {
    try {
      await fetch(`/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      showToast(`Task status updated to ${newStatus.replace('_', ' ')}`);
    } catch (err) {
      console.error(err);
      showToast('Error updating status');
    }
  }

  // ================= MODAL ACTIONS =================

  // Open New Project Modal
  function openNewProjectModal() {
    document.getElementById('modal-project-title').textContent = 'Create New Project';
    document.getElementById('form-project').reset();
    document.getElementById('proj-id').value = '';
    const btnDel = document.getElementById('btn-delete-project');
    if (btnDel) btnDel.style.display = 'none';
    openModal(modalProject);
  }

  btnCreateProject.addEventListener('click', openNewProjectModal);
  btnCreateProject2.addEventListener('click', openNewProjectModal);

  // Edit Project
  function openEditProjectModal(projectId) {
    const proj = state.projects.find(p => p.id === projectId);
    if (!proj) return;

    document.getElementById('modal-project-title').textContent = `Edit Project: ${proj.name}`;
    document.getElementById('proj-id').value = proj.id;
    document.getElementById('proj-name').value = proj.name;
    document.getElementById('proj-category').value = proj.category || '';
    document.getElementById('proj-desc').value = proj.description || '';
    document.getElementById('proj-status').value = proj.status || 'in_progress';
    document.getElementById('proj-priority').value = proj.priority || 'medium';
    document.getElementById('proj-dir').value = proj.directory || '';

    document.getElementById('role-claude').value = proj.aiRoles?.claude || '';
    document.getElementById('role-antigravity').value = proj.aiRoles?.antigravity || '';
    document.getElementById('role-chatgpt').value = proj.aiRoles?.chatgpt || '';
    document.getElementById('role-grok').value = proj.aiRoles?.grok || '';

    const btnDel = document.getElementById('btn-delete-project');
    if (btnDel) btnDel.style.display = 'inline-block';

    openModal(modalProject);
  }

  const btnDeleteProj = document.getElementById('btn-delete-project');
  if (btnDeleteProj) {
    btnDeleteProj.addEventListener('click', async () => {
      const id = document.getElementById('proj-id').value;
      const name = document.getElementById('proj-name').value;
      if (!id) return;
      if (confirm(`Are you sure you want to delete project "${name}" and all associated tasks?`)) {
        try {
          await fetch(`/api/projects/${id}`, { method: 'DELETE' });
          showToast(`Deleted project "${name}"`);
          closeModal(modalProject);
          await loadProjects();
          if (state.currentView === 'morning') loadDashboard();
          if (state.currentView === 'fleet') loadFleet();
          if (state.currentView === 'board') loadBoard();
        } catch (err) {
          console.error(err);
          showToast('Error deleting project');
        }
      }
    });
  }

  // Save Project Form
  document.getElementById('form-project').addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('proj-id').value;
    const payload = {
      name: document.getElementById('proj-name').value,
      category: document.getElementById('proj-category').value,
      description: document.getElementById('proj-desc').value,
      status: document.getElementById('proj-status').value,
      priority: document.getElementById('proj-priority').value,
      directory: document.getElementById('proj-dir').value,
      aiRoles: {
        claude: document.getElementById('role-claude').value,
        antigravity: document.getElementById('role-antigravity').value,
        chatgpt: document.getElementById('role-chatgpt').value,
        grok: document.getElementById('role-grok').value
      }
    };

    try {
      if (id) {
        await fetch(`/api/projects/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        showToast(`Updated project "${payload.name}"`);
      } else {
        await fetch('/api/projects', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        showToast(`Created project "${payload.name}"`);
      }

      closeModal(modalProject);
      await loadProjects();
      if (state.currentView === 'morning') loadDashboard();
    } catch (err) {
      console.error(err);
      showToast('Error saving project');
    }
  });

  // Open Task Modal (New Task)
  function openTaskModalForProject(projectId = null) {
    document.getElementById('modal-task-title').textContent = 'Assign AI Task';
    document.getElementById('form-task').reset();
    document.getElementById('task-id').value = '';
    if (projectId) {
      document.getElementById('task-project').value = projectId;
    }
    openModal(modalTask);
  }

  // Open Edit Task Modal
  function openEditTaskModal(taskId) {
    const task = state.tasks.find(t => t.id === taskId);
    if (!task) return;

    document.getElementById('modal-task-title').textContent = 'Edit Task';
    document.getElementById('task-id').value = task.id;
    document.getElementById('task-project').value = task.projectId;
    document.getElementById('task-title').value = task.title;
    document.getElementById('task-desc').value = task.description || '';
    document.getElementById('task-ai').value = task.assignedAi || 'claude';
    document.getElementById('task-status').value = task.status || 'todo';
    document.getElementById('task-priority').value = task.priority || 'medium';

    openModal(modalTask);
  }

  btnAddTaskMorning.addEventListener('click', () => openTaskModalForProject());
  btnAddFleetTask.addEventListener('click', () => openTaskModalForProject());
  btnAddBoardTask.addEventListener('click', () => openTaskModalForProject());

  // Save Task Form
  document.getElementById('form-task').addEventListener('submit', async (e) => {
    e.preventDefault();
    const taskId = document.getElementById('task-id').value;
    const payload = {
      projectId: document.getElementById('task-project').value,
      title: document.getElementById('task-title').value,
      description: document.getElementById('task-desc').value,
      assignedAi: document.getElementById('task-ai').value,
      status: document.getElementById('task-status').value,
      priority: document.getElementById('task-priority').value
    };

    try {
      if (taskId) {
        await fetch(`/api/tasks/${taskId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        showToast('Updated task');
      } else {
        await fetch('/api/tasks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        showToast('Assigned new AI task');
      }
      closeModal(modalTask);

      if (state.currentView === 'morning') loadDashboard();
      if (state.currentView === 'fleet') loadFleet();
      if (state.currentView === 'board') loadBoard();
      if (state.currentView === 'projects') loadProjects();
    } catch (err) {
      console.error(err);
      showToast('Error saving task');
    }
  });

  // Session / Chat Link Modal
  btnQuickAddLink.addEventListener('click', () => {
    document.getElementById('form-session').reset();
    openModal(modalSession);
  });

  document.getElementById('form-session').addEventListener('submit', async (e) => {
    e.preventDefault();
    const payload = {
      projectId: document.getElementById('sess-project').value,
      title: document.getElementById('sess-title').value,
      ai: document.getElementById('sess-ai').value,
      url: document.getElementById('sess-url').value,
      notes: document.getElementById('sess-notes').value
    };

    try {
      await fetch('/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      showToast('Linked AI chat thread');
      closeModal(modalSession);
      loadDashboard();
    } catch (err) {
      console.error(err);
      showToast('Error linking thread');
    }
  });

  // Scratchpad Note Add
  btnSaveNote.addEventListener('click', async () => {
    const text = scratchpadInput.value.trim();
    if (!text) return;

    try {
      await fetch('/api/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text })
      });
      scratchpadInput.value = '';
      loadDashboard();
      showToast('Saved note');
    } catch (err) {
      console.error(err);
    }
  });

  scratchpadInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') btnSaveNote.click();
  });

  // ================= CONTEXT HANDOFF STUDIO =================
  function openHandoffStudioForProject(projectId = null) {
    if (projectId) {
      document.getElementById('handoff-project').value = projectId;
    }
    openModal(modalHandoff);
    generateHandoffPrompt();
  }

  btnOpenHandoff.addEventListener('click', () => openHandoffStudioForProject());
  btnOpenHandoff2.addEventListener('click', () => openHandoffStudioForProject());

  async function generateHandoffPrompt() {
    const projectId = document.getElementById('handoff-project').value;
    const sourceAi = document.getElementById('handoff-source').value;
    const targetAi = document.getElementById('handoff-target').value;
    const specificInstruction = document.getElementById('handoff-specific').value;

    if (!projectId) return;

    try {
      const res = await fetch('/api/handoff', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId, sourceAi, targetAi, specificInstruction })
      });
      const data = await res.json();
      document.getElementById('handoff-output').value = data.prompt;

      // Update target launch link
      const launchBtn = document.getElementById('btn-launch-target-ai');
      let targetUrl = 'https://claude.ai';
      if (targetAi === 'chatgpt') targetUrl = 'https://chatgpt.com';
      if (targetAi === 'grok') targetUrl = 'https://grok.com';
      if (targetAi === 'antigravity') targetUrl = '#';

      launchBtn.href = targetUrl;
      launchBtn.textContent = targetAi === 'antigravity' ? '🔵 Antigravity (Local)' : `🚀 Open ${getAiInfo(targetAi).name}`;
    } catch (err) {
      console.error(err);
    }
  }

  document.getElementById('btn-generate-handoff').addEventListener('click', generateHandoffPrompt);

  document.getElementById('btn-copy-handoff').addEventListener('click', () => {
    const output = document.getElementById('handoff-output');
    navigator.clipboard.writeText(output.value);
    showToast('📋 Handoff prompt copied to clipboard!');
  });

  // ================= LOCAL AUTO-SCANNER =================
  btnOpenScanner.addEventListener('click', () => {
    openModal(modalScanner);
    runLocalScan();
  });

  document.getElementById('btn-rescan').addEventListener('click', runLocalScan);

  async function runLocalScan() {
    const statusText = document.getElementById('scan-status-text');
    const projList = document.getElementById('scan-projects-list');
    const claudeList = document.getElementById('scan-claude-list');
    const antigravityList = document.getElementById('scan-antigravity-list');

    statusText.textContent = 'Scanning local disk...';
    projList.innerHTML = 'Scanning...';
    claudeList.innerHTML = 'Scanning...';
    antigravityList.innerHTML = 'Scanning...';

    try {
      const res = await fetch('/api/scan/local');
      const data = await res.json();

      statusText.innerHTML = `✅ Found <strong>${data.foundProjects.length}</strong> local folders, <strong>${data.claudeCodeProjects.length}</strong> Claude Code workspaces, and <strong>${data.antigravitySessions.length}</strong> Antigravity sessions.`;

      // Render Projects
      projList.innerHTML = data.foundProjects.map(p => `
        <div class="scan-item">
          <div>
            <strong>${escapeHtml(p.name)}</strong>
            <span class="text-muted" style="font-size: 0.7rem; display: block;">${escapeHtml(p.path)}</span>
          </div>
          <div>
            ${p.isImported 
              ? `<span class="scan-item-imported">✓ Tracked</span>`
              : `<button class="btn btn-xs btn-primary btn-import-scanned" data-name="${escapeHtml(p.name)}" data-path="${escapeHtml(p.path)}">+ Track</button>`}
          </div>
        </div>
      `).join('');

      // Render Claude Code projects
      claudeList.innerHTML = data.claudeCodeProjects.map(c => `
        <div class="scan-item">
          <div>
            <strong>${escapeHtml(c.name)}</strong>
            <span class="text-muted" style="font-size: 0.7rem; display: block;">Claude Code workspace: ${escapeHtml(c.path)}</span>
          </div>
          <div>
            ${c.isImported
              ? `<span class="scan-item-imported">✓ Tracked</span>`
              : `<button class="btn btn-xs btn-primary btn-import-scanned" data-name="${escapeHtml(c.name)}" data-path="${escapeHtml(c.path)}">+ Track</button>`}
          </div>
        </div>
      `).join('');

      // Render Antigravity sessions
      antigravityList.innerHTML = data.antigravitySessions.map(a => `
        <div class="scan-item">
          <div>
            <strong>Session: ${escapeHtml(a.sessionId.substring(0, 8))}...</strong>
            <span class="text-muted" style="font-size: 0.7rem; display: block;">${escapeHtml(a.path)}</span>
          </div>
          <span class="scan-item-imported">✓ Local Agent</span>
        </div>
      `).join('');

      // Attach import buttons across projects and Claude Code workspaces
      document.querySelectorAll('#scan-projects-list .btn-import-scanned, #scan-claude-list .btn-import-scanned').forEach(btn => {
        btn.addEventListener('click', async () => {
          await fetch('/api/scan/import', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              name: btn.dataset.name,
              directory: btn.dataset.path,
              category: 'Local Project'
            })
          });
          showToast(`Imported project "${btn.dataset.name}"`);
          runLocalScan();
          loadProjects();
        });
      });

    } catch (err) {
      console.error(err);
      statusText.textContent = 'Failed to scan local directories.';
    }
  }

  // Quick Capture Bookmarklet Modal
  btnOpenCapture.addEventListener('click', () => {
    openModal(modalCapture);
  });

  const btnCopyBookmarklet = document.getElementById('btn-copy-bookmarklet');
  if (btnCopyBookmarklet) {
    btnCopyBookmarklet.addEventListener('click', () => {
      const code = `javascript:(function(){var u=encodeURIComponent(window.location.href);var t=encodeURIComponent(document.title);var w=540,h=400;var l=Math.round((screen.width-w)/2),top=Math.round((screen.height-h)/2);window.open('http://localhost:3456/capture?url='+u+'&title='+t,'OmniAICapture','width='+w+',height='+h+',left='+l+',top='+top);})();`;
      navigator.clipboard.writeText(code);
      showToast('📋 Copied bookmarklet code! Paste into a browser bookmark URL field.');
    });
  }

  // Antigravity Pill click
  const pillAntigravity = document.getElementById('pill-antigravity');
  if (pillAntigravity) {
    pillAntigravity.style.cursor = 'pointer';
    pillAntigravity.addEventListener('click', () => {
      switchView('fleet');
      showToast('Switched to AI Fleet View: Google Antigravity');
    });
  }

  // Filter Event Listeners
  projectFilterStatus.addEventListener('change', renderProjects);
  boardProjectFilter.addEventListener('change', renderBoard);
  boardAiFilter.addEventListener('change', renderBoard);

  // HTML Escape Utility
  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // Initialize
  initDate();
  loadDashboard();
});
