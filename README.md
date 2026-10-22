# Force-VLA Evaluation Atlas

基于 **React 19 + Vite 8** 的中文研究导航网站，支持本地运行和 GitHub Pages 静态托管。收录80项研究：62篇方法论文与18项独立资源。方法论文按四类组织，可同时属于多类：①夹爪＋末端六维力（研究重点），②夹爪＋其他力觉／触觉，③灵巧手，④其他本体。Benchmark、数据集、表示学习及仿真／硬件资源进入独立资源库，不占用四类。默认展示近两年内符合对应方向优先条件的工作；关注优先级与本体分类分别保留。

四个主页面：论文库、评测任务库、Benchmark / 资源库、横向比较。保留研究路线图、评测解释、四份原始文档下载。支持论文卡片/紧凑表格、信号来源与动作接口筛选、Stars/引用/Forks分别排序、任务覆盖矩阵、同任务跨论文协议对照、原文定位，以及浏览器本地收藏和笔记。

## 本地运行

需要 Node.js 22.12+。重新生成研究目录时还需 Python 3.9+。

日常打开：双击本目录的 `start-local.bat`，保持启动窗口开启，访问 http://127.0.0.1:8765/#works 。按 Ctrl+C 停止。

也可在本目录执行：

```powershell
npm start
```

依赖已安装，无需每次重装；复制到新电脑时先运行 `npm ci`。修改 React / CSS 后自动刷新；修改研究 JSON 后运行 `python prepare_data.py` 并刷新页面。

地址固定为 127.0.0.1:8765，保留原地址下的浏览器收藏和笔记。仅监听本机，无需登录。论文链接和远程图片仍需网络。端口占用时会报错，不自动换端口。

构建与检查：

```powershell
python prepare_data.py
node check.mjs
npm run build
```

dist 由 Vite 生成，不手工修改。

## GitHub Pages 发布与更新

仓库首次发布时，在 Settings → Pages → Build and deployment 中将 Source 设为 GitHub Actions。`.github/workflows/pages.yml` 会在推送到 `main` 后检查现有目录数据、构建网站并发布 `dist`，也可从 Actions 页面手动运行。

日常修改 React / CSS 后提交并推送即可自动更新网站。修改研究资料后，先在本地运行 `python prepare_data.py`，再将更新的研究资料及 `public/catalogue.json`、`public/data.js` 一并提交；云端直接使用这些生成文件，不依赖上级目录中的原始文档。通过检查与部署后，在线网址保持不变。

收藏和笔记保存在当前浏览器对应网址的 localStorage 中，本地地址和线上地址的数据不互通。迁移前可在来源窗口导出 JSON 备份。`public/documents` 中的原始文档会随网站公开提供下载。

## 更新研究资料

- src/App.jsx：页面调度和共享交互状态；导航、顶栏和比较栏分别由 Sidebar、Topbar 和 ComparisonTray 组件负责；任务库、资源库、比较及辅助页面按需加载。
- src/pages/：论文库、任务库、资源库、横向比较、研究路线及评测说明。
- src/components/：公共控件、论文卡片、任务协议、详情弹窗和错误边界。
- src/data/catalogue.js：目录上下文，以及论文、任务、协议和 Benchmark 关系的查询索引。
- src/data/selectors.js：公共论文筛选规则、论文排序、逐任务筛选和任务分类／矩阵数据整理。任务库的环境与力评测条件仍按具体任务筛选。
- src/hooks/：Hash 路由、本地阅读记录、论文库状态及移动导航行为；useScrollLock 统一管理导航和弹窗的滚动锁定；兼容原有链接及笔记存储键。
- src/main.jsx：异步读取 catalogue.json，建立索引；加载失败时提供重试入口。
- src/styles.css：桌面/移动端样式。
- prepare_data.py：读取上级四份调研文档及原始32项结构化数据。
- enrich_data.py：合并新增研究、关注度记录，生成任务交叉索引。
- review_data.py、research/verification_*.json：逐篇核对来源、逐任务修正及状态；verified=所需评测信息已核对，not_reported=查过的相关原文未说明某项细节，pending=仍未查清。只调研评测，不以是否完成机器人复现作为核查条件。生成页面时将专业说法换为易懂表述，保留原始数字、单位和出处。
- task_protocols.py、research/task_protocols_*.json：逐任务的评测目的、指标、设置、原始判分要求及原文定位，覆盖全部研究记录；缺少任何必需字段时生成检查会失败，不回退到论文级字段。
- scoring_data.py、research/scoring_presentation.tsv：将已有核对记录中的指标整理成简短评分方式列表，并把任务判定步骤、计算与计分说明放入“具体方法”；不改变原文核查状态。
- force_evaluation.py、research/force_evaluation_work_review.tsv、research/force_evaluation_tasks.json：独立的逐任务力评测核对记录，覆盖全部工作。任务卡片显示“有：具体力指标”“原文未报告”或“尚未核实”，并可展开原文位置与核对说明；不根据是否有力传感器或原有任务核查状态自动判断。
- evaluation_highlights.py、research/evaluation_design_review.tsv、research/evaluation_highlights.json：对全部工作筛查评测设计，只给少量具有具体借鉴理由的记录加“值得参考”标签。详情列出对应任务、具体做法、参考价值、边界与原文；未选中不表示论文质量低，也不改变热度排序或优先考察规则。
- taxonomy.py、research/taxonomy.json：四类多标签归属与独立资源分流；新增条目必须显式分配归属。
- research/embodiment_force_forms.json：本体、型号、力／触觉物理形式及原文依据。
- selection.py、research/selection_policy.json：可审查的关注优先规则与正式发表证据。
- research/publication_dates.json：2024年边界工作首次公开日期及arXiv来源。
- research/priority_additions.json：本轮补入的RDP与3D-ViTac；priority_attention.json保存对应API数值。
- research/primary_additions.json：补充的直接VLA研究。
- research/tactile_additions.json：触觉VLA、语言与表示前序。
- research/contact_additions.json：力控、灵巧手、硬件与仿真前序。
- research/attention.json、attention_new.json：带来源/日期的引用及GitHub计数。
- public/catalogue.json：页面读取和下载使用的完整目录。public/data.js 保留生成兼容，页面不再依赖全局变量。
- public/documents：四份原始调研文档的副本，原文件未改动。

新增论文时，在研究JSON的works数组加入一条，保留唯一id、name/fullTitle、year、source、信号、输出以及任务/目的/指标/设置/对比/资源六项字段，然后运行python prepare_data.py。在research/taxonomy.json中为该条目指定一类或多类，或归入resourceOnly；页面与任务覆盖索引自动更新，无需修改React组件。若要新增任务主题，在enrich_data.py的TASKS中增加明确的关键词映射。

每个工作须在对应task_protocols文件中逐任务填写task、purpose、metric、setting、conditions、locator、source，可补verification说明核验范围。conditions仅作为原始研究记录的字段保留；生成后的网页数据使用method，不再使用conditions。页面依次展示评测目的、指标、设置、具体方法：指标列出成功／失败、擦除程度、削皮长度、分阶段给分等评分方式，多项指标分别列出；设置记录本体、环境和次数；具体方法展开任务达标要求、测量与计算方式以及适用限制。新增指标时须在scoring_presentation.tsv增加对应展示说明，缺失会阻止生成。未知信息必须明确指出具体缺项，不能用论文级统计填满子任务。正文不再单列重复的“评测指标”段；任务库与论文详情共用同一份任务协议。关注度在详情只展示计数、查询日及发表时间，完整口径仍保留在来源窗口。

“力相关评测”只判断机器人自主执行时，论文是否用执行过程中的力数据评价执行效果。示教力波动、离线力预测、传感器标定或灵敏度演示、训练期受力统计不计入；这些实验本身的信息仍保留。自主执行时的力与示教参考值比较可以计入。案例曲线与跨任务汇总明确标注范围；超过某个力就停止的规则仅放在设置中。原文未报告与尚未核实分别保留，不能由字段空缺自动推出“原文未报告”。

论文库“只看值得参考”与年份、本体、优先考察等筛选叠加，不自动清空其他条件。独立资源仍保留在资源库。“有特色的论文评测方案”页使用同一份精选数据，不再把所有常规指标或作者的方法机制当成值得参考的实验设计。只有阶段成功率、换物体、多个任务或基础消融不自动加标签。ViTacFormer的汉堡任务按原文保留失败后继续测阶段的说明，不另造一套“有／无干预完整成功率”结果。

## 计数与证据口径

近两年按2024-10-16至2026-10-16筛选，首次公开或已核实正式发表落在范围内均可纳入。ForceMimic预印本较早，但ICRA2025正式发表，仍在范围内；日期依据在详情单列。旧资料保留为前序参考。

优先条件按方向区分：①夹爪＋末端六维力，只要求原文可查且有相关评测，不设引用或Stars门槛；其余三个方向还需官方仓库Stars≥30或OpenAlex引用≥5，任意一项满足即可。多类归属包含①时按①规则纳入。共享官方仓库用于筛选时标注“共享”，不当作每篇独立关注量。独立资源不占四类论文的优先名额。

年份是独立筛选项，默认近两年，可切换全部年份；较早论文满足条件也可被标为优先考察。论文库的优先数量随当前年份筛选变化，任务库仍可选择是否只看优先考察。默认按GitHub Stars降序，不使用Google Scholar指标。这些条件是阅读顺序，不是可靠性评分。

快照日期2026-10-16，原始四份文档为2026-10-15。默认按GitHub Stars排序；引用值是 **OpenAlex cited_by_count**，只代表该平台收录结果。OpenAlex覆盖、合并和更新滞后可能明显低估引用。GitHub Stars/Forks是关注度代理，不等于真实使用量。共享仓库不重复归为每篇论文的独立影响力。

null=未知/未获取，0=API明确返回0；缺失值排序在后。每个可用数值附原始API和记录链接。不生成无来源的综合热度分。

任务同名不意味着共享benchmark。分别记录原论文采用、自建、上游衍生、后续重新评测。任务和能力映射为阅读归纳，未逐表核实的成绩不生成排行榜。论文原图使用作者/arXiv远程资源并注明出处；网络不可用时显示明确的任务示意与原图入口。

收藏、阅读状态与笔记仅保存在当前浏览器localStorage，可在来源窗口导出JSON；不跨设备同步。

## 检查

node check.mjs 检查数据完整性、计数溯源、任务关联、Benchmark 关系方向、查询索引等价性和路由容错。browser_check.cjs 使用本机现有 Playwright 与 Edge，检查主要交互、文档下载、移动布局、资料加载重试及本地存储异常。默认检查 8765 端口，可通过 ATLAS_BASE_URL 指定生产预览地址。检查构建结果时需先启动 dist 的 HTTP 预览服务。qa/ 截图不进入发布包。
