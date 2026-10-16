# coding: utf-8
"""Normalise source-backed research records and task-level cross references."""
import json
import re
from pathlib import Path

ROOT=Path(__file__).resolve().parent
DATE='2026-10-16'

TASK_GROUPS=[
 dict(id='precision',name='短时接触与精密操作',description='连接器、插孔和按钮：接触对齐、就位和终点判断。',color='#24768c',icon='insertion'),
 dict(id='surface',name='持续接触与工具加工',description='擦拭、削切和打磨：持续接触、作用力与加工质量。',color='#3868a6',icon='wipe'),
 dict(id='assembly',name='多阶段装配与机构操作',description='齿轮、螺纹、门与锁：约束变化和连续接触决策。',color='#8d6c3b',icon='assembly'),
 dict(id='grasp',name='轻柔夹持与灵巧操作',description='易碎物、滑移、多指操作：夹持力、稳定性和无损完成。',color='#7562a9',icon='grasp'),
 dict(id='reason',name='物理属性与力反馈决策',description='重量、硬度和阻力：分开看离线感知与闭环决策。',color='#377b60',icon='weigh'),
 dict(id='special',name='专业操作与交互资源',description='超声、全身接触、采集和表示评测：保留方法边界。',color='#63738a',icon='medical'),
]
# Matching only indexes explicitly named tasks; it does not invent task protocols.
TASKS=[
 ('usb','USB 插入','precision',r'USB|usb'),
 ('plug','插头与充电器插接','precision',r'插头|充电|插座|power plug|plug insertion'),
 ('peg','插销与孔配合','precision',r'插孔|插销|孔形|方.*插入|块插入|peg|Insert Hole'),
 ('tube','管与吸头插接','precision',r'管插入|吸头|Insert Tube|HDMI'),
 ('key','钥匙插拔','precision',r'钥匙|Pull.out Key|key insertion'),
 ('press','按压与盖章','precision',r'按瓶|按压|按钮|按泵|急停|盖章|stamping|Stove Press'),
 ('whiteboard','擦白板','surface',r'擦白板|擦板|擦拭白板|whiteboard|board eraser'),
 ('curved','曲面与表面擦拭','surface',r'花瓶|曲面|擦盘|表面|圆周擦拭|Surface|surface wiping|Wipe'),
 ('peel','削皮与切割','surface',r'削皮|削黄瓜|切割|切片|芒果|chopping|peeling'),
 ('assembly','齿轮与螺纹装配','assembly',r'齿轮|螺母|螺纹|螺丝|screw|thread|Nut Thread'),
 ('articulated','开门、抽屉与锁扣','assembly',r'抽屉|开门|旋转窗|锁|搭扣|拧盖|翻盖|开盖|Faucet|Drawer|Stove Turn'),
 ('fragile','易碎 / 无损抓放','grasp',r'鸡蛋|华夫|果酱|无变形|易碎|轻柔|无损|gentle|fragile'),
 ('grasp','稳定抓取与滑移','grasp',r'抓取|抓放|夹持|Lift |抓稳|拆杯|杯子|抗滑|箱内|装箱|dense packing|slip|grasp|pick.and.place'),
 ('dex','多指与手内操作','grasp',r'翻页|洗牌|鞋带|多物体|灵巧|手内|转动|旋转|重定向|reorient|in.hand'),
 ('deform','柔性与双臂协作','grasp',r'围巾|拉链|明信片|叠书|耳机|挤膏|折|soft'),
 ('property','物理属性感知与推理','reason',r'重量|重心|硬度|材质|粗糙|属性|语义|分类|问答|分拣|阻力|reason|Weight|CoM|Grasp Classify'),
 ('pipette','移液与专业接触','special',r'移液|吸液|试管|pipett|syringe'),
 ('pour','倾倒与液体操作','special',r'倒液|倾倒|倒水|pour|Pour'),
 ('medical','超声与医学成像','special',r'超声|切面|肝|肾'),
 ('body','全身接触与搬推','special',r'搬箱|推箱|全身|移动|whole.body'),
 ('representation','触觉表示与跨传感器','special',r'跨传感器|表示|零样本触觉|线性探测|分类|深度|检索|传感器迁移|力定位'),
]

def txt(value):
    if isinstance(value,list):return '；'.join(str(v) for v in value)
    return str(value or '')

def load(name,default=None):
    p=ROOT/'research'/name
    return json.loads(p.read_text(encoding='utf-8-sig')) if p.exists() else (default or {})

def normalise(raw,index,prefix):
    w=dict(raw)
    w['id']=raw.get('id') or f'{prefix}{index:02d}'
    w['name']=raw.get('name') or raw.get('short') or raw.get('shortName')
    w['fullTitle']=raw.get('fullTitle') or raw.get('title') or w['name']
    w['arxiv']=raw.get('arxiv')
    sources=raw.get('sources') or []
    w['source']=raw.get('source') or (sources[0] if sources else 'https://arxiv.org/abs/'+w['arxiv'] if w.get('arxiv') else raw.get('project',''))
    w['github']=raw.get('github') or raw.get('repo')
    category=raw.get('category','')
    w['kind']=raw.get('kind') or ('VLA / VTLA + Benchmark' if category=='tactile-vla-benchmark' else 'VLA / VTLA' if category=='tactile-vla' else '表示学习 / 语言理解' if 'representation' in category or 'language-not' in category else '评测资源' if 'benchmark' in category or 'simulator' in category or raw.get('id') in ['C10','C11','C12','C14'] else '硬件与感知资源' if raw.get('id') in ['C05','C13','C20'] else '基础策略（非VLA）')
    w['family']=raw.get('family') or ('touch' if category.startswith('tactile-vla') else 'dex' if 'policy' in category else 'related')
    w['signal']=raw.get('signal') or '见原文'
    w['role']=raw.get('role') or ('触觉反馈' if 'VLA' in w['kind'] or '策略' in w['kind'] else '前序工作')
    w['platform']=raw.get('platform') or txt(raw.get('setting')) or '本轮未逐项抽取'
    w['actionOutput']=raw.get('actionOutput') or raw.get('action') or raw.get('output') or '本轮未逐项抽取'
    w['summary']=raw.get('summary') or raw.get('purpose') or w['fullTitle']
    w['purpose']=raw.get('purpose') or w['summary']
    w['tasks']=txt(raw.get('tasks'))
    w['metrics']=txt(raw.get('metrics')) or '本轮未逐项抽取'
    w['trials']=txt(raw.get('trials')) or '测试次数未核实'
    w['baseline']=txt(raw.get('baseline') or raw.get('baselines') or raw.get('comparisons')) or '完整对照本轮未逐项抽取'
    w['scope']=raw.get('scope') or '扩展相关'
    w['domains']=raw.get('domains') or (['离线'] if any(x in w['kind'] for x in ['表示','理解']) and '真机' not in w['platform'] else ['仿真','真机'] if '仿真' in w['platform'] and '真机' in w['platform'] else ['仿真'] if '仿真' in w['platform'] else ['真机'])
    w['evidence']=raw.get('status') or raw.get('evidence') or '论文 / 项目核查'
    w['locators']=raw.get('locators') or [txt(raw.get('locator')) or '原文Experiments部分；细分定位待补']
    w['openness']=raw.get('openness') if isinstance(raw.get('openness'),dict) else dict(status='有官方代码入口' if w.get('github') else '完整发布情况待核验',url=w.get('github') or raw.get('project') or w['source'],note=txt(raw.get('benchmark')) or '论文或代码入口不等于完整评测环境已可运行。')
    w['warning']=raw.get('warning') or ('相邻方法 / 资源，不作为带力VLA本体计数。' if 'VLA' not in w['kind'] else '不同任务、对象、控制器和评分协议的成功率不能直接合并排行。')
    w['experiments']=raw.get('experiments') or []
    if raw.get('figure'):
        f=raw['figure'];w['image']=dict(url=f['url'],caption=f.get('caption','')+'；'+f.get('locator',''),source=f.get('sourceUrl',w['source']))
    w['notes']=raw.get('notes') or '\n'.join([w['fullTitle'],txt(raw.get('benchmark')),txt(raw.get('publication')), '原文定位：'+txt(w['locators']), '核查来源：'+' '.join(sources or [w['source']])])
    w['sensorOrigin']=raw.get('sensorOrigin') or ('真实F/T传感器' if 'F/T传感器' in raw.get('sensorSource','') or 'OptoForce' in raw.get('sensorSource','') else infer_sensor(w))
    return w

def infer_sensor(w):
    s=w['signal']
    if any(k in s for k in ['部署不','训练期','训练用','训练含']):return '仅训练期触觉 / 力'
    if any(k in s for k in ['内部','估计','残差估力','关节 torque','关节torque','关节 torque']):return '机器人内部估计 / 关节力矩'
    if any(k in s for k in ['图像','光学','DIGIT','GelSight','视频']):return '触觉图像'
    if any(k in s for k in ['压力','阵列','taxel','3D力','指端','指尖']):return '指尖力 / 压力阵列'
    if any(k in s for k in ['F/T','wrench','六轴']):return 'F/T读数（测量链待核验）'
    return '其他 / 待核验'

def enrich(data):
    works=data['works']; benches=data['benchmarks']
    # Extract verified locators from the existing detailed notes.
    provenance={}
    for p in ROOT.parent.glob('*详细版.md'):
        for line in p.read_text(encoding='utf-8').splitlines():
            m=re.match(r'\| ((?:W|E)\d{2}) \|.*\| ([^|]+) \|$',line)
            if m and ('§' in m.group(2) or 'Table' in m.group(2)):provenance[m.group(1)]=m.group(2).strip()
    audit={r['id']:r for r in load('arxiv_audit.json',[]) } if isinstance(load('arxiv_audit.json',[]),list) else {}
    for w in works:
        m=re.search(r'(\d{4}\.\d{4,5})',w['source']);w['arxiv']=m.group(1) if m else None
        w['fullTitle']=re.sub(r'^\[[^]]+\]\s*','',audit.get(w['id'],{}).get('title',w['name']))
        w['locators']=[provenance.get(w['id'],'原调研笔记中的实验章节与表格；见下方来源')]
        w['kind']='评测资源' if w['id']=='B01' else '相邻系统（非标准VLA）' if w['id'] in ['W17','W18','E11','E12'] else 'VLA / VTLA' if w['id'] not in ['E01'] else '基础策略 + VLA实验'
        w['sensorOrigin']=infer_sensor(w)
        w['actionOutput']='显式目标力 + 运动' if w['id'] in ['W02','W05','W09','W11','E09'] else '未来力预测 + 运动（非目标力跟踪）' if w['id'] in ['W06','W13','W12'] else '运动动作；力用于观测 / 纠偏'
        w['actionMode']='显式目标力' if w['id'] in ['W02','W05','W09','W11','E09'] else '力辅助运动 / 预测'
        if w['id']=='W01':w['sensorOrigin']='机器人内部估计 / 关节力矩'
        if w['id']=='W05':w['sensorOrigin']='真实F/T传感器'
        if w['id']=='W06':
            w['sensorOrigin']='真实F/T传感器'
            w['actionOutput']='动作chunk + 目标力chunk + 接触概率；高速导纳控制跟踪目标力'
            w['actionMode']='显式目标力'
            w['locators'].append('§III-B Eq.(2)、Figure 2：desired-force chunk；§V预测误差不等于跟踪误差')
    for filename,prefix in [('primary_additions.json','P'),('tactile_additions.json','T'),('contact_additions.json','C'),('priority_additions.json','R')]:
        rows=load(filename).get('works',[])
        for i,raw in enumerate(rows,1):
            w=normalise(raw,i,prefix)
            if any((w.get('arxiv') and w['arxiv']==a.get('arxiv')) or w['name']==a['name'] for a in works):continue
            bid='suite-'+w['id'].lower()
            if w['name']=='UniVTAC':
                w['relations']=[dict(benchmark='univtac',type='proposes',label='提出平台与Benchmark',domain='仿真',note='八任务闭环协议；平台、编码器与benchmark分开。')]
                works.append(w)
                continue
            benchmark=raw.get('benchmark')
            if isinstance(benchmark,dict):benchmark=txt(benchmark.get('name'))+'；'+txt(benchmark.get('source'))
            resource=any(x in w['name'] for x in ['OpenViTac','TacBench','TacSL','ManiFeel','Tactile Gym','TACTO'])
            bkind='公开评测 / 仿真框架' if resource else '论文自建任务集' if w['kind'] in ['VLA','VLA / VTLA','VTLA基础策略','基础策略（非VLA）'] else '论文评测 / 配套资源'
            benches.append(dict(id=bid,name=w['name'] if resource else w['name']+' 评测方案',kind=bkind,domain=' + '.join(w['domains']),focus=w['purpose'],detail=txt(benchmark) or w['notes'],source=w['source'],tasks=raw.get('tasks') if isinstance(raw.get('tasks'),list) else w['tasks'].split('、')))
            w['relations']=raw.get('relations') or [dict(benchmark=bid,type='self',label='论文评测方案',domain=' + '.join(w['domains']),note=txt(benchmark) or '使用关系见原文，不能自动认定复用统一benchmark。')]
            w['actionMode']='显式目标力' if '显式目标力' in w['actionOutput'] and '非显式' not in w['actionOutput'] else '无动作输出' if any(x in w['kind'] for x in ['表示','理解']) else '力辅助运动 / 预测'
            works.append(w)
    attention=load('attention.json'); records=attention.get('works',[])
    for name in ['attention_new.json','attention_additions.json','priority_attention.json']:
        more=load(name);records.extend(more.get('works',[]) if isinstance(more,dict) else more)
    for w in works:
        candidates=[r for r in records if r.get('workId')==w['id'] or r.get('workId')==w['name'] or (r.get('arxiv') and re.sub(r'v\d+$','',str(r['arxiv']))==w.get('arxiv')) or r.get('title')==w.get('fullTitle')]
        r=candidates[-1] if candidates else {}
        if r.get('title'):w['fullTitle']=r['title']
        w['attention']=dict(citations=r.get('citations'),stars=r.get('stars'),forks=r.get('forks'),citationSource=r.get('citationSource'),citationRecord=r.get('citationRecord'),githubSource=r.get('githubSource'),date=r.get('date') or DATE,provider=r.get('provider') or 'OpenAlex',googleScholar=None,matchStatus=r.get('matchStatus') or '本轮未取得可用计数')
        if r.get('github'):w['github']=r['github']
        if w['id']=='C08':
            w['relatedRepo']=w.get('github');w['github']=None
            w['attention']['stars']=None;w['attention']['forks']=None;w['attention']['githubSource']=None
            w['warning']+=' 官网关联仓库对应Robot Synesthesia及其TouchDex基线，不能把整库星标归为该论文独立使用量。'
        if w['id'] in ['C06','C07']:w['repoNote']='Sparsh-skin / Sparsh-X 共享官方仓库，不把计数相加。'
        if w['id']=='C10':w['repoNote']='IsaacGymEnvs的TacSL分支，通用平台仓库的Stars不归为TacSL独立关注度。'
        w.setdefault('github',None)
        w.setdefault('actionMode','力辅助运动 / 预测')
        if w['id'] in ['C01','C03','C18']:
            w['actionMode']='显式目标力 / 力控参数'
        if w['kind']=='评测资源':w['actionMode']='评测 / 仿真接口（非策略）'
        if w['kind']=='硬件与感知资源':w['actionMode']='硬件与下游控制（非VLA）'
        if w['kind']=='表示学习 / 语言理解':w['actionMode']='表示与下游任务（非VLA）'
        if w['name']=='Sparsh / TacBench':
            w['domains']=['离线','真机']
            w['trials']='六任务中多数离线probe；bead maze为物理操作。各测试分母本轮未逐项核实。'
    original_task_details={
      'W07':'五单臂：翻物、USB、开柜、按键、擦板；四双臂：拔插头、插头插入、开抽屉、擦板',
      'W13':'接触五项：按键、充电器插入、USB插入、插座拔出、门把转动；常规五项：抓放瓶、倒液、堆方块、推到目标、开抽屉',
      'E03':'UniVTAC六项：Lift Bottle、Pull-out Key、Lift Can、Put Bottle、Insert Hole、Insert Tube；真机：气球、装配、拧盖、翻书、擦盘；未见传感器：Hanoi插入、USB、擦白板',
      'E04':'UniVTAC八项（含抓取、钥匙、插孔、管/HDMI插入及分类）；NeoReal九项含插头、纸箱/毛巾折叠、瓶站立与装袋；NeoSim十二项另计',
      'E07':'四类约束锁定拆解（按压、扭转、滑动等）＋箱内抓取',
      'B01':'仿真八项：重量分拣、重心分拣、水龙头转动/方向、炉灶旋转/按压、抽屉拉动、螺母旋入；五项真机验证另计',
      'X01':'UniVTAC六项：Lift Bottle、Pull-out Key、Lift Can、Put Bottle、Insert Hole、Insert Tube；另四项真机任务'
    }
    for w in works:
        if w['id'] in original_task_details:w['tasks']=original_task_details[w['id']]
    categories=[dict(id=a,name=b,group=c,pattern=d) for a,b,c,d in TASKS]
    instances=[]
    for w in works:
        search=w['tasks']
        is_offline=w['domains']==['离线']
        for task in categories:
            if not re.search(task['pattern'],search,re.I):continue
            if is_offline and task['id'] not in ['representation','property']:continue
            ex=next((e for e in w['experiments'] if re.search(task['pattern'],e.get('task',''),re.I)),None)
            instances.append(dict(id=w['id']+'-'+task['id'],work=w['id'],task=task['id'],label=ex['task'] if ex else task['name'],purpose=ex.get('purpose',w['purpose']) if ex else w['purpose'],success=ex.get('success','任务级成功判据尚未单独抽取；请核对原文。') if ex else '任务级成功判据尚未单独抽取；请核对原文。',metrics=ex.get('metric',w['metrics']) if ex else w['metrics'],setting=ex.get('setting',w['trials']) if ex else w['trials'],source=ex.get('source',w['source']) if ex else w['source'],locator=ex.get('locator','；'.join(w['locators'])) if ex else '；'.join(w['locators']),level='逐实验已抽取' if ex else '已确认任务覆盖；协议见论文级记录',offline=is_offline))
    # Original evaluation figures, linked directly to authors/arXiv with attribution.
    images={
        'precision':dict(url='https://arxiv.org/html/2608.01402v1/images/plug_1.jpeg',caption='FACT 插头插入实验，Figure 1局部',source='https://arxiv.org/html/2608.01402v1#S1.F1'),
        'surface':dict(url='https://arxiv.org/html/2610.14854v1/figures/DEFT_VLA_task_montage_revised_slide1.png',caption='DEFT-VLA 任务阶段图，Figure 4（含擦板）',source='https://arxiv.org/html/2610.14854v1#S4'),
        'grasp':dict(url='https://arxiv.org/html/2610.19155v1/randomness_v7.png',caption='FACT 灵巧手真机评测随机化，Figure 4',source='https://arxiv.org/html/2610.19155v1#S5'),
    }
    for g in TASK_GROUPS:g['image']=images.get(g['id'])
    used={i['task'] for i in instances};categories=[t for t in categories if t['id'] in used]
    for t in categories:t.pop('pattern',None)
    data.update(updated=DATE,originalSnapshot='2026-10-15',taskGroups=TASK_GROUPS,taskTypes=categories,taskInstances=instances,attentionMethodology=attention.get('methodology',{}))
    # Physical embodiment and signal form are distinct from model encodings and sensor origin.
    forms=json.loads((ROOT/'research'/'embodiment_force_forms.json').read_text(encoding='utf-8'))
    profiles={r[0]:dict(zip(forms['columns'][1:],r[1:])) for r in forms['records']}
    for w in works:
        profile=profiles.get(w['id'],dict(embodimentBrief='本体类型待核实',robotModel=w['platform'],effectorModel='末端执行器型号未核实',forceBrief='原始信号形式待核实',forceDetail=w['signal']))
        w['physicalProfile']={**profile, 'source':forms['sourceOverrides'].get(w['id'],dict(url=w['source'],locator='；'.join(w['locators'])))}
    from selection import apply_selection
    from taxonomy import apply_taxonomy
    return apply_taxonomy(apply_selection(data))
