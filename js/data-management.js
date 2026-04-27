// data-management.js

let selectedProjectId = null;
let pendingDeleteId = null;

function init() {
  renderProjectList();
  const projects = getProjects();
  if (projects.length > 0) selectProject(projects[0].id);
}

function renderProjectList() {
  const projects = getProjects();
  document.getElementById('projectCount').textContent = `共 ${projects.length} 个`;
  document.getElementById('projectListItems').innerHTML = projects.map(p => {
    const g = getGrade(p.scores.total);
    return `<div class="project-list-item${p.id === selectedProjectId ? ' active' : ''}" onclick="selectProject('${p.id}')">
      <div>
        <div class="proj-name">${p.name}</div>
        <div class="proj-city">${p.city} · ${p.level}</div>
      </div>
      <span class="grade-badge ${g.className}" style="margin-left:auto;font-size:11px;">${g.label}</span>
    </div>`;
  }).join('');
}

function selectProject(id) {
  selectedProjectId = id;
  renderProjectList();
  renderEditPanel();
}

function renderEditPanel() {
  const p = getProject(selectedProjectId);
  if (!p) return;

  document.getElementById('editPanel').innerHTML = `
    <div class="card">
      <div class="card-title" style="justify-content:space-between;">
        编辑项目：${p.name}
        <button class="btn btn-danger btn-sm" onclick="openDeleteModal('${p.id}', '${p.name}')">删除项目</button>
      </div>

      <div class="form-grid">
        <div class="section-divider">基本信息</div>

        <div class="form-group">
          <label>项目名称</label>
          <input type="text" id="f_name" value="${p.name}">
        </div>
        <div class="form-group">
          <label>城市</label>
          <input type="text" id="f_city" value="${p.city}">
        </div>
        <div class="form-group">
          <label>区域公司</label>
          <select id="f_region">
            ${['广州公司','佛清肇公司'].map(r => `<option${p.region===r?' selected':''}>${r}</option>`).join('')}
          </select>
        </div>
        <div class="form-group">
          <label>项目等级</label>
          <select id="f_level">
            ${['紫金花','金百合','向日葵','郁金香'].map(l => `<option${p.level===l?' selected':''}>${l}</option>`).join('')}
          </select>
        </div>
        <div class="form-group">
          <label>管理费单价（元/㎡）</label>
          <input type="number" id="f_unitPrice" value="${p.unitPrice}" step="0.1">
        </div>
        <div class="form-group">
          <label>面积（㎡）</label>
          <input type="number" id="f_area" value="${p.area}">
        </div>
        <div class="form-group">
          <label>检查人员</label>
          <input type="text" id="f_inspector" value="${p.inspector}">
        </div>
        <div class="form-group">
          <label>检查时间</label>
          <input type="date" id="f_inspectTime" value="${p.inspectTime}">
        </div>

        <div class="section-divider">模块得分</div>

        <div class="form-group">
          <label>环境卫生得分</label>
          <input type="number" id="f_env" value="${p.scores.env}" min="0" max="100" step="0.01">
        </div>
        <div class="form-group">
          <label>安全管理得分</label>
          <input type="number" id="f_safety" value="${p.scores.safety}" min="0" max="100" step="0.01">
        </div>
        <div class="form-group">
          <label>设施设备得分</label>
          <input type="number" id="f_facility" value="${p.scores.facility}" min="0" max="100" step="0.01">
        </div>
        <div class="form-group">
          <label>绿化养护得分</label>
          <input type="number" id="f_green" value="${p.scores.green}" min="0" max="100" step="0.01">
        </div>
        <div class="form-group">
          <label>客户服务得分</label>
          <input type="number" id="f_service" value="${p.scores.service}" min="0" max="100" step="0.01">
        </div>
        <div class="form-group" style="display:flex;flex-direction:column;justify-content:flex-end;">
          <label>总得分（自动计算）</label>
          <input type="text" id="f_total" value="${p.scores.total}" readonly style="background:#f5f5f5;color:var(--text-light);">
        </div>

        <div class="section-divider">检查标准点位</div>
        <div class="form-group full">
          <label>检查项目列表（可新增/删除）</label>
          <div id="checkItemsList"></div>
          <button class="btn btn-secondary btn-sm" onclick="addCheckItem()" style="margin-top:8px;">+ 新增检查项</button>
        </div>

        <div class="section-divider">处罚考核配置</div>
        <div class="form-group full">
          <label>红线项（可新增/删除）</label>
          <div id="redLinesList"></div>
          <button class="btn btn-secondary btn-sm" onclick="addRedLine()" style="margin-top:8px;">+ 新增红线项</button>
        </div>

        <div class="section-divider">问题与建议</div>
        <div class="form-group full">
          <label>主要问题（每行一条）</label>
          <textarea id="f_issues" rows="4">${(p.issues||[]).join('\n')}</textarea>
        </div>
        <div class="form-group full">
          <label>整改建议（每行一条）</label>
          <textarea id="f_suggestions" rows="4">${(p.suggestions||[]).join('\n')}</textarea>
        </div>
        <div class="form-group full">
          <label>AI 综合分析</label>
          <textarea id="f_aiAnalysis" rows="4">${p.aiAnalysis||''}</textarea>
        </div>
        <div class="form-group full">
          <label>AI 提升建议</label>
          <textarea id="f_aiSuggestion" rows="4">${p.aiSuggestion||''}</textarea>
        </div>
      </div>

      <div style="display:flex;justify-content:flex-end;gap:10px;margin-top:20px;padding-top:16px;border-top:1px solid var(--border);">
        <button class="btn btn-secondary" onclick="resetEdit()">重置</button>
        <button class="btn btn-success" onclick="saveEdit()">保存更改</button>
      </div>
    </div>
  `;

  renderCheckItems(p.checkItems || []);
  renderRedLines(p.redLines || []);

  // Auto-calc total on score change
  ['f_env','f_safety','f_facility','f_green','f_service'].forEach(id => {
    document.getElementById(id).addEventListener('input', recalcTotal);
  });
}

function recalcTotal() {
  const keys = ['f_env','f_safety','f_facility','f_green','f_service'];
  const vals = keys.map(k => parseFloat(document.getElementById(k).value) || 0);
  const total = Math.round(vals.reduce((a, b) => a + b, 0) / vals.length * 100) / 100;
  document.getElementById('f_total').value = total;
}

function renderCheckItems(items) {
  document.getElementById('checkItemsList').innerHTML = items.map((item, i) => `
    <div class="checklist-item" id="ci_${i}">
      <select style="border:none;background:transparent;font-size:12px;color:var(--text-light);width:80px;" onchange="updateCheckItem(${i},'module',this.value)">
        ${['环境卫生','安全管理','设施设备','绿化养护','客户服务'].map(m => `<option${item.module===m?' selected':''}>${m}</option>`).join('')}
      </select>
      <input value="${item.location||''}" placeholder="点位" style="width:80px;" onchange="updateCheckItem(${i},'location',this.value)">
      <input value="${item.desc||''}" placeholder="检查描述" style="flex:1;" onchange="updateCheckItem(${i},'desc',this.value)">
      <select style="border:none;background:transparent;font-size:12px;" onchange="updateCheckItem(${i},'passed',this.value==='true')">
        <option value="true"${item.passed?' selected':''}>通过</option>
        <option value="false"${!item.passed?' selected':''}>未通过</option>
      </select>
      <button class="btn btn-danger btn-sm" onclick="removeCheckItem(${i})">×</button>
    </div>
  `).join('');
}

let _checkItems = [];
let _redLines = [];

function renderCheckItems(items) {
  _checkItems = [...items];
  _renderCheckItems();
}

function _renderCheckItems() {
  document.getElementById('checkItemsList').innerHTML = _checkItems.map((item, i) => `
    <div class="checklist-item">
      <select style="border:none;background:transparent;font-size:12px;color:var(--text-light);width:80px;">
        ${['环境卫生','安全管理','设施设备','绿化养护','客户服务'].map(m => `<option${item.module===m?' selected':''}>${m}</option>`).join('')}
      </select>
      <input value="${item.location||''}" placeholder="点位" style="width:80px;" data-ci="${i}" data-field="location">
      <input value="${item.desc||''}" placeholder="检查描述" style="flex:1;" data-ci="${i}" data-field="desc">
      <select style="border:none;background:transparent;font-size:12px;" data-ci="${i}" data-field="passed">
        <option value="true"${item.passed?' selected':''}>通过</option>
        <option value="false"${!item.passed?' selected':''}>未通过</option>
      </select>
      <button class="btn btn-danger btn-sm" onclick="_removeCheckItem(${i})">×</button>
    </div>
  `).join('');
}

function addCheckItem() {
  _checkItems.push({ module: '环境卫生', location: '', desc: '', passed: true });
  _renderCheckItems();
}

function _removeCheckItem(i) {
  _checkItems.splice(i, 1);
  _renderCheckItems();
}

function renderRedLines(items) {
  _redLines = [...items];
  _renderRedLines();
}

function _renderRedLines() {
  document.getElementById('redLinesList').innerHTML = _redLines.map((r, i) => `
    <div class="checklist-item">
      <input value="${r.item||''}" placeholder="红线描述" style="flex:1;" data-rl="${i}" data-field="item">
      <input value="${r.location||''}" placeholder="位置" style="width:120px;" data-rl="${i}" data-field="location">
      <select style="border:none;background:transparent;font-size:12px;" data-rl="${i}" data-field="status">
        <option${r.status==='未整改'?' selected':''}>未整改</option>
        <option${r.status==='整改中'?' selected':''}>整改中</option>
        <option${r.status==='已整改'?' selected':''}>已整改</option>
      </select>
      <button class="btn btn-danger btn-sm" onclick="_removeRedLine(${i})">×</button>
    </div>
  `).join('');
}

function addRedLine() {
  _redLines.push({ item: '', location: '', status: '未整改' });
  _renderRedLines();
}

function _removeRedLine(i) {
  _redLines.splice(i, 1);
  _renderRedLines();
}

function collectCheckItems() {
  const rows = document.querySelectorAll('#checkItemsList .checklist-item');
  return Array.from(rows).map(row => {
    const selects = row.querySelectorAll('select');
    const inputs = row.querySelectorAll('input');
    return {
      module: selects[0].value,
      location: inputs[0].value,
      desc: inputs[1].value,
      passed: selects[1].value === 'true',
    };
  });
}

function collectRedLines() {
  const rows = document.querySelectorAll('#redLinesList .checklist-item');
  return Array.from(rows).map(row => {
    const inputs = row.querySelectorAll('input');
    const sel = row.querySelector('select');
    return {
      item: inputs[0].value,
      location: inputs[1].value,
      status: sel.value,
    };
  });
}

function saveEdit() {
  const p = getProject(selectedProjectId);
  if (!p) return;

  p.name = document.getElementById('f_name').value.trim();
  p.city = document.getElementById('f_city').value.trim();
  p.region = document.getElementById('f_region').value;
  p.level = document.getElementById('f_level').value;
  p.unitPrice = parseFloat(document.getElementById('f_unitPrice').value) || 0;
  p.area = parseInt(document.getElementById('f_area').value) || 0;
  p.inspector = document.getElementById('f_inspector').value.trim();
  p.inspectTime = document.getElementById('f_inspectTime').value;

  p.scores.env = parseFloat(document.getElementById('f_env').value) || 0;
  p.scores.safety = parseFloat(document.getElementById('f_safety').value) || 0;
  p.scores.facility = parseFloat(document.getElementById('f_facility').value) || 0;
  p.scores.green = parseFloat(document.getElementById('f_green').value) || 0;
  p.scores.service = parseFloat(document.getElementById('f_service').value) || 0;
  const vals = [p.scores.env, p.scores.safety, p.scores.facility, p.scores.green, p.scores.service];
  p.scores.total = Math.round(vals.reduce((a, b) => a + b, 0) / vals.length * 100) / 100;
  p.grade = getGrade(p.scores.total);

  p.checkItems = collectCheckItems();
  p.redLines = collectRedLines();

  const issuesText = document.getElementById('f_issues').value.trim();
  p.issues = issuesText ? issuesText.split('\n').filter(l => l.trim()) : [];
  const suggestText = document.getElementById('f_suggestions').value.trim();
  p.suggestions = suggestText ? suggestText.split('\n').filter(l => l.trim()) : [];
  p.aiAnalysis = document.getElementById('f_aiAnalysis').value.trim();
  p.aiSuggestion = document.getElementById('f_aiSuggestion').value.trim();

  updateProject(p);
  renderProjectList();

  // Toast
  showToast('保存成功！数据已更新');
}

function resetEdit() {
  renderEditPanel();
}

function showToast(msg) {
  const t = document.createElement('div');
  t.style.cssText = 'position:fixed;bottom:24px;right:24px;background:var(--success);color:#fff;padding:12px 20px;border-radius:6px;font-size:13px;box-shadow:0 4px 12px rgba(0,0,0,0.2);z-index:9999;animation:fadeIn 0.2s;';
  t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 2500);
}

// Add Modal
function openAddModal() {
  document.getElementById('addModal').classList.add('active');
}

function closeAddModal() {
  document.getElementById('addModal').classList.remove('active');
}

function addProject_ui() {
  const name = document.getElementById('new_name').value.trim();
  const city = document.getElementById('new_city').value.trim();
  if (!name || !city) { alert('请填写项目名称和城市'); return; }

  const newP = {
    name,
    city,
    region: document.getElementById('new_region').value,
    level: document.getElementById('new_level').value,
    unitPrice: parseFloat(document.getElementById('new_unitPrice').value) || 2.0,
    area: parseInt(document.getElementById('new_area').value) || 10000,
    inspector: document.getElementById('new_inspector').value.trim() || '待填写',
    inspectTime: document.getElementById('new_inspectTime').value,
    scores: { env: 85, safety: 85, facility: 85, green: 85, service: 85 },
    redLines: [],
    penalties: [],
    history: { lastYear: { env: 80, safety: 80, facility: 80, green: 80, service: 80 }, lastMonth: { env: 83, safety: 83, facility: 83, green: 83, service: 83 } },
    issues: [],
    suggestions: [],
    checkItems: [],
    aiAnalysis: '请编辑并填写AI综合分析内容。',
    aiSuggestion: '请编辑并填写AI提升建议内容。',
  };

  const added = addProject(newP);
  closeAddModal();
  selectedProjectId = added.id;
  renderProjectList();
  renderEditPanel();
  showToast(`项目「${name}」已新增`);
}

// Delete Modal
function openDeleteModal(id, name) {
  pendingDeleteId = id;
  document.getElementById('deleteConfirmText').textContent = `确定要删除项目「${name}」吗？此操作不可撤销。`;
  document.getElementById('deleteModal').classList.add('active');
}

function closeDeleteModal() {
  document.getElementById('deleteModal').classList.remove('active');
  pendingDeleteId = null;
}

function confirmDelete() {
  if (!pendingDeleteId) return;
  const projects = getProjects().filter(p => p.id !== pendingDeleteId);
  saveProjects(projects);
  closeDeleteModal();
  selectedProjectId = projects.length > 0 ? projects[0].id : null;
  renderProjectList();
  if (selectedProjectId) renderEditPanel();
  else document.getElementById('editPanel').innerHTML = '<div class="card" style="color:var(--text-light);text-align:center;padding:60px;">请从左侧选择项目进行编辑</div>';
  showToast('项目已删除');
}

init();
