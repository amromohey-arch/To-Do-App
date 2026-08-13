/* ============================================================
   618 MEDIA ACTION PLAN
   Now backed by Supabase: shared Postgres database, real login,
   live sync across every browser, and a history log. See README.md
   for one-time setup (create the Supabase project, run schema.sql,
   add your two logins, paste your project URL/key below).
============================================================ */

// ---------- Config ----------
// Filled in via index.html's inline <script> block (window.SUPABASE_URL / window.SUPABASE_ANON_KEY).

const SUPABASE_URL = window.SUPABASE_URL;
const SUPABASE_ANON_KEY = window.SUPABASE_ANON_KEY;

const CATEGORIES = [
  'URGENT / BUGS',
  'CLIENT FOLLOW-UPS',
  'CALCULATOR / PRODUCT',
  'CONTENT PRODUCTION (INSTAGRAM / REELS)',
  'STRATEGY / BUSINESS DECISIONS',
  'STANDING RULES / SYSTEMS',
  'DONE',
];

const ASSIGNEES = ['Unassigned', 'Amro', 'Daniel', 'Both'];

const NAME_ALIASES = {
  danny: 'daniel', dan: 'daniel', daniel: 'daniel', herrera: 'daniel',
  amro: 'amro', mohi: 'amro', me: 'amro',
};

const CATEGORY_KEYWORDS = {
  'URGENT / BUGS': ['urgent', 'bug', 'broken', 'fix asap', 'deploy', 'deployment', 'live site', 'error', 'glitch', 'xss', 'crash', 'down'],
  'CLIENT FOLLOW-UPS': ['gerry', 'byrne', 'choir', 'fadi', 'emre', 'moubayed', 'turcan', 'client', 'quote', 'follow up', 'followup', 'testimonial', 'outreach', 'pli', 'insurance', 'permit', 'council', 'clovelly', 'coogee', 'randwick', 'interview booking', 'lead'],
  'CALCULATOR / PRODUCT': ['calculator', 'pricing', 'tier', 'estimate', 'add-on', 'addon', 'complexity', 'rush surcharge', '618 session', 'music style', 'slider', 'threshold'],
  'CONTENT PRODUCTION (INSTAGRAM / REELS)': ['instagram', 'reel', 'caption', 'video', 'shoot', 'film', 'tofu', 'mofu', 'bofu', 'highlight', 'story', 'stories', 'carousel', 'colour grading', 'color grading', 'dj snake', 'adidas', 'beastie boys', 'asap rocky', 'origin story', 'chef joe', 'post'],
  'STRATEGY / BUSINESS DECISIONS': ['release plan', 'price floor', 'specialisation', 'specialization', 'retainer', 'strategy', 'positioning', 'check-in', 'checkin', 'revenue'],
  'STANDING RULES / SYSTEMS': ['skill file', 'em dash', 'brand colour', 'brand color', 'carousel skill', 'proofread', 'funnel-content', 'standing rule', 'hook'],
};

// ---------- State ----------

const state = {
  tasks: [],
  filter: { query: '', category: 'All', assignee: 'All', showDone: false },
  editingId: null,
  categoryManuallySet: false,
};

let supabaseClient = null;
let currentUser = null;
let realtimeChannel = null;

// ---------- Utilities ----------

function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function canonicalName(term) {
  const t = (term || '').toLowerCase().trim();
  return NAME_ALIASES[t] || t;
}

function assigneeSlug(assignee) {
  return (assignee || 'unassigned').toLowerCase();
}

function showToast(msg) {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.hidden = false;
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => { el.hidden = true; }, 2600);
}

// ---------- Category guessing ----------

function guessCategory(text) {
  const t = (text || '').toLowerCase();
  let best = null, bestScore = 0;
  for (const [cat, words] of Object.entries(CATEGORY_KEYWORDS)) {
    let score = 0;
    for (const w of words) if (t.includes(w)) score++;
    if (score > bestScore) { bestScore = score; best = cat; }
  }
  return best;
}

// ---------- Search ----------

function matchesSearch(task, rawQuery) {
  if (!rawQuery) return true;
  const q = rawQuery.toLowerCase().trim();
  if (!q) return true;
  const canonQ = canonicalName(q);

  const haystack = [task.text, task.notes || '', task.category || '', task.subcategory || '']
    .join(' ').toLowerCase();
  if (haystack.includes(q)) return true;

  const assignee = (task.assignee || '').toLowerCase();
  if (assignee.includes(q)) return true;
  if (canonicalName(assignee) === canonQ) return true;

  return false;
}

// ---------- Import parser ----------
// Same format as export: "==== CATEGORY ====" headers, "SUBHEADER" lines in caps,
// "[ ] task" / "[x] done task", optional "(Assigned: Name)" suffix, optional
// "    Note: ..." continuation line.

function parseImportText(raw) {
  const lines = raw.split(/\r?\n/);
  const dividerRe = /^=+$/;
  const taskRe = /^\[( |x|X)\]\s+(.*)$/;
  const assigneeSuffixRe = /\s*\(Assigned:\s*([^)]+)\)\s*$/i;
  const noteLineRe = /^\s{2,}Note:\s*(.*)$/i;
  const tasks = [];
  let currentCategory = null;
  let currentSub = null;
  let waitingForHeader = false;
  let skipNextDivider = false;

  for (let idx = 0; idx < lines.length; idx++) {
    const line = lines[idx].trim();

    if (dividerRe.test(line)) {
      if (skipNextDivider) skipNextDivider = false;
      else waitingForHeader = true;
      continue;
    }
    if (line === '') continue;

    if (waitingForHeader) {
      currentCategory = line;
      currentSub = null;
      waitingForHeader = false;
      skipNextDivider = true;
      continue;
    }

    const m = line.match(taskRe);
    if (m) {
      const status = m[1].toLowerCase() === 'x' ? 'done' : 'open';
      let text = m[2].trim();

      let assignee = 'Unassigned';
      const am = text.match(assigneeSuffixRe);
      if (am) {
        const candidate = am[1].trim();
        if (ASSIGNEES.includes(candidate)) assignee = candidate;
        text = text.replace(assigneeSuffixRe, '').trim();
      }

      let notes = '';
      const next = lines[idx + 1];
      if (next) {
        const nm = next.match(noteLineRe);
        if (nm) { notes = nm[1].trim(); idx++; }
      }

      tasks.push({
        text,
        category: currentCategory || 'Uncategorized',
        subcategory: currentSub,
        assignee,
        status,
        notes,
      });
      continue;
    }

    if (currentCategory && line === line.toUpperCase() && /[A-Za-z]/.test(line)) {
      currentSub = line;
      continue;
    }
  }
  return tasks;
}

// ---------- Grouping ----------

function bucketBySubcategory(items) {
  const buckets = new Map();
  const order = [];
  items.forEach(t => {
    const key = t.subcategory || null;
    if (!buckets.has(key)) {
      buckets.set(key, []);
      order.push(key);
    }
    buckets.get(key).push(t);
  });
  order.sort((a, b) => {
    if (a === null) return -1;
    if (b === null) return 1;
    const aMin = Math.min(...buckets.get(a).map(t => t.createdAt || 0));
    const bMin = Math.min(...buckets.get(b).map(t => t.createdAt || 0));
    return aMin - bMin;
  });
  return order.map(key => ({ subcategory: key, items: buckets.get(key) }));
}

function sortItems(items) {
  return [...items].sort((a, b) => {
    if (a.status !== b.status) return a.status === 'done' ? 1 : -1;
    return (a.createdAt || 0) - (b.createdAt || 0);
  });
}

// ---------- Supabase: rows <-> app task shape ----------

function rowToTask(row) {
  return {
    id: row.id,
    text: row.text,
    category: row.category,
    subcategory: row.subcategory,
    assignee: row.assignee,
    status: row.status,
    notes: row.notes || '',
    createdAt: new Date(row.created_at).getTime(),
  };
}

// ---------- Supabase: data access ----------

async function loadTasksFromDb() {
  const { data, error } = await supabaseClient
    .from('tasks')
    .select('*')
    .order('created_at', { ascending: true });
  if (error) {
    showToast(`Could not load tasks: ${error.message}`);
    return [];
  }
  return data.map(rowToTask);
}

async function createTaskInDb(draft) {
  const { data, error } = await supabaseClient
    .from('tasks')
    .insert({
      text: draft.text,
      category: draft.category,
      subcategory: draft.subcategory ?? null,
      assignee: draft.assignee || 'Unassigned',
      status: draft.status || 'open',
      notes: draft.notes || '',
    })
    .select()
    .single();
  if (error) {
    showToast(`Could not save: ${error.message}`);
    return null;
  }
  return rowToTask(data);
}

async function updateTaskInDb(id, patch) {
  const { data, error } = await supabaseClient
    .from('tasks')
    .update(patch)
    .eq('id', id)
    .select()
    .single();
  if (error) {
    showToast(`Could not update: ${error.message}`);
    return null;
  }
  return rowToTask(data);
}

async function deleteTaskInDb(id) {
  const { error } = await supabaseClient.from('tasks').delete().eq('id', id);
  if (error) {
    showToast(`Could not delete: ${error.message}`);
    return false;
  }
  return true;
}

async function deleteCategoryInDb(category) {
  const { error } = await supabaseClient.from('tasks').delete().eq('category', category);
  if (error) {
    showToast(`Could not delete category: ${error.message}`);
    return false;
  }
  return true;
}

async function bulkInsertTasksInDb(drafts) {
  if (!drafts.length) return [];
  const rows = drafts.map(d => ({
    text: d.text,
    category: d.category,
    subcategory: d.subcategory ?? null,
    assignee: d.assignee || 'Unassigned',
    status: d.status || 'open',
    notes: d.notes || '',
  }));
  const { data, error } = await supabaseClient.from('tasks').insert(rows).select();
  if (error) {
    showToast(`Import failed: ${error.message}`);
    return [];
  }
  return data.map(rowToTask);
}

// ---------- History ----------

function diffTask(oldTask, newTask) {
  const changes = [];
  if (oldTask.text !== newTask.text) changes.push('text edited');
  if (oldTask.category !== newTask.category) changes.push(`moved to ${newTask.category}`);
  if (oldTask.assignee !== newTask.assignee) changes.push(`assigned to ${newTask.assignee}`);
  if (oldTask.notes !== newTask.notes) changes.push('notes updated');
  return changes.length ? changes.join(', ') : 'saved with no changes';
}

async function logHistory(action, task, detail) {
  const { error } = await supabaseClient.from('task_history').insert({
    task_id: task && task.id ? task.id : null,
    task_text_snapshot: (task && task.text) || '',
    action,
    detail: detail || '',
    changed_by: (currentUser && currentUser.email) || 'unknown',
  });
  if (error) console.warn('History log failed (non-fatal):', error.message);
}

async function openHistoryView() {
  const { data, error } = await supabaseClient
    .from('task_history')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(100);
  if (error) {
    showToast(`Could not load history: ${error.message}`);
    return;
  }
  renderHistoryList(data || []);
  const backdrop = document.getElementById('historyBackdrop');
  backdrop.hidden = false;
  requestAnimationFrame(() => backdrop.removeAttribute('data-closing'));
}

function renderHistoryList(rows) {
  const list = document.getElementById('historyList');
  if (!rows.length) {
    list.innerHTML = '<p class="history-empty">No history yet.</p>';
    return;
  }
  const ACTION_LABEL = {
    created: 'Added',
    edited: 'Edited',
    status_changed: 'Status changed',
    deleted: 'Deleted',
    category_deleted: 'Category deleted',
    imported: 'Imported',
  };
  list.innerHTML = rows.map(r => {
    const when = new Date(r.created_at).toLocaleString('en-AU', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' });
    const label = ACTION_LABEL[r.action] || r.action;
    return `<div class="history-row">
      <p class="history-detail">${escapeHtml(label)}: "${escapeHtml(r.task_text_snapshot)}"${r.detail ? ` — ${escapeHtml(r.detail)}` : ''}</p>
      <p class="history-meta">${escapeHtml(r.changed_by)} · ${escapeHtml(when)}</p>
    </div>`;
  }).join('');
}

function closeHistoryView() {
  const backdrop = document.getElementById('historyBackdrop');
  backdrop.setAttribute('data-closing', '');
  setTimeout(() => { backdrop.hidden = true; }, 200);
}

// ---------- Realtime ----------

function subscribeToRealtime() {
  realtimeChannel = supabaseClient
    .channel('tasks-sync')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, handleRealtimeChange)
    .subscribe();
}

function handleRealtimeChange(payload) {
  if (payload.eventType === 'INSERT') {
    if (!state.tasks.some(t => t.id === payload.new.id)) {
      state.tasks.push(rowToTask(payload.new));
    }
  } else if (payload.eventType === 'UPDATE') {
    const idx = state.tasks.findIndex(t => t.id === payload.new.id);
    if (idx !== -1) state.tasks[idx] = rowToTask(payload.new);
  } else if (payload.eventType === 'DELETE') {
    state.tasks = state.tasks.filter(t => t.id !== payload.old.id);
  }
  renderChips();
  render();
}

// ---------- Export ----------

function exportTasks() {
  const extraCats = [...new Set(state.tasks.map(t => t.category))].filter(c => !CATEGORIES.includes(c));
  const orderedCats = [...CATEGORIES, ...extraCats];
  const divider = '='.repeat(54);

  let out = '618 MEDIA MASTER ACTION PLAN\n';
  out += `Exported from the Action Plan app on ${new Date().toLocaleDateString('en-AU', { day: '2-digit', month: 'long', year: 'numeric' })}\n\n`;

  for (const cat of orderedCats) {
    const items = state.tasks.filter(t => t.category === cat);
    if (!items.length) continue;

    out += `${divider}\n${cat}\n${divider}\n\n`;

    for (const bucket of bucketBySubcategory(items)) {
      if (bucket.subcategory) out += `${bucket.subcategory}\n\n`;
      for (const t of sortItems(bucket.items)) {
        const box = t.status === 'done' ? '[x]' : '[ ]';
        const assigneeTag = t.assignee && t.assignee !== 'Unassigned' ? ` (Assigned: ${t.assignee})` : '';
        out += `${box} ${t.text}${assigneeTag}\n`;
        if (t.notes) out += `    Note: ${t.notes}\n`;
        out += '\n';
      }
    }
  }

  const blob = new Blob([out], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `618-media-action-plan-${new Date().toISOString().slice(0, 10)}.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  showToast('Exported.');
}

// ---------- Rendering ----------

function getFilteredGrouped() {
  const { query, category, assignee, showDone } = state.filter;
  const searching = query.trim().length > 0;

  let tasks = state.tasks.filter(t => {
    if (!matchesSearch(t, query)) return false;
    if (category !== 'All' && t.category !== category) return false;
    if (assignee !== 'All' && (t.assignee || 'Unassigned') !== assignee) return false;
    if (!searching && !showDone && t.status === 'done' && category !== 'DONE') return false;
    return true;
  });

  const allCats = [...new Set([...CATEGORIES, ...tasks.map(t => t.category)])];
  const grouped = [];
  for (const cat of allCats) {
    const items = tasks.filter(t => t.category === cat);
    if (!items.length) continue;
    grouped.push({ category: cat, items });
  }
  return grouped;
}

function render() {
  const list = document.getElementById('list');
  const empty = document.getElementById('emptyState');
  const grouped = getFilteredGrouped();

  if (!grouped.length) {
    list.innerHTML = '';
    empty.hidden = false;
    empty.textContent = state.tasks.length
      ? 'Nothing here. Add a task or clear your filters.'
      : 'No tasks yet. Use Import in the menu to load your last exported plan, or tap + to add one.';
    return;
  }
  empty.hidden = true;

  let html = '';
  grouped.forEach(group => {
    const idx = CATEGORIES.indexOf(group.category);
    const numStr = idx >= 0 ? String(idx + 1).padStart(2, '0') : '--';
    const isUrgent = group.category === 'URGENT / BUGS';
    const openCount = group.items.filter(t => t.status !== 'done').length;

    html += `<section class="cat-section">
      <div class="cat-header">
        <span class="cat-num${isUrgent ? ' is-urgent' : ''}">${numStr}</span>
        <h2 class="cat-title">${escapeHtml(group.category)}</h2>
        <span class="cat-count">${openCount} open</span>
        <button class="cat-delete" data-action="delete-category" data-category="${escapeHtml(group.category)}" aria-label="Delete this whole category">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2.5 3.5H11.5M5 3.5V2.3C5 1.8 5.4 1.4 5.9 1.4H8.1C8.6 1.4 9 1.8 9 2.3V3.5M6 6.3V10.2M8 6.3V10.2M3.3 3.5L3.9 11.4C3.94 12 4.4 12.4 5 12.4H9C9.6 12.4 10.06 12 10.1 11.4L10.7 3.5" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </button>
      </div>
      <div class="cat-tasks">`;

    bucketBySubcategory(group.items).forEach(bucket => {
      if (bucket.subcategory) {
        html += `<p class="cat-sub">${escapeHtml(bucket.subcategory)}</p>`;
      }
      sortItems(bucket.items).forEach(t => {
        const done = t.status === 'done';
        html += `<div class="task-card${done ? ' is-done' : ''}${isUrgent ? ' is-urgent-cat' : ''}" data-id="${t.id}">
          <button class="task-check" data-action="toggle" data-id="${t.id}" aria-label="${done ? 'Mark open' : 'Mark done'}">
            ${done ? '<svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 6.2L4.8 9L10 3" stroke="white" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>' : ''}
          </button>
          <div class="task-body" data-action="edit" data-id="${t.id}">
            <p class="task-text">${escapeHtml(t.text)}</p>
            ${t.notes ? `<p class="task-notes">${escapeHtml(t.notes)}</p>` : ''}
            <div class="task-meta">
              <span class="badge assignee-${assigneeSlug(t.assignee)}">${escapeHtml(t.assignee || 'Unassigned')}</span>
            </div>
          </div>
        </div>`;
      });
    });

    html += `</div></section>`;
  });

  list.innerHTML = html;
}

function renderChips() {
  const assigneeChips = document.getElementById('assigneeChips');
  const categoryChips = document.getElementById('categoryChips');

  const assigneeOptions = ['All', ...ASSIGNEES];
  assigneeChips.innerHTML = assigneeOptions.map(a =>
    `<button class="chip${state.filter.assignee === a ? ' is-active' : ''}" data-filter="assignee" data-value="${escapeHtml(a)}">${escapeHtml(a)}</button>`
  ).join('');

  const categoryOptions = ['All', ...new Set([...CATEGORIES, ...state.tasks.map(t => t.category)])];
  categoryChips.innerHTML = categoryOptions.map(c => {
    const active = state.filter.category === c;
    const urgent = c === 'URGENT / BUGS';
    return `<button class="chip${active ? ' is-active' : ''}${active && urgent ? ' is-urgent' : ''}" data-filter="category" data-value="${escapeHtml(c)}">${escapeHtml(c === 'All' ? 'All' : c)}</button>`;
  }).join('');
}

// ---------- Modal ----------

function populateSelects() {
  const catSel = document.getElementById('taskCategory');
  catSel.innerHTML = CATEGORIES.map(c => `<option value="${escapeHtml(c)}">${escapeHtml(c)}</option>`).join('')
    + `<option value="Uncategorized">Uncategorized</option>`
    + `<option value="__new__">+ New category...</option>`;

  const assSel = document.getElementById('taskAssignee');
  assSel.innerHTML = ASSIGNEES.map(a => `<option value="${escapeHtml(a)}">${escapeHtml(a)}</option>`).join('');
}

function openModal(task) {
  state.editingId = task ? task.id : null;
  state.categoryManuallySet = !!task;

  document.getElementById('modalTitle').textContent = task ? 'Edit task' : 'Add task';
  document.getElementById('taskText').value = task ? task.text : '';
  document.getElementById('taskNotes').value = task ? (task.notes || '') : '';
  document.getElementById('taskCategoryCustom').hidden = true;
  document.getElementById('taskCategoryCustom').value = '';
  document.getElementById('suggestHint').hidden = true;

  const catSel = document.getElementById('taskCategory');
  if (task) {
    if (CATEGORIES.includes(task.category) || task.category === 'Uncategorized') {
      catSel.value = task.category;
    } else {
      catSel.value = '__new__';
      document.getElementById('taskCategoryCustom').hidden = false;
      document.getElementById('taskCategoryCustom').value = task.category;
    }
  } else {
    catSel.value = 'Uncategorized';
  }

  document.getElementById('taskAssignee').value = task ? (task.assignee || 'Unassigned') : 'Unassigned';
  document.getElementById('deleteTaskBtn').hidden = !task;

  const backdrop = document.getElementById('modalBackdrop');
  backdrop.hidden = false;
  requestAnimationFrame(() => backdrop.removeAttribute('data-closing'));
  document.getElementById('taskText').focus();
}

function closeModal() {
  const backdrop = document.getElementById('modalBackdrop');
  backdrop.setAttribute('data-closing', '');
  setTimeout(() => { backdrop.hidden = true; }, 200);
  state.editingId = null;
}

function onTaskTextInput() {
  if (state.categoryManuallySet) return;
  const text = document.getElementById('taskText').value;
  const guess = guessCategory(text);
  const hint = document.getElementById('suggestHint');
  if (guess) {
    document.getElementById('taskCategory').value = guess;
    hint.textContent = `Auto-detected: ${guess}`;
    hint.hidden = false;
  } else {
    hint.hidden = true;
  }
}

async function saveTaskFromModal() {
  const text = document.getElementById('taskText').value.trim();
  if (!text) { showToast('Add some text first.'); return; }

  let category = document.getElementById('taskCategory').value;
  if (category === '__new__') {
    const custom = document.getElementById('taskCategoryCustom').value.trim();
    category = custom || 'Uncategorized';
  }
  const assignee = document.getElementById('taskAssignee').value;
  const notes = document.getElementById('taskNotes').value.trim();

  const saveBtn = document.getElementById('saveTaskBtn');
  saveBtn.disabled = true;

  if (state.editingId) {
    const t = state.tasks.find(x => x.id === state.editingId);
    if (!t) { saveBtn.disabled = false; closeModal(); return; }
    const oldTask = { ...t };
    const patch = { text, category, assignee, notes };
    if (t.category !== category) patch.subcategory = null;
    const updated = await updateTaskInDb(t.id, patch);
    if (updated) {
      Object.assign(t, updated);
      renderChips();
      render();
      logHistory('edited', t, diffTask(oldTask, t));
    }
  } else {
    const created = await createTaskInDb({ text, category, subcategory: null, assignee, status: 'open', notes });
    if (created) {
      state.tasks.push(created);
      renderChips();
      render();
      logHistory('created', created, `Added to ${created.category}`);
    }
  }

  saveBtn.disabled = false;
  closeModal();
}

async function deleteTask() {
  if (!state.editingId) return;
  if (!confirm('Delete this task?')) return;
  const t = state.tasks.find(x => x.id === state.editingId);
  const ok = await deleteTaskInDb(state.editingId);
  if (ok) {
    state.tasks = state.tasks.filter(x => x.id !== state.editingId);
    renderChips();
    render();
    if (t) logHistory('deleted', t, `Removed from ${t.category}`);
  }
  closeModal();
}

function deleteCategory(category) {
  const count = state.tasks.filter(t => t.category === category).length;
  if (!count) return;
  const ok = confirm(`Delete all ${count} task${count === 1 ? '' : 's'} in "${category}"? This deletes them for Amro and Daniel, everywhere. This can't be undone.`);
  if (!ok) return;
  deleteCategoryInDb(category).then(success => {
    if (!success) return;
    state.tasks = state.tasks.filter(t => t.category !== category);
    renderChips();
    render();
    showToast(`Deleted ${count} task${count === 1 ? '' : 's'} from ${category}.`);
    logHistory('category_deleted', { text: category }, `${count} task${count === 1 ? '' : 's'} removed`);
  });
}

async function toggleTaskStatus(id) {
  const t = state.tasks.find(x => x.id === id);
  if (!t) return;
  const newStatus = t.status === 'done' ? 'open' : 'done';
  const updated = await updateTaskInDb(id, { status: newStatus });
  if (updated) {
    Object.assign(t, updated);
    render();
    logHistory('status_changed', t, newStatus === 'done' ? 'Marked done' : 'Reopened');
  }
}

// ---------- Event wiring ----------

function bindEvents() {
  document.getElementById('searchInput').addEventListener('input', e => {
    state.filter.query = e.target.value;
    document.getElementById('clearSearch').hidden = !e.target.value;
    render();
  });
  document.getElementById('clearSearch').addEventListener('click', () => {
    const input = document.getElementById('searchInput');
    input.value = '';
    state.filter.query = '';
    document.getElementById('clearSearch').hidden = true;
    render();
  });

  document.getElementById('assigneeChips').addEventListener('click', e => {
    const btn = e.target.closest('[data-filter="assignee"]');
    if (!btn) return;
    state.filter.assignee = btn.dataset.value;
    renderChips();
    render();
  });
  document.getElementById('categoryChips').addEventListener('click', e => {
    const btn = e.target.closest('[data-filter="category"]');
    if (!btn) return;
    state.filter.category = btn.dataset.value;
    renderChips();
    render();
  });

  document.getElementById('showDoneToggle').addEventListener('change', e => {
    state.filter.showDone = e.target.checked;
    render();
  });

  document.getElementById('list').addEventListener('click', e => {
    const toggleBtn = e.target.closest('[data-action="toggle"]');
    if (toggleBtn) { toggleTaskStatus(toggleBtn.dataset.id); return; }
    const deleteCatBtn = e.target.closest('[data-action="delete-category"]');
    if (deleteCatBtn) { deleteCategory(deleteCatBtn.dataset.category); return; }
    const editArea = e.target.closest('[data-action="edit"]');
    if (editArea) {
      const t = state.tasks.find(x => x.id === editArea.dataset.id);
      if (t) openModal(t);
    }
  });

  document.getElementById('fab').addEventListener('click', () => openModal(null));
  document.getElementById('cancelTaskBtn').addEventListener('click', closeModal);
  document.getElementById('saveTaskBtn').addEventListener('click', saveTaskFromModal);
  document.getElementById('deleteTaskBtn').addEventListener('click', deleteTask);
  document.getElementById('modalBackdrop').addEventListener('click', e => {
    if (e.target.id === 'modalBackdrop') closeModal();
  });

  document.getElementById('taskText').addEventListener('input', onTaskTextInput);
  document.getElementById('taskCategory').addEventListener('change', e => {
    state.categoryManuallySet = true;
    document.getElementById('taskCategoryCustom').hidden = e.target.value !== '__new__';
    document.getElementById('suggestHint').hidden = true;
  });

  document.getElementById('closeHistoryBtn').addEventListener('click', closeHistoryView);
  document.getElementById('historyBackdrop').addEventListener('click', e => {
    if (e.target.id === 'historyBackdrop') closeHistoryView();
  });

  const menuBtn = document.getElementById('menuBtn');
  const menuPanel = document.getElementById('menuPanel');
  menuBtn.addEventListener('click', () => {
    const open = menuPanel.hidden;
    menuPanel.hidden = !open;
    menuBtn.setAttribute('aria-expanded', String(open));
  });
  document.addEventListener('click', e => {
    if (!menuPanel.hidden && !menuPanel.contains(e.target) && e.target !== menuBtn && !menuBtn.contains(e.target)) {
      menuPanel.hidden = true;
    }
  });
  menuPanel.addEventListener('click', e => {
    const btn = e.target.closest('[data-action]');
    if (!btn) return;
    menuPanel.hidden = true;
    if (btn.dataset.action === 'history') openHistoryView();
    if (btn.dataset.action === 'import') document.getElementById('importFile').click();
    if (btn.dataset.action === 'export') exportTasks();
    if (btn.dataset.action === 'logout') handleLogout();
    if (btn.dataset.action === 'reset') {
      const count = state.tasks.length;
      const ok = confirm(`This permanently deletes all ${count} tasks for EVERYONE, Amro and Daniel both, on every device. This cannot be undone. Continue?`);
      if (!ok) return;
      Promise.all(state.tasks.map(t => deleteTaskInDb(t.id))).then(() => {
        state.tasks = [];
        renderChips();
        render();
        logHistory('deleted', { text: 'all tasks' }, `Reset: ${count} tasks removed`);
        showToast('All tasks deleted.');
      });
    }
  });

  document.getElementById('importFile').addEventListener('change', async e => {
    const file = e.target.files[0];
    e.target.value = '';
    if (!file) return;
    const text = await file.text();
    const parsed = parseImportText(text);
    if (!parsed.length) {
      showToast('No [ ] or [x] items found in that file.');
      return;
    }
    const existingTextSet = new Set(state.tasks.map(t => t.text.trim().toLowerCase()));
    const toInsert = [];
    let skipped = 0;
    for (const draft of parsed) {
      const key = draft.text.trim().toLowerCase();
      if (existingTextSet.has(key)) { skipped++; continue; }
      existingTextSet.add(key);
      toInsert.push(draft);
    }
    const created = await bulkInsertTasksInDb(toInsert);
    state.tasks.push(...created);
    renderChips();
    render();
    showToast(`Imported ${created.length} task${created.length === 1 ? '' : 's'}${skipped ? `, skipped ${skipped} duplicate${skipped === 1 ? '' : 's'}` : ''}.`);
    if (created.length) logHistory('imported', { text: file.name }, `${created.length} tasks imported`);
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      if (!document.getElementById('modalBackdrop').hidden) closeModal();
      if (!document.getElementById('historyBackdrop').hidden) closeHistoryView();
    }
  });
}

// ---------- Auth ----------

function showGateScreen(errorMsg) {
  document.getElementById('loadingScreen').hidden = true;
  document.getElementById('app').hidden = true;
  const gate = document.getElementById('gate');
  gate.hidden = false;
  const err = document.getElementById('gateError');
  if (errorMsg) {
    err.textContent = errorMsg;
    err.hidden = false;
    const card = gate.querySelector('.gate-card');
    card.classList.remove('shake');
    void card.offsetWidth;
    card.classList.add('shake');
  } else {
    err.hidden = true;
  }
}

function showLoading(text) {
  document.getElementById('gate').hidden = true;
  document.getElementById('app').hidden = true;
  document.getElementById('loadingText').textContent = text || 'Loading...';
  document.getElementById('loadingScreen').hidden = false;
}

async function handleLogin(email, password) {
  showLoading('Logging in...');
  const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password });
  if (error) {
    showGateScreen("Couldn't log in. Check your email and password.");
    return;
  }
  currentUser = data.user;
  await bootApp();
}

function handleLogout() {
  supabaseClient.auth.signOut();
  if (realtimeChannel) supabaseClient.removeChannel(realtimeChannel);
  currentUser = null;
  state.tasks = [];
  location.reload();
}

async function bootApp() {
  showLoading('Loading your tasks...');
  state.tasks = await loadTasksFromDb();
  subscribeToRealtime();
  populateSelects();
  renderChips();
  render();
  const label = document.getElementById('menuUserLabel');
  if (label) label.textContent = `Logged in as ${currentUser?.email || ''}`;
  document.getElementById('loadingScreen').hidden = true;
  document.getElementById('gate').hidden = true;
  document.getElementById('app').hidden = false;
}

// ---------- Boot ----------

async function initApp() {
  if (!SUPABASE_URL || SUPABASE_URL.includes('PASTE_YOUR')) {
    showGateScreen('Supabase isn\u2019t configured yet, edit index.html and add your project URL and key.');
    return;
  }

  supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  bindEvents();

  document.getElementById('gateForm').addEventListener('submit', e => {
    e.preventDefault();
    const email = document.getElementById('gateEmail').value.trim();
    const password = document.getElementById('gateInput').value;
    if (!email || !password) { showGateScreen('Enter both email and password.'); return; }
    handleLogin(email, password);
  });

  showLoading('Checking your session...');
  const { data: { session } } = await supabaseClient.auth.getSession();
  if (session) {
    currentUser = session.user;
    await bootApp();
  } else {
    showGateScreen();
  }

  supabaseClient.auth.onAuthStateChange((event, session) => {
    if (event === 'SIGNED_OUT') {
      showGateScreen();
    }
  });
}

initApp();
