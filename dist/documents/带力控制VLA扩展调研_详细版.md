# 带力控制 VLA 扩展调研：触觉、灵巧手、全身接触与专用工具（详细版）

调研日期：2026-10-15。接续[末端六维力与夹爪专题](./带力控制VLA评测调研_详细版.md)，本次新增12项工作，继续按“工作 → 所用benchmark/任务集 → 评测方式 → 值得收集的部分”组织。

## 1. 范围与阅读结论

本次放宽“末端六维力且夹爪”限制，覆盖四个方向：触觉图像/压力阵列驱动动作、灵巧手多点力反馈、移动/全身接触控制、超声探头等专用工具交互。仍使用夹爪、但没有腕部六维力输入的触觉VLA也纳入；并不是只找“完全没有夹爪”的机器人。

必须区分：**触觉参与动作生成、力作为观测、显式跟踪目标力，是三种不同证据。**不少VTLA论文只输出位姿或手指关节动作，不能统一称为显式力伺服。TLA缺少视觉输入，OmniVTA采用世界模型与反射控制，因此作为两项边界参考单列；不为了扩大数量而把它们包装成标准VLA。

**建议阅读顺序（本次判断）：**

- 了解较早的多模态VLA路线：**FuSe → TLA/VTLA**。TLA是相关前序，VTLA加入视觉和偏好学习。
- 了解较受关注的触觉基础策略：**FTP-1、N₀-VTLA**。
- 了解平行夹爪之外的多指操作：**T-Rex、STAR**。
- 了解真正扩展到全身/移动接触：**FWBC-VLA、Opt2VLA**。
- 了解专用末端工具：**ForceU-VLA**。

这里“较早代表”不等于已有多年共识的经典。该细分方向多数工作发表于2025–2026年，不能把所有新论文都叫高引用经典。相较上份报告，本次新增工作，不重复展开Tactile-VLA、TaF-VLA、MoSS、TORL-VLA等已收录条目。

## 2. 代表性与热度证据

以下为2026-10-15快照。引用数据是OpenAlex匹配记录的cited_by_count，可能遗漏或分散在不同版本；stars是官方仓库关注度，均不等于方法质量或完整影响力排名。

| 工作 | 本次核验的证据 | 为什么收集 |
|---|---|---|
| **FuSe / Beyond Sight** | OpenAlex匹配记录14次引用；官方仓库72 stars / 2 forks；官方项目标ICRA 2025 | 较早把触觉/声音通过语言接入通用策略，且明确有PaliGemma VLA实验 |
| **TLA** | OpenAlex匹配记录10次引用；VTLA原文采用它的数据/动作构造并作对照 | 早期触觉—语言—动作前序，帮助理解后续VTLA |
| **VTLA** | OpenAlex匹配记录7次引用；在TLA之后加入视觉、DPO及真机迁移 | 早期插孔专项VTLA代表 |
| **FTP-1** | 官方仓库133 stars / 8 forks；SimpleTouch、OpenViTac后续评测将其列为对照 | 跨触觉传感器基础策略的重要公开参照 |
| **N₀-VTLA** | 官方仓库197 stars / 12 forks；HF论文API显示79 upvotes；OpenViTac列其为对照 | 本次新条目中有明确公开关注度证据的规模化VTLA |
| **T-Rex / STAR** | 已有具体多指任务、基线和详细评测协议 | 因灵巧手与任务代表性收集，未据此断言高引用 |
| **FWBC-VLA / Opt2VLA / ForceU-VLA** | 全身、移动和探头场景的一手评测可查 | 因本体/接触模式扩展价值收集，尚无可靠高引用证据 |
| **TacVLA / OmniVTA** | 接触门控、遮挡、扰动或反射控制的具体对照 | 补齐评测方式；不作为热度排行榜成员 |

数据入口：[FuSe GitHub API](https://api.github.com/repos/fuse-model/FuSe)、[FTP-1 GitHub API](https://api.github.com/repos/michaelyuancb/ftp1-policy)、[N₀-VTLA GitHub API](https://api.github.com/repos/neoteai/N0-VTLA)、[N₀ HF论文API](https://huggingface.co/api/papers/2607.23782)；[FuSe OpenAlex](https://openalex.org/W4413917725)、[TLA OpenAlex](https://openalex.org/W7122803719)、[VTLA OpenAlex](https://openalex.org/W4414940030)。后续采用证据：[SimpleTouch](https://arxiv.org/abs/2610.02784)、[OpenViTac官方结果](https://github.com/FVL-Repo/OpenViTac)。

## 3. 工作—Benchmark总览

“自建套件”是对应论文自己的实验集合，不默认有独立开源环境。下表ID与后文一一对应。

| ID | 工作 | 接触信号/本体 | 该工作实际使用的benchmark/任务集 | 原文评测量或口径 |
|---|---|---|---|---|
| E01 | FuSe / Beyond Sight，2025 | DIGIT触觉图像、声音；WidowX | 自建桌面抓取、购物袋抓取、按钮与跨模态组合任务 | 每个具体scenario重复5次；含Octo及VLA实验 |
| E02 | VTLA，2025 | 双指GelStereo图像；UR3 | 自建五形状插孔、不同间隙、仿真与Sim2Real | 真机每插孔设置20次；最多15次尝试 |
| E03 | FTP-1，2026 | 多类型触觉；夹爪与灵巧手 | UniVTAC六任务子集；Sharpa North、Sharpa&Dexmate；未见传感器套件 | 仿真100次/任务，真机20次/任务 |
| E04 | N₀-VTLA，2026 | 潜在触觉tokens；单/双臂 | UniVTAC八任务+NeoSim十二任务；NeoReal九任务；ALTER长流程 | NeoReal每任务预算不同；SR+100分阶段进度 |
| E05 | T-Rex，2026 | 指端力向量+形变图；双22-DoF手 | 自建12项tactile-reactive灵巧操作任务 | 每任务16次；多阶段含进度评分 |
| E06 | STAR，2026 | 稀疏大面积触觉；双臂灵巧手 | 自建耳机翻转、叠书取出、明信片、多物体抓取 | 每任务20次，共用初始配置；SR+TCR |
| E07 | TacVLA，2026 | 15×8压力阵列；Franka | 自建四项约束拆解+箱内取物；遮挡/运行扰动 | 主结果每任务20次 |
| E08 | FWBC-VLA，2026 | 关节残差估力+全身补偿；轮足机械臂 | 自建移动开门、有/无闭门器、白板擦拭 | 25次/任务；逐阶段与最终成功 |
| E09 | Opt2VLA | 关节torque历史；Digit全身 | 自建搬箱、推箱、擦拭；语言轻/中/重力 | 仿真每变体90episode；45次VLA闭环真机测力 |
| E10 | ForceU-VLA，2026 | 六维F/T+超声；探头工具 | ForceU-VLA-Data对应肝/肾五标准切面任务 | 每任务45次，三个BMI组各15 |
| E11 | TLA，2025【前序】 | 触觉+语言，无视觉 | 自建TLA插孔数据/闭环任务，形状与间隙变化 | 闭环每任务50次；离线GCR/L1 |
| E12 | OmniVTA，2026【相邻系统】 | 视觉—触觉世界模型+反射控制 | 自建擦/削/切/装配/抓取/调姿六类任务 | 常规每物体10次；另有高度/工具/接触扰动 |

对应来源、细节与限制在第4–7节。不要将同名的“擦拭”“插孔”合并成统一benchmark。

## 4. 较早的触觉/多模态路线

### E01 — FuSe / Beyond Sight: Finetuning Generalist Robot Policies with Heterogeneous Sensors via Language Grounding

**对应评测：FuSe论文的自建多模态真机任务集。**WidowX有双DIGIT触觉、相机与麦克风，评测桌面/袋中抓取、按钮和组合指令，包括看起来相似但触感不同的对象，以及声音与视觉语义组合。每个具体scenario重复5次，含未见物体。

论文多数主实验使用Octo，另外单独验证PaliGemma 3B VLA。收集其结果时必须标清骨干，不能把所有Octo数字记为VLA成绩。官方仓库发布26,866条多模态轨迹及模型入口。

**值得收集：购物袋遮挡抓取、跨模态组合指令。**它主要测试触觉信息对任务选择/动作的帮助，没有用目标力误差证明显式力伺服。

来源：[原文§IV-A–G](https://arxiv.org/html/2501.04693v1)、[项目](https://fuse-model.github.io/)、[代码](https://github.com/fuse-model/FuSe)。

### E02 — VTLA: Vision-Tactile-Language-Action Model with Preference Learning for Insertion Manipulation

**对应评测：VTLA自建插孔套件，沿用TLA的动作构造并扩展视觉与DPO。**仿真五类孔形、0.6–2.0 mm间隙；UR3+Robotiq 2F-85+双GelStereo 2.0进行真机验证，每设置20次。一次episode最多15次插入尝试，超过算失败。

离线报告GCR（x/y/rz动作均正确）和分轴L1；闭环报告成功率和尝试步数。真实验证还比较间隙、未见孔形、TLA/VLA对照。旋转误差单位为度，不能与毫米直接求平均。

**值得收集：动作预测准确度 → 闭环成功/步数 → Sim2Real的三层评测。**触觉来自接触图像，不能把其成功率当作指定牛顿力跟踪能力。

来源：[VTLA原文§3–4与Tables 5–7](https://arxiv.org/html/2505.09577v1)、[正式期刊页](https://www.sciencedirect.com/science/article/pii/S2667379726000616)。

## 5. 触觉基础策略与灵巧操作

### E03 — FTP-1: A Generalist Foundation Tactile Policy Across Tactile Sensors for Contact-Rich Manipulation

**对应评测：FTP-1的UniVTAC六任务子集+自建多本体真机套件。**仿真每任务100次；真机20次。六项仿真为Lift Bottle、Pull-out Key、Lift Can、Put Bottle、Insert Hole、Insert Tube；另外报告排除两个lift任务的平均，以避免视觉已能解决的任务稀释触觉贡献。

真机含Sharpa North的气球、修手/小件装配、拧盖，以及Sharpa&Dexmate翻书/擦盘；Fix Hand表中有Tear/Finish两列，不能当成独立物体任务随意计数。未见传感器另测Insert Hanoi、USB、Wipe Board。

**值得收集：跨传感器迁移+去除视觉容易任务的分组统计。**官方预训练覆盖多传感器类型，但输出动作并不统一等于指定力闭环。

来源：[FTP-1§3–4、附录E](https://arxiv.org/html/2606.13102v1)、[项目](https://ftp1-policy.github.io/)、[代码](https://github.com/michaelyuancb/ftp1-policy)。

### E04 — N₀-VTLA: Scaling Vision–Tactile–Language–Action Model with Latent Tactile Tokens

**对应评测：NeoReal九任务、UniVTAC八任务+NeoSim十二任务，以及ALTER长流程改进。**NeoReal同时报告成功率与100分阶段rubric；例如插座插接、纸箱折叠、瓶站立、毛巾折叠/装袋等任务或阶段。每任务trial预算不同，本文不擅自统一成20或30。

仿真二十任务按八个UniVTAC与十二个NeoSim分别统计；每任务100条示教。ALTER是在固定部署数据上做离线策略改进，不能与未使用这些数据的基础模型无说明混排。

**值得收集：NeoReal/NeoSim与阶段rubric。**预训练数据NeoData、仿真benchmark NeoSim和真实benchmark NeoReal是不同资源；任务进度分不等于全任务成功率。

来源：[N₀-VTLA§5、附录E](https://arxiv.org/html/2607.23782v1)、[项目](https://research.neoteai.com/n0-vtla/)、[代码](https://github.com/neoteai/N0-VTLA)。

### E05 — T-Rex: Tactile-Reactive Dexterous Manipulation

**对应评测：T-Rex自建12任务灵巧手套件。**双臂Dexmate Vega-1+两只22-DoF Sharpa Wave手，输入各指力向量及形变图。十二项包括翻页、移蛋、擦盘、挤膏、拆杯、麻将分拣、开锁、补药片、酸碱中和、抽卡、发牌、拧灯泡。

每任务16次，位置/旋转随机；多阶段采用progress-based rubric，所以其平均“success rate”需结合附录评分读取，不能简单当192次整任务二元成功。对照π0.5、加触觉版本、EgoScale、Tactile-VLA、RDP等，另测力/形变模态、异步、示教效率。

**值得收集：T-Rex十二任务及评分rubric。**覆盖夹爪难完成的多指、形变与轻柔操作；不是逐轴wrench跟踪基准。

来源：[T-Rex§5.1–5.3、附录F](https://arxiv.org/html/2606.17055v1)。

### E06 — STAR: Sparse Tactile Representation Learning in Vision–Tactile–Language–Action Models for Dexterous Manipulation

**对应评测：STAR自建四任务真机套件。**耳机180°翻转、紧叠书取出、明信片滑移拾取、多物体分指抓取。每任务20次，共用随机初始配置；每项后训练100条轨迹，测试物体未进入200小时预训练集，但进入了任务后训练，不能称为完全未见物体零样本。

同时报告SR和TCR（子任务完成比例）；例如书任务按拉出/抓取/取出/放置分阶段。另消融去触觉、推理时掩码触觉、稀疏/全局tokens和未来触觉预测。

**值得收集：多指接触丰富与接触稀疏任务的成对分析。**避免所有触觉收益都来自额外数据，原文有同数据无触觉对照。

来源：[STAR§V、附录任务描述](https://arxiv.org/html/2609.12549v1)。

### E07 — TacVLA: Contact-Aware Tactile Fusion for Robust Vision-Language-Action Manipulation

**对应评测：TacVLA自建四类约束锁定拆解+箱内拾取。**Franka单指15×8压力阵列，π0.5骨干；每任务50条示教、主结果20次评测。拆解需要按压、扭转、滑动等特定动作；箱内取物限制相机可见性，另测遮挡与人扰动。

**值得收集：约束锁定拆解与遮挡条件。**比较无触觉、无门控触觉和接触门控，回答“接触阶段才用触觉是否有效”。原表部分基线百分比与成功次数出现不一致，不建议照抄有冲突单元格；优先保存原表与复核分母。

来源：[TacVLA§IV、Table II](https://arxiv.org/html/2603.12665v1)。

## 6. 全身接触、移动操作与探头工具

### E08 — FWBC-VLA: Force-Aware Whole-Body Compensation for Contact-Rich Loco-Manipulation

**对应评测：FWBC-VLA自建移动开门与擦白板套件。**DeepRobotics M20S轮足机器人+机械臂+夹爪，核心扩展是机器人身体参与接触补偿，力由关节残差等估计，不是固定台式机械臂的腕力输入问题。

每任务25次，按接近、抓取、操作、放置/推门、离开/过门分阶段；开门有/无闭门器，带闭门器需约50 N推力。擦板污迹ID/OOD比例1:2。另做估力准确度/接触识别，以及force interface、body compensation消融；对照含真实F/T输入版本。

**值得收集：阶段成功率与最终完成率。**“门把压下”或“擦干净”不等于完成离开/穿门全流程；力估计误差和整任务成功也分开计分。

来源：[FWBC-VLA v2§5、Tables 1–3](https://arxiv.org/html/2609.03889v2)。

### E09 — Opt2VLA: Force-Aware Vision-Language-Action for Contact-Rich Humanoid Whole-Body Manipulation

**对应评测：Opt2VLA在Digit上的搬箱、架上推箱、表面擦拭。**关节torque历史作为反馈，策略输出双手/双脚位置与双手接触力参考；是全身协调和目标力接口，并非夹爪宽度控制。

项目页对九种VLA配置分别运行90个仿真episode（每任务30），共用FCT低层控制器；另有45次VLA闭环真机测力。评分串联三关：任务完成、发出的力命令符合语言力区间、实际力与命令均值差满足阈值；低层控制器另测force MAE。

**值得收集：Task+Intent+Tracking联合成功。**取样窗口与无效接触trial处理有单独说明；应与RL-only控制器试验分开。当前主要核查官方项目，未据此认定已是高引用经典。

来源：[官方项目的Closed-loop evaluation与硬件结果](https://opt2vla.github.io/)。

### E10 — ForceU-VLA: A Force-Aware Vision–Language–Action Model for Embodied Ultrasound Scanning

**对应评测：ForceU-VLA-Data对应肝/肾五种标准超声切面。**专用探头接触身体，联合RGB、超声图像与6D F/T；不属于夹爪抓放。数据450条示教。

每任务45次，三BMI组各15；成功定义为获得目标标准切面，另报扫描步数与力信号，比较π0/π0.5/ForceVLA及模态消融。这里的任务目标是成像质量/标准切面获取，接触力是过程质量因素。

**值得收集：任务专业结果+交互过程的联合观察。**论文力曲线对舒适/安全属于间接证据，不能写成已验证所有受试者舒适性。原文和当前仓库对示教参与者/操作者口径存在差异，450条可核验，但不把“10名操作者”写成确定事实。

来源：[原文§4–5](https://arxiv.org/html/2608.15009v1)、[官方仓库](https://github.com/VMVLab/ForceU-VLA)。

## 7. 两项有价值的边界参考

### E11 — TLA: Tactile-Language-Action Model for Contact-Rich Manipulation

**对应评测：TLA插孔数据与闭环插入套件。**这是触觉+语言动作模型，不含视觉输入，因此作为VTLA前序收集。

离线用24k触觉—动作—指令样本，测GCR和分轴L1；闭环对不同孔形、1.0/1.6/2.0 mm间隙，每设置50次，最多15次尝试；报告成功率与成功episode平均步数。孔已握在手中，从近孔位开始，不涵盖完整视觉定位抓取。

**值得收集：孔形/间隙泛化和局部接触纠偏。**VTLA后续加入真机Sim2Real比较，不能将后续论文的真机结果反写成TLA原论文结果。

来源：[TLA§V](https://arxiv.org/html/2503.08548v1)。

### E12 — OmniVTA: Visuo-Tactile World Modeling for Contact-Rich Robotic Manipulation

**对应评测：OmniVTA六类自建任务。**擦拭、削皮、切割、装配、抓取、调姿，视觉—触觉世界模型+扩散规划器+触觉反射控制。它是相邻系统，不因比较VLA就自动称为通用VLA。

每类2–4物体、每物体10次；高度泛化每物体每高度5次，换刀具10次，突然上/下移动对象以破坏接触的扰动试验每任务10次。计分含加工长度比例、完整插入/无损抓取、调姿角度等，也约束不损坏触觉传感器。

**值得收集：主动打断接触再恢复的扰动协议。**比只看初始位置随机化更直接测在线反馈；成功率、加工比例和传感器无损需按原文任务分别解释。

来源：[OmniVTA§V-A–B](https://arxiv.org/html/2603.19201v1)。

## 8. 本轮最值得收集的Benchmark清单

以下每项明确对应论文，不把预训练数据量当benchmark规模。

| 收集项 | 对应工作 | 最有价值的评测设计 | 使用时的关键限制 |
|---|---|---|---|
| **跨传感器+仿真六任务** | **E03 FTP-1** | 已见/未见传感器分开；剔除视觉易解lift任务的均值 | 不是原版UniVTAC八任务均值；真机有子阶段列 |
| **NeoReal / NeoSim** | **E04 N₀-VTLA** | 真实SR+阶段rubric；单/双臂仿真 | NeoData是训练数据，不是NeoReal测试集；预算按任务 |
| **12项触觉灵巧操作** | **E05 T-Rex** | 多指力+形变，轻柔/柔性/多阶段任务 | 进度评分不能当纯二元整任务成功 |
| **四项多指操作** | **E06 STAR** | 同配置SR/TCR；无触觉/掩码触觉消融 | 测试物体见过后训练，不是完全零样本 |
| **语言力联合成功** | **E09 Opt2VLA** | 任务、力意图、实际跟踪三关；低层控制器单独测 | 项目页来源；均值窗口/无效接触样本需保留 |
| **移动接触全流程** | **E08 FWBC-VLA** | 带闭门器负载，身体补偿，阶段/最终成功 | 底座/腿参与，不能与固定臂分数直接比较 |
| **遮挡下跨模态指令** | **E01 FuSe** | 袋中抓取、触感与声音组合 | Octo主结果与VLA实验分别收集 |
| **局部插孔Sim2Real** | **E02 VTLA；前序E11 TLA** | 孔形、公差、纠偏步数与真机迁移 | 起始已抓住零件；不覆盖完整抓取流程 |
| **标准超声切面获取** | **E10 ForceU-VLA** | 专业任务结果+交互力+体型差异 | 专用领域，不等同一般接触物体操作 |
| **接触丢失恢复** | **E12 OmniVTA** | 执行中改物体高度；换工具 | 相邻世界模型系统，单列 |

## 9. 相较原专题，评测关注点发生了什么变化

| 方向 | 原来腕部F/T+夹爪常见测法 | 本次扩展工作的特色 | 对应工作 |
|---|---|---|---|
| 触觉感知 | 净合力/力矩 | 接触分布、纹理、形变、遮挡下识别 | FuSe、TacVLA、VTLA |
| 灵巧手 | TCP+单夹爪宽度 | 多指分工、滑移/滚动、复杂分阶段完成 | T-Rex、STAR |
| 传感器泛化 | 固定一套F/T接口 | 跨图像/阵列/状态类触觉迁移 | FTP-1 |
| 多本体基础策略 | 单台机器人几任务 | NeoReal/NeoSim及任务进度rubric | N₀-VTLA |
| 全身接触 | 台式机械臂局部纠偏 | 手、身体、腿协调，任务+意图+力实现 | FWBC-VLA、Opt2VLA |
| 专用工具 | 物体操作是否完成 | 标准切面成像与人体接触过程 | ForceU-VLA |

本次未提供跨论文分数排行榜：骨干、预训练规模、对象、初始状态、评分尺度不同。尤其不能把T-Rex进度分、STAR的TCR、N₀的100分rubric和普通二元SR放到同一列排序。

## 10. 核验状态

已核对上述原文/官方项目的评测章节与主要口径，核验3个官方仓库关注度和3条匹配引用记录。未运行benchmark、下载大型数据或复现模型。明确缺失处：N₀-VTLA统一trial数并不存在于已查到的通用协议说明；Opt2VLA主要依据项目页；其他新工作尚未建立可靠高引用证据。代码仓库存在不代表其所有数据、权重和任务资产都已齐备。

原专题两份文档保留；本文件为扩展补充，避免把原来的核心范围改乱。