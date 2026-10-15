/* Buildless research explorer. Data is a dated reading record, not a leaderboard. */
'use strict';
(() => {
  const D = window.RESEARCH_DATA;
  if (!D) { document.querySelector('#main').textContent = '研究数据未加载，请刷新页面。'; return; }
  const $ = (s, root = document) => root.querySelector(s);
  const workById = new Map(D.works.map(w => [w.id,w]));
  const benchById = new Map(D.benchmarks.map(b => [b.id,b]));
  const groupById = new Map(D.groups.map(g => [g.id,g]));
  const labels = {overview:'分类地图',works:'工作索引',benchmarks:'评测关系',guide:'读懂评测'};
  const S = {view:'overview',scope:'focus',q:'',family:'',domain:'',role:'',sort:'default',layout:'table',compare:[],benchmark:'univtac',benchFilter:'all',benchQuery:'',loop:0};
  const esc = s => String(s??'').replace(/[&<>"']/g,c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const color = w => groupById.get(w.family)?.color || '#63738a';
  const familyName = w => groupById.get(w.family)?.name || '';
  const domainTags = w => w.domains.map(d => `<span class="tag ${d==='仿真'?'sim':'real'}">${d}</span>`).join('');
  const scopeTags = w => ['边界参考','评测研究'].includes(w.scope)?`<span class="tag boundary">${esc(w.scope)}</span>`:'';
  const workNode = w => `<button class="work-node" style="--color:${color(w)}" data-work="${w.id}">${esc(w.name)}</button>`;
  const compareButton = w => `<button class="compare-toggle ${S.compare.includes(w.id)?'selected':''}" data-compare="${w.id}" aria-pressed="${S.compare.includes(w.id)}">${S.compare.includes(w.id)?'已选对比':'＋ 对比'}</button>`;
  const isFocus = w => w.scope==='核心相关';
  const baseWorks = () => S.scope==='focus'? D.works.filter(isFocus):D.works;
  const scopeControl = () => `<div class="scope-control"><span>当前范围</span><div class="segmented"><button data-scope="focus" class="${S.scope==='focus'?'active':''}">六维力 + 夹爪</button><button data-scope="all" class="${S.scope==='all'?'active':''}">全部相关路线</button></div><small>${S.scope==='focus'?'优先呈现你的已知主线，具体模型方向暂不预设':'包含触觉、灵巧手、全身控制与边界参考'}</small></div>`;
  const intro = (title, description, note='') => `<div class="page-intro"><div><h1>${title}</h1><p>${description}</p></div><div class="intro-note">${note||'<span class="verified">文献快照已整理</span><p>截至 2026.10.15<br>不代表已完成实验复现</p>'}</div></div>`;
  const sectionHead = (title,sub='',button='') => `<div class="section-head"><div><h2>${title}</h2>${sub?`<p>${sub}</p>`:''}</div>${button}</div>`;
  function setView(view, keepScroll=false) {
    if (!labels[view]) return;
    S.view=view;
    document.querySelectorAll('[data-view]').forEach(b => { b.classList.toggle('active', b.dataset.view===view); if(b.classList.contains('nav-item')) b.setAttribute('aria-current', b.dataset.view===view?'page':'false'); });
    $('#current-view').textContent=labels[view];
    document.title=`${labels[view]} · 力与触觉 VLA 研究地图`;
    render();
    $('.sidebar').classList.remove('mobile-open'); $('#mobile-menu').setAttribute('aria-expanded','false');
    if (!keepScroll) window.scrollTo({top:0,behavior:'instant'});
  }
  function route(view) { history.replaceState(null,'',`#${view}`); setView(view); }
  function render() {
    $('#main').innerHTML= S.view==='overview'? overview():S.view==='works'? worksView():S.view==='benchmarks'? benchmarksView():guideView();
    if(S.view==='works') renderResults();
    updateTray();
  }
  function overview() {
    const list=baseWorks();
    const dual=list.filter(w=>w.domains.length===2).length;
    const main=D.works.filter(isFocus);
    const relevant=S.scope==='focus'?[D.groups[0]]:D.groups;
    const laneContents = {wrist:['接触执行与力调节','按压 / 插接 / 擦拭 / 装配'],touch:['夹持与接触语义','指尖力 / 触觉图像 / 压力分布'],dex:['多指操作与传感器迁移','灵巧动作 / 单双臂 / 触觉基础策略'],body:['身体协调与专业结果','移动开门 / 接触力 / 标准切面'],related:['保持方法边界','torque / 蒸馏 / 世界模型 / benchmark']};
    const lanes=relevant.map(g=>{const ws=(S.scope==='focus'?main:D.works).filter(w=>w.family===g.id);return `<div class="map-lane" style="--color:${g.color}"><button class="lane-label" data-family="${g.id}"><h3>${g.name}</h3><p>${esc(g.subtitle)}</p></button><div class="lane-works">${ws.map(workNode).join('')}</div><div class="lane-outcome"><strong>${laneContents[g.id][0]}</strong>${laneContents[g.id][1]}</div></div>`;}).join('');
    return intro('从工作出发，读懂评测。','把研究对象、实验目的和 benchmark 使用关系分开。先找到与你相关的工作，再沿原文查看它究竟验证了什么。')+scopeControl()+
    `<div class="catalogue-summary"><div class="summary-item"><strong>${list.length}</strong>当前研究条目</div><div class="summary-item"><strong>${D.works.length}</strong>全部条目</div><div class="summary-item"><strong>${dual}</strong>仿真 + 真机</div><div class="summary-item"><strong>6</strong>统一阅读维度</div></div>`+
    sectionHead('研究路线','点击工作查看完整评测；点击方向进入筛选',`<button class="subtle-link" data-go="works">查看工作对照表 ↗</button>`)+
    `<div class="diagram-panel"><div class="diagram-heading"><span>接触信息 / 研究方向</span><span>对应工作 · 点击展开</span><span>常见验证问题</span></div>${lanes}</div>`+
    (S.scope==='focus'?`<div class="focus-context"><div><strong>主线已聚焦：末端六维力 + 夹爪</strong><p>力观测、显式力—位置、快速纠偏和残差学习都保留，暂不替你限定具体方法。</p></div><button class="secondary-button" data-scope="all">展开 ${D.works.length-main.length} 项相关参照</button></div>`:'')+
    `<div class="overview-lower"><section>${sectionHead('共同环境，使用关系不同')}<div class="reuse-panel"><h3>UniVTAC 是怎样被复用的？</h3><p class="panel-description">平台、编码器和八任务 benchmark 是三个不同部分。</p><div class="reuse-flow"><button class="reuse-source" data-benchmark="univtac">UniVTAC<small>视觉—触觉仿真 benchmark</small></button><span class="reuse-arrow">↗</span><div class="reuse-targets"><div class="reuse-target"><button data-work="E03">FTP-1</button><span>采用6任务子集</span></div><div class="reuse-target"><button data-work="E04">N₀-VTLA</button><span>采用8个原始任务</span></div><div class="reuse-target"><button data-work="X01">SimpleTouch</button><span>沿用6任务选择</span></div></div></div><p class="mini-note">这些工作的真机实验另有任务与硬件。复用仿真环境，不代表原样搬到真机，也不等于零样本迁移。</p></div></section><section>${sectionHead('六个问题，读一篇工作')}<div class="reuse-panel question-list">${[
    ['评测任务与目的','做哪些任务？每个实验想证明什么？','works'],['指标与实验设置','用什么数据证明？仿真、真机、次数和变化？','works'],['对照与公开资源','跟谁比？有没有去力消融？能否找到评测入口？','benchmarks']].map(([a,b,c])=>`<button class="question-item" data-go="${c}"><div><strong>${a}</strong><p>${b}</p></div><span>探索 ↗</span></button>`).join('')}</div></section></div>`+
    sectionHead('值得单独收集的评测设计','按实验问题挑选，而非按跨论文成功率排序')+
    `<div class="feature-grid">${D.features.filter(f=>S.scope==='all'||isFocus(workById.get(f.work))).map(f=>{const w=workById.get(f.work);return `<button class="feature-item" style="--color:${color(w)}" data-work="${w.id}"><h3>${f.title}</h3><p>${f.text}</p><small>对应工作：${esc(w.name)}</small></button>`;}).join('')}</div>`+
    `<p class="scope-note section-spacer">分类用于阅读组织；“评测目的”是按论文实验设计归纳。自建套件的描述名不代表作者已发布独立同名 benchmark。</p>`;
  }
  function worksView() {
    const roles=[...new Set(D.works.map(w=>w.role))];
    return intro('工作评测，对照着看。','统一按你提出的六个维度整理：任务、目的、指标、设置、对比实验，以及 benchmark 来源与公开情况。')+scopeControl()+
    `<div class="toolbar"><div class="search-field"><span>⌕</span><input id="work-search" type="search" value="${esc(S.q)}" placeholder="搜索工作、USB、力跟踪、无力消融…" aria-label="搜索工作、任务或评测指标"><button id="clear-search" aria-label="清空搜索">×</button></div><div class="filters"><label class="filter-control">方向<select id="filter-family"><option value="">全部方向</option>${D.groups.map(g=>`<option value="${g.id}" ${S.family===g.id?'selected':''}>${g.name}</option>`).join('')}</select></label><label class="filter-control">环境<select id="filter-domain">${['','真机','仿真','仿真 + 真机'].map(x=>`<option value="${x}" ${S.domain===x?'selected':''}>${x||'全部环境'}</option>`).join('')}</select></label><label class="filter-control">力的作用<select id="filter-role"><option value="">全部作用</option>${roles.map(r=>`<option ${S.role===r?'selected':''}>${r}</option>`).join('')}</select></label><button class="reset" id="reset-filters">重置筛选</button></div></div><div class="results-head"><div id="results-count"></div><div class="results-actions"><label>排序 <select id="sort-works"><option value="default" ${S.sort==='default'?'selected':''}>调研顺序</option><option value="year" ${S.sort==='year'?'selected':''}>年份从新到旧</option><option value="name" ${S.sort==='name'?'selected':''}>名称</option></select></label><div class="segmented"><button data-layout="table" class="${S.layout==='table'?'active':''}" aria-label="表格视图">对照表</button><button data-layout="cards" class="${S.layout==='cards'?'active':''}" aria-label="卡片视图">卡片</button></div></div></div><div id="work-results"></div><p class="scope-note section-spacer">可勾选2–3项并排比较。各论文硬件、对象与评分尺度不同，本页不提供跨论文性能排名。</p>`;
  }
  function filteredWorks() {
    const q=S.q.trim().toLowerCase();
    let ws=baseWorks().filter(w=>(!S.family||w.family===S.family)&&(!S.role||w.role===S.role)&&(!S.domain||(S.domain==='仿真 + 真机'?w.domains.length===2:w.domains.includes(S.domain)))&&(!q||[w.name,w.signal,w.role,w.platform,w.tasks,w.metrics,w.summary,w.baseline,...w.relations.map(r=>benchById.get(r.benchmark)?.name)].join(' ').toLowerCase().includes(q)));
    if(S.sort==='year')ws.sort((a,b)=>b.year-a.year||a.name.localeCompare(b.name));
    if(S.sort==='name')ws.sort((a,b)=>a.name.localeCompare(b.name));
    return ws;
  }
  function renderResults() {
    const ws=filteredWorks();
    $('#results-count').textContent=`找到 ${ws.length} 项工作 / 当前范围 ${baseWorks().length} 项`;
    if(!ws.length){$('#work-results').innerHTML=`<div class="empty"><h3>当前条件下没有工作</h3><p>尝试清空关键词、重置筛选，或切换到全部相关路线。</p><button class="primary-button" id="empty-reset">重置筛选</button><button class="secondary-button" data-scope="all">查看全部路线</button></div>`;return;}
    if(S.layout==='cards'){$('#work-results').innerHTML=`<div class="work-grid">${ws.map(w=>`<article class="work-card" style="--color:${color(w)}"><div class="card-title"><div><button class="work-name" data-work="${w.id}">${esc(w.name)}</button><div class="year-note">${w.year} · ${familyName(w)}</div></div>${scopeTags(w)}</div><div class="pill-row">${domainTags(w)}<span class="tag role">${esc(w.role)}</span></div><p>${esc(w.summary)}</p><div class="card-facts"><strong>${esc(w.tasks)}</strong>${esc(w.trials)}</div><div class="card-bottom"><button data-work="${w.id}">查看六维评测详情 ↗</button>${compareButton(w)}</div></article>`).join('')}</div>`;return;}
    $('#work-results').innerHTML=`<div class="table-wrap"><table class="work-table"><thead><tr><th>工作 / 力信号</th><th>评测任务与目的</th><th>指标</th><th>实验设置</th><th>对比实验</th><th>Benchmark来源 / 公开情况</th><th>比较</th></tr></thead><tbody>${ws.map(w=>`<tr style="--color:${color(w)}"><td class="name-cell"><button class="work-name" data-work="${w.id}">${esc(w.name)}</button><div class="year-note">${w.year} · ${esc(w.signal)}</div><div class="pill-row" style="margin-top:7px"><span class="tag role">${esc(w.role)}</span>${scopeTags(w)}</div></td><td><div>${esc(w.tasks)}</div><div class="cell-sub">${esc(w.purpose)}</div></td><td>${esc(w.metrics)}</td><td><div class="pill-row">${domainTags(w)}</div><div class="cell-sub">${esc(w.trials)}</div></td><td><div class="cell-sub">${esc(w.baseline)}</div></td><td>${w.relations.map(r=>`<button class="suite-link" data-benchmark="${r.benchmark}">${esc(benchById.get(r.benchmark)?.name)} ↗</button>`).join('')}<div class="cell-sub">${esc(w.openness.status)}</div></td><td>${compareButton(w)}</td></tr>`).join('')}</tbody></table></div>`;
  }
  function benchmarksView() {
    const keyIds=['univtac','forcebench','tabero','neoreal','neosim','libero'];
    let bs=D.benchmarks.filter(b=>S.benchFilter==='all'||(S.benchFilter==='shared'?keyIds.includes(b.id):b.kind==='论文自建任务集'));
    if(S.benchQuery)bs=bs.filter(b=>(b.name+' '+b.focus).toLowerCase().includes(S.benchQuery.toLowerCase()));
    const selected=benchById.get(S.benchmark)||D.benchmarks[0];
    return intro('谁，使用了哪套评测？','围绕一个 benchmark 查看关联工作，分清原论文采用、自建、上游衍生与后续重新评测。')+
    `<div class="bench-tabs"><button data-bench-filter="all" class="${S.benchFilter==='all'?'active':''}">全部评测资源</button><button data-bench-filter="shared" class="${S.benchFilter==='shared'?'active':''}">共同框架 / 命名套件</button><button data-bench-filter="self" class="${S.benchFilter==='self'?'active':''}">论文自建任务集</button></div><div class="bench-layout"><aside class="benchmark-picker" aria-label="选择评测资源"><div class="picker-title">${bs.length} 项评测资源</div><div class="bench-filter"><input id="bench-search" type="search" placeholder="搜索评测资源" aria-label="搜索评测资源" value="${esc(S.benchQuery)}"></div><div id="benchmark-options">${bs.map(b=>`<button class="bench-option ${b.id===selected.id?'active':''}" data-select-bench="${b.id}"><strong>${esc(b.name)}</strong><span>${esc(b.domain)} · ${esc(b.kind)}</span></button>`).join('')||'<p class="mini-note" style="padding:20px">没有匹配资源，清空搜索可恢复。</p>'}</div></aside><section class="bench-detail">${benchDetail(selected)}</section></div>`;
  }
  function benchDetail(b) {
    const users=D.works.flatMap(w=>w.relations.filter(r=>r.benchmark===b.id).map(r=>({w,r})));
    const extras=D.extraRelations.filter(r=>r.toBenchmark===b.id||r.fromBenchmark===b.id);
    const isUni=b.id==='univtac';
    let graph='';
    const n=users.length;
    if(n){const height=Math.max(210,n*68);const step=height/(n+1);graph=`<div class="relation-canvas" style="height:${height}px"><svg viewBox="0 0 600 ${height}" preserveAspectRatio="none" aria-hidden="true">${users.map((u,i)=>{const y=step*(i+1);return `<path d="M228 ${y} C310 ${y}, 310 ${height*.5}, 398 ${height*.5}"/>`;}).join('')}<circle cx="398" cy="${height*.5}" r="3" fill="#8da8d2"/></svg>${users.map(({w,r},i)=>`<button class="graph-work" style="top:${step*(i+1)-25}px" data-work="${w.id}">${esc(w.name)}<small>${esc(r.label)} · ${esc(r.domain)}</small></button>`).join('')}<div class="graph-bench">${esc(b.name)}<small>${esc(b.domain)}</small></div></div>`;}
    return `<div class="bench-top"><div class="pill-row"><span class="tag">${esc(b.kind)}</span><span class="tag ${b.domain.includes('仿真')?'sim':'real'}">${esc(b.domain)}</span></div><h2>${esc(b.name)}</h2><p>${esc(b.detail)}</p><a class="bench-source" href="${esc(b.source)}" target="_blank" rel="noopener noreferrer">查看原文依据 ↗</a>${b.tasks.length?`<div class="task-chips">${b.tasks.map(t=>`<span class="task-chip">${esc(t)}</span>`).join('')}</div>`:''}</div>`+
    `<div class="relation-stage"><div class="relation-heading"><h3>原论文中的使用关系</h3><span class="tag">${users.length} 项工作</span></div>${graph}<p class="graph-caption">连线表示文献中的评测使用关系；不表示共同训练、性能强弱或直接迁移。</p>${users.map(({w,r})=>`<div class="relation-row"><button data-work="${w.id}">${esc(w.name)}</button><span class="relation-label">${esc(r.label)}</span><p>${esc(r.note)}</p></div>`).join('')||'<p class="mini-note">该项是上游资源；本目录未将它标为所有相关方法的直接测试集。</p>'}</div>`+
    (isUni?`<div class="explain-note"><strong>FTP-1 的真机评测另建。</strong>UniVTAC用于六任务闭环仿真：50条官方示教 / 任务、100次rollout。Sharpa、Dexmate与未见传感器实验在真实硬件微调和执行，不是原六任务直接搬到真机。</div><div class="proof-grid"><div class="proof-card"><h3>FTP-1 排除了哪两项？</h3><p>Grasp Classify 被作者认为已饱和；Insert HDMI 官方示教缺少足够纠偏接触。N₀-VTLA则采用全部八项，均值不能直接等同。</p><a href="https://arxiv.org/html/2606.13102v1#A5.SS2" target="_blank" rel="noopener noreferrer">FTP-1 附录E.2 ↗</a></div><div class="proof-card"><h3>结果是否都重新测试？</h3><p>FTP-1原表带星号的VITaL、UniVTAC-ACT引用原benchmark结果；自家VLA配置另做评测。引用旧结果与重新运行需区分。</p><a href="https://arxiv.org/html/2606.13102v1" target="_blank" rel="noopener noreferrer">FTP-1 Table 1 ↗</a></div></div>`:'')+
    (extras.length?`<div class="relation-stage"><h3 style="font-size:14px">上游衍生 / 后续评测</h3>${extras.map(r=>{const w=workById.get(r.fromWork);const other=benchById.get(r.toBenchmark);return `<div class="relation-row">${w?`<button data-work="${w.id}">${esc(w.name)}</button>`:`<button data-benchmark="${other?.id}">${esc(other?.name)}</button>`}<span class="relation-label later">${esc(r.label)}</span><p>${esc(r.note)} <a href="${esc(r.source)}" target="_blank" rel="noopener noreferrer">依据 ↗</a></p></div>`;}).join('')}</div>`:'')+
    (b.kind==='论文自建任务集'?`<div class="explain-note"><strong>这是对应论文自己的任务套件。</strong>本站用描述名帮助索引；名称不意味着存在独立发布包，也不能从同名任务推定跨论文协议相同。</div>`:'');
  }
  function guideView() {
    const steps=[['观察','读取图像、接触信号与机器人状态'],['输出动作','模型根据当前观测给出动作'],['执行与接触','仿真或真实机器人改变物理状态'],['读取新反馈','重新观测后继续调整，直到成功或终止']];
    return intro('先分清“在测什么”。','同一个插孔任务，可以用于验证接触感知、快速纠偏或目标力跟踪。任务名相同，不代表实验目的和证据相同。')+
    `<div class="guide-cards"><article class="guide-card" style="--color:#7562a9"><h3>离线预测评测</h3><p>给模型已有数据，比较预测与标签；不执行它预测的动作。</p><ul><li>问题：动作或力预测得准不准？</li><li>常见指标：L1、MSE、GCR</li><li>不能直接推出任务做得成</li></ul></article><article class="guide-card" style="--color:#315ec8"><h3>闭环仿真评测</h3><p>模型在模拟环境里执行动作，读取新反馈，再继续决策。</p><ul><li>问题：在模拟接触中能否完成？</li><li>常见指标：成功率、步骤、力统计</li><li>UniVTAC属于这种任务环境</li></ul></article><article class="guide-card" style="--color:#377b60"><h3>真实机器人评测</h3><p>在真实硬件、对象和接触条件下执行策略，按预定规则计分。</p><ul><li>问题：真实接触中是否有效？</li><li>还需记录急停、介入、掉落与损伤</li><li>和仿真任务不一定一一对应</li></ul></article></div>`+
    `<div class="loop-panel"><div class="loop-controls"><div><h3>闭环究竟是什么意思？</h3><p class="mini-note">流程示意，不是实际模型运行或实验数据。</p></div><button class="primary-button" id="next-loop">下一步</button></div><div class="loop-steps">${steps.map(([title,text],i)=>`<div class="loop-step ${S.loop===i?'active':''}"><strong>${title}</strong><p>${text}</p></div>`).join('')}</div><p class="loop-status">${['模型获得当前观测。离线评测通常停留在“给数据、做预测”。','模型生成动作。预测很像专家，不保证执行后一定成功。','动作真的被执行：环境、接触与力发生变化。','新反馈回到模型，下一轮可以纠偏。这才形成闭环。'][S.loop]}</p></div>`+
    sectionHead('六个维度，怎样读才不会混淆')+
    `<div class="table-wrap"><table class="quality-table"><thead><tr><th>调研维度</th><th>具体看什么</th><th>要回答的问题</th></tr></thead><tbody>${[
    ['评测任务','任务数、物体、工具、接触方式','覆盖了什么力交互场景？'],['评测目的','接触感知、反馈调整、精确力控、语义','该实验到底想证明什么？'],['评测指标','成功率、峰值、力误差、时间','用哪些数据支持结论？'],['实验设置','仿真/真机、次数、初始分布、物理变化','测试充分吗，是否在测泛化？'],['对比实验','骨干、数据、控制器、去力与组件消融','收益可以归因到力反馈吗？'],['Benchmark来源与公开','自建/采用/衍生；代码、数据、环境','资源能否找到，使用关系能否追溯？']].map(r=>`<tr>${r.map(c=>`<td>${c}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`+
    sectionHead('网站中的关系词，都有明确含义')+
    `<div class="relation-types">${[['采用已有benchmark','方法原论文明确使用了该环境/任务协议，例如FTP-1采用UniVTAC六项。'],['自建并评测','论文在自家硬件与物体上组织任务；不自动意味着公开独立环境。'],['上游资源衍生','复用场景/轨迹后改变环境，例如Tabero对LIBERO资源的迁移。'],['后续重新评测','后来论文把旧方法纳入比较，例如ForceBench评测ForceVLA；方向不能反写。']].map(([a,b])=>`<div class="relation-type"><strong>${a}</strong><p>${b}</p></div>`).join('')}</div>`+
    sectionHead('容易混淆的证据边界')+
    `<div class="glossary">${[
    ['腕部6D wrench ≠ 两指各3D力','前者含合力与合力矩，后者是局部接触力拼接；夹持内力可能在腕部抵消。'],['读力 ≠ 跟踪目标力','力作为输入、未来预测监督、输出目标力和底层力伺服是不同控制证据。'],['峰值力 ≠ 跟踪误差','接触更轻不等于跟踪更准；任务可能需要必要的作用力。'],['控制频率 ≠ 策略重规划率','传感采样、查询新观测、发动作和底层伺服频率应分别记录。'],['任务成功 ≠ 阶段进度','SR、TCR、100分rubric与progress评分不能不加区分地排序。'],['未核验公开情况 ≠ 未公开','存在论文或代码入口，也不等于数据、权重、对象和环境完整可复现。']].map(([a,b])=>`<div class="glossary-item"><h3>${a}</h3><p>${b}</p></div>`).join('')}</div>`+
    `<div class="explain-note"><strong>本网站帮助组织调研，不提前限定方法方向。</strong>当前已知主线是末端六维力与夹爪。所有“目的”是按原文实验设计归纳，关键数字和结论仍需回到链接中的论文版本核对。</div>`;
  }
  function markdown(text) {
    let src=esc(text).replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g,(_,t,u)=>`<a href="${u}" target="_blank" rel="noopener noreferrer">${t}</a>`).replace(/\*\*([^*]+)\*\*/g,'<strong>$1</strong>');
    const lines=src.split('\n');let out='',inList=false;
    for(const line of lines){if(/^[-*] /.test(line)){if(!inList){out+='<ul>';inList=true;}out+=`<li>${line.slice(2)}</li>`;continue;}if(inList){out+='</ul>';inList=false;}if(/^#{1,4} /.test(line)){out+=`<h3>${line.replace(/^#{1,4} /,'')}</h3>`;}else if(line.trim()){out+=`<p>${line}</p>`;}}
    return out+(inList?'</ul>':'');
  }
  function openWork(id) {
    const w=workById.get(id);if(!w)return;
    const later=D.extraRelations.filter(r=>r.fromWork===w.id);
    $('#detail-content').innerHTML=`<header class="dialog-header"><span>工作详情 · ${w.evidence} · ${D.updated}</span><button class="close-dialog" data-close="detail-dialog" aria-label="关闭工作详情">×</button></header><div class="detail-body" style="--color:${color(w)}"><div class="detail-identity"><div><h2 id="detail-title">${esc(w.name)}</h2><div class="year-note">${w.year} · ${familyName(w)} · ${esc(w.scope)}</div></div><div class="pill-row">${domainTags(w)}</div></div><p class="detail-summary">${esc(w.summary)}</p><div class="detail-actions"><a href="${esc(w.source)}" target="_blank" rel="noopener noreferrer">打开论文 / 官方项目 ↗</a>${compareButton(w)}<button class="secondary-button" data-copy-work="${w.id}">复制来源链接</button></div><div class="detail-facts"><div><dt>力 / 接触信号</dt><dd>${esc(w.signal)}</dd></div><div><dt>力如何进入系统</dt><dd>${esc(w.role)}</dd></div><div><dt>机器人与执行器</dt><dd>${esc(w.platform)}</dd></div><div><dt>证据状态</dt><dd>${esc(w.evidence)}；未运行复现</dd></div></div><h3 class="detail-subhead">1. 评测任务</h3><p class="detail-text">${esc(w.tasks)}</p><h3 class="detail-subhead">2. 评测目的</h3><p class="detail-text">${esc(w.purpose)}</p><p class="mini-note">按论文实验设计归纳，不把任务名称直接当能力结论。</p>${w.experiments.length?`<div class="experiment-table-wrap"><table class="experiment-table"><thead><tr><th>具体实验</th><th>想验证什么</th><th>怎么计分 / 设置</th></tr></thead><tbody>${w.experiments.map(e=>`<tr><td>${esc(e.task)}</td><td>${esc(e.purpose)}</td><td>${esc(e.metric)}<small>${esc(e.setting)}</small></td></tr>`).join('')}</tbody></table></div>`:`<p class="mini-note">本条已做工作层面的归纳；逐任务目的的完整映射仍需结合下方原文笔记。</p>`}<h3 class="detail-subhead">3. 评测指标</h3><p class="detail-text">${esc(w.metrics)}</p><h3 class="detail-subhead">4. 实验设置</h3><p class="detail-text">${w.domains.join(' + ')}；${esc(w.trials)}</p><p class="mini-note">初始位置、物体变化、ID/OOD与介入规则见逐实验设置及原文笔记；未确认项不自动补齐。</p><h3 class="detail-subhead">5. 对比实验</h3><p class="detail-text">${esc(w.baseline)}</p><h3 class="detail-subhead">6. Benchmark 来源与公开情况</h3>${w.relations.map(r=>`<div class="related-bench"><span class="relation-label">${esc(r.label)}</span><button data-benchmark="${r.benchmark}">${esc(benchById.get(r.benchmark)?.name)} ↗</button><p>${esc(r.domain)}；${esc(r.note)}</p></div>`).join('')}<div class="release-block"><span class="tag">${esc(w.openness.status)}</span><p>${esc(w.openness.note)}</p><a href="${esc(w.openness.url)}" target="_blank" rel="noopener noreferrer">核对资源入口 ↗</a></div>${later.map(r=>`<div class="explain-note">${esc(benchById.get(r.toBenchmark)?.name)} <strong>${r.label}</strong>：${esc(r.note)}</div>`).join('')}<div class="evidence-warning"><strong>阅读时保留的限制</strong><br>${esc(w.warning)}</div><details class="source-notes"><summary>展开原始调研笔记与原文定位</summary><div class="markdown">${markdown(w.notes)}</div></details></div>`;
    if(!$('#detail-dialog').open)$('#detail-dialog').showModal();
    $('#detail-dialog').scrollTop=0;
  }
  function toggleCompare(id) {
    if(S.compare.includes(id))S.compare=S.compare.filter(x=>x!==id);
    else if(S.compare.length>=3){toast('最多同时比较3项，请先移除一项。');return;}
    else S.compare.push(id);
    document.querySelectorAll(`[data-compare="${id}"]`).forEach(b=>{const yes=S.compare.includes(id);b.classList.toggle('selected',yes);b.setAttribute('aria-pressed',yes);b.textContent=yes?'已选对比':'＋ 对比';});
    updateTray();
  }
  function updateTray() {
    const tray=$('#compare-tray');tray.hidden=!S.compare.length;
    tray.innerHTML=`<div class="tray-items"><span>已选 ${S.compare.length} / 3</span>${S.compare.map(id=>`<span class="tray-chip">${esc(workById.get(id).name)}<button data-compare="${id}" aria-label="移除${esc(workById.get(id).name)}">×</button></span>`).join('')}</div><div class="tray-actions"><button class="reset" id="clear-compare">清空</button><button class="primary-button" id="show-compare" ${S.compare.length<2?'disabled':''}>并排比较</button></div>`;
  }
  function showComparison() {
    if(S.compare.length<2)return;
    const ws=S.compare.map(id=>workById.get(id));
    const rows=[['研究范围',w=>`${esc(familyName(w))}<br>${esc(w.scope)}`],['接触信号 / 力作用',w=>`${esc(w.signal)}<br>${esc(w.role)}`],['1. 评测任务',w=>esc(w.tasks)],['2. 评测目的',w=>esc(w.purpose)],['3. 评测指标',w=>esc(w.metrics)],['4. 实验设置',w=>`${domainTags(w)}<p>${esc(w.platform)}</p><p>${esc(w.trials)}</p>`],['5. 对比实验',w=>esc(w.baseline)],['6. Benchmark与公开',w=>`${w.relations.map(r=>`${esc(benchById.get(r.benchmark)?.name)}（${esc(r.label)}）`).join('<br>')}<p>${esc(w.openness.status)}</p>`],['解释限制',w=>esc(w.warning)],['一手来源',w=>`<a href="${esc(w.source)}" target="_blank" rel="noopener noreferrer">原文 / 官方项目 ↗</a>`]];
    $('#compare-content').innerHTML=`<header class="dialog-header"><h2 id="compare-title" style="font-size:16px">按六个维度并排阅读</h2><button class="close-dialog" data-close="compare-dialog" aria-label="关闭对比">×</button></header><div class="compare-body"><p class="mini-note" style="margin-bottom:15px">这里比较研究设计，不把不同硬件、对象和评分口径的成功率排成榜单。</p><div class="compare-scroll"><table class="comparison-table"><thead><tr><th>调研维度</th>${ws.map(w=>`<td class="compare-work-head" style="border-top:3px solid ${color(w)}">${esc(w.name)}<div class="year-note">${w.year} · ${esc(w.evidence)}</div></td>`).join('')}</tr></thead><tbody>${rows.map(([a,f])=>`<tr><th>${a}</th>${ws.map(w=>`<td>${f(w)}</td>`).join('')}</tr>`).join('')}</tbody></table></div></div>`;
    $('#compare-dialog').showModal();
  }
  function sources() {
    $('#sources-content').innerHTML=`<header class="dialog-header"><h2 id="sources-title" style="font-size:16px">原始文档与证据说明</h2><button class="close-dialog" data-close="sources-dialog" aria-label="关闭来源说明">×</button></header><div class="source-body"><p>网站基于已完成的四份调研文档，补入UniVTAC/FTP-1关系核查与SimpleTouch条目。每项工作都链接到对应论文版本或官方项目。</p>${D.documents.map(d=>`<a class="document-link" href="${encodeURI(d.url)}" download><span>${esc(d.name)}</span><small>下载 Markdown ↓</small></a>`).join('')}<div class="source-disclaimer">文献快照：${D.updated}。原文核查不等于实验复现；未确认的次数、资源完整性与引用覆盖不自动补齐。研究目的为按实验设计归纳，网站没有生成实验数据或性能排名。</div><h3 style="font-size:13px;margin-top:23px">关注度是带日期的快照</h3><p style="font-size:11px;margin-top:8px">TA-VLA 123 stars，Tabero 59；FuSe 72，FTP-1 133，N₀-VTLA 197。数据来自此前官方GitHub API核验，不是实时排行，也不等于学术质量。</p><p class="mini-note">完整引用数据与限制见下载文档，不依据索引库的零引用认定无人引用。</p></div>`;
    $('#sources-dialog').showModal();
  }
  function toast(message){$('#toast').textContent=message;$('#toast').classList.add('show');clearTimeout(toast.timer);toast.timer=setTimeout(()=>$('#toast').classList.remove('show'),2800);}
  function resetFilters(){S.q='';S.family='';S.domain='';S.role='';S.sort='default';render();}
  function openBenchmark(id){if(!benchById.has(id))return;S.benchmark=id;S.benchFilter='all';S.benchQuery='';$('#detail-dialog').close();route('benchmarks');}
  document.addEventListener('click',async e=>{
    const b=e.target.closest('button, a.brand');if(!b)return;
    if(b.dataset.work){openWork(b.dataset.work);return;}
    if(b.dataset.benchmark){openBenchmark(b.dataset.benchmark);return;}
    if(b.dataset.compare){toggleCompare(b.dataset.compare);return;}
    if(b.dataset.view||b.dataset.go){route(b.dataset.view||b.dataset.go);return;}
    if(b.dataset.scope){S.scope=b.dataset.scope;S.family='';S.role='';S.domain='';S.q='';render();return;}
    if(b.dataset.family){S.scope='all';S.family=b.dataset.family;S.q='';S.domain='';S.role='';route('works');return;}
    if(b.dataset.layout){S.layout=b.dataset.layout;render();return;}
    if(b.dataset.selectBench){S.benchmark=b.dataset.selectBench;const pos=$('.benchmark-picker')?.scrollTop||0;render();$('.benchmark-picker').scrollTop=pos;return;}
    if(b.dataset.benchFilter){S.benchFilter=b.dataset.benchFilter;S.benchQuery='';render();return;}
    if(b.dataset.close){$('#'+b.dataset.close).close();return;}
    if(b.dataset.copyWork){const w=workById.get(b.dataset.copyWork);try{await navigator.clipboard.writeText(`${w.name}\n${w.source}`);toast('已复制工作名称与来源链接。');}catch{toast('浏览器未开放剪贴板，可使用原文按钮。');}return;}
    switch(b.id){
      case 'search-shortcut': route('works');$('#work-search').focus();break;
      case 'clear-search': S.q='';$('#work-search').value='';renderResults();$('#work-search').focus();break;
      case 'reset-filters':case 'empty-reset':resetFilters();break;
      case 'source-button':sources();break;
      case 'clear-compare':S.compare=[];render();break;
      case 'show-compare':showComparison();break;
      case 'next-loop':S.loop=(S.loop+1)%4;const y=window.scrollY;render();window.scrollTo(0,y);break;
      case 'mobile-menu':const expanded=$('.sidebar').classList.toggle('mobile-open');b.setAttribute('aria-expanded',String(expanded));break;
    }
  });
  document.addEventListener('input',e=>{
    if(e.target.id==='work-search'){S.q=e.target.value;renderResults();}
    if(e.target.id==='bench-search'){S.benchQuery=e.target.value;const start=e.target.selectionStart;const y=window.scrollY;render();const input=$('#bench-search');input.focus();input.setSelectionRange(start,start);window.scrollTo(0,y);}
  });
  document.addEventListener('change',e=>{const map={'filter-family':'family','filter-domain':'domain','filter-role':'role','sort-works':'sort'};if(map[e.target.id]){S[map[e.target.id]]=e.target.value;renderResults();}});
  document.addEventListener('keydown',e=>{if(e.key==='/'&&!/INPUT|TEXTAREA|SELECT/.test(e.target.tagName)&&!document.querySelector('dialog[open]')){e.preventDefault();route('works');$('#work-search').focus();}});
  document.querySelectorAll('dialog').forEach(d=>d.addEventListener('click',e=>{if(e.target===d){const r=d.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)d.close();}}));
  $('#work-count').textContent=D.works.length;
  $('#family-navigation').innerHTML=D.groups.map(g=>`<button class="family-link" data-family="${g.id}"><span class="dot" style="--color:${g.color}"></span>${g.name}</button>`).join('');
  const initial=location.hash.slice(1);
  if(initial.startsWith('work=')){setView('works');openWork(initial.slice(5));}else setView(labels[initial]?initial:'overview');
  window.addEventListener('hashchange',()=>{const value=location.hash.slice(1);if(labels[value])setView(value);});
})();
