# Force-VLA Evaluation Atlas

基于 **React 19 + Vite 8** 的中文研究导航网站，沿用现有私有网址。收录80项研究：62篇方法论文与18项独立资源。方法论文按四类组织，可同时属于多类：①夹爪＋末端六维力（研究重点），②夹爪＋其他力觉／触觉，③灵巧手，④其他本体。Benchmark、数据集、表示学习及仿真／硬件资源进入独立资源库，不占用四类。默认展示近两年内满足关注证据门槛的工作；关注优先级与本体分类分别保留。

四个主页面：论文库、评测任务库、Benchmark / 资源库、横向比较。保留研究路线图、评测解释、四份原始文档下载。支持论文卡片/紧凑表格、信号来源与动作接口筛选、引用/Stars/Forks分别排序、任务覆盖矩阵、同任务跨论文协议对照、原文定位，以及浏览器本地收藏和笔记。

## 本地运行

需要Node.js 22.12+及Python 3.9+。在本目录执行：

```powershell
npm ci
python prepare_data.py
npm run dev
```

开发预览默认 http://127.0.0.1:5173/ 。正式构建：

```powershell
python prepare_data.py
node check.mjs
npm run build
npm run preview
```

dist由Vite生成，不手工修改。部署配置保存在.openai/hosting.json，继续复用同一Site。原有纯JS页面已由React组件替代。

## 更新研究资料

- src/App.jsx：React页面、筛选、任务关联、对比与个人笔记。
- src/styles.css：桌面/移动端样式。
- prepare_data.py：读取上级四份调研文档及原始32项结构化数据。
- enrich_data.py：合并新增研究、关注度记录，生成任务交叉索引。
- taxonomy.py、research/taxonomy.json：四类多标签归属与独立资源分流；新增条目必须显式分配归属。
- research/embodiment_force_forms.json：本体、型号、力／触觉物理形式及原文依据。
- selection.py、research/selection_policy.json：可审查的关注优先规则与正式发表证据。
- research/publication_dates.json：2024年边界工作首次公开日期及arXiv来源。
- research/priority_additions.json：本轮补入的RDP与3D-ViTac；priority_attention.json保存对应API数值。
- research/primary_additions.json：补充的直接VLA研究。
- research/tactile_additions.json：触觉VLA、语言与表示前序。
- research/contact_additions.json：力控、灵巧手、硬件与仿真前序。
- research/attention.json、attention_new.json：带来源/日期的引用及GitHub计数。
- public/catalogue.json、public/data.js：生成后的完整目录。
- public/documents：四份原始调研文档的副本，原文件未改动。

新增论文时，在研究JSON的works数组加入一条，保留唯一id、name/fullTitle、year、source、信号、输出以及任务/目的/指标/设置/对比/资源六项字段，然后运行python prepare_data.py。在research/taxonomy.json中为该条目指定一类或多类，或归入resourceOnly；页面与任务覆盖索引自动更新，无需修改React组件。若要新增任务主题，在enrich_data.py的TASKS中增加明确的关键词映射。

experiments数组可填写task、purpose、metric、setting、success、locator、source，为同任务跨论文页提供具体协议。只有论文级信息的记录会明确显示“任务覆盖已确认，协议待抽取”，不会自动补齐成功判据。

## 计数与证据口径

近两年按2024-10-16至2026-10-16筛选，首次公开或已核实正式发表落在范围内均可纳入。ForceMimic预印本较早，但ICRA2025正式发表，仍在范围内；日期依据在详情单列。旧资料保留为前序参考。

本轮自定阅读门槛：范围内的官方仓库Stars≥100，或OpenAlex收录引用≥20，或Stars≥50且收录引用≥10，标为“优先考察”；未达此门槛但有正式发表或部分关注证据，标为“补充参考”；关注不足或未知，标为“待观察”。共享仓库Stars不用于给单篇论文过门槛。该规则不是领域质量标准，不以0引用或缺失计数判定论文不可靠，也不将公开代码/被作基线当作已独立复现。

论文库和任务库默认显示优先考察；可展开全部目录。“①研究重点优先”按当前①夹爪＋末端六维力分类与关注门槛筛选，不再使用原先固定10项的契合度列表。训练期力、在线力反馈及多配置版本在详情中分别说明；腕部六维力与两指各三维力不混为一类。分类数量因交叉归属不能相加，论文总数按唯一ID去重。

快照日期2026-10-16，原始四份文档为2026-10-15。引用值是 **OpenAlex cited_by_count**，并非Google Scholar或全平台总引用。本轮未取得可核验Google Scholar计数。OpenAlex覆盖、合并和更新滞后可能明显低估引用。GitHub Stars/Forks是关注度代理，不等于真实使用量。共享仓库不重复归为每篇论文的独立影响力。

null=未知/未获取，0=API明确返回0；缺失值排序在后。每个可用数值附原始API和记录链接。不生成无来源的综合热度分。

任务同名不意味着共享benchmark。分别记录原论文采用、自建、上游衍生、后续重新评测。任务和能力映射为阅读归纳，未逐表核实的成绩不生成排行榜。论文原图使用作者/arXiv远程资源并注明出处；网络不可用时显示明确的任务示意与原图入口。

收藏、阅读状态与笔记仅保存在当前浏览器localStorage，可在来源窗口导出JSON；不跨设备同步。

## 检查

node check.mjs检查数据完整性、计数溯源、任务关联和benchmark关系方向。browser_check.cjs使用本机现有Playwright与Edge，对构建后HTTP站点检查主要交互、文档下载与移动布局。需要先以8765端口服务dist。qa/截图不进入发布包。
