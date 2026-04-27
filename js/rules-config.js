// rules-config.js

let currentRuleId = null;
let pendingDeleteId = null;
let editingRuleId = null;

function init() {
  renderSidebar();
}

function renderSidebar() {
  const rules = getRules();
  const categories = RULE_CATEGORIES;
  let html = '';

  categories.forEach(cat => {
    const catRules = rules.filter(r => r.category === cat.value);
    html += `<div class="rule-category-section">
      <div class="rule-category-label">${cat.label}</div>`;
    catRules.forEach(rule => {
      html += `<div class="rule-sidebar-item${rule.id === currentRuleId ? ' active' : ''}" onclick="selectRule('${rule.id}')">
        <span class="rule-dot" style="background:${cat.color};"></span>
        <span style="flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${rule.name}</span>
        <span class="rule-status-dot ${rule.enabled ? 'dot-on' : 'dot-off'}"></span>
      </div>`;
    });
    html += '</div>';
  });

  document.getElementById('ruleSidebar').innerHTML = html;
}

function selectRule(id) {
  currentRuleId = id;
  renderSidebar();
  renderDetail(id);
}

function renderDetail(id) {
  const rule = getRules().find(r => r.id === id);
  if (!rule) return;

  const cat = RULE_CATEGORIES.find(c => c.value === rule.category);
  const tagClass = rule.category === 'analysis' ? 'tag-analysis' : 'tag-suggestion';

  const previewText = generatePreview(rule.promptTemplate);

  document.getElementById('ruleDetail').innerHTML = `
    <div class="card">
      <div class="rule-detail-header">
        <div>
          <span class="rule-category-tag ${tagClass}">${cat?.label || rule.category}</span>
          <div style="font-size:18px;font-weight:700;color:var(--text);margin-bottom:4px;">${rule.name}</div>
          <div class="rule-meta">
            <span>ID: ${rule.id}</span>
            <span>输出格式: ${rule.outputFormat}</span>
            <span>变量数: ${(rule.variables || []).length}</span>
          </div>
          <div style="font-size:13px;color:var(--text-light);margin-top:8px;">${rule.desc}</div>
        </div>
        <div class="rule-header-actions">
          <label class="toggle-switch" title="${rule.enabled ? '点击禁用' : '点击启用'}">
            <input type="checkbox" ${rule.enabled ? 'checked' : ''} onchange="toggleRule('${rule.id}', this.checked)">
            <span class="toggle-slider"></span>
          </label>
          <span style="font-size:12px;color:var(--text-light);min-width:28px;">${rule.enabled ? '启用' : '禁用'}</span>
          <button class="btn btn-secondary btn-sm" onclick="openEditModal('${rule.id}')">编辑</button>
          <button class="btn btn-danger btn-sm" onclick="openDeleteModal('${rule.id}')">删除</button>
        </div>
      </div>
    </div>

    <div class="card">
      <div class="card-title">提示词模板</div>
      <div style="margin-bottom:12px;">
        <div style="font-size:12px;color:var(--text-light);margin-bottom:8px;">可用变量（点击复制）</div>
        <div class="variable-chips">
          ${(rule.variables || []).map(v => `<span class="variable-chip" onclick="copyToClipboard('{{${v}}}')" title="点击复制">{{${v}}}</span>`).join('')}
        </div>
      </div>
      <textarea class="prompt-editor" id="promptEditor" rows="14">${escapeHtml(rule.promptTemplate)}</textarea>
      <div style="display:flex;gap:8px;margin-top:10px;justify-content:flex-end;">
        <button class="btn btn-secondary" onclick="resetPrompt('${rule.id}')">重置</button>
        <button class="btn btn-primary" onclick="savePrompt('${rule.id}')">保存提示词</button>
      </div>
    </div>

    <div class="card">
      <div class="card-title">提示词预览（样例数据填充）</div>
      <div class="preview-box" id="promptPreview">${escapeHtml(previewText)}</div>
      <div style="text-align:right;margin-top:8px;">
        <button class="btn btn-secondary btn-sm" onclick="refreshPreview('${rule.id}')">刷新预览</button>
      </div>
    </div>
  `;
}

function generatePreview(template) {
  const sampleData = {
    projectName: '时代天韵（黄埔）',
    totalScore: '75.76',
    grade: '不及格',
    env: '89.73',
    safety: '84.46',
    facility: '87.67',
    green: '74.37',
    service: '92.87',
    level: '紫金花',
    city: '广州',
    moduleName: '绿化养护',
    moduleScore: '74.37',
    moduleGrade: '不及格',
    issues: '整体绿化裸露明显，长时间未进行养护',
    historyScores: '71.5、72.8、73.5',
    redlineCount: '1',
    penaltyCount: '1',
    issueList: '1. 楼栋内堆放易燃杂物\n2. 整体绿化裸露\n3. 员工着装不规范',
    weakModules: '绿化养护、安全管理',
    benchmarkScore: '88.5',
    benchmarkProject: '佛山金百合广场',
    benchmarkTotal: '89.75',
  };

  return template.replace(/\{\{(\w+)\}\}/g, (_, key) => sampleData[key] || `[${key}]`);
}

function refreshPreview(id) {
  const promptEl = document.getElementById('promptEditor');
  if (!promptEl) return;
  const preview = generatePreview(promptEl.value);
  document.getElementById('promptPreview').textContent = preview;
}

function savePrompt(id) {
  const promptEl = document.getElementById('promptEditor');
  if (!promptEl) return;
  const rules = getRules();
  const rule = rules.find(r => r.id === id);
  if (!rule) return;
  rule.promptTemplate = promptEl.value;

  // Re-parse variables from template
  const matches = rule.promptTemplate.match(/\{\{(\w+)\}\}/g) || [];
  rule.variables = [...new Set(matches.map(m => m.replace(/[{}]/g, '')))];

  updateRule(rule);
  showToast('提示词已保存');
  renderSidebar();
  renderDetail(id);
}

function resetPrompt(id) {
  const original = DEFAULT_RULES.find(r => r.id === id);
  if (!original) return;
  const promptEl = document.getElementById('promptEditor');
  if (promptEl) promptEl.value = original.promptTemplate;
  showToast('已重置为默认提示词');
}

function toggleRule(id, enabled) {
  const rules = getRules();
  const rule = rules.find(r => r.id === id);
  if (!rule) return;
  rule.enabled = enabled;
  updateRule(rule);
  renderSidebar();
  // Update status text
  const statusEl = document.querySelector('.rule-header-actions span');
  if (statusEl) statusEl.textContent = enabled ? '启用' : '禁用';
}

// ---- Add/Edit Modal ----
function openAddModal() {
  editingRuleId = null;
  document.getElementById('modalTitle').textContent = '新增规则';
  document.getElementById('modal_name').value = '';
  document.getElementById('modal_category').value = 'analysis';
  document.getElementById('modal_desc').value = '';
  document.getElementById('modal_outputFormat').value = '段落文字';
  document.getElementById('modal_prompt').value = '';
  document.getElementById('ruleModal').classList.add('active');
}

function openEditModal(id) {
  editingRuleId = id;
  const rule = getRules().find(r => r.id === id);
  if (!rule) return;
  document.getElementById('modalTitle').textContent = '编辑规则';
  document.getElementById('modal_name').value = rule.name;
  document.getElementById('modal_category').value = rule.category;
  document.getElementById('modal_desc').value = rule.desc;
  document.getElementById('modal_outputFormat').value = rule.outputFormat;
  document.getElementById('modal_prompt').value = rule.promptTemplate;
  document.getElementById('ruleModal').classList.add('active');
}

function closeRuleModal() {
  document.getElementById('ruleModal').classList.remove('active');
}

function saveRuleModal() {
  const name = document.getElementById('modal_name').value.trim();
  if (!name) { alert('请填写规则名称'); return; }

  const template = document.getElementById('modal_prompt').value;
  const matches = template.match(/\{\{(\w+)\}\}/g) || [];
  const variables = [...new Set(matches.map(m => m.replace(/[{}]/g, '')))];

  const ruleData = {
    name,
    category: document.getElementById('modal_category').value,
    desc: document.getElementById('modal_desc').value.trim(),
    outputFormat: document.getElementById('modal_outputFormat').value,
    promptTemplate: template,
    variables,
    enabled: true,
  };

  if (editingRuleId) {
    ruleData.id = editingRuleId;
    updateRule(ruleData);
    showToast('规则已更新');
    currentRuleId = editingRuleId;
  } else {
    const newRule = addRule(ruleData);
    currentRuleId = newRule.id;
    showToast('规则已新增');
  }

  closeRuleModal();
  renderSidebar();
  renderDetail(currentRuleId);
}

function insertVar(varName) {
  const ta = document.getElementById('modal_prompt');
  const pos = ta.selectionStart;
  const val = ta.value;
  const insert = `{{${varName}}}`;
  ta.value = val.slice(0, pos) + insert + val.slice(ta.selectionEnd);
  ta.selectionStart = ta.selectionEnd = pos + insert.length;
  ta.focus();
}

// ---- Delete ----
function openDeleteModal(id) {
  pendingDeleteId = id;
  const rule = getRules().find(r => r.id === id);
  document.getElementById('deleteConfirmText').textContent = `确定要删除规则「${rule?.name}」吗？此操作不可撤销。`;
  document.getElementById('deleteModal').classList.add('active');
}

function closeDeleteModal() {
  document.getElementById('deleteModal').classList.remove('active');
  pendingDeleteId = null;
}

function confirmDeleteRule() {
  if (!pendingDeleteId) return;
  deleteRule(pendingDeleteId);
  if (currentRuleId === pendingDeleteId) {
    currentRuleId = null;
    document.getElementById('ruleDetail').innerHTML = `
      <div class="card empty-state">
        <div class="empty-icon">⚙️</div>
        <p>规则已删除，请从左侧选择其他规则</p>
      </div>`;
  }
  closeDeleteModal();
  renderSidebar();
  showToast('规则已删除');
}

// ---- Helpers ----
function escapeHtml(str) {
  return (str || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

function copyToClipboard(text) {
  navigator.clipboard?.writeText(text).then(() => showToast(`已复制 ${text}`));
}

function showToast(msg) {
  const existing = document.querySelector('.toast');
  if (existing) existing.remove();
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = msg;
  toast.style.cssText = `
    position:fixed;bottom:24px;right:24px;
    background:#333;color:#fff;
    padding:10px 18px;border-radius:6px;
    font-size:13px;z-index:9999;
    animation:fadeIn 0.2s ease;
  `;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 2000);
}

init();
