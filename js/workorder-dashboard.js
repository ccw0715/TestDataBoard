// workorder-dashboard.js

let pieChart = null;
let projBarChart = null;
let statusBarChart = null;
let filteredOrders = [];
let sortKey = 'id';
let sortAsc = true;
let currentRegionChart = 'category';

function init() {
  const regionSel = document.getElementById('regionSel');
  regionSel.innerHTML = REGIONS.map(r => `<option value="${r}">${r}</option>`).join('');
  onRegionChange();
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
  const city = document.getElementById('citySel').value;
  const projects = getProjects();
  const filtered = city === '总体（默认）' ? projects : projects.filter(p => p.city === city);
  const sel = document.getElementById('projectSel');
  sel.innerHTML = '<option value="">总体（默认）</option>' +
    filtered.map(p => `<option value="${p.id}">${p.name}</option>`).join('');
}

function applyFilters() {
  const region = document.getElementById('regionSel').value;
  const city = document.getElementById('citySel').value;
  const projectId = document.getElementById('projectSel').value;
  const category = document.getElementById('categorySel').value;
  const valid = document.getElementById('validSel').value;
  const completed = document.getElementById('completedSel').value;
  const overdue = document.getElementById('overdueSel').value;

  let projects = getProjects();
  if (region !== '总体（默认）') projects = projects.filter(p => p.region === region);
  if (city !== '总体（默认）') projects = projects.filter(p => p.city === city);
  if (projectId) projects = projects.filter(p => p.id === projectId);
  const projectIds = new Set(projects.map(p => p.id));

  let orders = getWorkOrders().filter(o => projectIds.has(o.projectId));
  if (category) orders = orders.filter(o => o.category === category);
  if (valid === 'yes') orders = orders.filter(o => o.valid === true);
  if (valid === 'no') orders = orders.filter(o => o.valid === false);
  if (completed === 'yes') orders = orders.filter(o => o.completed === true);
  if (completed === 'no') orders = orders.filter(o => o.completed === false);
  if (overdue === 'yes') orders = orders.filter(o => o.overdue === true);
  if (overdue === 'no') orders = orders.filter(o => o.overdue === false);

  filteredOrders = orders;
  renderAll(projects);
}

function resetFilters() {
  document.getElementById('regionSel').value = '总体（默认）';
  onRegionChange();
  document.getElementById('categorySel').value = '';
  document.getElementById('validSel').value = '';
  document.getElementById('completedSel').value = '';
  document.getElementById('overdueSel').value = '';
  applyFilters();
}

function renderAll(projects) {
  renderStatCards();
  renderPieChart();
  renderProjectBarChart();
  renderStatusChart();
  renderTable();
}

function renderStatCards() {
  const orders = filteredOrders;
  const total = orders.length;
  const repair  = orders.filter(o => o.category === 'repair').length;
  const service = orders.filter(o => o.category === 'service').length;
  const env     = orders.filter(o => o.category === 'env').length;
  const green   = orders.filter(o => o.category === 'green').length;
  const pending = orders.filter(o => !o.completed).length;
  const overdue = orders.filter(o => o.overdue).length;
  const satisfied = orders.filter(o => o.satisfied === true).length;
  const rated = orders.filter(o => o.satisfied !== null).length;
  const satisfiedRate = rated > 0 ? Math.round(satisfied / rated * 100) : 0;
  const completedCount = orders.filter(o => o.completed).length;
  const completedRate = total > 0 ? Math.round(completedCount / total * 100) : 0;

  document.getElementById('statCards').innerHTML = `
    <div class="stat-card stat-total">
      <div class="stat-value" style="color:var(--text);">${total}</div>
      <div class="stat-label">工单总数</div>
      <div class="stat-sub" style="color:var(--text-light);">完成率 ${completedRate}%</div>
    </div>
    <div class="stat-card stat-repair">
      <div class="stat-value" style="color:#7d3c98;">🔧 ${repair}</div>
      <div class="stat-label">维修类</div>
      <div class="stat-sub" style="color:#9b59b6;">${total > 0 ? Math.round(repair/total*100) : 0}%</div>
    </div>
    <div class="stat-card stat-consulting">
      <div class="stat-value" style="color:#2c6fbe;">💬 ${service}</div>
      <div class="stat-label">服务类</div>
      <div class="stat-sub" style="color:#5b8dd9;">${total > 0 ? Math.round(service/total*100) : 0}%</div>
    </div>
    <div class="stat-card" style="border-top-color:#d4ac0d;">
      <div class="stat-value" style="color:#b7950b;">🧹 ${env}</div>
      <div class="stat-label">环境类</div>
      <div class="stat-sub" style="color:#d4ac0d;">${total > 0 ? Math.round(env/total*100) : 0}%</div>
    </div>
    <div class="stat-card" style="border-top-color:#16a085;">
      <div class="stat-value" style="color:#148f77;">🌿 ${green}</div>
      <div class="stat-label">绿化类</div>
      <div class="stat-sub" style="color:#16a085;">${total > 0 ? Math.round(green/total*100) : 0}%</div>
    </div>
    <div class="stat-card stat-pending">
      <div class="stat-value" style="color:${overdue > 0 ? 'var(--danger)' : 'var(--text)'};">${pending}</div>
      <div class="stat-label">待处理工单</div>
      <div class="stat-sub" style="color:var(--danger);">超时 ${overdue} 单 &nbsp; 满意率 ${satisfiedRate}%</div>
    </div>
  `;
}

function renderPieChart() {
  const orders = filteredOrders;
  const cats = Object.entries(WORK_ORDER_CATEGORIES);
  const data = cats.map(([k]) => orders.filter(o => o.category === k).length);

  if (pieChart) pieChart.destroy();
  pieChart = new Chart(document.getElementById('categoryPieChart'), {
    type: 'doughnut',
    data: {
      labels: cats.map(([, v]) => `${v.icon} ${v.label}`),
      datasets: [{
        data,
        backgroundColor: cats.map(([, v]) => v.color),
        borderWidth: 2,
        borderColor: '#fff',
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: 'bottom', labels: { font: { size: 12 } } },
        tooltip: {
          callbacks: {
            label: (ctx) => ` ${ctx.label}：${ctx.raw} 单（${orders.length > 0 ? Math.round(ctx.raw / orders.length * 100) : 0}%）`,
          },
        },
      },
    },
  });
}

function onRegionChartChange() {
  currentRegionChart = document.getElementById('regionChartSel').value;
  renderProjectBarChart();
}

function renderProjectBarChart() {
  if (projBarChart) projBarChart.destroy();
  const orders = filteredOrders;
  if (orders.length === 0) return;

  const allProjects = getProjects();
  const projectMap = {};
  allProjects.forEach(p => { projectMap[p.id] = p; });

  const regionSet = new Set();
  orders.forEach(o => { const p = projectMap[o.projectId]; if (p) regionSet.add(p.region); });
  const regions = [...regionSet];
  if (regions.length === 0) return;

  const byRegion = r => orders.filter(o => { const p = projectMap[o.projectId]; return p && p.region === r; });

  let stacked = false;
  let datasets = [];
  let yAxis = { ticks: { stepSize: 1 } };

  switch (currentRegionChart) {
    case 'category': {
      stacked = true;
      datasets = Object.entries(WORK_ORDER_CATEGORIES).map(([k, v]) => ({
        label: `${v.icon} ${v.label}`,
        data: regions.map(r => byRegion(r).filter(o => o.category === k).length),
        backgroundColor: v.color, borderRadius: 3,
      }));
      break;
    }
    case 'attitude': {
      datasets = [
        { label: '态度良好', data: regions.map(r => byRegion(r).filter(o => o.attitude !== '态度恶劣').length), backgroundColor: '#27ae60', borderRadius: 3 },
        { label: '态度恶劣', data: regions.map(r => byRegion(r).filter(o => o.attitude === '态度恶劣').length), backgroundColor: '#c0392b', borderRadius: 3 },
      ];
      break;
    }
    case 'valid': {
      datasets = [
        { label: '有效', data: regions.map(r => byRegion(r).filter(o => o.valid === true).length), backgroundColor: '#27ae60', borderRadius: 3 },
        { label: '无效', data: regions.map(r => byRegion(r).filter(o => o.valid === false).length), backgroundColor: '#95a5a6', borderRadius: 3 },
      ];
      break;
    }
    case 'completed': {
      datasets = [
        { label: '已完成', data: regions.map(r => byRegion(r).filter(o => o.completed === true).length), backgroundColor: '#27ae60', borderRadius: 3 },
        { label: '处理中', data: regions.map(r => byRegion(r).filter(o => o.completed === false).length), backgroundColor: '#e67e22', borderRadius: 3 },
      ];
      break;
    }
    case 'handleTime': {
      yAxis = { title: { display: true, text: '小时(h)' }, ticks: { stepSize: 1 } };
      datasets = [{
        label: '平均处理时长(h)',
        data: regions.map(r => {
          const done = byRegion(r).filter(o => o.handleTime !== null);
          if (!done.length) return 0;
          return Math.round(done.reduce((s, o) => s + o.handleTime, 0) / done.length * 10) / 10;
        }),
        backgroundColor: '#5b8dd9', borderRadius: 3,
      }];
      break;
    }
    case 'overdue': {
      datasets = [
        { label: '未超时', data: regions.map(r => byRegion(r).filter(o => !o.overdue).length), backgroundColor: '#27ae60', borderRadius: 3 },
        { label: '超时', data: regions.map(r => byRegion(r).filter(o => o.overdue).length), backgroundColor: '#c0392b', borderRadius: 3 },
      ];
      break;
    }
    case 'satisfied': {
      stacked = true;
      datasets = [
        { label: '满意', data: regions.map(r => byRegion(r).filter(o => o.satisfied === true).length), backgroundColor: '#27ae60', borderRadius: 3 },
        { label: '不满意', data: regions.map(r => byRegion(r).filter(o => o.satisfied === false).length), backgroundColor: '#c0392b', borderRadius: 3 },
        { label: '未评价', data: regions.map(r => byRegion(r).filter(o => o.satisfied === null).length), backgroundColor: '#bdc3c7', borderRadius: 3 },
      ];
      break;
    }
  }

  projBarChart = new Chart(document.getElementById('projectBarChart'), {
    type: 'bar',
    data: { labels: regions, datasets },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: { stacked },
        y: { ...yAxis, stacked },
      },
      plugins: { legend: { position: 'bottom', labels: { font: { size: 12 } } } },
    },
  });
}

function renderStatusChart() {
  if (statusBarChart) statusBarChart.destroy();
  const orders = filteredOrders;
  const total = orders.length;
  if (total === 0) return;

  const completed = orders.filter(o => o.completed).length;
  const overdue = orders.filter(o => o.overdue).length;
  const satisfied = orders.filter(o => o.satisfied === true).length;
  const dissatisfied = orders.filter(o => o.satisfied === false).length;
  const unrated = orders.filter(o => o.satisfied === null).length;

  statusBarChart = new Chart(document.getElementById('statusBarChart'), {
    type: 'bar',
    data: {
      labels: ['完成情况', '超时情况', '满意度'],
      datasets: [
        {
          label: '已完成 / 无超时 / 满意',
          data: [completed, total - overdue, satisfied],
          backgroundColor: '#27ae60',
          borderRadius: 4,
        },
        {
          label: '未完成 / 超时 / 不满意',
          data: [total - completed, overdue, dissatisfied],
          backgroundColor: '#c0392b',
          borderRadius: 4,
        },
        {
          label: '未评价',
          data: [0, 0, unrated],
          backgroundColor: '#bdc3c7',
          borderRadius: 4,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: { x: { stacked: true }, y: { stacked: true, ticks: { stepSize: 1 } } },
      plugins: { legend: { position: 'bottom', labels: { font: { size: 11 } } } },
    },
  });
}

function sortTable(key) {
  if (sortKey === key) sortAsc = !sortAsc;
  else { sortKey = key; sortAsc = true; }
  renderTable();
}

function renderTable() {
  const orders = [...filteredOrders].sort((a, b) => {
    let av = a[sortKey], bv = b[sortKey];
    if (av === null || av === undefined) av = sortAsc ? Infinity : -Infinity;
    if (bv === null || bv === undefined) bv = sortAsc ? Infinity : -Infinity;
    if (typeof av === 'boolean') av = av ? 1 : 0;
    if (typeof bv === 'boolean') bv = bv ? 1 : 0;
    return sortAsc ? (av > bv ? 1 : -1) : (av < bv ? 1 : -1);
  });

  const projectMap = {};
  getProjects().forEach(p => { projectMap[p.id] = p.name; });

  document.getElementById('tableTitle').textContent = `工单列表（共 ${orders.length} 条）`;

  document.getElementById('woTableBody').innerHTML = orders.map((o, idx) => {
    const cat = WORK_ORDER_CATEGORIES[o.category];
    const attitudeClass = o.attitude === '态度恶劣' ? 'bool-no' : 'bool-yes';
    const respStyle = o.responseTime > 10 ? 'style="color:var(--danger);font-weight:600;"' : '';
    const dash = '<span class="bool-na">—</span>';
    const isInvalid = o.valid === false;
    return `<tr>
      <td style="color:var(--text-light);font-size:12px;">${idx + 1}</td>
      <td style="max-width:240px;">
        <div style="font-weight:500;">${o.issue}</div>
        <div style="font-size:11px;color:var(--text-light);">${projectMap[o.projectId] || o.projectId}</div>
      </td>
      <td><span class="category-tag tag-${o.category}">${cat.icon} ${cat.label}</span></td>
      <td ${respStyle}>${o.responseTime}</td>
      <td class="${attitudeClass}">${o.attitude}</td>
      <td class="${o.valid ? 'bool-yes' : 'bool-no'}">${o.valid ? '是（生成工单）' : '否'}</td>
      <td>${isInvalid ? dash : o.handler}</td>
      <td class="${isInvalid ? '' : (o.completed ? 'completed-yes' : 'completed-no')}">${isInvalid ? dash : (o.completed ? '是' : '处理中')}</td>
      <td>${isInvalid ? dash : o.deadline}</td>
      <td>${isInvalid ? dash : (o.handleTime !== null ? o.handleTime + 'h' : dash)}</td>
      <td class="${isInvalid ? '' : (o.overdue ? 'overdue-yes' : 'overdue-no')}">${isInvalid ? dash : (o.overdue ? '是' : '否')}</td>
      <td class="${isInvalid ? '' : (o.satisfied === true ? 'bool-yes' : o.satisfied === false ? 'bool-no' : 'bool-na')}">
        ${isInvalid ? dash : (o.satisfied === true ? '满意（含不回复）' : o.satisfied === false ? '不满意' : '—')}
      </td>
    </tr>`;
  }).join('');
}

init();
