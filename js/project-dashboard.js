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
    <div class="info-item"><div class="info-label">供应商</div><div class="info-value">${p.vendor || '—'}</div></div>
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
  const keys = ['env', 'safety', 'facility', 'green', 'service'];
  const moduleLabels = ['环境卫生', '安全管理', '设施设备', '绿化养护', '客户服务'];

  if (barChart) barChart.destroy();

  if (type === 'yoy') {
    // 同比：本期 vs 去年同期，按模块分组柱状图
    const current = keys.map(k => p.scores[k]);
    const compare = keys.map(k => p.history.lastYear[k]);
    barChart = new Chart(document.getElementById('barChart'), {
      type: 'bar',
      data: {
        labels: moduleLabels,
        datasets: [
          { label: '本期', data: current, backgroundColor: '#c0392b', borderRadius: 4 },
          { label: '去年同期', data: compare, backgroundColor: '#95a5a6', borderRadius: 4 },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: { y: { min: 60, max: 100, ticks: { stepSize: 10 } } },
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
  } else {
    // 环比：前三次检查 + 本期，展示总分趋势折线图
    const prev = p.history.prevInspections || [];
    const timeLabels = [...prev.map(h => h.date), `${p.inspectTime}（本期）`];
    const colors = ['#3498db', '#9b59b6', '#e67e22', '#c0392b'];

    const datasets = keys.map((k, i) => {
      const pastData = prev.map(h => h[k]);
      return {
        label: moduleLabels[i],
        data: [...pastData, p.scores[k]],
        borderColor: ['#c0392b', '#e67e22', '#3498db', '#27ae60', '#9b59b6'][i],
        backgroundColor: 'transparent',
        pointBackgroundColor: ['#c0392b', '#e67e22', '#3498db', '#27ae60', '#9b59b6'][i],
        borderWidth: 2,
        pointRadius: 4,
        tension: 0.3,
      };
    });

    barChart = new Chart(document.getElementById('barChart'), {
      type: 'line',
      data: { labels: timeLabels, datasets },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: { y: { min: 60, max: 100, ticks: { stepSize: 10 } } },
        plugins: {
          legend: { position: 'bottom' },
          tooltip: {
            callbacks: {
              afterLabel: (ctx) => {
                const ds = ctx.dataset.data;
                const idx = ctx.dataIndex;
                if (idx === 0) return '';
                const diff = ds[idx] - ds[idx - 1];
                return `较上次：${diff >= 0 ? '+' : ''}${diff.toFixed(2)}分`;
              },
            },
          },
        },
      },
    });
  }
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

  // 每个模块的相关问题（按模块名匹配）
  const moduleIssueMap = {};
  keys.forEach(k => { moduleIssueMap[k] = []; });
  const moduleKeywords = { env: ['环境', '清洁', '卫生', '垃圾', '漂浮'], safety: ['安全', '消防', '燃', '电梯机房', '通道'], facility: ['设施', '设备', '电梯', '维修', '老化'], green: ['绿化', '植', '养护', '裸露'], service: ['服务', '员工', '着装', '应答'] };
  (p.issues || []).forEach(issue => {
    let assigned = false;
    for (const [k, kws] of Object.entries(moduleKeywords)) {
      if (kws.some(kw => issue.includes(kw))) { moduleIssueMap[k].push(issue); assigned = true; break; }
    }
    if (!assigned) moduleIssueMap['env'].push(issue);
  });

  const moduleBlocks = keys.map(k => {
    const score = s[k];
    const grade = getGrade(score);
    const label = MODULE_LABELS[k];
    const issues = moduleIssueMap[k];
    const borderColor = score >= 93 ? 'var(--success)' : score >= 88 ? 'var(--info)' : score >= 83 ? 'var(--warning)' : 'var(--danger)';
    const issueHtml = issues.length > 0
      ? `<ul style="list-style:none;margin-top:6px;">${issues.map(i => `<li style="color:var(--text-light);font-size:12px;margin-bottom:4px;">• ${i}</li>`).join('')}</ul>`
      : `<p style="color:var(--success);font-size:12px;margin-top:6px;">✓ 本期未发现问题</p>`;
    return `<div class="analysis-block" style="border-left-color:${borderColor};">
      <div class="analysis-title" style="display:flex;align-items:center;gap:8px;">
        ${label}
        <span style="font-size:22px;font-weight:700;color:${borderColor};">${score}</span>
        <span class="grade-badge ${grade.className}" style="font-size:11px;">${grade.label}</span>
      </div>
      ${issueHtml}
    </div>`;
  }).join('');

  document.getElementById('analysisContent').innerHTML = `
    <div class="analysis-block">
      <div class="analysis-title">总分分析</div>
      <p>${totalAnalysis}</p>
      <div class="module-tags" style="margin-top:10px;">
        ${goodModules.map(m => `<span class="module-tag tag-good">✓ ${m}</span>`).join('')}
        ${badModules.map(m => `<span class="module-tag tag-bad">✗ ${m}</span>`).join('')}
      </div>
    </div>
    <div style="margin-bottom:4px;font-size:13px;font-weight:600;color:var(--text);">各模块分析</div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:10px;">
      ${moduleBlocks}
    </div>
    <div class="analysis-block" style="border-left-color:var(--info);">
      <div class="analysis-title">综合分析</div>
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
      <div class="analysis-title">提升建议</div>
      <p style="color:var(--text-light);line-height:1.8;">${p.aiSuggestion}</p>
    </div>
  `;
}

init();
