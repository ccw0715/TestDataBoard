// mock-data.js — 第三方检查数据看板模拟数据

const GRADE_RULES = [
  { label: '卓越', min: 96, className: 'grade-excellent' },
  { label: '优秀', min: 93, className: 'grade-good' },
  { label: '良好', min: 88, className: 'grade-good' },
  { label: '及格', min: 83, className: 'grade-pass' },
  { label: '不及格', min: 0, className: 'grade-fail' },
];

function getGrade(score) {
  for (const g of GRADE_RULES) {
    if (score >= g.min) return g;
  }
  return GRADE_RULES[GRADE_RULES.length - 1];
}

const RAW_PROJECTS = [
  {
    id: 'P001',
    name: '时代天韵（黄埔）',
    vendor: '广州万洁升环保工程有限公司',
    city: '广州',
    region: '广州公司',
    level: '紫金花',
    unitPrice: 2.5,
    area: 12000,
    inspector: '张明华',
    inspectTime: '2025-08-01',
    scores: { env: 89.73, safety: 84.46, facility: 87.67, green: 74.37, service: 92.87 },
    redLines: [
      { item: '楼栋内堆放易燃杂物', location: '3号楼地下室', status: '未整改' },
    ],
    penalties: [
      { type: 'external', project: '时代天韵', reason: '绿化养护得分不达标', month: '8月', amount: '合同扣罚 0.5%' },
    ],
    history: {
      lastYear: { env: 87.2, safety: 82.1, facility: 85.3, green: 72.0, service: 90.5 },
      lastMonth: { env: 88.5, safety: 83.2, facility: 86.1, green: 73.5, service: 91.4 },
      prevInspections: [
        { date: '2024-11-10', env: 84.1, safety: 80.3, facility: 83.2, green: 76.5, service: 88.6 },
        { date: '2025-02-12', env: 85.9, safety: 81.8, facility: 84.7, green: 75.8, service: 89.8 },
        { date: '2025-05-10', env: 87.4, safety: 82.8, facility: 85.9, green: 75.2, service: 91.0 },
      ],
    },
    issues: [
      '项目楼栋内堆放易燃杂物较多，存在安全隐患，楼栋天面多个电梯机房未关闭',
      '整体绿化裸露明显，长时间未进行养护',
      '项目员工着装不规范，且对应答流程不熟悉',
    ],
    moduleIssueDetails: {
      env: [
        { subCategory: '垃圾投放点卫生', items: [{ location: 'A1栋大堂', deduction: 2 }, { location: '垃圾投放点', deduction: 3 }, { location: '负一停车场', deduction: 2 }] },
        { subCategory: '架空层保洁', items: [{ location: '园区主干道', deduction: 3 }, { location: 'B区架空层', deduction: 2 }, { location: 'A栋架空层', deduction: 2 }] },
      ],
      safety: [
        { subCategory: '消防设施巡检', items: [{ location: '3号楼地下室', deduction: 1 }, { location: 'A栋天面', deduction: 3 }] },
        { subCategory: '门禁设施使用', items: [{ location: '小区外围', deduction: 3 }, { location: '园区', deduction: 2 }] },
      ],
      facility: [
        { subCategory: '楼栋照明', items: [{ location: '电梯机房', deduction: 1 }, { location: '设备用房', deduction: 3 }] },
        { subCategory: '消防指示灯', items: [{ location: 'B区走廊', deduction: 2 }] },
      ],
      green: [
        { subCategory: '草坪维护', items: [{ location: '养护问题', deduction: 1 }] },
        { subCategory: '绿植修剪', items: [{ location: '养护问题', deduction: 1 }] },
      ],
      service: [
        { subCategory: '员工形象', items: [{ location: '管家', deduction: 2 }] },
        { subCategory: '应答规范', items: [{ location: '门岗', deduction: 3 }] },
      ],
    },
    suggestions: [
      '宣贯消防安全知识，组织开展楼栋杂物清理专项工作',
      '项目整体绿化较差，需督促绿化单位根据公司标准开展整改，落实相应处罚',
      '品质分部需对专业线条人员进行服务标准宣贯，并落实定期检查',
    ],
    aiAnalysis: '该项目本期总得分 75.76 分，处于不及格等级。主要问题集中在绿化养护（74.37分，良好以下）和安全管理（84.46分，及格边缘）。客户服务表现突出（92.87分，优秀），可作为全区标杆模块推广。建议优先整改绿化和安全两个模块，争取在下个检查周期内提升至及格以上水平。',
    aiSuggestion: '对比同类型金百合级别优秀项目（平均88.5分），建议：①参照佛山金百合项目绿化日常养护标准，制定绿化巡查频率和问题响应时限；②借鉴清远郁金香项目的楼栋安全自查清单，实现每日自查闭环；③客服模块保持现有优势，可提炼经验输出至其他弱项项目。',
    checkItems: [
      { module: '环境卫生', location: '小区周边', desc: '出入口及公区无漂浮垃圾', passed: true },
      { module: '环境卫生', location: '园区', desc: '楼栋无漂浮垃圾', passed: false },
      { module: '安全管理', location: '楼栋', desc: '电梯机房门关闭', passed: false },
      { module: '绿化养护', location: '公区', desc: '绿植无明显裸露枯死', passed: false },
      { module: '客户服务', location: '大堂', desc: '员工着装整洁符合规范', passed: false },
    ],
  },
  {
    id: 'P002',
    name: '清远远天世纪城',
    vendor: '广州万洁升环保工程有限公司',
    city: '清远',
    region: '佛清肇公司',
    level: '金百合',
    unitPrice: 1.8,
    area: 18500,
    inspector: '李晓燕',
    inspectTime: '2025-08-01',
    scores: { env: 77.44, safety: 80.63, facility: 89.73, green: 75.50, service: 82.00 },
    redLines: [],
    penalties: [
      { type: 'external', project: '清远远天世纪城', reason: '清洁得分不达标', month: '8月', amount: '合同扣罚 1%' },
    ],
    history: {
      lastYear: { env: 75.1, safety: 78.5, facility: 87.2, green: 74.0, service: 80.3 },
      lastMonth: { env: 76.8, safety: 79.6, facility: 88.5, green: 75.0, service: 81.2 },
      prevInspections: [
        { date: '2024-11-08', env: 73.2, safety: 76.5, facility: 86.0, green: 72.8, service: 78.5 },
        { date: '2025-02-10', env: 74.8, safety: 77.9, facility: 87.2, green: 73.5, service: 79.8 },
        { date: '2025-05-08', env: 75.9, safety: 78.4, facility: 87.3, green: 74.1, service: 80.8 },
      ],
    },
    issues: [
      '环境卫生问题较多，楼道清洁频率不足',
      '整体绿化裸露明显，长时间未进行养护',
      '安全管理存在隐患，部分消防设施未及时检查',
    ],
    moduleIssueDetails: {
      env: [
        { subCategory: '楼道保洁', items: [{ location: '1-3栋楼道', deduction: 6 }, { location: '地下室入口', deduction: 4 }, { location: '电梯厅', deduction: 3 }] },
        { subCategory: '公区清洁', items: [{ location: '架空层', deduction: 4 }, { location: '垃圾房周边', deduction: 4 }] },
      ],
      safety: [
        { subCategory: '消防设施', items: [{ location: 'B栋消防箱', deduction: 5 }, { location: '地下车库', deduction: 4 }] },
        { subCategory: '安全巡查', items: [{ location: '小区出入口', deduction: 3 }, { location: '天台', deduction: 2 }] },
      ],
      facility: [],
      green: [
        { subCategory: '绿化养护', items: [{ location: '中心绿地', deduction: 7 }, { location: '楼间绿化', deduction: 5 }, { location: '入口景观', deduction: 4 }] },
        { subCategory: '植被补种', items: [{ location: '裸露地块', deduction: 5 }] },
      ],
      service: [
        { subCategory: '服务响应', items: [{ location: '服务中心', deduction: 5 }, { location: '巡逻岗', deduction: 3 }] },
      ],
    },
    suggestions: [
      '增加楼道清洁频率，确保每日至少清洁两次',
      '制定绿化养护计划，定期浇水施肥修剪',
      '组织消防安全检查，确保所有消防设施正常运作',
    ],
    aiAnalysis: '该项目本期总得分 75.76 分（不及格）。设施设备表现较好（89.73分，良好），但环境卫生（77.44分）和绿化养护（75.50分）拉低整体得分。需重点关注清洁管理和绿化维护的系统性改善。',
    aiSuggestion: '参照同区域优秀项目经验，建议建立日常清洁台账和绿化养护记录，通过数字化手段实现问题可追溯，提升管理精细化程度。',
    checkItems: [
      { module: '环境卫生', location: '楼道', desc: '楼道清洁达标', passed: false },
      { module: '设施设备', location: '电梯', desc: '电梯正常运行', passed: true },
      { module: '安全管理', location: '消防', desc: '消防设施完好', passed: false },
    ],
  },
  {
    id: 'P003',
    name: '佛山金百合广场',
    vendor: '广州万洁升环保工程有限公司',
    city: '佛山',
    region: '佛清肇公司',
    level: '金百合',
    unitPrice: 2.1,
    area: 22000,
    inspector: '王建国',
    inspectTime: '2025-08-02',
    scores: { env: 91.2, safety: 88.5, facility: 93.1, green: 85.6, service: 90.3 },
    redLines: [],
    penalties: [],
    history: {
      lastYear: { env: 88.5, safety: 86.2, facility: 91.3, green: 83.5, service: 88.7 },
      lastMonth: { env: 90.1, safety: 87.8, facility: 92.5, green: 84.9, service: 89.6 },
      prevInspections: [
        { date: '2024-11-06', env: 87.5, safety: 85.2, facility: 90.5, green: 82.3, service: 87.8 },
        { date: '2025-02-08', env: 88.8, safety: 86.5, facility: 91.5, green: 83.5, service: 88.8 },
        { date: '2025-05-06', env: 90.1, safety: 87.8, facility: 92.5, green: 84.9, service: 89.6 },
      ],
    },
    issues: ['绿化养护需进一步提升精细化程度'],
    moduleIssueDetails: {
      env: [],
      safety: [],
      facility: [],
      green: [
        { subCategory: '精细化养护', items: [{ location: '中心绿地边角', deduction: 3 }, { location: 'C区花坛', deduction: 2 }] },
      ],
      service: [],
    },
    suggestions: ['建立绿化养护月度计划，提升绿化品质'],
    aiAnalysis: '该项目本期总得分 89.75 分（良好）。设施设备（93.1分，优秀）和环境卫生（91.2分，优秀）表现突出，整体管理水平较高。绿化养护（85.6分，及格）是相对薄弱环节，需进一步加强。',
    aiSuggestion: '建议对标标杆项目，在绿化精细化管理方面引入专业园艺团队，争取在下一检查周期内将绿化得分提升至优秀水平。',
    checkItems: [
      { module: '环境卫生', location: '公区', desc: '公区保洁达标', passed: true },
      { module: '设施设备', location: '设备房', desc: '设备运行正常', passed: true },
    ],
  },
  {
    id: 'P004',
    name: '广州紫金花园',
    vendor: '广州万洁升环保工程有限公司',
    city: '广州',
    region: '广州公司',
    level: '紫金花',
    unitPrice: 3.2,
    area: 8500,
    inspector: '陈思远',
    inspectTime: '2025-08-03',
    scores: { env: 95.3, safety: 94.1, facility: 96.8, green: 93.5, service: 97.2 },
    redLines: [],
    penalties: [],
    history: {
      lastYear: { env: 93.1, safety: 92.5, facility: 95.2, green: 91.8, service: 95.6 },
      lastMonth: { env: 94.7, safety: 93.6, facility: 96.1, green: 92.9, service: 96.8 },
      prevInspections: [
        { date: '2024-11-05', env: 92.5, safety: 91.5, facility: 94.8, green: 90.8, service: 95.2 },
        { date: '2025-02-06', env: 93.5, safety: 92.5, facility: 95.5, green: 91.5, service: 96.0 },
        { date: '2025-05-05', env: 94.7, safety: 93.6, facility: 96.1, green: 92.9, service: 96.8 },
      ],
    },
    issues: [],
    moduleIssueDetails: { env: [], safety: [], facility: [], green: [], service: [] },
    suggestions: ['继续保持现有管理水平，可作为区域标杆项目进行推广交流'],
    aiAnalysis: '该项目本期总得分 95.38 分（优秀），各模块均表现优异。服务得分（97.2分，卓越）和设施设备（96.8分，卓越）尤为突出，是全区标杆项目。',
    aiSuggestion: '建议将该项目管理经验整理成册，在区域内推广分享，特别是客户服务标准化流程和设施设备维保体系，可作为其他项目学习模板。',
    checkItems: [
      { module: '客户服务', location: '大堂', desc: '服务标准达标', passed: true },
      { module: '设施设备', location: '各楼层', desc: '设施设备完好', passed: true },
      { module: '环境卫生', location: '全区', desc: '环境整洁达标', passed: true },
    ],
  },
  {
    id: 'P005',
    name: '广州向日葵花苑',
    vendor: '广州万洁升环保工程有限公司',
    city: '广州',
    region: '广州公司',
    level: '向日葵',
    unitPrice: 1.5,
    area: 31000,
    inspector: '刘雅婷',
    inspectTime: '2025-08-04',
    scores: { env: 83.1, safety: 85.7, facility: 82.4, green: 79.8, service: 84.5 },
    redLines: [
      { item: '消防通道被占用', location: 'B区地面停车场', status: '整改中' },
    ],
    penalties: [
      { type: 'internal', item: '消防通道被占用', consequence: '通报批评' },
    ],
    history: {
      lastYear: { env: 80.5, safety: 83.2, facility: 80.1, green: 77.5, service: 82.8 },
      lastMonth: { env: 82.3, safety: 84.9, facility: 81.7, green: 78.9, service: 83.6 },
      prevInspections: [
        { date: '2024-11-07', env: 79.2, safety: 82.0, facility: 79.1, green: 76.5, service: 81.2 },
        { date: '2025-02-09', env: 80.5, safety: 83.2, facility: 80.1, green: 77.5, service: 82.5 },
        { date: '2025-05-07', env: 81.8, safety: 84.5, facility: 81.3, green: 78.8, service: 83.5 },
      ],
    },
    issues: [
      'B区停车场消防通道被车辆占用，存在安全隐患',
      '设施设备局部老化，需要更新维修',
    ],
    moduleIssueDetails: {
      env: [
        { subCategory: '公区保洁', items: [{ location: 'B区停车场', deduction: 4 }, { location: '小区入口', deduction: 2 }] },
      ],
      safety: [
        { subCategory: '消防通道', items: [{ location: 'B区地面停车场', deduction: 8 }, { location: 'A区地下室', deduction: 3 }] },
        { subCategory: '安全设施', items: [{ location: '架空层', deduction: 2 }] },
      ],
      facility: [
        { subCategory: '设备维修', items: [{ location: '健身器材区', deduction: 5 }, { location: '儿童游乐区', deduction: 4 }, { location: '地库灯具', deduction: 2 }] },
      ],
      green: [
        { subCategory: '绿化养护', items: [{ location: '中心花园', deduction: 6 }, { location: '单元门口', deduction: 4 }] },
        { subCategory: '杂草清除', items: [{ location: 'B区绿地', deduction: 3 }] },
      ],
      service: [
        { subCategory: '员工形象', items: [{ location: '门岗', deduction: 3 }] },
        { subCategory: '巡逻管理', items: [{ location: '夜间巡逻', deduction: 2 }] },
      ],
    },
    suggestions: [
      '立即清理消防通道占用车辆，设置防占用设施',
      '制定设施设备更新计划，优先处理老化设备',
    ],
    aiAnalysis: '该项目本期总得分 83.1 分（及格）。整体处于及格线附近，绿化养护（79.8分）低于及格线，是主要风险项。消防通道红线项已触发内部考核，需重点关注。',
    aiSuggestion: '建议针对绿化和设施两个弱项模块制定专项提升计划，同时建立红线问题快速响应机制，确保下次检查能够达到良好水平。',
    checkItems: [
      { module: '安全管理', location: '停车场', desc: '消防通道畅通', passed: false },
      { module: '绿化养护', location: '公区', desc: '绿化养护达标', passed: false },
    ],
  },
];

// 计算总分（五项均分）
RAW_PROJECTS.forEach(p => {
  const s = p.scores;
  const vals = [s.env, s.safety, s.facility, s.green, s.service];
  s.total = Math.round(vals.reduce((a, b) => a + b, 0) / vals.length * 100) / 100;
  p.grade = getGrade(s.total);
});

// 持久化（localStorage）
function loadProjects() {
  try {
    const stored = localStorage.getItem('tdb_projects_v4');
    if (stored) return JSON.parse(stored);
  } catch(e) {}
  return JSON.parse(JSON.stringify(RAW_PROJECTS));
}

function saveProjects(projects) {
  localStorage.setItem('tdb_projects_v4', JSON.stringify(projects));
}

function getProjects() { return loadProjects(); }

function getProject(id) { return getProjects().find(p => p.id === id); }

function updateProject(updated) {
  const list = getProjects();
  const idx = list.findIndex(p => p.id === updated.id);
  if (idx >= 0) list[idx] = updated;
  else list.push(updated);
  saveProjects(list);
}

function addProject(project) {
  const list = getProjects();
  project.id = 'P' + String(Date.now()).slice(-6);
  const s = project.scores;
  const vals = [s.env, s.safety, s.facility, s.green, s.service];
  s.total = Math.round(vals.reduce((a, b) => a + b, 0) / vals.length * 100) / 100;
  project.grade = getGrade(s.total);
  list.push(project);
  saveProjects(list);
  return project;
}

// Static options
const REGIONS = ['总体（默认）', '广州公司', '佛清肇公司'];
const REGION_CITIES = {
  '广州公司': ['广州'],
  '佛清肇公司': ['佛山', '清远'],
};
const LEVELS = ['总体（默认）', '紫金花', '金百合', '向日葵', '郁金香'];
const MODULES = ['总体（默认）', '环境卫生', '安全管理', '设施设备', '绿化养护', '客户服务'];
const GRADE_OPTIONS = ['总体（默认）', '卓越', '优秀', '良好', '及格', '不及格'];

const MODULE_KEYS = {
  '环境卫生': 'env',
  '安全管理': 'safety',
  '设施设备': 'facility',
  '绿化养护': 'green',
  '客户服务': 'service',
};

const MODULE_LABELS = { env: '环境卫生', safety: '安全管理', facility: '设施设备', green: '绿化养护', service: '客户服务' };

// ---- 规则配置数据 ----
const DEFAULT_RULES = [
  {
    id: 'R001',
    category: 'analysis',
    name: '总分分析规则',
    desc: '根据项目总得分，生成总体质量分析文字，包括等级判断、好坏模块识别',
    enabled: true,
    promptTemplate: `你是一名物业品质分析专家。请根据以下项目的第三方检查数据，生成简洁的总分分析报告（150字以内）。

项目名称：{{projectName}}
本期总得分：{{totalScore}}（{{grade}}）
各模块得分：环境卫生 {{env}}、安全管理 {{safety}}、设施设备 {{facility}}、绿化养护 {{green}}、客户服务 {{service}}

分析要求：
1. 说明总体得分水平及等级
2. 指出优秀以上（≥93分）的模块
3. 指出良好以下（<88分）的模块
4. 一句话总结主要问题方向`,
    variables: ['projectName', 'totalScore', 'grade', 'env', 'safety', 'facility', 'green', 'service'],
    outputFormat: '段落文字',
  },
  {
    id: 'R002',
    category: 'analysis',
    name: '模块分析规则',
    desc: '对每个专业模块（环境/安全/设施/绿化/服务）进行独立得分分析，识别具体问题点',
    enabled: true,
    promptTemplate: `你是一名物业品质分析专家。请对以下模块的检查数据进行简要分析（每模块80字以内）。

项目：{{projectName}}
模块：{{moduleName}}
本期得分：{{moduleScore}}（{{moduleGrade}}）
主要问题：{{issues}}
历史得分：前三次分别为 {{historyScores}}

分析要求：
1. 说明本期得分水平
2. 结合主要问题说明失分原因
3. 与历史对比说明趋势（上升/下降/持平）`,
    variables: ['projectName', 'moduleName', 'moduleScore', 'moduleGrade', 'issues', 'historyScores'],
    outputFormat: '段落文字',
  },
  {
    id: 'R003',
    category: 'analysis',
    name: 'AI综合分析规则',
    desc: '基于全部模块得分与问题，生成综合性AI分析报告，涵盖风险评估与重点关注项',
    enabled: true,
    promptTemplate: `你是一名资深物业品质管理顾问。请基于以下第三方检查数据，生成综合分析报告（200字以内）。

项目：{{projectName}}（{{level}}级，{{city}}）
本期总得分：{{totalScore}}（{{grade}}）
模块得分：环境 {{env}}、安全 {{safety}}、设施 {{facility}}、绿化 {{green}}、服务 {{service}}
红线触发：{{redlineCount}} 项
处罚考核：{{penaltyCount}} 项
主要问题：{{issues}}

分析框架：
1. 整体品质水平评价
2. 核心风险点识别（优先安全类红线）
3. 亮点模块与薄弱模块对比
4. 下一步重点关注方向`,
    variables: ['projectName', 'level', 'city', 'totalScore', 'grade', 'env', 'safety', 'facility', 'green', 'service', 'redlineCount', 'penaltyCount', 'issues'],
    outputFormat: '段落文字',
  },
  {
    id: 'R004',
    category: 'suggestion',
    name: '整改建议规则',
    desc: '针对检查发现的具体问题，生成可操作的整改建议列表',
    enabled: true,
    promptTemplate: `你是一名物业品质改善顾问。请针对以下问题，生成具体可执行的整改建议（每条建议不超过50字，最多5条）。

项目：{{projectName}}
问题清单：
{{issueList}}

要求：
1. 每条建议对应具体问题
2. 建议要具体可执行，包含"谁来做、做什么、何时完成"
3. 按优先级排序（安全类优先）
4. 格式：序号 + 建议内容`,
    variables: ['projectName', 'issueList'],
    outputFormat: '列表（编号）',
  },
  {
    id: 'R005',
    category: 'suggestion',
    name: 'AI提升建议规则',
    desc: '基于同类优秀项目数据对比，生成中长期品质提升建议',
    enabled: true,
    promptTemplate: `你是一名物业品质战略顾问。请基于以下数据，对比同类型优秀项目，给出中长期提升建议（200字以内）。

目标项目：{{projectName}}（{{level}}级）
当前得分：{{totalScore}}（{{grade}}）
薄弱模块：{{weakModules}}

同类优秀项目参考数据：
- 同级别平均得分：{{benchmarkScore}}
- 标杆项目：{{benchmarkProject}}（得分：{{benchmarkTotal}}）

提升建议框架：
1. 与标杆项目的差距分析
2. 薄弱模块的系统性改善路径
3. 可借鉴的具体管理方法
4. 建议时间节点（短期1月/中期3月/长期半年）`,
    variables: ['projectName', 'level', 'totalScore', 'grade', 'weakModules', 'benchmarkScore', 'benchmarkProject', 'benchmarkTotal'],
    outputFormat: '段落文字',
  },
];

function loadRules() {
  try {
    const stored = localStorage.getItem('tdb_rules');
    if (stored) return JSON.parse(stored);
  } catch(e) {}
  return JSON.parse(JSON.stringify(DEFAULT_RULES));
}

function saveRules(rules) {
  localStorage.setItem('tdb_rules', JSON.stringify(rules));
}

function getRules() { return loadRules(); }

function updateRule(updated) {
  const list = getRules();
  const idx = list.findIndex(r => r.id === updated.id);
  if (idx >= 0) list[idx] = updated;
  else list.push(updated);
  saveRules(list);
}

function addRule(rule) {
  const list = getRules();
  rule.id = 'R' + String(Date.now()).slice(-6);
  list.push(rule);
  saveRules(list);
  return rule;
}

function deleteRule(id) {
  const list = getRules().filter(r => r.id !== id);
  saveRules(list);
}

// ---- 工单数据 ----
const WORK_ORDER_CATEGORIES = {
  repair:  { label: '维修类', icon: '🔧', color: '#9b59b6', bg: '#f3e8fb', desc: '设备/设施报修' },
  service: { label: '服务类', icon: '💬', color: '#5b8dd9', bg: '#e8f0fb', desc: '咨询/投诉/建议等' },
  env:     { label: '环境类', icon: '🧹', color: '#d4ac0d', bg: '#fef9e7', desc: '清洁/环境问题' },
  green:   { label: '绿化类', icon: '🌿', color: '#16a085', bg: '#e8f6f3', desc: '绿化养护问题' },
};

const RAW_WORK_ORDERS = [
  { id: 'WO001', projectId: 'P001', issue: '电梯故障，无法正常运行', category: 'repair', responseTime: 3, attitude: '态度良好', valid: true, handler: '李技师', completed: true, deadline: '2025-08-03', handleTime: 4.5, overdue: false, satisfied: true },
  { id: 'WO002', projectId: 'P001', issue: '停车费用收取标准疑问', category: 'service', responseTime: 2, attitude: '态度良好', valid: true, handler: '王客服', completed: true, deadline: '2025-08-02', handleTime: 1.2, overdue: false, satisfied: true },
  { id: 'WO003', projectId: 'P001', issue: '保洁人员态度恶劣，言语冲突', category: 'service', responseTime: 5, attitude: '态度恶劣', valid: true, handler: '陈主管', completed: true, deadline: '2025-08-02', handleTime: 8.0, overdue: true, satisfied: false },
  { id: 'WO004', projectId: 'P001', issue: '公共区域灯光损坏未修复', category: 'repair', responseTime: 4, attitude: '态度良好', valid: true, handler: '张技师', completed: false, deadline: '2025-08-05', handleTime: null, overdue: false, satisfied: null },
  { id: 'WO005', projectId: 'P001', issue: '小区绿化养护问题反映', category: 'green', responseTime: 3, attitude: '态度良好', valid: false, handler: '王客服', completed: true, deadline: '2025-08-04', handleTime: 2.0, overdue: false, satisfied: true },
  { id: 'WO006', projectId: 'P002', issue: '水管漏水，墙面渗水', category: 'repair', responseTime: 8, attitude: '态度良好', valid: true, handler: '李技师', completed: true, deadline: '2025-08-03', handleTime: 6.0, overdue: false, satisfied: true },
  { id: 'WO007', projectId: 'P002', issue: '物业费计算规则咨询', category: 'service', responseTime: 1, attitude: '态度良好', valid: true, handler: '陈客服', completed: true, deadline: '2025-08-02', handleTime: 0.8, overdue: false, satisfied: true },
  { id: 'WO008', projectId: 'P002', issue: '安保人员不文明执勤投诉', category: 'service', responseTime: 11, attitude: '态度恶劣', valid: true, handler: '刘主管', completed: false, deadline: '2025-08-04', handleTime: null, overdue: true, satisfied: null },
  { id: 'WO009', projectId: 'P002', issue: '健身设施损坏报修', category: 'repair', responseTime: 6, attitude: '态度良好', valid: true, handler: '张技师', completed: true, deadline: '2025-08-05', handleTime: 12.0, overdue: true, satisfied: false },
  { id: 'WO010', projectId: 'P003', issue: '消防设施检查询问', category: 'service', responseTime: 2, attitude: '态度良好', valid: true, handler: '王客服', completed: true, deadline: '2025-08-02', handleTime: 1.5, overdue: false, satisfied: true },
  { id: 'WO011', projectId: 'P003', issue: '停车位划分不合理投诉', category: 'service', responseTime: 4, attitude: '态度良好', valid: true, handler: '陈主管', completed: true, deadline: '2025-08-03', handleTime: 5.0, overdue: false, satisfied: true },
  { id: 'WO012', projectId: 'P003', issue: '门禁系统故障', category: 'repair', responseTime: 5, attitude: '态度良好', valid: true, handler: '李技师', completed: true, deadline: '2025-08-02', handleTime: 3.0, overdue: false, satisfied: true },
  { id: 'WO013', projectId: 'P004', issue: '装修管理规定咨询', category: 'service', responseTime: 1, attitude: '态度良好', valid: true, handler: '王客服', completed: true, deadline: '2025-08-01', handleTime: 0.5, overdue: false, satisfied: true },
  { id: 'WO014', projectId: 'P004', issue: '楼上噪音扰民投诉', category: 'service', responseTime: 7, attitude: '态度良好', valid: true, handler: '刘主管', completed: true, deadline: '2025-08-03', handleTime: 4.0, overdue: false, satisfied: true },
  { id: 'WO015', projectId: 'P004', issue: '路灯损坏报修', category: 'repair', responseTime: 3, attitude: '态度良好', valid: true, handler: '张技师', completed: true, deadline: '2025-08-02', handleTime: 2.5, overdue: false, satisfied: true },
  { id: 'WO016', projectId: 'P005', issue: '车辆被贴条咨询', category: 'service', responseTime: 2, attitude: '态度恶劣', valid: false, handler: '陈客服', completed: true, deadline: '2025-08-03', handleTime: 1.0, overdue: false, satisfied: false },
  { id: 'WO017', projectId: 'P005', issue: '消防通道被占用投诉（业主反映）', category: 'env', responseTime: 12, attitude: '态度良好', valid: true, handler: '刘主管', completed: false, deadline: '2025-08-04', handleTime: null, overdue: true, satisfied: null },
  { id: 'WO018', projectId: 'P005', issue: '单元门锁损坏报修', category: 'repair', responseTime: 4, attitude: '态度良好', valid: true, handler: '李技师', completed: true, deadline: '2025-08-03', handleTime: 3.5, overdue: false, satisfied: true },
  { id: 'WO019', projectId: 'P005', issue: '绿化破坏赔偿标准咨询', category: 'green', responseTime: 3, attitude: '态度良好', valid: true, handler: '王客服', completed: true, deadline: '2025-08-04', handleTime: 2.0, overdue: false, satisfied: true },
  { id: 'WO020', projectId: 'P002', issue: '地下停车场排水堵塞', category: 'env', responseTime: 9, attitude: '态度良好', valid: true, handler: '李技师', completed: false, deadline: '2025-08-05', handleTime: null, overdue: false, satisfied: null },
];

function getWorkOrders() {
  try {
    const stored = localStorage.getItem('tdb_workorders_v4');
    if (stored) return JSON.parse(stored);
  } catch(e) {}
  return JSON.parse(JSON.stringify(RAW_WORK_ORDERS));
}

function saveWorkOrders(list) {
  localStorage.setItem('tdb_workorders_v4', JSON.stringify(list));
}

const RULE_CATEGORIES = [
  { value: 'analysis', label: '问题分析', color: '#c0392b' },
  { value: 'suggestion', label: '提升建议', color: '#2980b9' },
];
