// scope-dashboard.js

let scopeBarChart = null;
let scopeRadarChart = null;
let filteredProjects = [];
let sortKey = 'total';
let sortAsc = false;
let currentCompareModule = 'total';
let currentCompareTrend = 'yoy';

function initFilters() {
  // Region
  const regionSel = document.getElementById('regionSel');
  regionSel.innerHTML = REGIONS.map(r => `<option value="${r}">${r}</option>`).join('');

  onRegionChange();

  // Level
  const levelSel = document.getElementById('levelSel');
  levelSel.innerHTML = LEVELS.map(l => `<option value="${l}">${l}</option>`).join('');

  // Module
  const moduleSel = document.getElementById('moduleSel');
  moduleSel.innerHTML = MODULES.map(m => `<option value="${m}">${m}</option>`).join('');

  // Grade
  const gradeSel = document.getElementById('gradeSel');
  gradeSel.innerHTML = GRADE_OPTIONS.map(g => `<option value="${g}">${g}</option>`).join('');

  applyFilters();
}

function onRegionChange() {
  const region = document.getElementById('regionSel').value;
  const citySel = document.getElementById('citySel');
  let cities = ['总体（默认）'];
  if (region !== '总体（默认）' && REGION_CITIES[region]) {
    cities = cities.concat(REGION_CITIES[region]);
  } else {
    Object.values(REGION_CITIES).forEach(arr => arr.forEach(c => { if (!cities.includes(c)) cities.push(c); }));
  }
  citySel.innerHTML = cities.map(c => `<option value="${c}">${c}</option>`).join('');
  updateProjectSel();
  applyFilters();
}

function updateProjectSel() {
  const projects = getProjects();
  const projectSel = document.getElementById('projectSel');
  projectSel.innerHTML = '<option value="总体（默认）">总体（默认）</option>' +
    projects.map(p => `<option value="${p.id}">${p.name}</option>`).join('');
}

function applyFilters() {
  const region = document.getElementById('regionSel').value;
  const city = document.getElementById('citySel').value;
  const level = document.getElementById('levelSel').value;
  const projectId = document.getElementById('projectSel').value;
  const module = document.getElementById('moduleSel').value;
  const grade = document.getElementById('gradeSel').value;
  const redline = document.getElementById('redlineSel').value;
  const minScore = parseFloat(document.getElementById('minScore').value) || 0;
  const maxScore = parseFloat(document.getElementById('maxScore').value) || 100;

  let projects = getProjects();

  if (region !== '总体（默认）') projects = projects.filter(p => p.region === region);
  if (city !== '总体（默认）') projects = projects.filter(p => p.city === city);
  if (level !== '总体（默认）') projects = projects.filter(p => p.level === level);
  if (projectId !== '总体（默认）') projects = projects.filter(p => p.id === projectId);
  if (grade !== '总体（默认）') projects = projects.filter(p => getGrade(p.scores.total).label === grade);
  if (redline === 'yes') projects = projects.filter(p => p.redLines && p.redLines.length > 0);
  if (redline === 'no') projects = projects.filter(p => !p.redLines || p.redLines.length === 0);
  projects = projects.filter(p => p.scores.total >= minScore && p.scores.total <= maxScore);

  filteredProjects = projects;
  renderAll();
}

function resetFilters() {
  document.getElementById('regionSel').value = '总体（默认）';
  onRegionChange();
  document.getElementById('levelSel').value = '总体（默认）';
  document.getElementById('moduleSel').value = '总体（默认）';
  document.getElementById('gradeSel').value = '总体（默认）';
  document.getElementById('redlineSel').value = '';
  document.getElementById('minScore').value = '';
  document.getElementById('maxScore').value = '';
  applyFilters();
}

function renderAll() {
  renderTable();
  renderBarChart();
  renderRadarChart();
  renderRankings();
  renderScopeAnalysis();
}

function sortTable(key) {
  if (sortKey === key) sortAsc = !sortAsc;
  else { sortKey = key; sortAsc = false; }
  renderTable();
}

function renderTable() {
  const projects = [...filteredProjects].sort((a, b) => {
    let av = sortKey === 'name' ? a.name : a.scores[sortKey];
    let bv = sortKey === 'name' ? b.name : b.scores[sortKey];
    return sortAsc ? (av > bv ? 1 : -1) : (av < bv ? 1 : -1);
  });

  const keys = ['env', 'safety', 'facility', 'green', 'service'];
  const avg = {};
  ['total', ...keys].forEach(k => {
    avg[k] = projects.length > 0
      ? Math.round(projects.reduce((s, p) => s + p.scores[k], 0) / projects.length * 100) / 100
      : 0;
  });

  document.getElementById('tableTitle').textContent = `输出内容（共 ${projects.length} 个项目）`;

  const rows = projects.map(p => {
    const g = getGrade(p.scores.total);
    return `<tr>
      <td><a href="project-dashboard.html?id=${p.id}" style="color:var(--primary);text-decoration:none;font-weight:500;">${p.name}</a></td>
      <td class="score-cell ${scoreClass(p.scores.total)}">${p.scores.total}</td>
      ${keys.map(k => `<td class="score-cell ${scoreClass(p.scores[k])}">${p.scores[k]}</td>`).join('')}
      <td><span class="grade-badge ${g.className}">${g.label}</span></td>
    </tr>`;
  }).join('');

  const avgRow = `<tr class="avg-row">
    <td>平均</td>
    <td class="score-cell">${avg.total}</td>
    ${keys.map(k => `<td class="score-cell">${avg[k]}</td>`).join('')}
    <td></td>
  </tr>`;

  document.getElementById('tableBody').innerHTML = rows + avgRow;
}

function scoreClass(v) {
  if (v >= 93) return 'score-high';
  if (v >= 83) return 'score-mid';
  return 'score-low';
}

function dateToQuarter(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  const q = Math.ceil((d.getMonth() + 1) / 3);
  return `${d.getFullYear()}年Q${q}`;
}

function onCompareModuleChange() {
  currentCompareModule = document.getElementById('compareModuleSel').value;
  renderBarChart();
}

function onTrendChange(trend, btn) {
  currentCompareTrend = trend;
  document.querySelectorAll('.compare-tab-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  renderBarChart();
}

function getRegionAvgScore(projects, key, historyPeriod) {
  if (projects.length === 0) return 0;
  const moduleKeys = ['env', 'safety', 'facility', 'green', 'service'];
  const scores = projects.map(p => {
    if (!historyPeriod) {
      return key === 'total' ? p.scores.total : p.scores[key];
    }
    const h = p.history[historyPeriod];
    if (!h) return 0;
    if (key === 'total') {
      const vals = moduleKeys.map(k => h[k] || 0);
      return Math.round(vals.reduce((a, b) => a + b, 0) / vals.length * 100) / 100;
    }
    return h[key] || 0;
  });
  return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length * 100) / 100;
}

function renderBarChart() {
  const projects = filteredProjects;
  if (scopeBarChart) scopeBarChart.destroy();
  if (projects.length === 0) return;

  const regions = [...new Set(projects.map(p => p.region))];
  const moduleLabel = currentCompareModule === 'total' ? '总分' : MODULE_LABELS[currentCompareModule];

  function moduleScore(p, key, histSlot) {
    const moduleKeys = ['env', 'safety', 'facility', 'green', 'service'];
    if (histSlot === null) {
      return key === 'total' ? p.scores.total : p.scores[key];
    }
    const h = p.history?.prevInspections?.[histSlot];
    if (!h) return null;
    if (key === 'total') {
      const vals = moduleKeys.map(k => h[k] || 0);
      return Math.round(vals.reduce((a, b) => a + b, 0) / vals.length * 100) / 100;
    }
    return h[key] || 0;
  }

  function regionAvg(rProjects, key, histSlot) {
    const scores = rProjects.map(p => moduleScore(p, key, histSlot)).filter(v => v !== null);
    if (scores.length === 0) return null;
    return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length * 100) / 100;
  }

  if (currentCompareTrend === 'yoy') {
    const currentData = regions.map(r => regionAvg(projects.filter(p => p.region === r), currentCompareModule, null));
    const compareData = regions.map(r =>
      getRegionAvgScore(projects.filter(p => p.region === r), currentCompareModule, 'lastYear')
    );

    scopeBarChart = new Chart(document.getElementById('barChart'), {
      type: 'bar',
      data: {
        labels: regions,
        datasets: [
          { label: `本期（${moduleLabel}）`, data: currentData, backgroundColor: '#c0392b', borderRadius: 4 },
          { label: '去年同期', data: compareData, backgroundColor: '#95a5a6', borderRadius: 4 },
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
                if (ctx.datasetIndex !== 0) return '';
                const diff = currentData[ctx.dataIndex] - compareData[ctx.dataIndex];
                return `较去年同期：${diff >= 0 ? '+' : ''}${diff.toFixed(2)}分`;
              },
            },
          },
        },
      },
    });
  } else {
    // 环比：前3次检查（按季度）+ 本期，折线图，每条线代表一个区域
    const sampleProject = projects[0];
    const prevDates = (sampleProject?.history?.prevInspections || []).map(h => h.date);
    const timeLabels = [
      ...prevDates.map(d => dateToQuarter(d)),
      `${dateToQuarter(sampleProject.inspectTime)}（本期）`,
    ];

    const regionColors = ['#c0392b', '#3498db', '#27ae60', '#e67e22'];

    const datasets = regions.map((r, i) => {
      const rProjects = projects.filter(p => p.region === r);
      const data = [
        regionAvg(rProjects, currentCompareModule, 0),
        regionAvg(rProjects, currentCompareModule, 1),
        regionAvg(rProjects, currentCompareModule, 2),
        regionAvg(rProjects, currentCompareModule, null),
      ];
      const color = regionColors[i % regionColors.length];
      return {
        label: `${r}（${moduleLabel}）`,
        data,
        borderColor: color,
        backgroundColor: 'transparent',
        pointBackgroundColor: color,
        borderWidth: 2,
        pointRadius: 5,
        tension: 0.3,
      };
    });

    scopeBarChart = new Chart(document.getElementById('barChart'), {
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
                if (idx === 0 || ds[idx - 1] === null) return '';
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

function renderRadarChart() {
  const projects = filteredProjects;
  if (scopeRadarChart) scopeRadarChart.destroy();
  if (projects.length === 0) return;

  const labels = ['环境卫生', '安全管理', '设施设备', '绿化养护', '客户服务'];
  const keys = ['env', 'safety', 'facility', 'green', 'service'];
  const avg = keys.map(k => {
    const vals = projects.map(p => p.scores[k]);
    return Math.round(vals.reduce((a, b) => a + b, 0) / vals.length * 10) / 10;
  });

  scopeRadarChart = new Chart(document.getElementById('radarChart'), {
    type: 'radar',
    data: {
      labels,
      datasets: [{
        label: '平均得分',
        data: avg,
        backgroundColor: 'rgba(192,57,43,0.2)',
        borderColor: '#c0392b',
        pointBackgroundColor: '#c0392b',
        borderWidth: 2,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: { r: { min: 60, max: 100, ticks: { stepSize: 10 } } },
      plugins: { legend: { position: 'bottom' } },
    },
  });
}

function renderRankings() {
  const projects = [...filteredProjects].sort((a, b) => b.scores.total - a.scores.total);
  document.getElementById('totalRank').innerHTML = projects.map((p, i) => {
    const cls = i === 0 ? 'top1' : i === 1 ? 'top2' : i === 2 ? 'top3' : 'other';
    return `<li class="rank-item">
      <span class="rank-num ${cls}">${i + 1}</span>
      <span class="rank-name">${p.name}</span>
      <span class="rank-score">${p.scores.total}</span>
    </li>`;
  }).join('');

  renderModuleRank();
}

function renderModuleRank() {
  const key = document.getElementById('rankModuleSel').value;
  const projects = [...filteredProjects].sort((a, b) => b.scores[key] - a.scores[key]);
  document.getElementById('moduleRank').innerHTML = projects.map((p, i) => {
    const cls = i === 0 ? 'top1' : i === 1 ? 'top2' : i === 2 ? 'top3' : 'other';
    return `<li class="rank-item">
      <span class="rank-num ${cls}">${i + 1}</span>
      <span class="rank-name">${p.name}</span>
      <span class="rank-score">${p.scores[key]}</span>
    </li>`;
  }).join('');
}

function renderScopeAnalysis() {
  const projects = filteredProjects;
  if (projects.length === 0) {
    document.getElementById('scopeAnalysis').innerHTML = '<p style="color:var(--text-light);">暂无符合条件的项目数据</p>';
    document.getElementById('scopeSuggestion').innerHTML = '';
    return;
  }

  const keys = ['env', 'safety', 'facility', 'green', 'service'];
  const avgTotal = Math.round(projects.reduce((s, p) => s + p.scores.total, 0) / projects.length * 100) / 100;
  const moduleAvg = {};
  keys.forEach(k => {
    moduleAvg[k] = Math.round(projects.reduce((s, p) => s + p.scores[k], 0) / projects.length * 100) / 100;
  });

  const goodModules = keys.filter(k => moduleAvg[k] >= 88).map(k => MODULE_LABELS[k]);
  const badModules = keys.filter(k => moduleAvg[k] < 88).map(k => MODULE_LABELS[k]);
  const failCount = projects.filter(p => p.scores.total < 83).length;
  const redlineCount = projects.filter(p => p.redLines && p.redLines.length > 0).length;
  const totalGrade = getGrade(avgTotal);

  const totalAnalysis = `当前范围共 <strong>${projects.length}</strong> 个项目，平均得分 <strong>${avgTotal}</strong> 分，得分等级：<strong>${totalGrade.label}</strong>。` +
    (goodModules.length > 0 ? `良好及以上模块：${goodModules.join('、')}；` : '') +
    (badModules.length > 0 ? `良好以下模块：${badModules.join('、')}。` : '各模块表现均衡。') +
    (failCount > 0 ? `<span style="color:var(--danger);"> 其中 ${failCount} 个项目不及格，需重点关注。</span>` : '') +
    (redlineCount > 0 ? `<span style="color:var(--danger);"> ${redlineCount} 个项目触发红线项。</span>` : '');

  // 各模块分析块：与单项目格式一致，展示均分+等级+各项目得分列表
  const moduleBlocks = keys.map(k => {
    const score = moduleAvg[k];
    const grade = getGrade(score);
    const label = MODULE_LABELS[k];
    const borderColor = score >= 93 ? 'var(--success)' : score >= 88 ? 'var(--info)' : score >= 83 ? 'var(--warning)' : 'var(--danger)';

    const goodProjects = projects.filter(p => p.scores[k] >= 88);
    const badProjects  = projects.filter(p => p.scores[k] < 88);
    const listHtml = `<div style="margin-top:8px;">
      ${goodProjects.map(p => `<div style="font-size:12px;color:var(--success);margin-bottom:3px;">✓ ${p.name}（${p.scores[k]}）</div>`).join('')}
      ${badProjects.map(p => `<div style="font-size:12px;color:var(--danger);margin-bottom:3px;">✗ ${p.name}（${p.scores[k]}）</div>`).join('')}
    </div>`;

    return `<div class="analysis-block" style="border-left-color:${borderColor};">
      <div class="analysis-title" style="display:flex;align-items:center;gap:8px;">
        ${label}
        <span style="font-size:22px;font-weight:700;color:${borderColor};">${score}</span>
        <span class="grade-badge ${grade.className}" style="font-size:11px;">${grade.label}</span>
      </div>
      ${listHtml}
    </div>`;
  }).join('');

  const aiAnalysis = `基于当前 ${projects.length} 个项目检查数据综合分析：整体品质水平${avgTotal >= 93 ? '优秀' : avgTotal >= 88 ? '良好' : avgTotal >= 83 ? '及格' : '有待提升'}，区域平均得分 ${avgTotal} 分。` +
    (badModules.length > 0 ? `${badModules.join('、')}模块在多个项目中均呈现较低得分，建议从管理机制、人员培训等方面进行系统性改善。` : '各模块得分均处于较好水平，建议继续保持。') +
    (redlineCount > 0 ? `有 ${redlineCount} 个项目触发红线项，需优先整改安全隐患。` : '');

  document.getElementById('scopeAnalysis').innerHTML = `
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
      <p>${aiAnalysis}</p>
    </div>
  `;

  // 提升建议：与单项目格式一致
  const badKeys = keys.filter(k => moduleAvg[k] < 88);
  const suggestionItems = badKeys.length > 0
    ? badKeys.map((k, i) => `<li style="margin-bottom:8px;color:var(--text-light);">
        <span style="font-weight:700;color:var(--primary);">${i + 1}.</span>
        针对 <strong>${MODULE_LABELS[k]}</strong>（区域均分 ${moduleAvg[k]} 分），督促相关项目制定专项整改计划，明确责任人及完成时限
      </li>`).join('')
    : `<li style="color:var(--text-light);">当前所有模块均达到良好以上水平，继续保持。</li>`;

  const aiSuggestion = (badModules.length > 0
    ? badModules.map((m, i) => `${'①②③④⑤'[i]}针对${m}薄弱环节，参照区域内优秀项目管理标准，制定专项提升计划并设定考核节点`).join('；') + '。'
    : '继续保持现有管理水平，将优秀经验向区域内其他项目输出推广。') +
    '加强项目间横向交流，组织现场观摩学习；建立问题闭环管理机制，确保检查发现问题在规定时限内完成整改并验收。';

  document.getElementById('scopeSuggestion').innerHTML = `
    <div class="analysis-block">
      <div class="analysis-title">整改要求</div>
      <ul style="list-style:none;">${suggestionItems}</ul>
    </div>
    <div class="analysis-block" style="border-left-color:var(--info);">
      <div class="analysis-title">提升建议</div>
      <p style="color:var(--text-light);line-height:1.8;">${aiSuggestion}</p>
    </div>
  `;
}

// Support ?id= from project-dashboard link
(function handleQueryParam() {
  const params = new URLSearchParams(location.search);
  const id = params.get('id');
  if (id) {
    setTimeout(() => {
      const sel = document.getElementById('projectSel');
      if (sel) { sel.value = id; applyFilters(); }
    }, 100);
  }
})();

initFilters();
