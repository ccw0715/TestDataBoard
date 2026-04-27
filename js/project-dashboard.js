// project-dashboard.js

let radarChart = null;
let barChart = null;
let currentTrend = 'yoy';
let currentProject = null;

function init() {
  const sel = document.getElementById('projectSelect');
  const projects = getProjects();
  sel.innerHTML = projects.map(p => `<option value="${p.id}">${p.name}</option>`).join('');
  renderPage();
}

function renderPage() {
  const id = document.getElementById('projectSelect').value;
  const projects = getProjects();
  currentProject = projects.find(p => p.id === id) || projects[0];
  if (!currentProject) return;

  renderInfo();
  renderScoreCards();
  renderRadar();
  renderBar(currentTrend);
  renderPenalty();
  renderAnalysis();
  renderSuggestion();
}

function renderInfo() {
  const p = currentProject;
  document.getElementById('infoGrid').innerHTML = `
    <div class="info-item"><div class="info-label">项目名称</div><div class="info-value">${p.name}</div></div>
    <div class="info-item"><div class="info-label">城市</div><div class="info-value">${p.city}</div></div>
    <div class="info-item"><div class="info-label">区域公司</div><div class="info-value">${p.region}</div></div>
    <div class="info-item"><div class="info-label">项目等级</div><div class="info-value">${p.level}</div></div>
    <div class="info-item"><div class="info-label">管理费单价</div><div class="info-value">${p.unitPrice} 元/㎡</div></div>
    <div class="info-item"><div class="info-label">面积</div><div class="info-value">${p.area.toLocaleString()} ㎡</div></div>
    <div class="info-item"><div class="info-label">检查人员</div><div class="info-value">${p.inspector}</div></div>
    <div class="info-item"><div class="info-label">检查时间</div><div class="info-value">${p.inspectTime}</div></div>
  `;
}

function renderScoreCards() {
  const p = currentProject;
  const s = p.scores;
  const g = getGrade(s.total);
  const cards = [
    { label: '总得分', value: s.total, sub: `得分等级`, extra: `<span class="grade-badge ${g.className}">${g.label}</span>`, total: true },
    { label: '环境卫生', value: s.env },
    { label: '安全管理', value: s.safety },
    { label: '设施设备', value: s.facility },
    { label: '绿化养护', value: s.green },
    { label: '客户服务', value: s.service },
  ];
  document.getElementById('scoreCards').innerHTML = cards.map(c => `
    <div class="score-card${c.total ? ' total' : ''}">
      <div class="score-label">${c.label}</div>
      <div class="score-value">${c.value}</div>
      ${c.extra ? c.extra : `<div class="score-sub">${scoreSubText(c.value)}</div>`}
    </div>
  `).join('');
}

function scoreSubText(v) {
  return getGrade(v).label;
}

function renderRadar() {
  const p = currentProject;
  const projects = getProjects();
  const labels = ['环境卫生', '安全管理', '设施设备', '绿化养护', '客户服务'];
  const keys = ['env', 'safety', 'facility', 'green', 'service'];
  const current = keys.map(k => p.scores[k]);
  const avg = keys.map(k => {
    const vals = projects.map(pr => pr.scores[k]);
    return Math.round(vals.reduce((a, b) => a + b, 0) / vals.length * 10) / 10;
  });

  if (radarChart) radarChart.destroy();
  radarChart = new Chart(document.getElementById('radarChart'), {
    type: 'radar',
    data: {
      labels,
      datasets: [
        {
          label: p.name,
          data: current,
          backgroundColor: 'rgba(192,57,43,0.15)',
          borderColor: '#c0392b',
          pointBackgroundColor: '#c0392b',
          borderWidth: 2,
        },
        {
          label: '全项目平均',
          data: avg,
          backgroundColor: 'rgba(52,152,219,0.1)',
          borderColor: '#3498db',
          pointBackgroundColor: '#3498db',
          borderDash: [4, 4],
          borderWidth: 2,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: { r: { min: 60, max: 100, ticks: { stepSize: 10 } } },
      plugins: { legend: { position: 'bottom' } },
    },
  });
}

function switchTrend(type, btn) {
  currentTrend = type;
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  renderBar(type);
}

function renderBar(type) {
  const p = currentProject;
  const labels = ['环境卫生', '安全管理', '设施设备', '绿化养护', '客户服务'];
  const keys = ['env', 'safety', 'facility', 'green', 'service'];
  const current = keys.map(k => p.scores[k]);
  const compare = keys.map(k => type === 'yoy' ? p.history.lastYear[k] : p.history.lastMonth[k]);
  const compareLabel = type === 'yoy' ? '去年同期' : '上月';

  if (barChart) barChart.destroy();
  barChart = new Chart(document.getElementById('barChart'), {
    type: 'bar',
    data: {
      labels,
      datasets: [
        {
          label: '本期',
          data: current,
          backgroundColor: '#c0392b',
          borderRadius: 4,
        },
        {
          label: compareLabel,
          data: compare,
          backgroundColor: '#95a5a6',
          borderRadius: 4,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: { min: 60, max: 100, ticks: { stepSize: 10 } },
      },
      plugins: {
        legend: { position: 'bottom' },
        tooltip: {
          callbacks: {
            afterLabel: (ctx) => {
              const diff = current[ctx.dataIndex] - compare[ctx.dataIndex];
              return `变化：${diff >= 0 ? '+' : ''}${diff.toFixed(2)}分`;
            },
          },
        },
      },
    },
  });
}

function renderPenalty() {
  const p = currentProject;
  let html = '';

  const internalPenalties = p.redLines.map(r => ({
    isRedline: true,
    text: `红线触发：${r.item}（${r.location}）`,
    consequence: '通报批评',
  }));
  if (p.penalties) {
    p.penalties.filter(pen => pen.type === 'internal').forEach(pen => {
      internalPenalties.push({ isRedline: false, text: pen.item || '得分不达标', consequence: pen.consequence });
    });
  }

  if (internalPenalties.length === 0 && (!p.penalties || p.penalties.filter(pen => pen.type === 'external').length === 0)) {
    html = '<p style="color:var(--success);padding:12px 0;">✓ 本期无处罚考核事项</p>';
  } else {
    if (internalPenalties.length > 0) {
      html += '<div style="font-size:13px;font-weight:600;color:var(--text);margin-bottom:8px;">触发内部考核</div>';
      html += '<ul class="penalty-list">';
      internalPenalties.forEach(item => {
        html += `<li class="penalty-item${item.isRedline ? ' red-line' : ''}">
          <span class="penalty-tag tag-redline">红线</span>
          <span style="flex:1;">${item.text}</span>
          <span style="color:var(--danger);font-weight:600;">${item.consequence}</span>
        </li>`;
      });
      html += '</ul>';
    }

    const externalPenalties = (p.penalties || []).filter(pen => pen.type === 'external');
    if (externalPenalties.length > 0) {
      html += '<div style="font-size:13px;font-weight:600;color:var(--text);margin:12px 0 8px;">触发外部扣罚</div>';
      html += '<ul class="penalty-list">';
      externalPenalties.forEach(pen => {
        html += `<li class="penalty-item">
          <span class="penalty-tag tag-penalty">扣罚</span>
          <span style="flex:1;">${pen.project}：${pen.reason}</span>
          <span style="color:var(--warning);font-weight:600;">${pen.month || ''} ${pen.amount || ''}</span>
        </li>`;
      });
      html += '</ul>';
    }
  }

  document.getElementById('penaltyContent').innerHTML = html;
}

function renderAnalysis() {
  const p = currentProject;
  const s = p.scores;
  const keys = ['env', 'safety', 'facility', 'green', 'service'];
  const goodModules = keys.filter(k => s[k] >= 93).map(k => MODULE_LABELS[k]);
  const badModules = keys.filter(k => s[k] < 88).map(k => MODULE_LABELS[k]);

  const totalGrade = getGrade(s.total);
  const totalAnalysis = `本期总得分 ${s.total} 分，得分等级：<strong>${totalGrade.label}</strong>。` +
    (goodModules.length > 0 ? `优秀以上模块：${goodModules.join('、')}；` : '') +
    (badModules.length > 0 ? `良好以下模块：${badModules.join('、')}。` : '各模块表现均衡。');

  const issues = p.issues.length > 0
    ? p.issues.map(i => `<li style="margin-bottom:6px;color:var(--text-light);">• ${i}</li>`).join('')
    : '<li style="color:var(--success);">• 本期未发现重大问题</li>';

  document.getElementById('analysisContent').innerHTML = `
    <div class="analysis-block">
      <div class="analysis-title">总分分析</div>
      <p>${totalAnalysis}</p>
      <div class="module-tags" style="margin-top:10px;">
        ${goodModules.map(m => `<span class="module-tag tag-good">✓ ${m}</span>`).join('')}
        ${badModules.map(m => `<span class="module-tag tag-bad">✗ ${m}</span>`).join('')}
      </div>
    </div>
    <div class="analysis-block">
      <div class="analysis-title">模块分析 — 主要问题</div>
      <ul style="list-style:none;">${issues}</ul>
    </div>
    <div class="analysis-block" style="border-left-color:var(--info);">
      <div class="analysis-title">AI 综合分析</div>
      <p>${p.aiAnalysis}</p>
    </div>
  `;
}

function renderSuggestion() {
  const p = currentProject;
  const items = p.suggestions.length > 0
    ? p.suggestions.map((s, i) => `<li style="margin-bottom:8px;color:var(--text-light);">
        <span style="font-weight:700;color:var(--primary);">${i + 1}.</span> ${s}
      </li>`).join('')
    : '';

  document.getElementById('suggestionContent').innerHTML = `
    <div class="analysis-block">
      <div class="analysis-title">整改建议</div>
      <ul style="list-style:none;">${items}</ul>
    </div>
    <div class="analysis-block" style="border-left-color:var(--info);">
      <div class="analysis-title">AI 提升建议</div>
      <p style="color:var(--text-light);line-height:1.8;">${p.aiSuggestion}</p>
    </div>
  `;
}

init();
