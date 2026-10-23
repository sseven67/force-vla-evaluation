"""Reader copy only: preserve identifiers, names, citations and scoring facts."""
from pathlib import Path
import re

ROOT = Path(__file__).parent / 'research'

# Phrases, not broad substitutions of technical names or numerical units.
PHRASES = {
    '固定部署数据离线策略改进': '用已经收集的执行数据改进策略',
    '没有针对该项任务训练迁移': '不额外进行该项任务训练，直接用于',
    '不等于六轴逐时刻RMSE': '不代表逐时刻检查了六个方向的力误差',
    '跨任务汇总': '多个任务合在一起统计',
    '平台汇总': '同一机器人平台上的任务合在一起统计',
    '原文消融任务组': '原文用于组件对照的任务',
    '原文组件与频率消融任务': '原文用于比较组件和更新频率的任务',
    '消融子集尚未逐项对应，不自动套用全部五任务。': '这项组件对照具体用了哪些任务，尚未逐项确认；不能默认用了全部五项任务。',
    '消融实验': '去掉部分设计的对照测试',
    '消融': '去掉部分设计的对照',
    '同骨干模态消融': '在同一基础模型中逐项去掉感官输入的测试',
    '同骨干': '同一基础模型', '跨骨干': '不同基础模型之间',
    '原骨干': '原来的基础模型', '骨干': '基础模型',
    '模态消融': '逐项去掉感官输入的对照测试',
    '去接触视觉消融': '接触后停止输入视觉的对照测试',
    '去模态': '去掉某种感官输入', '单模态': '单一感官输入',
    '多模态': '多种感官信息', '感知模态': '感官输入',
    '输入模态': '输入信息类型', '模态组合': '感官输入组合',
    '模态互补': '不同感官信息互相补充', '模态': '信息类型',
    '反事实力输入': '保持其他输入不变，只替换力数据',
    '反事实力交换': '保持画面不变，交换力信号',
    '反事实真机分拣成功率': '机器人实际交换力输入后重新分拣的成功率',
    '反事实成功率': '实际替换输入后重新执行的成功率',
    '初态分布': '起始状态的随机变化范围',
    '初态随机': '随机改变起始位置和朝向', '随机初态': '随机改变起始位置和朝向',
    '初态': '起始状态', '同分布': '与训练时相同范围的条件',
    '已见分布': '与训练相似的条件', '未见分布': '训练中未见的条件',
    '几何泛化': '适应新形状的能力', '空间泛化': '适应新位置的能力',
    '跨物体泛化': '适应新物体的能力', '跨实例泛化': '适应同类新传感器的能力',
    '物体泛化': '适应新物体的能力', '孔形泛化': '适应新孔形的能力',
    '语言泛化': '理解新说法的能力', '物理泛化': '适应重量、摩擦等物理变化的能力',
    '泛化能力': '适应新物体或条件的能力',
    '泛化测试': '更换物体或条件后的测试', '泛化': '适应新条件的能力',
    '闭环成功率': '根据新反馈不断调整动作时的成功率',
    '闭环精密操作': '接触后继续根据反馈调整的精密操作',
    '闭环力控': '执行中根据测到的力调整动作',
    '闭环控制': '执行后读取新反馈，再调整动作',
    '闭环操作': '执行中不断读取新反馈并调整动作',
    '闭环': '执行中根据新反馈调整动作',
    '开环执行': '执行时不根据新反馈调整动作',
    '任务子集': '其中一部分任务', '子集': '其中一部分',
    '评测协议': '任务、评分和测试规则', '评分协议': '评分和测试规则',
    '任务协议': '任务和测试规则', '协议': '测试规则',
    '统一口径': '相同统计规则', '统计口径': '统计方式',
    '测试分母': '用于计算比例的测试总次数', '分母': '计算比例时的总次数',
    '标签预算': '带参考答案的数据量', '训练预算': '训练数据量和训练次数',
    '在线交互预算': '机器人实际交互的次数',
    '标注效率': '需要多少带参考答案的数据',
    '样本效率': '需要多少训练数据或交互',
    '数据效率': '用较少训练数据学习的效果',
    '感知回归': '预测连续数值', '几何回归': '预测位置、角度或形状',
    '法向力': '按向接触表面的力', '切向力': '沿接触表面的力',
    '剪切力': '沿接触表面的力', '法向加载': '沿垂直接触表面的方向施力',
    '切向': '沿接触表面的方向',
    '力过冲': '瞬间用力超过目标', '力振荡': '用力反复波动',
    '接触门控': '按接触情况决定是否使用触觉',
    '特权物理信息': '训练时可读取、实际执行时无法直接读取的物理信息',
    '潜变量': '模型内部特征', '表征': '模型提取的信息',
    '下游任务': '后续具体任务', '下游': '后续任务',
    '预握': '已握住',
    '动态随机化': '随机改变摩擦、质量等物理条件',
    '基线': '对照方法', 'long-horizon': '多步骤',
    '短动作段': '较短的一段动作',
    '先验': '预先学到的策略或知识',
    '执行低层': '底层控制器执行时',
    '底层伺服': '底层控制',
    '吞吐量': '单位时间完成的任务数',
    '标注预算': '带答案的训练数据量',
    '优化预算': '训练设置和训练次数',
    '多标注预算': '多种带答案的训练数据量',
    '7D外部关节扭矩估计': '7个关节的外部扭矩估计',
    'sim-to-real': '从仿真迁移到真机',
    '判定与任务要求：': '完成要求：', '计算与计分：': '计分：',
    '逐次判断是否完成任务，再以成功次数÷测试总次数计算比例；具体完成要求见本任务判定步骤。': '按上述要求判断每次是否成功；成功次数÷测试次数得到成功率。',
    '力另行比较。': '用力情况单独比较，不并入成功率。',
    '空间对齐表示': '在同一空间位置上对应视觉和触觉信息',
    '零样本迁移': '不额外训练就用于新任务',
    '没有针对该项任务训练测试': '不额外训练，直接测试',
    'marker特征': '触觉图像中的标记点变化',
    'tokens': '模型内部特征', 'token': '模型内部特征',
    'latent 模型内部特征': '模型内部特征',
    'latent tokens': '模型内部特征',
    '触觉语言对齐': '将触觉与语言描述对应起来',
    '协议明确': '测试和评分规则明确',
    '部分协议可查': '已找到部分测试和评分规则',
}

WORDS = {
    'OOD': '训练中未见的条件', 'ID': '与训练相似的条件',
    'wrench': '力与力矩', 'torque': '扭矩', 'effort': '关节用力读数',
    'Sim2Real': '仿真到真机', 'sim2real': '仿真到真机',
    'rollouts': '次完整测试', 'rollout': '完整测试',
    'episodes': '次完整测试', 'episode': '单次测试',
    'trials': '次测试', 'trial': '单次测试',
    'checkpoint': '训练得到的模型版本', 'checkpoints': '模型版本',
    'seed': '随机种子（用于重复不同随机过程）',
    'horizon': '每次生成或执行的动作步数',
    'chunk': '一段连续动作', 'chunks': '连续动作段',
    'marker': '触觉图像中的标记点', 'markers': '触觉图像中的标记点',
    'rubric': '评分规则', 'pixel': '像素', 'pixels': '像素',
    'home': '机器人起始位置', 'stroke': '次擦拭或削皮动作',
    'Encoder': '特征提取模块', 'release': '发布',
}

# Sentence-level fixes keep expanded terms from forming awkward phrases.
CLEANUPS = {
    '采用6其中一部分任务': '采用其中6项任务',
    'UniVTAC六其中一部分任务': 'UniVTAC中的六项任务',
    '执行中根据新反馈调整动作插入成功率': '机器人实际插入的成功率',
    '执行中根据新反馈调整动作抓取成功率': '机器人实际抓取的成功率',
    '执行中根据新反馈调整动作机器人力控输入': '机器人执行时用于调整动作的力输入',
    '执行中根据新反馈调整动作手内控制': '根据新反馈调整的手内操作',
    '执行中根据新反馈调整动作用力': '根据力反馈调整用力',
    '执行中根据新反馈调整动作决策': '根据新反馈继续作出操作决定',
    '完整仿真执行中根据新反馈调整动作评测': '模型在仿真中自主完成任务的评测',
    '25Hz夹爪执行中根据新反馈调整动作': '夹爪每秒根据新反馈调整25次',
    '执行中根据新反馈调整动作50次 / 设置': '每种设置自主执行50次',
    '真实传感器演示；正文明确为proof-of-concept，非标准化执行中根据新反馈调整动作benchmark。': '使用真实传感器做功能演示；用于展示能否实现，不是采用统一评分规则的自主操作评测。',
    '未使用的TacQuad细粒度其中一部分': '此前未用于训练的TacQuad细分类别数据',
    '不同一基础模型实验不合并成同一去掉部分设计的对照': '不同基础模型的实验分开比较，不能视为只改变了一个组件',
}


def plain(text):
    if not isinstance(text, str):
        return text
    for old, new in sorted(PHRASES.items(), key=lambda item: -len(item[0])):
        text = text.replace(old, new)
    for old, new in WORDS.items():
        text = re.sub(r'(?<![A-Za-z0-9_])' + re.escape(old) + r'(?![A-Za-z0-9_])', lambda _: new, text)
    text = text.replace('6D F/T', '六维力／力矩').replace('6D 力／力矩', '六维力／力矩')
    text = text.replace('3D力', '三维力').replace('力／力矩／力矩', '力／力矩')
    for old, new in CLEANUPS.items():
        text = text.replace(old, new)
    return text


def fields(obj, keys):
    for key in keys:
        if isinstance(obj.get(key), str):
            obj[key] = plain(obj[key])


def apply_plain_language(data):
    import json
    overrides = json.loads((ROOT / 'plain_copy.json').read_text(encoding='utf-8'))
    purpose_map = {}
    for line in (ROOT / 'plain_task_purposes.tsv').read_text(encoding='utf-8-sig').splitlines():
        if line.strip():
            old, new = line.split('|', 1)
            assert old not in purpose_map, old
            purpose_map[old] = new
    for work in data['works']:
        fields(work, ('summary', 'purpose', 'signal', 'actionOutput', 'role', 'warning', 'baseline', 'trials', 'classificationNote'))
        fields(work['researchObjective'], ('text',))
        fields(work.get('physicalProfile', {}), ('robotConfiguration', 'embodimentBrief', 'forceBrief', 'forceDetail'))
        fields(work['openness'], ('note',))
        for card in work['comparisonMethods']:
            fields(card, ('question', 'objects', 'tasks', 'controlled', 'evaluation', 'lesson', 'note'))
            card.update(overrides['comparisons'].get(card['id'], {}))
        for h in work['evaluationHighlights']:
            fields(h, ('title', 'tasks', 'design', 'why', 'boundary'))
        fields(work['resultSummary'], ('result', 'limitation'))
        if work['id'] in overrides['works']:
            for key, value in overrides['works'][work['id']].items():
                if key == 'objectiveText':
                    work['researchObjective']['text'] = value
                else:
                    work[key] = value
        for e in work['experiments']:
            original = e['purpose']
            assert original in purpose_map or original in purpose_map.values(), (e['id'], original)
            e['purpose'] = purpose_map.get(original, original)
            fields(e, ('metric', 'setting', 'method'))
            f = e['forceEvaluation']
            fields(f, ('summary', 'scopeNote'))
            fields(f.get('explanation', {}), ('method', 'comparison'))
            e.update(overrides['experiments'].get(e['id'], {}))
        for relation in work['relations']:
            fields(relation, ('label', 'note'))
    # Task comparisons store protocol copies; keep all views consistent.
    protocols = {e['id']: e for w in data['works'] for e in w['experiments']}
    for instance in data['taskInstances']:
        instance['protocols'] = [protocols[p['id']] for p in instance['protocols']]
    for b in data['benchmarks']:
        fields(b, ('focus', 'detail', 'reason', 'protocol', 'scope', 'release', 'verdict'))
        if b['id'].startswith('suite-') and b['id'][6:].upper() in overrides['works']:
            b['focus'] = overrides['works'][b['id'][6:].upper()]['summary']
    for relation in data['extraRelations']:
        fields(relation, ('note', 'label'))
    for feature in data['features']:
        fields(feature, ('title', 'text'))
    for group in data['groups']:
        fields(group, ('subtitle',))
    for group in data['taskGroups']:
        fields(group, ('description',))
    data['benchmarkAudit']['criteria'] = [
        '有明确的测试任务；离线的感知测试也可以构成基准。',
        '说明输入、测试条件和评分方法，让其他模型能用相同规则测试。',
        '提供对照结果或比较方法；作者自建、使用量少，也可以构成基准。',
        '是否公开代码、是否被其他团队使用，与有没有明确的评测规则分开记录。',
    ]
    return data
