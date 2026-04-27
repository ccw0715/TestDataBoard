// scope-dashboard.js

let scopeBarChart = null;
let scopeRadarChart = null;
let filteredProjects = [];
let sortKey = 'total';
let sortAsc = false;

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

function renderBarChart() {
  const projects = filteredProjects;
  if (scopeBarChart) scopeBarChart.destroy();
  if (projects.length === 0) return;

  const labels = projects.map(p => p.name.length > 8 ? p.name.slice(0, 8) + '…' : p.name);
  const data = projects.map(p => p.scores.total);
  const colors = data.map(v => v >= 93 ? '#27ae60' : v >= 83 ? '#e67e22' : '#c0392b');

  scopeBarChart = new Chart(document.getElementById('barChart'), {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label: '总得分',
        data,
        backgroundColor: colors,
        borderRadius: 4,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: { min: 60, max: 100 },
      },
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            title: (items) => projects[items[0].dataIndex].name,
            afterLabel: (item) => `等级：${getGrade(item.raw).label}`,
          },
        },
      },
    },
  });
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

  const goodModules = keys.filter(k => moduleAvg[k] >= 93).map(k => MODULE_LABELS[k]);
  const badModules = keys.filter(k => moduleAvg[k] < 88).map(k => MODULE_LABELS[k]);
  const failCount = projects.filter(p => p.scores.total < 83).length;
  const redlineCount = projects.filter(p => p.redLines && p.redLines.length > 0).length;

  document.getElementById('scopeAnalysis').innerHTML = `
    <div class="analysis-block">
      <div class="analysis-title">总分分析</div>
      <p>当前筛选范围共 <strong>${projects.length}</strong> 个项目，平均得分 <strong>${avgTotal}</strong> 分。
        ${failCount > 0 ? `<span style="color:var(--danger);">其中 ${failCount} 个项目不及格，需重点关注。</span>` : '所有项目均达及格线以上。'}
        ${redlineCount > 0 ? `<span style="color:var(--danger);"> ${redlineCount} 个项目触发红线项。</span>` : ''}
      </p>
      <div class="module-tags" style="margin-top:10px;">
        ${goodModules.map(m => `<span class="module-tag tag-good">✓ ${m}（优秀）</span>`).join('')}
        ${badModules.map(m => `<span class="module-tag tag-bad">✗ ${m}（待提升）</span>`).join('')}
      </div>
    </div>
    <div class="analysis-block">
      <div class="analysis-title">模块分析</div>
      <p>各模块平均得分：${keys.map(k => `${MODULE_LABELS[k]} ${moduleAvg[k]}`).join('、')}。
        ${badModules.length > 0 ? `<strong>${badModules.join('、')}</strong>为整体薄弱环节，建议重点关注。` : '各模块表现均衡。'}
      </p>
    </div>
    <div class="analysis-block" style="border-left-color:var(--info);">
      <div class="analysis-title">AI 综合分析</div>
      <p>基于当前 ${projects.length} 个项目的检查数据综合分析：整体品质水平${avgTotal >= 93 ? '优秀' : avgTotal >= 88 ? '良好' : avgTotal >= 83 ? '及格' : '有待提升'}。
        ${badModules.length > 0 ? `${badModules.join('、')}模块在多个项目中均呈现较低得分，建议从管理机制、人员培训等方面进行系统性改善。` : '各模块得分均处于较好水平，建议继续保持。'}
      </p>
    </div>
  `;

  document.getElementById('scopeSuggestion').innerHTML = `
    <div class="analysis-block" style="border-left-color:var(--info);">
      <div class="analysis-title">AI 提升建议</div>
      <p>基于同类型优秀项目数据对比，建议：</p>
      <ol style="padding-left:20px;margin-top:8px;line-height:2;color:var(--text-light);">
        ${badModules.length > 0 ? badModules.map(m => `<li>针对 <strong>${m}</strong> 薄弱环节，参照区域内优秀项目的管理标准，制定专项提升计划，设置明确的改进时限和考核节点</li>`).join('') : '<li>继续保持现有管理水平，将优秀经验向区域内其他项目输出推广</li>'}
        <li>加强项目间横向交流，组织现场观摩学习活动，提升整体管理水平</li>
        <li>建立问题闭环管理机制，确保检查发现问题在规定时限内完成整改并验收</li>
      </ol>
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
