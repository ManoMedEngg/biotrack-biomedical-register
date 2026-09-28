/* =========================================================
   BioTrack main application
   ========================================================= */
(() => {
  'use strict';

  const data = window.BioTrackData;
  const keys = data.keys;
  const $ = s => document.querySelector(s);
  const canManage = () => window.BioTrackAuth?.canManage() === true;
  const esc = s => String(s || '').replace(/[&<>"']/g, c =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  /* ---------- State ---------- */
  let equipment = JSON.parse(localStorage.getItem('biotrack-equipment') || 'null') || data.initial;
  let history = JSON.parse(localStorage.getItem('biotrack-history') || 'null') || data.buildHistory(equipment);
  let stock = JSON.parse(localStorage.getItem('biotrack-stock') || 'null') || data.buildStock();
  let logs = JSON.parse(localStorage.getItem('biotrack-logs') || 'null') || [];
  let team = JSON.parse(localStorage.getItem('biotrack-team') || 'null') || [];
  let notifications = JSON.parse(localStorage.getItem('biotrack-alerts') || 'null') || [];

  let editingId = null, editingEventId = null, selectedId = null;
  let editingStockId = null, editingLogId = null, selectedLogId = null;

  function save() {
    localStorage.setItem('biotrack-equipment', JSON.stringify(equipment));
    localStorage.setItem('biotrack-history', JSON.stringify(history));
    localStorage.setItem('biotrack-stock', JSON.stringify(stock));
    localStorage.setItem('biotrack-logs', JSON.stringify(logs));
    localStorage.setItem('biotrack-team', JSON.stringify(team));
    localStorage.setItem('biotrack-alerts', JSON.stringify(notifications));
    window.dispatchEvent(new Event('biotrack-local-change'));
  }

  /* ---------- Equipment table ---------- */
  function fillDepartments() {
    const current = $('#department').value;
    const ds = [...new Set(equipment.map(x => x.department).filter(Boolean))].sort();
    $('#department').innerHTML = '<option value="">All departments</option>' +
      ds.map(d => `<option ${d === current ? 'selected' : ''}>${esc(d)}</option>`).join('');
  }

  function visible() {
    const q = $('#search').value.trim().toLowerCase();
    const dept = $('#department').value;
    return equipment.filter(x =>
      (!dept || x.department === dept) &&
      (!q || keys.some(k => String(x[k]).toLowerCase().includes(q)))
    );
  }

  function render() {
    fillDepartments();
    const data2 = visible();
    $('#totalCount').textContent = equipment.length;
    $('#deptCount').textContent = new Set(equipment.map(x => x.department).filter(Boolean)).size;
    $('#historyCount').textContent = history.length;
    $('#empty').hidden = !!data2.length;
    $('#rows').innerHTML = data2.map((x, i) => `
      <tr onclick="openHistory('${x.id}')">
        <td>${i + 1}</td>
        <td><span class="tag">${esc(x.department)}</span></td>
        <td><strong>${esc(x.name)}</strong></td>
        <td>${esc(x.make) || '<span class="muted">—</span>'}</td>
        <td>${esc(x.model) || '<span class="muted">—</span>'}</td>
        <td>${esc(x.serial) || '<span class="muted">—</span>'}</td>
        <td>${esc(x.assetCode) || '<span class="muted">—</span>'}</td>
        <td class="actions" data-write>
          <button class="plain" onclick="event.stopPropagation();editItem('${x.id}')">Edit</button>
          <button class="plain" onclick="event.stopPropagation();openHistory('${x.id}')">History</button>
          <button class="danger" onclick="event.stopPropagation();removeItem('${x.id}')">Remove</button>
        </td>
      </tr>`).join('');
  }

  /* ---------- Equipment editor ---------- */
  function openEditor(item) {
    if (!canManage()) return;
    editingId = item?.id || null;
    $('#dialogTitle').textContent = editingId ? 'Edit equipment' : 'Add equipment';
    const f = $('#equipmentForm');
    f.reset();
    keys.forEach(k => f.elements[k].value = item?.[k] || '');
    $('#editor').showModal();
  }

  window.editItem = id => openEditor(equipment.find(x => x.id === id));
  window.removeItem = id => {
    if (!canManage()) return;
    const item = equipment.find(x => x.id === id);
    if (confirm(`Remove "${item.name}" and its service history?`)) {
      equipment = equipment.filter(x => x.id !== id);
      history = history.filter(x => x.equipmentId !== id);
      save(); render();
    }
  };

  /* ---------- History ---------- */
  const prettyDate = d => d
    ? new Date(d + 'T00:00:00').toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' })
    : 'No date';

  const selected = () => equipment.find(x => x.id === selectedId);
  const eventList = () => history.filter(x => x.equipmentId === selectedId).sort((a, b) => b.date.localeCompare(a.date));

  function renderHistory() {
    const e = selected();
    if (!e) return;
    $('#historyName').textContent = e.name;
    $('#historyMeta').innerHTML = [e.department, e.make, e.model, e.serial && `S/N: ${e.serial}`, e.assetCode && `Asset: ${e.assetCode}`]
      .filter(Boolean).map(x => `<span>${esc(x)}</span>`).join('');
    const list = eventList();
    $('#timeline').innerHTML = list.length
      ? list.map(x => `
          <div class="event">
            <div class="event-date">${prettyDate(x.date)}</div>
            <div class="event-dot"></div>
            <div class="event-card">
              <b>${esc(x.type)}</b>
              <p>${esc(x.details)}</p>
              ${x.provider ? `<p>By: ${esc(x.provider)}</p>` : ''}
              ${x.nextDue ? `<p>Next due: ${prettyDate(x.nextDue)}</p>` : ''}
            </div>
            <div class="event-actions" data-write>
              <button class="plain" onclick="editHistory('${x.id}')">Edit</button>
              <button class="danger" onclick="removeHistory('${x.id}')">Delete</button>
            </div>
          </div>`).join('')
      : '<div class="timeline-empty">No history recorded yet. Add the first event for this device.</div>';
  }

  window.openHistory = id => { selectedId = id; renderHistory(); $('#historyDialog').showModal(); };

  function openEvent(eventItem) {
    if (!canManage()) return;
    editingEventId = eventItem?.id || null;
    $('#eventTitle').textContent = editingEventId ? 'Edit history event' : 'Add history event';
    const f = $('#eventForm');
    f.reset();
    Object.entries(eventItem || { date: new Date().toISOString().slice(0, 10), type: 'General check' })
      .forEach(([k, v]) => { if (f.elements[k]) f.elements[k].value = v || ''; });
    $('#eventDialog').showModal();
  }

  window.editHistory = id => openEvent(history.find(x => x.id === id));
  window.removeHistory = id => {
    if (!canManage()) return;
    if (confirm('Delete this service-history event?')) {
      history = history.filter(x => x.id !== id);
      save(); render(); renderHistory();
    }
  };

  /* ---------- Wire up equipment UI ---------- */
  $('#addBtn').onclick = () => openEditor();
  $('#closeBtn').onclick = $('#cancelBtn').onclick = () => $('#editor').close();
  $('#historyClose').onclick = () => $('#historyDialog').close();
  $('#eventClose').onclick = $('#eventCancel').onclick = () => $('#eventDialog').close();
  $('#addHistoryBtn').onclick = () => openEvent();
  $('#search').oninput = render;
  $('#department').onchange = render;

  $('#equipmentForm').onsubmit = e => {
    e.preventDefault();
    if (!canManage()) return;
    const values = Object.fromEntries(new FormData(e.target));
    if (editingId) equipment = equipment.map(x => x.id === editingId ? { ...x, ...values } : x);
    else equipment.push({ id: 'user-' + Date.now(), ...values });
    save(); $('#editor').close(); render();
  };

  $('#eventForm').onsubmit = e => {
    e.preventDefault();
    if (!canManage()) return;
    const values = Object.fromEntries(new FormData(e.target));
    if (editingEventId) history = history.map(x => x.id === editingEventId ? { ...x, ...values } : x);
    else history.push({ id: 'event-' + Date.now(), equipmentId: selectedId, ...values });
    save(); $('#eventDialog').close(); render(); renderHistory();
  };

  /* ---------- Exports ---------- */
  function download(name, content, type) {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([content], { type }));
    a.download = name; a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 250);
  }
  const xml = v => String(v || '').replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
  const sheet = (name, rows) => `<Worksheet ss:Name="${name}"><Table>${
    rows.map((r, i) => '<Row>' + r.map(v =>
      `<Cell ss:StyleID="${i ? 'cell' : 'head'}"><Data ss:Type="String">${xml(v)}</Data></Cell>`
    ).join('') + '</Row>').join('')}</Table></Worksheet>`;

  function exportExcel() {
    const h = ['S.No', 'Department', 'Equpiment Name', 'Make', 'Model', 'Serial Number', 'Assert Code'];
    const rows = [h, ...visible().map((x, i) => [i + 1, x.department, x.name, x.make, x.model, x.serial, x.assetCode])];
    const historyRows = [
      ['Equipment', 'Serial number', 'Event date', 'Event type', 'Details', 'Engineer / company', 'Next due'],
      ...history.map(x => {
        const e = equipment.find(q => q.id === x.equipmentId) || {};
        return [e.name, e.serial, x.date, x.type, x.details, x.provider, x.nextDue];
      })
    ];
    const file = `<?xml version="1.0"?><Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"><Styles><Style ss:ID="head"><Font ss:Bold="1"/><Interior ss:Color="#DDEBF7" ss:Pattern="Solid"/></Style><Style ss:ID="cell"><Alignment ss:Vertical="Center"/></Style></Styles>${sheet('Consolidated Equpment list', rows)}${sheet('Equipment History', historyRows)}</Workbook>`;
    download('Biomedical_Equipment_Register.xls', file, 'application/vnd.ms-excel');
  }

  function exportWord() {
    const cells = x => `<td>${xml(x || '—')}</td>`;
    const body = visible().map((x, i) =>
      `<tr>${cells(i + 1)}${cells(x.department)}${cells(x.name)}${cells(x.make)}${cells(x.model)}${cells(x.serial)}${cells(x.assetCode)}</tr>`
    ).join('');
    const doc = `<!doctype html><html><head><meta charset="utf-8"><style>body{font-family:Arial;color:#183047}h1{color:#12355b}table{border-collapse:collapse;width:100%;font-size:10pt}th{background:#ddebF7}td,th{border:1px solid #9db0bd;padding:6px;text-align:left}</style></head><body><h1>Biomedical Equipment Register</h1><p>Generated ${new Date().toLocaleDateString()}</p><table><tr><th>S.No</th><th>Department</th><th>Equpiment Name</th><th>Make</th><th>Model</th><th>Serial Number</th><th>Assert Code</th></tr>${body}</table></body></html>`;
    download('Biomedical_Equipment_Register.doc', doc, 'application/msword');
  }

  function downloadDeviceReport() {
    const e = selected();
    const rows = eventList().map(x =>
      `<tr><td>${prettyDate(x.date)}</td><td>${xml(x.type)}</td><td>${xml(x.details)}</td><td>${xml(x.provider || '—')}</td></tr>`
    ).join('');
    const doc = `<!doctype html><html><head><meta charset="utf-8"><style>body{font-family:Arial;color:#183047}h1{color:#12355b}table{border-collapse:collapse;width:100%;font-size:10pt}th{background:#ddebF7}td,th{border:1px solid #9db0bd;padding:6px;text-align:left}</style></head><body><h1>${xml(e.name)} — Device lifecycle</h1><p>Department: ${xml(e.department)}<br>Serial number: ${xml(e.serial || '—')}<br>Model: ${xml(e.model || '—')}</p><table><tr><th>Date</th><th>Event</th><th>Details</th><th>Engineer / company</th></tr>${rows}</table></body></html>`;
    download(`${e.name.replace(/[^a-z0-9]+/gi, '_')}_history.doc`, doc, 'application/msword');
  }

  /* ---------- Stock ---------- */
  const stockKey = s => String(s || '').toLowerCase().replace(/[^a-z0-9]/g, '');

  function stockBalances() {
    const map = new Map();
    stock.forEach(x => {
      const key = stockKey(x.product);
      const item = map.get(key) || { product: x.product, received: 0, issued: 0 };
      item[x.direction] += Number(x.quantity) || 0;
      map.set(key, item);
    });
    return [...map.values()]
      .map(x => ({ ...x, balance: x.received - x.issued }))
      .sort((a, b) => a.product.localeCompare(b.product));
  }

  function renderStock() {
    const balances = stockBalances();
    const rec = stock.filter(x => x.direction === 'received').reduce((a, x) => a + (+x.quantity || 0), 0);
    const issued = stock.filter(x => x.direction === 'issued').reduce((a, x) => a + (+x.quantity || 0), 0);
    $('#stockItems').textContent = balances.length;
    $('#stockReceived').textContent = rec;
    $('#stockIssued').textContent = issued;
    $('#stockList').innerHTML = balances.length
      ? balances.map(x => `
          <div class="data-row">
            <div><b>${esc(x.product)}</b><br><small>Received ${x.received} · Issued ${x.issued}</small></div>
            <b class="${x.balance < 0 ? 'negative' : 'positive'}">${x.balance}</b>
            <small>${x.balance < 0 ? 'Review' : 'On hand'}</small>
            <span></span>
          </div>`).join('')
      : '<p class="no-data">No stock records.</p>';
    $('#stockMoves').innerHTML = stock.slice().sort((a, b) => b.date.localeCompare(a.date)).map(x => `
      <div class="data-row">
        <div><b>${esc(x.product)}</b><br><small>${prettyDate(x.date)} · ${esc(x.party || '—')}</small></div>
        <b class="${x.direction === 'received' ? 'positive' : 'negative'}">${x.direction === 'received' ? '+' : '−'}${x.quantity}</b>
          <button class="plain" data-write onclick="editStock('${x.id}')">Edit</button>
          <button class="danger" data-write onclick="deleteStock('${x.id}')">×</button>
      </div>`).join('');
  }

  function openStockEditor(item) {
    if (!canManage()) return;
    editingStockId = item?.id || null;
    $('#stockTitle').textContent = editingStockId ? 'Edit stock movement' : 'Record stock movement';
    const f = $('#stockForm'); f.reset();
    Object.entries(item || { direction: 'received', date: new Date().toISOString().slice(0, 10) })
      .forEach(([k, v]) => { if (f.elements[k]) f.elements[k].value = v || ''; });
    $('#stockEditor').showModal();
  }

  window.editStock = id => openStockEditor(stock.find(x => x.id === id));
  window.deleteStock = id => {
    if (!canManage()) return;
    if (confirm('Delete this stock movement?')) {
      stock = stock.filter(x => x.id !== id);
      save(); renderStock();
    }
  };

  /* ---------- Team ---------- */
  function renderTeam() {
    $('#teamList').innerHTML = team.length
      ? team.map(x => `
          <div class="team-row">
            <span><b>${esc(x.member)}</b><br><small>${esc(x.role)}</small></span>
            <button class="danger" data-write onclick="deleteTeam('${x.id}')">Remove</button>
          </div>`).join('')
      : '<p class="no-data">No collaborators added.</p>';
  }
  window.deleteTeam = id => {
    if (!canManage()) return;
    team = team.filter(x => x.id !== id); save(); renderTeam();
  };

  /* ---------- Logs ---------- */
  function renderLogs() {
    const sorted = logs.slice().sort((a, b) => b.date.localeCompare(a.date));
    $('#logList').innerHTML = sorted.length
      ? sorted.map(x => `
          <div class="log-item" onclick="openLog('${x.id}')">
            <b>${esc(x.text)}</b>
            <span>${prettyDate(x.date)} · ${esc(x.author)} · ${(x.comments || []).length} comments</span>
            <div class="event-actions" data-write>
              <button class="plain" onclick="event.stopPropagation();editLog('${x.id}')">Edit</button>
              <button class="danger" onclick="event.stopPropagation();deleteLog('${x.id}')">Delete</button>
            </div>
          </div>`).join('')
      : '<p class="no-data">No daily updates yet.</p>';
    renderTeam();
  }

  function openLogEditor(item) {
    if (!canManage()) return;
    editingLogId = item?.id || null;
    $('#logTitle').textContent = editingLogId ? 'Edit daily update' : 'Add daily update';
    const f = $('#logForm'); f.reset();
    Object.entries(item || { date: new Date().toISOString().slice(0, 10) })
      .forEach(([k, v]) => { if (f.elements[k]) f.elements[k].value = v || ''; });
    $('#logEditor').showModal();
  }

  window.editLog = id => openLogEditor(logs.find(x => x.id === id));
  window.deleteLog = id => {
    if (!canManage()) return;
    if (confirm('Delete this daily update?')) {
      logs = logs.filter(x => x.id !== id);
      save(); renderLogs();
    }
  };

  const activeLog = () => logs.find(x => x.id === selectedLogId);

  function renderLogDetail() {
    const log = activeLog();
    if (!log) return;
    $('#detailTitle').textContent = `${prettyDate(log.date)} · ${log.author}`;
    $('#detailText').textContent = log.text;
    $('#comments').innerHTML = (log.comments || []).map(c =>
      `<div class="comment"><b>${esc(c.author)}</b> <small>${prettyDate(c.date)}</small><br>${esc(c.text)}</div>`
    ).join('') || '<p class="no-data">No comments yet.</p>';
  }

  window.openLog = id => { selectedLogId = id; renderLogDetail(); $('#logDetail').showModal(); };

  /* ---------- Alerts ---------- */
  function renderAlerts() {
    const unread = notifications.filter(x => !x.read);
    $('#alertCount').hidden = !unread.length;
    $('#alertCount').textContent = unread.length;
    $('#alertsList').innerHTML = notifications.length
      ? notifications.slice().reverse().map(x => `
          <div class="notify-item">
            <b>${esc(x.title)}</b><span>${esc(x.text)}</span><br><small>${prettyDate(x.date)}</small>
          </div>`).join('')
      : '<p class="no-data">You have no new notifications.</p>';
  }

  /* ---------- Wire up workspace UI ---------- */
  // Stock (topbar + toolbar both point to the same action)
  const openStock = () => { renderStock(); $('#stockDialog').showModal(); };
  $('#stockBtn').onclick = openStock;
  $('#stockBtnMain').onclick = openStock;
  $('#stockClose').onclick = () => $('#stockDialog').close();
  $('#addStockBtn').onclick = () => openStockEditor();
  $('#stockEditClose').onclick = $('#stockCancel').onclick = () => $('#stockEditor').close();

  $('#stockForm').onsubmit = e => {
    e.preventDefault();
    if (!canManage()) return;
    const values = Object.fromEntries(new FormData(e.target));
    values.quantity = Number(values.quantity);
    if (editingStockId) stock = stock.map(x => x.id === editingStockId ? { ...x, ...values } : x);
    else stock.push({ id: 'stock-user-' + Date.now(), ...values });
    save(); $('#stockEditor').close(); renderStock();
  };

  // Logs
  $('#logBtn').onclick = $('#logbookBtn').onclick = () => { renderLogs(); $('#logDialog').showModal(); };
  $('#logClose').onclick = () => $('#logDialog').close();
  $('#addLogBtn').onclick = () => openLogEditor();
  $('#logEditClose').onclick = $('#logCancel').onclick = () => $('#logEditor').close();

  $('#logForm').onsubmit = e => {
    e.preventDefault();
    if (!canManage()) return;
    const values = Object.fromEntries(new FormData(e.target));
    if (editingLogId) logs = logs.map(x => x.id === editingLogId ? { ...x, ...values } : x);
    else logs.push({ id: 'log-' + Date.now(), comments: [], ...values });
    save(); $('#logEditor').close(); renderLogs();
  };

  $('#teamForm').onsubmit = e => {
    e.preventDefault();
    if (!canManage()) return;
    const v = Object.fromEntries(new FormData(e.target));
    team.push({ id: 'team-' + Date.now(), ...v });
    save(); e.target.reset(); renderTeam();
  };

  // Log detail + comments
  $('#logDetailClose').onclick = () => $('#logDetail').close();
  $('#commentForm').onsubmit = e => {
    e.preventDefault();
    if (!canManage()) return;
    const v = Object.fromEntries(new FormData(e.target));
    const log = activeLog();
    log.comments = log.comments || [];
    log.comments.push({ id: 'comment-' + Date.now(), ...v, date: new Date().toISOString().slice(0, 10) });
    notifications.push({
      id: 'alert-' + Date.now(),
      title: `New comment on ${prettyDate(log.date)}`,
      text: `${v.author}: ${v.text}`,
      date: new Date().toISOString().slice(0, 10),
      read: false
    });
    save(); e.target.reset(); renderLogDetail(); renderLogs(); renderAlerts();
  };

  // Alerts
  $('#alertsBtn').onclick = () => {
    if (canManage()) {
      notifications.forEach(x => x.read = true);
      save(); renderAlerts();
    }
    $('#alertsDialog').showModal();
  };
  $('#alertsClose').onclick = () => $('#alertsDialog').close();

  // Exports
  $('#excelBtn').onclick = exportExcel;
  $('#wordBtn').onclick = exportWord;
  $('#downloadHistoryBtn').onclick = downloadDeviceReport;

  // Theme dots
  document.querySelectorAll('[data-theme]').forEach(b => b.onclick = () => {
    document.body.dataset.theme = b.dataset.theme;
    localStorage.setItem('biotrack-theme', b.dataset.theme);
  });
  document.body.dataset.theme = localStorage.getItem('biotrack-theme') || 'ocean';

  // Initial render
  render();
  renderAlerts();
  window.BioTrackApp = {
    refreshFromCloud() {
      equipment = JSON.parse(localStorage.getItem('biotrack-equipment') || '[]');
      history = JSON.parse(localStorage.getItem('biotrack-history') || '[]');
      stock = JSON.parse(localStorage.getItem('biotrack-stock') || '[]');
      logs = JSON.parse(localStorage.getItem('biotrack-logs') || '[]');
      notifications = JSON.parse(localStorage.getItem('biotrack-alerts') || '[]');
      render();
      renderAlerts();
    }
  };
})();