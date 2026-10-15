# coding: utf-8
"""Build a static, source-linked catalogue from the existing research notes."""
from pathlib import Path
import json
import re
import shutil

ROOT = Path(__file__).resolve().parent
SOURCE = ROOT.parent
DIST = ROOT / 'dist'
DIST.mkdir(exist_ok=True)

GROUPS = [
    dict(id='wrist', name='末端力与力矩', color='#24768c', subtitle='腕部 wrench、目标力与快速接触纠偏'),
    dict(id='touch', name='指尖力与触觉', color='#7562a9', subtitle='夹持、接触分布、力语言与多模态表示'),
    dict(id='dex', name='灵巧手与基础策略', color='#377b60', subtitle='多指协作、跨传感器与规模化触觉学习'),
    dict(id='body', name='全身与专用工具', color='#ab7238', subtitle='移动接触、身体补偿与探头交互'),
    dict(id='related', name='相关路线与评测框架', color='#63738a', subtitle='关节扭矩、蒸馏、世界模型与统一评测'),
]

# id, name, year, family, signal, role, platform, short contribution, tasks, metrics
ROWS = [
('W01','ForceVLA',2025,'wrist','估计末端6D wrench','力观测','Flexiv Rizon + 夹爪','将末端力作为 VLA 的独立输入，研究接触任务与物理泛化。','按瓶、插头、USB、擦板、削皮','成功率、削皮长度/次数'),
('W02','ForceVLA2',2026,'wrist','末端6D F/T','显式力—位置','Flexiv Rizon 4s + DH AG-95','将力引入动作接口，覆盖持续接触与装配。','按瓶、清洁花瓶、擦板、取盘、齿轮','成功率、过载与接触表现'),
('W03','FAVLA',2026,'wrist','腕部6D F/T','快速反馈','Monte / X-ARM + 夹爪','通过快慢环与自适应更新频率应对接触变化。','USB、齿轮、翻盒、擦板','成功率、平均峰值力、频率消融'),
('W04','DAM-VLA（异步多模态）',2026,'wrist','机器人内部F/T','快速反馈','Franka Panda + 夹爪','分离力、视觉记忆与异步处理的贡献。','围巾、擦板、按钮、洗手液、插座、扫珠、Lego','成功率、耗时、平滑、tracking lag'),
('W05','CR-VLA-Force',2026,'wrist','末端6D F/T','显式力—位置','UR5e + UMI-like 夹爪','慢策略结合柔顺执行，定量检验恒力跟踪。','急停按钮、充电插头、旋转窗、恒力擦板','成功率、法向力相对误差、保护停机'),
('W06','TAO-Force',2026,'wrist','腕部6D F/T','显式力—位置','AgiBot G1 双臂','通过反事实力输入检验动作是否真正依赖力。','重量分拣、削皮、按泵、擦板、切割','成功率、力/矩预测MSE、路由Flip Rate'),
('W07','ForceDelta-VLA',2026,'wrist','估计末端6D wrench','快速反馈','Franka Panda / X Square 双臂','在参考动作更新间隙学习接触纠偏与延迟修正。','五单臂任务、四双臂任务','成功率、成功样本峰值/时间、延迟'),
('W08','ForceRFT',2026,'wrist','腕部6D F/T','残差适应','Franka FR3 + Robotiq 2F-85','以在线残差学习提升限时自主完成能力。','插头、环套柱、擦板','自主成功次数、在线预算、力反馈消融'),
('W09','Tactile-VLA',2025,'touch','双指触觉 / 力','显式力—位置','触觉夹爪','把力语言迁移、物理常识和失败后调力分别测试。','USB/充电器插拔、无变形抓取、擦板','成功率、施加力、无可见变形'),
('W10','TaF-VLA',2026,'touch','触觉—力对齐','触觉反馈','触觉夹爪 / 工具','利用物理接触表示覆盖抗滑、易碎与工具操作。','管插入、镊子提重、拔出、擦板、切片、抓取等八类','任务特定成功率'),
('W11','Tabero',2026,'touch','双指各3D力','显式力—位置','Isaac Lab 触觉夹爪','分开评估夹持内力、对外作用力与轻柔指令。','LIBERO衍生轻柔抓放 / 接触任务','SR、AG、MG、AA、MA'),
('W12','TORL-VLA',2026,'touch','双指各6D wrench（合12D）','残差适应','Piper + Pika / Tacta','将精密接触、机械锁定与易碎搬运串为完整流程。','杯子入架、搭扣、鸡蛋、串联全流程','子任务/全流程成功、耗时、60分钟吞吐'),
('W13','TA-VLA',2025,'related','关节 torque / effort','预测监督','机械臂 + 夹爪','研究历史扭矩与未来预测，同时检查常规能力。','五接触任务 + 五常规任务','成功率、跨模型与跨本体测试'),
('W14','FD-VLA',2026,'related','训练用力，部署不读真实力','力蒸馏','UR5e + 夹爪','把训练期力知识蒸馏到部署时可用表示。','擦板、急停按钮、插头','成功率、蒸馏与直接力输入对照'),
('W15','MoSS',2026,'touch','触觉 + 关节 torque','触觉反馈','FR3 + Robotiq / AnySkin','在同一骨干与任务下比较多种物理模态。','拆杯、鸡蛋抓放、擦板、插头（v1）','成功率、多模态与训练消融'),
('W16','CompVLA',2026,'related','训练含F/T，评测策略不读F/T','柔顺性','Franka FR3','评估可变柔顺性，并保留普通抓放对照。','擦板、Pivot、Cup Dispense、Pick & Place','成功率、常规能力保持'),
('W17','ForceFlow',2026,'related','末端力历史','相邻系统','机械臂 + 工具','VLM定位与接触策略分阶段，分析力统计与物理泛化。','盖章、插头、按压、USB、擦板、花瓶','成功率、专家力统计偏差、OOD'),
('W18','FAWAM',2026,'related','腕部6D F/T','相邻系统','Franka + ATI F/T','世界动作模型结合力预测与残差纠偏。','擦板、削皮、翻盒、擦花瓶','成功率、时间、观测/预测/残差消融'),
('E01','FuSe / Beyond Sight',2025,'touch','DIGIT触觉图像 + 声音','触觉反馈','WidowX 250','用语言连接异质感官，分别验证Octo与VLA。','桌面抓取、袋中抓取、按钮、跨模态组合','成功率、未见物体与组合语义'),
('E02','VTLA',2025,'touch','双指触觉图像','触觉反馈','UR3 + Robotiq / GelStereo','从接触动作预测到闭环插孔，再验证仿真到真机。','五孔形、不同装配间隙','GCR、分轴L1、成功率、尝试步数'),
('E03','FTP-1',2026,'dex','多类触觉传感器','触觉反馈','Franka / Sharpa / Dexmate / Flexiv','同一触觉基础策略跨传感器与本体适配。','UniVTAC六任务 + 多本体真机任务','成功率、已见/未见传感器迁移'),
('E04','N₀-VTLA',2026,'dex','潜在触觉 tokens','触觉反馈','单臂 / 双臂','同时评估真实长流程、仿真任务与离线策略改进。','NeoReal九任务；UniVTAC八项；NeoSim十二项','成功率、100分阶段rubric'),
('E05','T-Rex',2026,'dex','指端力向量 + 形变图','快速反馈','Dexmate Vega-1 + 双22-DoF手','以触觉快速细化多指动作，覆盖复杂物体交互。','翻页、移蛋、擦盘、挤膏、拆杯、开锁等十二项','任务分数、多阶段progress rubric'),
('E06','STAR',2026,'dex','稀疏大面积触觉','触觉反馈','双臂灵巧手','针对触觉的空间、时间与信息稀疏性学习。','耳机翻转、叠书取出、明信片、多物体抓取','SR、TCR、去/掩码触觉消融'),
('E07','TacVLA',2026,'touch','15×8压力阵列','触觉反馈','Franka Panda + 单指传感器','接触门控决定何时使用触觉，验证受限/遮挡操作。','四项约束拆解 + 箱内取物','成功率、遮挡与运行扰动'),
('E08','FWBC-VLA',2026,'body','关节残差估力','全身补偿','M20S 轮足 + CM1机械臂','身体参与接触补偿，单独核验力估计和流程结果。','移动开门、闭门器负载、擦白板','阶段/最终成功率、估力误差'),
('E09','Opt2VLA',2026,'body','关节 torque 历史','显式力—位置','Digit 人形机器人','将任务完成、力意图和实际力实现联合计分。','搬箱、推箱、擦拭；轻/中/重力指令','Task + Intent + Tracking、MAE'),
('E10','ForceU-VLA',2026,'body','6D F/T + 超声图像','力观测','超声探头工具','以专业成像结果与接触过程共同验证策略。','肝 / 肾五个标准超声切面','切面获取成功、扫描步数、力信号'),
('E11','TLA',2025,'related','触觉 + 语言，无视觉','前序工作','插孔环境','早期触觉—语言—动作模型，局部纠偏而非完整抓取。','不同孔形与间隙的插孔','GCR、L1、闭环成功率/步数'),
('E12','OmniVTA',2026,'related','视觉—触觉世界模型','相邻系统','触觉机械臂 / 工具','规划与反射控制结合，主动扰动接触再恢复。','擦、削、切、装配、抓取、调姿','成功/加工比例、物体/工具/扰动泛化'),
('B01','ForceBench',2026,'related','仿真腕部6D反力','评测框架','Isaac Lab / Franka','固定数据、骨干与种子，比较六维力接入设计。','八仿真任务 + 五真机验证任务','任务/类别成功率、诊断结果'),
('X01','SimpleTouch',2026,'dex','预训练触觉表示','触觉反馈','UniVTAC / 真机','以单阶段任务微调检验是否必须做额外触觉策略预训练。','UniVTAC六任务 + 四个真机任务','成功率、执行horizon消融'),
]

PRIMARY = {
'W01':'2505.22159v1','W02':'2603.15169v1','W03':'2602.23648v1','W04':'2606.12105v1','W05':'2609.05832v1','W06':'2609.18497v1','W07':'2609.18242v1','W08':'2609.22840v1','W09':'2507.09160v1','W10':'2601.20321v1','W11':'2605.27886v1','W12':'2606.09337v1','W13':'2509.07962v1','W14':'2602.02142v2','W15':'2604.23272v1','W17':'2605.11048v1','W18':'2606.08555v1',
'E01':'2501.04693v1','E02':'2505.09577v1','E03':'2606.13102v1','E04':'2607.23782v1','E05':'2606.17055v1','E06':'2609.12549v1','E07':'2603.12665v1','E08':'2609.03889v2','E10':'2608.15009v1','E11':'2503.08548v1','E12':'2603.19201v1','B01':'2610.19604v1','X01':'2610.02784v1'}

TRIALS = {
'W01':'插接/按压20；擦板10；削皮15','W02':'20次 / 任务','W03':'USB25 / 齿轮30 / 翻盒20 / 擦板10','W04':'15次 / 任务','W05':'24–25次 / 条件','W06':'30次 / 任务 / ID或OOD条件','W07':'20次 / 任务','W08':'30次 / 设置','W09':'抓取10次 / 物体；其他按实验','W10':'15次 / 任务','W11':'统一每任务次数未确认','W12':'子任务与全流程各30次','W13':'20次 / 任务','W14':'30次 / 任务','W15':'24次 / 任务（v1）','W16':'评测次数未确认','W17':'20次 / 主任务','W18':'20次 / 任务，最长60秒',
'E01':'5次 / 具体scenario','E02':'真机20次 / 设置','E03':'仿真100；真机20次 / 任务','E04':'按任务分配；不统一填次数','E05':'16次 / 任务','E06':'20次 / 任务','E07':'20次 / 主任务','E08':'25次 / 任务','E09':'仿真90次 / 变体；VLA真机45次','E10':'45次 / 任务，BMI组各15','E11':'闭环50次 / 设置','E12':'常规10次 / 物体；泛化另设','B01':'仿真200；真机20次 / 任务-方法','X01':'仿真100；真机20次 / 任务'}

WARNINGS = {
'W01':'力作为观测，动作仍是位姿与夹爪宽度。','W02':'任务成功不自动等于完整六轴力/矩跟踪。','W03':'峰值力下降不等于跟踪误差下降。','W04':'不要与同名 Dynamic Action Model DAM-VLA 混淆；100 Hz控制不等于100 Hz重规划。','W05':'主要量化法向力，不是六轴目标同时跟踪；40 N仅属于原实验。','W06':'反事实分析是离线轨迹响应；预测MSE不是执行误差。','W07':'峰值力与耗时表仅统计成功trial；夹爪命令不由快纠偏头控制。','W08':'正式评测固定策略；在线训练预算不等于测试时继续更新。','W09':'跨任务零样本指力语言迁移；充电器运动示教已见过。','W10':'TaF-VLA与TA-VLA是不同工作。','W11':'双指各3D拼接不是腕部6D；MG/MA是最高5%样本均值。','W12':'双指6D拼为12D；对照方法已适配到共同接口。','W13':'关节torque不是末端6D wrench。','W14':'部署时不读真实力；不要与ForceDelta-VLA混淆。','W15':'原文v1四任务与当前主页扩展演示分开。','W16':'评测时策略不读F/T；试验次数和重复seed未确认。','W17':'VLM定位加局部策略；Force Fidelity不是六轴逐时刻RMSE。','W18':'World Action Model路线，不能只因比较VLA就归为标准VLA。',
'E01':'多数主实验是Octo；另有PaliGemma VLA实验，不混用成绩。','E02':'初始已握住零件；评测局部接触纠偏而非全流程抓取。','E03':'只使用UniVTAC六任务；真机套件另建，非六任务原样迁移。','E04':'NeoData是训练数据，NeoReal/NeoSim是评测；阶段进度和SR不同。','E05':'多阶段含progress评分，不能当成全任务二元成功率。','E06':'物体进入任务后训练；不是完全未见物体零样本。','E07':'部分原表基线百分比与次数冲突，需逐格复核。','E08':'身体/腿参与补偿，与固定臂结果不能直接排行。','E09':'主要依据官方项目页；三关联合成功与RL-only试验分开。','E10':'标准切面为专业任务结果；力曲线不等于全面舒适/安全证实。','E11':'不含视觉，作为TLA前序单列。','E12':'世界模型+反射控制相邻系统，非典型通用VLA。','B01':'2026-10-14新发布；完整发布包未确认；主要配置50步执行完才再查询。','X01':'仅为本轮补充核验；不将原表基线结果都称为重新测试。'}

SIMREAL = {'W11':['仿真'],'E02':['仿真','真机'],'E03':['仿真','真机'],'E04':['仿真','真机'],'E09':['仿真','真机'],'E11':['仿真'],'B01':['仿真','真机'],'X01':['仿真','真机']}

texts = {}
for filename in ['带力控制VLA评测调研_详细版.md','带力控制VLA扩展调研_详细版.md']:
    raw = (SOURCE / filename).read_text(encoding='utf-8')
    matches = list(re.finditer(r'^### ((?:W|E)\d{2})\s+[—–-].*$', raw, re.M))
    for i,m in enumerate(matches):
        end = matches[i+1].start() if i+1 < len(matches) else len(raw)
        section = raw[m.start():end]
        # Stop at the next top-level section instead of including unrelated notes.
        stop = re.search(r'\n## ', section)
        if stop: section = section[:stop.start()]
        texts[m.group(1)] = section.strip()
texts['B01'] = '''### ForceBench 的使用关系

ForceBench包含八个仿真任务与五个真实验证任务，以统一数据、骨干与种子比较力接入方案。原文仿真每任务—方法200次。

ForceBench重新评估ForceVLA和ForceFlow等外部方法。这个方向是“后续评测”，不意味着早期方法原论文已采用ForceBench。

来源：[原文§III、§V](https://arxiv.org/html/2610.19604v1)。'''
texts['X01'] = '''### SimpleTouch：补充核验

在UniVTAC六任务子集上微调与闭环评测，沿用FTP-1排除Grasp Classify和Insert HDMI。每任务50条示教、100次仿真，另有四个真实任务、20次/任务。

附录明确使用官方任务随机化与成功定义。接触插入任务缩短执行horizon，控制率、预测块长、重规划间隔需要分别记录。

来源：[原文与附录](https://arxiv.org/html/2610.02784v1)。'''

def bm(id, name, kind, domain, focus, detail, source, tasks=None):
    return dict(id=id,name=name,kind=kind,domain=domain,focus=focus,detail=detail,source=source,tasks=tasks or [])

benchmarks = [
bm('univtac','UniVTAC Benchmark','公开任务框架','仿真','视觉—触觉策略','平台支持触觉仿真与数据合成；Encoder为表示学习模块；Benchmark为八个闭环操作任务。三者不混用。','https://arxiv.org/html/2602.10093v1',['Lift Bottle','Pull-out Key','Lift Can','Put Bottle in Shelf','Insert Hole','Insert HDMI','Insert Tube','Grasp Classify']),
bm('forcebench','ForceBench','公开评测研究','仿真 + 真机','腕部六维力融合','统一数据、骨干和测试种子比较力接入设计；新近发布，完整可运行发布包尚未确认。','https://arxiv.org/html/2610.19604v1',['Weight Sort','CoM Sort','Faucet Turn','Faucet Direction','Stove Turn','Stove Press','Drawer Pull','Nut Thread']),
bm('tabero','Tabero Benchmark','论文提出的框架','仿真','轻柔指令与夹持力','LIBERO场景/轨迹迁移至Isaac Lab触觉环境；属于衍生环境，不等于原版LIBERO分数。','https://arxiv.org/html/2605.27886v1',['firm / gentle指令','夹持力AG / MG','施加力AA / MA']),
bm('libero','LIBERO（上游资源）','上游场景/轨迹','仿真','通用操作资源','在本关系图中标记Tabero的场景/轨迹来源，不标为所有触觉方法原论文的测试集。','https://arxiv.org/html/2605.27886v1'),
bm('neoreal','NeoReal','论文自建命名套件','真机','精细接触与长流程','九项任务，成功率与100分阶段rubric并列；各任务试验预算不统一。','https://arxiv.org/html/2607.23782v1'),
bm('neosim','NeoSim','论文自建命名套件','仿真','单臂 / 双臂接触','十二个任务，和UniVTAC八任务分组统计。','https://arxiv.org/html/2607.23782v1'),
]

works = []
for row in ROWS:
    id,name,year,family,signal,role,platform,summary,tasks,metrics = row
    source = 'https://arxiv.org/html/'+PRIMARY[id] if id in PRIMARY else {'W16':'https://compvla.github.io/','E09':'https://opt2vla.github.io/'}[id]
    evidence = '项目页核查' if id in ['W16','E09'] else '原文核查'
    scope = '评测研究' if id=='B01' else '边界参考' if id in ['W17','W18','E11','E12'] else '扩展相关' if id.startswith('E') or id=='X01' or id in ['W09','W10','W11','W12','W13','W14','W15','W16'] else '核心相关'
    relations=[]
    if id in ['E03','E04','X01']:
        relations.append(dict(benchmark='univtac',type='adopts',label='采用6任务子集' if id!='E04' else '采用8个任务',domain='仿真',note='每任务50条官方示教；100次闭环仿真' if id in ['E03','X01'] else '八项原始任务，与NeoSim十二项分开统计'))
    if id=='W11':
        relations.append(dict(benchmark='tabero',type='proposes',label='提出并评测',domain='仿真',note='LIBERO衍生环境；统一每任务次数未确认'))
    elif id=='B01':
        relations.append(dict(benchmark='forcebench',type='proposes',label='提出并评测',domain='仿真 + 真机',note='八仿真任务、五真机验证任务'))
    elif id=='E04':
        for bid,domain in [('neoreal','真机'),('neosim','仿真')]:relations.append(dict(benchmark=bid,type='adopts',label='采用并评测',domain=domain,note='见配套报告与任务协议'))
    else:
        bid='suite-'+id.lower()
        domain='真机' if id in ['E03','X01'] else '仿真 + 真机' if id in ['E02','E09'] else SIMREAL.get(id,['真机'])[0]
        bname=name.replace('（异步多模态）','')+' '+('真机套件' if domain=='真机' else '任务套件')
        benchmarks.append(bm(bid,bname,'论文自建任务集',domain,summary,'描述名用于索引，不意味着作者发布了独立同名benchmark。具体任务与计分见对应工作的原文。',source,tasks.split('、')))
        relations.append(dict(benchmark=bid,type='self',label='自建并评测',domain=domain,note=TRIALS[id]))
    works.append(dict(id=id,name=name,year=year,family=family,signal=signal,role=role,platform=platform,summary=summary,tasks=tasks,metrics=metrics,trials=TRIALS[id],warning=WARNINGS[id],domains=SIMREAL.get(id,['真机']),scope=scope,evidence=evidence,source=source,notes=texts.get(id,''),relations=relations))

EXTRA = [
dict(fromWork='W01',toBenchmark='forcebench',type='later',label='后续重新评测',note='ForceBench论文中的外部比较，不是ForceVLA原论文的评测。',source='https://arxiv.org/html/2610.19604v1'),
dict(fromWork='W17',toBenchmark='forcebench',type='later',label='后续重新评测',note='由ForceBench纳入外部比较。',source='https://arxiv.org/html/2610.19604v1'),
dict(fromBenchmark='tabero',toBenchmark='libero',type='derived',label='场景 / 轨迹衍生',note='复用资源并改变触觉/控制环境，不能直接等同原版成绩。',source='https://arxiv.org/html/2605.27886v1'),
]

FEATURES=[
    dict(work='W06',title='模型真的在利用力吗？',text='固定视觉交换力输入，区分离线路由响应与实际执行。'),
    dict(work='W07',title='参考动作延迟时还能纠偏吗？',text='单臂与双臂分别测，峰值和耗时保留成功样本口径。'),
dict(work='W05',title='有没有跟住目标力？',text='恒力擦拭与高度OOD，明确参考力、误差和保护停机。'),
dict(work='W09',title='“轻一点”能否跨任务？',text='把已见运动与未见力语言分开，测真实施加力。'),
dict(work='W12',title='能否无损完成全流程？',text='杯子、搭扣、鸡蛋，子任务与完整自主流程分别计分。'),
dict(work='E05',title='多指操作怎样计分？',text='十二类灵巧操作；完整成功与分阶段进度要读清。'),
dict(work='E03',title='传感器换了还能用吗？',text='UniVTAC仿真与真实硬件分开，已见/未见传感器分组。'),
dict(work='E09',title='做成了，也用对力了吗？',text='任务完成、命令力意图、实际力跟踪三关联合。'),
]


# The six user-requested review dimensions; purposes are our reading of experiments.
BASELINES = {
'W01':'π0-base / π0-fast，无力与简单力输入版本；FVLMoE消融。',
'W02':'ACP、π0、π0.5、ForceVLA、π0简单力输入；力提示/融合组件消融。',
'W03':'π0、π0+Force、TA-VLA、ForceVLA；力注入、预测、自适应频率消融。',
'W04':'同X-VLA骨干：同步/异步、无力、无记忆、拼接与门控融合；同数据划分。',
'W05':'DP、π0、π0.5、π0+Force、ForceVLA；训练阶段、历史力编码、柔顺控制器消融。',
'W06':'主任务对照GR00T N1.7、π0.5；离线力融合比较DePost、FVLMoE；分拣对无力基线标N/A。',
'W07':'π0.5、ForceVLA、TA-VLA、ImplicitRDP、Temporal Teacher；纠偏/延迟与历史力消融。',
'W08':'SmolVLA-SFT、力条件prior、残差模仿；移除执行时wrench/增量，匹配在线预算。',
'W09':'π0-base、π0-fast，带/不带CoT推理；语言、ID/OOD物体和任务迁移。',
'W10':'ACT、DP、FreeTacMan、π0.5，以及TaF-Adapter版本；物理对齐表示比较。',
'W11':'不同触觉表示与力反馈配置；firm/gentle条件；完整基线及次数以原表为准。',
'W12':'π0.5、TA-VLA、ForceVLA、w/o RL、RLT；对照均适配同π0.5与双指接口。',
'W13':'ACT、RDT、π0；torque观测、预测及组合；输入位置/历史编码消融。',
'W14':'DP3、π0、SmolVLA，真实力输入、蒸馏token与模块消融。',
'W15':'GR00T N1.5、π0，加Tactile-VLA/ForceVLA/TA-VLA适配；单模态和多模态组合。',
'W16':'π0、ForceVLA、TA-VLA、DP、ACT；项目页表格，重复次数未确认。',
'W17':'π0.5、ACT、DP、ForceVLA、无力版本；接触阶段去视觉及OOD。',
'W18':'π0.5、GE-Act、ForceVLA、TA-VLA；力观测/未来预测/残差纠偏拆分。',
'E01':'视觉基线、不同辅助损失；Octo主实验与PaliGemma VLA实验分开。',
'E02':'DP、VLA、TLA；DPO-1k/2k与无DPO；仿真和真机孔形/间隙比较。',
'E03':'π0.5、Tactile-VLA、未做FTP-1预训练版本；原表星号基线引用原benchmark结果。',
'E04':'ACT、π0.5及多种基础策略；无触觉退化与ALTER固定数据改进。',
'E05':'ViTacFormer、RDP、Tactile-VLA、π0.5、EgoScale、π0.5+tactile；去触觉/形变/异步。',
'E06':'GR00T N1.7、LDA-1B、π0.5、同数据Dex版本；去/掩码触觉与训练组件。',
'E07':'π0.5、DP+tactile、3D DP+tactile、无门控；原表有个别次数/百分比冲突。',
'E08':'OpenVLA、StarVLA、π0.5、GR00T、ACP、ForceVLA、真实力GT；全身补偿消融。',
'E09':'九种共同FCT控制器的VLA配置；torque历史/预测/编码与骨干微调。',
'E10':'π0、π0.5、ForceVLA及US/F/阶段调制消融。',
'E11':'BC、DP、单孔/多孔TLA；ID/OOD孔形与公差。',
'E12':'原文视觉/触觉策略与RDP；无反射控制器版本；完整接口以原文为准。',
'B01':'同π0.5骨干无力+六种融合设计；π0、ForceVLA、ForceFlow作外部比较。',
'X01':'π0.5、Tactile-VLA、FTP-π0.5、FTP-1；编码器/未来预测/执行horizon消融。',
}
OPEN = {
'W11':('有代码与资源入口','https://github.com/NathanWu7/Tabero','环境/评测仓库可见，有数据/权重链接；版本和传感器绑定影响复现，未实际运行。'),
'W13':('有官方代码','https://github.com/ZZongzheng0918/TA-VLA','代码与effort字段可查；完整真机资产和统一评测器未完成核验。'),
'E01':('有代码与资源入口','https://github.com/fuse-model/FuSe','代码、26,866条轨迹和模型入口可查；未下载运行。'),
'E03':('有代码与资源入口','https://github.com/michaelyuancb/ftp1-policy','官方代码/模型/数据入口可查；各真机对象与硬件需自行搭建。'),
'E04':('有官方代码','https://github.com/neoteai/N0-VTLA','官方仓库与项目可查；NeoReal每任务资源完整性未运行核验。'),
'E10':('部分数据入口','https://github.com/VMVLab/ForceU-VLA','仓库与部分数据入口可查；操作者/受试者口径需进一步核对。'),
'W16':('项目页可查','https://compvla.github.io/','数据发布说明可查；试验次数和全部可运行资源未确认。'),
'E09':('项目页可查','https://opt2vla.github.io/','含评测记录和计分说明；未核验完整可复现代码/数据包。'),
'B01':('完整发布包待核验','https://forcebench-platform.github.io/','论文已发布；尚未确认完整代码、数据、权重和可运行环境。'),
}
# task, purpose, metric, condition (purpose is an editorial synthesis)
EXPERIMENTS = {
'W01':[
('按瓶','检验轴向接触与高度变化下的动作调整','任务成功率','20次；另有瓶型/高度泛化'),
('插头 / USB','检验受约束接触下对齐与纠偏','完整插入成功率','各20次；插头另设遮挡/不稳定插座'),
('擦白板','区分执行擦拭动作与真正清洁','擦拭动作成功、完全擦除','10次；不等于目标法向力跟踪'),
('削黄瓜','检验工具持续接触与加工质量','平均削皮长度、最少stroke','15次，每次15个stroke')],
'W02':[
('按瓶 / 取盘','检验不同接触阶段的混合力—位置操作','任务成功率','各20次独立试验'),
('清洁花瓶 / 擦板','检验持续接触与变化表面','任务成功率、定性接触表现','各20次；没有系统六轴跟踪表'),
('齿轮装配','检验装配约束下的接触执行','任务成功率','20次；对比同任务方法')],
'W03':[
('USB / 齿轮装配','检验精密接触与及时修正','成功率；齿轮平均峰值力','25 / 30次；频率消融'),
('翻盒','检验动态接触与冲击控制','成功率、平均峰值力','20次'),
('擦板','检验持续接触执行','成功率、组件消融','10次')],
'W04':[
('七类真机任务','分辨异步、力与记忆对操作的贡献','成功率、平均episode时长','各15次，同X-VLA骨干与数据划分'),
('Sweep / 频率补充实验','检验动作平滑与重规划响应','SPARC、tracking lag、成功','控制器100/200 Hz与实际重规划率分开')],
'W05':[
('恒力擦板','检验是否跟踪给定法向力','相对绝对误差；保护停机','参考40 N；75 N触发保护；每条件24–25次'),
('按钮 / 擦板高度OOD','检验位置变化后的力调节','成功率；擦板跟踪误差','高度比示教低6 cm'),
('插头近起点 PI-pro','检验视觉不可见孔位时的接触探索','插入成功率','近插座且腕相机不可见孔位'),
('旋转窗','检验长程约束与柔顺操作','分阶段成功率、过载现象','先抓把手再抵住窗框打开')],
'W06':[
('五任务ID / OOD','检验物理和视觉变化后的执行','成功率','每任务每条件30次；平均值排除分拣'),
('空 / 满罐力信号交换','检验动作是否依赖力而非仅视觉','离线轨迹MSE、Flip Rate','20条测试轨迹，固定视觉交换力'),
('削皮接触段','检验未来力/矩预测','Force MSE、Torque MSE','离线接触窗口；不是控制跟踪误差')],
'W07':[
('五单臂 / 四双臂任务','检验快速纠偏的任务表现','成功率、成功trial峰值/时间','每任务20次，同示教/初始分布/控制限制'),
('参考动作延迟实验','检验旧参考下纠偏能力','延迟变化后的任务与接触表现','实际延迟设置需按原文表读取'),
('未见物体','检验接触纠偏的泛化','任务成功与力表现','原文§IV-E；不与主表分母混用')],
'W08':[
('插头 / 环套柱','检验无人救援下自主接触完成','成功次数 / 30','60秒内就位并释放；禁止介入/重置/保护停机'),
('擦板','检验清洁及自主终止','成功次数 / 30','180秒内去除全部文字、抬起并停止'),
('执行时力反馈与在线学习','检验残差对实时wrench的利用','成功率、训练过程检查点','各在线变体30分钟；测试固定参数')],
}
for work in works:
    work['baseline']=BASELINES.get(work['id'],'详见原文实验设置，尚未逐项抽取。')
    title,url,note=OPEN.get(work['id'],('公开情况待核验',work['source'],'论文原文已核查；代码、数据、评测环境的完整公开情况尚未逐项确认，不等于未公开。'))
    work['openness']=dict(status=title,url=url,note=note)
    work['experiments']=[dict(task=a,purpose=b,metric=c,setting=d) for a,b,c,d in EXPERIMENTS.get(work['id'],[])]
    work['purpose']=work['summary']

documents=[]
for p in sorted(SOURCE.glob('*.md')):
    target=DIST/'documents'/p.name
    target.parent.mkdir(exist_ok=True)
    shutil.copy2(p,target)
    documents.append(dict(name=p.stem,url='documents/'+p.name))

data=dict(updated='2026-10-15',groups=GROUPS,works=works,benchmarks=benchmarks,extraRelations=EXTRA,features=FEATURES,documents=documents)
(DIST/'data.js').write_text('window.RESEARCH_DATA = '+json.dumps(data,ensure_ascii=False,indent=2)+';\n',encoding='utf-8')
print(json.dumps(dict(works=len(works),benchmarks=len(benchmarks),sources=len(documents),missingNotes=[w['id'] for w in works if not w['notes']]),ensure_ascii=False))
