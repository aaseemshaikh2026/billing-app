let activeClientId = null;

// ─── INIT ─────────────────────────────────────────────────────
loadCurrentUser();
loadClients();
setDefaultMonth();

async function loadCurrentUser() {
    try {
        const user = await apiCall('/api/current-user');
        document.getElementById('userInfo').innerHTML = `<span>👤 ${user.full_name}</span><button onclick="logout()">Logout</button>`;
    } catch { window.location.href = '/login'; }
}

function logout() { if (confirm('Logout?')) window.location.href = '/logout'; }

// ─── NOTIFICATIONS & API ──────────────────────────────────────
function showNotification(msg, isError = false) {
    const n = document.getElementById('notification');
    n.textContent = msg; n.className = 'notification' + (isError ? ' error' : ''); n.style.display = 'block';
    setTimeout(() => n.style.display = 'none', 3000);
}

async function apiCall(url, method = 'GET', data = null) {
    const opts = { method, headers: { 'Content-Type': 'application/json' } };
    if (data) opts.body = JSON.stringify(data);
    const r = await fetch(url, opts);
    if (r.status === 401) { window.location.href = '/login'; return; }
    const json = await r.json();
    if (!r.ok) { showNotification(json.error || 'Request failed', true); throw new Error(json.error); }
    return json;
}

// ─── CLIENT MANAGEMENT ────────────────────────────────────────
async function loadClients() {
    const clients = await apiCall('/api/clients');
    const sel = document.getElementById('activeClient');
    sel.innerHTML = '<option value="">-- Select Client --</option>' + clients.map(c => `<option value="${c.id}">${c.client_name}</option>`).join('');
    if (activeClientId) { sel.value = activeClientId; onClientChange(); }
    else { showNoClient(); }
}

function onClientChange() {
    activeClientId = document.getElementById('activeClient').value;
    if (!activeClientId) { showNoClient(); return; }
    document.getElementById('noClient').classList.remove('active');
    document.querySelectorAll('.tab-btn')[0].click();
}

function showNoClient() {
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    document.getElementById('noClient').classList.add('active');
}

function showAddClient() {
    document.getElementById('modal').classList.remove('hidden');
    document.getElementById('modalClientName').value = '';
    document.getElementById('modalClientDesc').value = '';
    document.getElementById('modalClientName').focus();
}

function closeModal() { document.getElementById('modal').classList.add('hidden'); }

async function submitNewClient() {
    const name = document.getElementById('modalClientName').value;
    const desc = document.getElementById('modalClientDesc').value;
    if (!name.trim()) { showNotification('Client name is required', true); return; }
    const c = await apiCall('/api/clients', 'POST', { client_name: name, description: desc });
    activeClientId = c.id;
    closeModal();
    showNotification('Client created!');
    loadClients();
}

async function editClient() {
    if (!activeClientId) { showNotification('Select a client first', true); return; }
    const name = prompt('Edit client name:');
    if (name) { await apiCall(`/api/clients/${activeClientId}`, 'PUT', { client_name: name }); showNotification('Client updated!'); loadClients(); }
}

async function deleteClient() {
    if (!activeClientId) return;
    if (confirm('Delete this client and ALL its data? This cannot be undone.')) {
        await apiCall(`/api/clients/${activeClientId}`, 'DELETE');
        activeClientId = null; showNotification('Client deleted!'); loadClients();
    }
}

// ─── TAB SWITCHING ────────────────────────────────────────────
document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        if (!activeClientId && btn.dataset.tab !== 'settings') { showNotification('Select a client first', true); return; }
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
        btn.classList.add('active');
        document.getElementById(btn.dataset.tab).classList.add('active');
        const t = btn.dataset.tab;
        if (t === 'roles') loadRoles();
        if (t === 'employees') { loadRoles(); loadEmployees(); }
        if (t === 'holidays') loadHolidays();
        if (t === 'leaves') { loadEmployees(); loadLeaves(); }
        if (t === 'dashboard') setDefaultMonth();
        if (t === 'settings') loadSecurityQuestions();
    });
});

// ─── ROLES ────────────────────────────────────────────────────
async function loadRoles() {
    const roles = await apiCall(`/api/clients/${activeClientId}/roles`);
    document.getElementById('rolesTable').innerHTML = roles.length === 0 ? '<p>No roles yet.</p>' : `<table><thead><tr><th>Role</th><th>Rate (USD/hr)</th><th>Actions</th></tr></thead><tbody>${roles.map(r => `<tr><td>${r.role_name}</td><td>$${r.hourly_rate_usd.toFixed(2)}</td><td><button class="btn-edit" onclick="editRole(${r.id},'${r.role_name}',${r.hourly_rate_usd})">Edit</button><button class="btn-danger" onclick="deleteRole(${r.id})">Delete</button></td></tr>`).join('')}</tbody></table>`;
    const sel = document.getElementById('empRole');
    sel.innerHTML = '<option value="">Select Role</option>' + roles.map(r => `<option value="${r.id}">${r.role_name} ($${r.hourly_rate_usd}/hr)</option>`).join('');
}

document.getElementById('roleForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    await apiCall(`/api/clients/${activeClientId}/roles`, 'POST', { role_name: document.getElementById('roleName').value, hourly_rate_usd: parseFloat(document.getElementById('roleRate').value) });
    showNotification('Role added!'); e.target.reset(); loadRoles();
});

async function editRole(id, name, rate) {
    const n = prompt('Role Name:', name); const r = prompt('Hourly Rate:', rate);
    if (n && r) { await apiCall(`/api/roles/${id}`, 'PUT', { role_name: n, hourly_rate_usd: parseFloat(r) }); showNotification('Role updated!'); loadRoles(); }
}
async function deleteRole(id) { if (confirm('Delete this role?')) { await apiCall(`/api/roles/${id}`, 'DELETE'); showNotification('Role deleted!'); loadRoles(); } }

// ─── EMPLOYEES ────────────────────────────────────────────────
async function loadEmployees() {
    const emps = await apiCall(`/api/clients/${activeClientId}/employees`);
    document.getElementById('employeesTable').innerHTML = emps.length === 0 ? '<p>No employees yet.</p>' : `<table><thead><tr><th>Name</th><th>Role</th><th>Rate</th><th>Start Date</th><th>Status</th><th>Actions</th></tr></thead><tbody>${emps.map(e => `<tr><td>${e.name}</td><td>${e.role_name}</td><td>$${e.hourly_rate.toFixed(2)}</td><td>${e.billing_start_date}</td><td>${e.is_active ? '✅' : '❌'}</td><td><button class="btn-edit" onclick="editEmployee(${e.id})">Edit</button><button class="btn-danger" onclick="deleteEmployee(${e.id})">Delete</button></td></tr>`).join('')}</tbody></table>`;
    const opts = emps.map(e => `<option value="${e.id}">${e.name}</option>`).join('');
    document.getElementById('leaveEmployee').innerHTML = '<option value="">Select Employee</option>' + opts;
    document.getElementById('filterEmployee').innerHTML = '<option value="">All</option>' + opts;
}

document.getElementById('employeeForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    await apiCall(`/api/clients/${activeClientId}/employees`, 'POST', { name: document.getElementById('empName').value, role_id: parseInt(document.getElementById('empRole').value), billing_start_date: document.getElementById('empStartDate').value, is_active: document.getElementById('empActive').checked });
    showNotification('Employee added!'); e.target.reset(); loadEmployees();
});

async function editEmployee(id) { const n = prompt('Edit name:'); if (n) { await apiCall(`/api/employees/${id}`, 'PUT', { name: n }); showNotification('Updated!'); loadEmployees(); } }
async function deleteEmployee(id) { if (confirm('Delete employee and all their data?')) { await apiCall(`/api/employees/${id}`, 'DELETE'); showNotification('Deleted!'); loadEmployees(); } }

// ─── HOLIDAYS ─────────────────────────────────────────────────
let holidayCount = 0;
async function loadHolidays() {
    const year = document.getElementById('filterYear').value;
    const url = `/api/clients/${activeClientId}/holidays` + (year ? `?year=${year}` : '');
    const holidays = await apiCall(url);
    document.getElementById('holidaysTable').innerHTML = holidays.length === 0 ? '<p>No holidays.</p>' : `<table><thead><tr><th>Date</th><th>Description</th><th>Year</th><th>Actions</th></tr></thead><tbody>${holidays.map(h => `<tr><td>${h.date}</td><td>${h.description}</td><td>${h.year}</td><td><button class="btn-danger" onclick="deleteHoliday(${h.id})">Delete</button></td></tr>`).join('')}</tbody></table>`;
}

function addHolidayRow() {
    if (!document.getElementById('holidayYear').value) { alert('Enter year first'); return; }
    holidayCount++;
    document.getElementById('holidayInputs').innerHTML += `<div class="holiday-input-row"><input type="date" id="hd${holidayCount}"><input type="text" id="hdesc${holidayCount}" placeholder="Description"><button type="button" onclick="this.parentElement.remove()">✕</button></div>`;
    document.getElementById('submitHolidays').style.display = 'block';
}

async function submitHolidays() {
    const holidays = [];
    for (let i = 1; i <= holidayCount; i++) {
        const d = document.getElementById(`hd${i}`); const desc = document.getElementById(`hdesc${i}`);
        if (d && d.value) holidays.push({ date: d.value, description: desc ? desc.value : '' });
    }
    if (!holidays.length) { alert('Add at least one date'); return; }
    const r = await apiCall(`/api/clients/${activeClientId}/holidays`, 'POST', { holidays });
    showNotification(`${r.added} holidays added!`);
    document.getElementById('holidayInputs').innerHTML = ''; document.getElementById('submitHolidays').style.display = 'none'; holidayCount = 0; loadHolidays();
}

async function deleteHoliday(id) { if (confirm('Delete?')) { await apiCall(`/api/holidays/${id}`, 'DELETE'); showNotification('Deleted!'); loadHolidays(); } }

// ─── LEAVES ───────────────────────────────────────────────────
async function loadLeaves() {
    const empId = document.getElementById('filterEmployee').value;
    const url = `/api/clients/${activeClientId}/leaves` + (empId ? `?employee_id=${empId}` : '');
    const leaves = await apiCall(url);
    document.getElementById('leavesTable').innerHTML = leaves.length === 0 ? '<p>No leaves.</p>' : `<table><thead><tr><th>Employee</th><th>Date</th><th>Type</th><th>Actions</th></tr></thead><tbody>${leaves.map(l => `<tr><td>${l.employee_name}</td><td>${l.leave_date}</td><td>${l.is_half_day ? '🕐 Half' : '📅 Full'}</td><td><button class="btn-edit" onclick="editLeave(${l.id},'${l.leave_date}',${l.is_half_day})">Edit</button><button class="btn-danger" onclick="deleteLeave(${l.id})">Delete</button></td></tr>`).join('')}</tbody></table>`;
}

document.getElementById('leaveForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    await apiCall(`/api/clients/${activeClientId}/leaves`, 'POST', { employee_id: parseInt(document.getElementById('leaveEmployee').value), leave_date: document.getElementById('leaveDate').value, is_half_day: document.getElementById('leaveHalfDay').checked });
    showNotification('Leave added!'); e.target.reset(); loadLeaves();
});

async function editLeave(id, date, half) {
    const d = prompt('Date (YYYY-MM-DD):', date); const h = confirm('Half day?');
    if (d) { await apiCall(`/api/leaves/${id}`, 'PUT', { leave_date: d, is_half_day: h }); showNotification('Updated!'); loadLeaves(); }
}
async function deleteLeave(id) { if (confirm('Delete?')) { await apiCall(`/api/leaves/${id}`, 'DELETE'); showNotification('Deleted!'); loadLeaves(); } }

// ─── DASHBOARD ────────────────────────────────────────────────
function setDefaultMonth() { const n = new Date(); document.getElementById('dashboardMonth').value = `${n.getFullYear()}-${String(n.getMonth()+1).padStart(2,'0')}`; }

async function loadMonthlyBilling() {
    if (!activeClientId) return;
    const [y, m] = document.getElementById('dashboardMonth').value.split('-');
    const data = await apiCall(`/api/clients/${activeClientId}/billing/monthly?month=${m}&year=${y}`);
    if (!data.length) { document.getElementById('monthlyBillingTable').innerHTML = '<p>No billing data.</p>'; return; }
    const total = data.reduce((s, d) => s + d.billing_amount, 0);
    document.getElementById('monthlyBillingTable').innerHTML = `<table><thead><tr><th>Employee</th><th>Role</th><th>Rate</th><th>Working Days</th><th>Hours</th><th>Amount</th></tr></thead><tbody>${data.map(d => `<tr><td>${d.employee_name}</td><td>${d.role}</td><td>$${d.hourly_rate.toFixed(2)}</td><td>${d.working_days.toFixed(1)}</td><td>${(d.working_days*8).toFixed(1)}</td><td>$${d.billing_amount.toFixed(2)}</td></tr>`).join('')}<tr class="total-row"><td colspan="5">TOTAL</td><td>$${total.toFixed(2)}</td></tr></tbody></table>`;
}

// ─── REPORTS ──────────────────────────────────────────────────
async function generateReport() {
    const s = document.getElementById('reportStartDate').value; const e = document.getElementById('reportEndDate').value;
    if (!s || !e) { alert('Select dates'); return; }
    const data = await apiCall(`/api/clients/${activeClientId}/billing/calculate`, 'POST', { start_date: s, end_date: e });
    if (!data.length) { document.getElementById('reportTable').innerHTML = '<p>No data.</p>'; return; }
    const total = data.reduce((sum, d) => sum + d.billing_amount, 0);
    document.getElementById('reportTable').innerHTML = `<table><thead><tr><th>Employee</th><th>Role</th><th>Rate</th><th>Working Days</th><th>Hours</th><th>Amount</th></tr></thead><tbody>${data.map(d => `<tr><td>${d.employee_name}</td><td>${d.role}</td><td>$${d.hourly_rate.toFixed(2)}</td><td>${d.working_days.toFixed(1)}</td><td>${(d.working_days*8).toFixed(1)}</td><td>$${d.billing_amount.toFixed(2)}</td></tr>`).join('')}<tr class="total-row"><td colspan="5">TOTAL</td><td>$${total.toFixed(2)}</td></tr></tbody></table>`;
}

async function exportReport(fmt) {
    const s = document.getElementById('reportStartDate').value; const e = document.getElementById('reportEndDate').value;
    if (!s || !e) { alert('Select dates'); return; }
    const r = await fetch(`/api/clients/${activeClientId}/export/${fmt}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ start_date: s, end_date: e }) });
    const blob = await r.blob(); const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `billing_${s}_${e}.${fmt}`; a.click();
    showNotification(`Exported as ${fmt.toUpperCase()}!`);
}

// ─── SETTINGS ─────────────────────────────────────────────────
document.getElementById('passwordForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const np = document.getElementById('newPassword').value;
    if (np !== document.getElementById('confirmPassword').value) { showNotification('Passwords do not match', true); return; }
    await apiCall('/api/change-password', 'POST', { current_password: document.getElementById('currentPassword').value, new_password: np });
    showNotification('Password changed!'); e.target.reset();
});

document.getElementById('securityQuestionsForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const q1 = document.getElementById('securityQuestion1').value; const q2 = document.getElementById('securityQuestion2').value;
    if (q1 === q2) { showNotification('Select different questions', true); return; }
    await apiCall('/api/security-questions', 'POST', { question_1: q1, answer_1: document.getElementById('securityAnswer1').value, question_2: q2, answer_2: document.getElementById('securityAnswer2').value });
    showNotification('Security questions saved!'); document.getElementById('securityStatus').style.display = 'block';
    document.getElementById('securityAnswer1').value = ''; document.getElementById('securityAnswer2').value = '';
});

async function loadSecurityQuestions() {
    try {
        const d = await apiCall('/api/security-questions');
        if (d.has_questions) { document.getElementById('securityStatus').style.display = 'block'; document.getElementById('securityQuestion1').value = d.question_1 || ''; document.getElementById('securityQuestion2').value = d.question_2 || ''; }
    } catch {}
}


function checkPwSettings(pw) {
    const el = document.getElementById('pwSettingsStrength');
    let score = 0;
    if (pw.length >= 8) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[a-z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(pw)) score++;
    const labels = ['','❌ Very Weak','❌ Weak','⚠️ Fair','✅ Good','✅ Strong'];
    const clrs = ['','#dc3545','#dc3545','#ffc107','#28a745','#28a745'];
    el.textContent = labels[score] || ''; el.style.color = clrs[score] || '#666';
}

function togglePw(id, btn) {
    const i = document.getElementById(id);
    const show = i.type === 'password';
    i.type = show ? 'text' : 'password';
    btn.textContent = show ? '🙈' : '👁️';
}
