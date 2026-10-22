"""Register five source-reviewed VLA papers in the existing catalogue pipeline.

The original priority rules stay unchanged. Run from any directory, then run
prepare_data.py to rebuild the public catalogue. All updates are idempotent.
"""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent
DATE = '2026-10-22'


def read(name):
    return json.loads((ROOT / name).read_text(encoding='utf-8-sig'))


def write(name, value):
    (ROOT / name).write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')


def merge_tsv(name, rows, separator='\t'):
    path = ROOT / name
    keys = {r.split(separator, 1)[0] for r in rows}
    lines = [s for s in path.read_text(encoding='utf-8-sig').splitlines()
             if s.split(separator, 1)[0] not in keys]
    path.write_text('\n'.join(lines + rows) + '\n', encoding='utf-8')


def task(name, purpose, metric, setup, condition, scoring, locator, mode='真机', comparison=None):
    return dict(task=name, purpose=purpose, metric=metric, setting=setup,
                conditions=condition, scoring=scoring, locator=locator,
                mode=mode, comparison=comparison)


papers = []

# N01: the appendices specify which wrist is actually consumed and which task
# really requires two robot arms. A bimanual platform alone is not sufficient.
fm_setup = 'AgiBot G1双臂＋两指夹爪；腕部六维力传感器100 Hz，模型读取右腕力历史。每方法每任务18次。'
fm = dict(id='N01', name='FM-VLA', arxiv='2607.18231', first='2026-07-20',
          fullTitle='FM-VLA: Force-based Memory for Vision-Language-Action Models in Contact-Rich Manipulation',
          category='gripper-wrench', project='https://qft-333.github.io/FM-VLA/',
          github='https://github.com/qft-333/FM-VLA',
          signal='右腕六维力／力矩历史', sensorOrigin='真实F/T传感器',
          profile=['双臂＋两指夹爪', 'AgiBot G1；每臂7自由度', '两组单自由度夹爪', '腕部六维力／力矩',
                   '两腕装有六维传感器；模型使用右腕三维力＋三维力矩的历史，不把双腕拼成12维输入。'],
          summary='记住过去的接触事件，测试机器人能否找到隐藏物块、按指定次数按钮或擦指定次数。',
          objective='将六维力的历史压缩成少量记忆信息，让VLA根据已经发生的接触决定下一步。',
          actionOutput='输出双臂和夹爪的动作；力用于记忆接触过程，不输出目标力。',
          baseline='π0.5无历史版本、重新实现的π-MEM视觉记忆、基于π0.5重新实现的TA-VLA；另比较仅力历史、仅状态历史及不同记忆编码器。',
          metricSummary='三项任务各算成功率；另比较模型计算一次动作需要多久。力曲线用于说明接触过程。',
          result='三项任务的平均成功率为83.3%，视觉记忆对照为53.7%；提升主要来自按次数按钮和擦拭。',
          limitation='每任务18次，主要测试记忆接触次数；没有用力误差或最大接触力给各方法评分。',
          sections=['§4；Table1–2；Fig.4', 'Appendix B、D–E'],
          openStatus='官方代码已公开', openNote='官方仓库提供实现与使用说明；真机任务由作者自建。',
          scholar=(5, '9966605111508553898'), openalex='W7169875807',
          figure=('2607.18231v1/teaser_v1.png', 'FM-VLA接触记忆任务示意，原文Figure 1'),
          tasks=[
              task('揭杯寻找隐藏物块', '检查是否记得已经查看过哪个杯子，并完成双臂分工。', '成功率（完整完成／失败）',
                   fm_setup+'物块藏在前杯、后杯各9次。',
                   '右臂依次揭开杯子，左臂取走物块，右臂放回最后揭开的杯子；同一杯子不能重复查看。',
                   '上述步骤全部完成才记成功，成功次数除以18；不能只因找到物块就算完成。', '§4.1–4.2；Appendix B.1–B.2'),
              task('按指定次数蓝色按钮', '检查能否利用接触历史记住已经按了几次。', '成功率（次数准确并停止／失败）',
                   fm_setup+'要求按1、2、3次，各测6次；本任务用右臂操作。',
                   '必须按出按钮的咔嗒声才算一次，恰好达到指令次数后张开夹爪停止；少按、多按都失败。',
                   '按规定次数完成并停止的次数除以18；不是按接触力大小评分。', '§4.1–4.2；Appendix B.1–B.2'),
              task('按指定次数擦碗', '检查是否能记住已经完成几轮接触擦拭。', '成功率（轮数准确并停止／失败）',
                   fm_setup+'要求擦1、2、3轮，各测6次；右臂持海绵。',
                   '完整来回擦一次算一轮，每轮覆盖碗内左右两侧且中途不能失去接触；完成指定轮数后松开海绵停止。',
                   '完整轮数和停止动作都正确才记成功；不按擦掉多少污渍或力误差评分。', '§4.1–4.2；Appendix B.1–B.2')],
          comparisons=[
              ['力记忆比只看当前画面或记住过去画面更有效吗？', 'FM-VLA／π0.5／π-MEM／重新实现的TA-VLA', '三项接触记忆任务',
               '使用同一任务数据和训练安排；TA-VLA改为π0.5基础模型后比较', '各任务成功率；动作计算耗时',
               '区分力历史、视觉历史和短时间力窗口的作用。', 'TA-VLA为本文重新实现版本，不是直接引用原论文成绩。', '§4.1–4.4；Appendix D'],
              ['提升是否需要同时记住力和机器人状态？', '完整模型／仅力历史／仅状态历史／GRU或Q-Former记忆', '三项接触记忆任务',
               '分别更换历史输入或记忆编码器，其他训练设置保持一致', '各任务成功率',
               '单独去掉输入，检查提升来自哪部分记忆。', '这是方法内部对照，不另列成新的操作任务。', '§4.3；Table1；Appendix E']])
papers.append(fm)

# N02: nine real evaluation conditions, not six task names collapsed together.
tf_metric = '成功率；一次完成比例；每次最大接触力的平均值；平均完成时间'
tf_score = '完整插入才算成功；第一次就完成另计一次完成比例。两种比例越高越好，平均完成时间越短越好；力的比较见下方。'
tf_setup = 'Franka Panda＋Franka两指夹爪＋DIGIT触觉图像；插入前已夹住零件，不测试抓取。'
tf = dict(id='N02', name='TacFiLM', arxiv='2603.14604', first='2026-03-15',
          fullTitle='Tactile Modality Fusion for Vision-Language-Action Models',
          category='gripper-touch', project='https://charliem7.github.io/projects/TacFilm/', github=None,
          signal='DIGIT指尖触觉图像', sensorOrigin='触觉图像',
          profile=['单臂＋平行夹爪', 'Franka Emika Panda', 'Franka hand；安装DIGIT触觉传感器', '指尖视触觉图像',
                   '模型输入DIGIT触觉图像；评测另记录接触力，不把输入标为腕部六维力。'],
          summary='在同一OpenVLA-OFT模型中比较触觉融合方式，同时评价是否完成、是否一次完成、用力和用时。',
          objective='用触觉信息调整视觉特征，让VLA更准确地处理插入和拉抽屉时的接触。',
          actionOutput='输出机械臂和夹爪动作；触觉帮助调整运动，不输出目标力。',
          baseline='同OpenVLA-OFT基础模型：无触觉、触觉特征拼接、交叉注意力、TacFiLM；另比较触觉编码器、融合位置和视觉变差的情况。',
          metricSummary='成功率；一次完成比例；最大接触力的平均值；平均完成时间；另做离线触觉识别与力估计测试。',
          result='四项常规测试的平均成功率为86.67%，无触觉对照为58.10%；最大接触力和用时也整体降低。',
          limitation='以插入和拉抽屉为主，插入前已经抓好物体；尚不能说明完整抓取装配流程或其他VLA模型有同样提升。',
          sections=['§4.1–4.3；Tables1–3', 'Fig.3–5；§5.1'],
          openStatus='项目页和论文公开', openNote='官网代码和数据标为待公开；操作任务为作者自建，离线编码器测试采用T3及TacBench。',
          scholar=(7, '16277709111848379163'), openalex='W7138099466',
          figure=('2603.14604v2/task_setup.png', 'TacFiLM插入和抽屉任务，原文Figure 3'), tasks=[],
          comparisons=[
              ['换一种触觉融合方式，是否更容易一次完成且减少硬推？', '无触觉／特征拼接／交叉注意力／TacFiLM', '圆销、USB、抽屉及新形状插入',
               '固定OpenVLA-OFT基础模型和训练步骤；按同一任务分别比较', tf_metric,
               '避免只看最终成功率，忽略反复调整、用力过大或耗时过长。', '不同任务各自比较，不能把孔隙或形状不同的结果当成同一难度。', '§4.1–4.2；Table1'],
              ['视觉变差或改变融合位置后是否仍然有效？', '不同融合位置／画面变暗80%／只更新一半画面', '圆销3 mm、五边形销3 mm',
               '按原文任务分别改变融合位置或相机条件，每种设置15次', tf_metric,
               '检查触觉是否能在视觉信息减少时保持操作表现。', '属于同任务的条件对照，不重复计为新的操作任务。', '§4.3；Table2'],
              ['哪种触觉编码器更适合读取接触信息？', 'T3／Sparsh-IJEPA／Sparsh-MAE／Sparsh-DINO', '离线旋转识别、接触识别和TacBench力估计',
               '对相同触觉样本提取特征，再训练识别或估计模块', '分类准确率；力估计误差',
               '用于选择编码器，不直接代表自主插入的完成效果。', '离线估计力不计入自主执行的力相关评测。', '§4.3；Table3']])
for shape, gap, familiar in [('圆销',3,True),('圆销',2,True),('方销',3,False),('五边形销',3,False),('方销',2,False),('五边形销',2,False)]:
    tf['tasks'].append(task(f'{shape}插入（{gap} mm孔隙）', '检查接触后能否调整对齐，并减少反复尝试和硬推。', tf_metric,
                            tf_setup+('每方法30次，属于训练相似条件。' if familiar else '每方法15次；使用训练中未见的销形状。'),
                            f'将{shape}完整插入对应底座；孔与销之间预留{gap} mm间隙，允许接触后调整再试。', tf_score, '§4.1–4.2；Table1'))
# Keep the paper's familiar tasks together in the reading order.
tf['tasks'][2:2] = [
    task('USB插入', '检查真实连接器接触后的对齐和恢复。', tf_metric, tf_setup+'每方法30次；训练相似条件。',
         '将已夹住的USB连接器完整插入端口，允许调整后再试。', tf_score, '§4.1–4.2；Table1'),
    task('拉开抽屉', '检查能否挂住把手并持续拉动。', tf_metric, 'Franka Panda＋Franka两指夹爪＋DIGIT；每方法30次；使用夹爪挂住绿色把手。',
         '夹爪钩住顶层抽屉的把手并完全拉开；首次直接拉开与调整后拉开分开记录。', tf_score, '§4.1–4.2；Table1')]
tf['tasks'][3]['scoring']=tf_score.replace('完整插入','完全拉开抽屉')
tf['tasks'].append(task('HDMI插入', '检查换成训练中没见过的连接器后能否完成。', tf_metric,
                        tf_setup+'每方法15次；从USB插入扩展到HDMI连接器。',
                        '将已夹住的HDMI连接器完整插入端口，允许调整后再试。', tf_score, '§4.1–4.2；Table1'))
tf['tasks'].append(task('触觉编码器离线识别与力估计', '检查触觉特征是否保留旋转、接触和力大小信息。',
                        '旋转和接触分类准确率；力估计误差（越小越好）',
                        '使用T3和Sparsh/TacBench中的离线测试；比较四种预训练编码器。',
                        '从保存的触觉样本判断旋转和接触状态，另预测力值并与参考值比较。',
                        '三项分类按判断正确的比例计分，越高越好；力估计用预测值与参考值的差距计分，越小越好。不是机器人自主操作评分。',
                        '§4.3；Table3', mode='离线', comparison=3))
papers.append(tf)

ut_setup = 'RealMan RM75B单臂＋三维打印平行夹爪＋两枚DM-Tac W；每方法每任务正常和有人为干扰各50次，在规定时间内完成。'
ut = dict(id='N03', name='UniTacVLA', arxiv='2606.31723', first='2026-06-30',
          fullTitle='UniTacVLA: Unified Tactile Understanding and Prediction in Vision Language Action Models',
          category='gripper-touch', project=None, github=None, signal='指尖深度和两个方向的剪切形变图像', sensorOrigin='触觉图像',
          profile=['单臂＋平行夹爪', 'RealMan RM75B', '三维打印平行夹爪；两枚DM-Tac W', '三通道触觉形变图像',
                   '每指记录深度形变、x方向剪切形变、y方向剪切形变；不是六维力读数。ALOHA式主从示教不算双臂协作。'],
          summary='在调整、擦拭、插入和齿轮装配中比较正常与有人干扰时的完成率，测试触觉预测和快速纠正动作的作用。',
          objective='同时理解当前接触、预测接下来触觉的变化，并用新反馈及时修正VLA生成的动作。',
          actionOutput='输出机械臂和夹爪动作，并根据实时及预测触觉修正动作。',
          baseline='π0、π0.5、基于π0.5重新实现的VTLA与TacVLA；另比较执行时无真实触觉、无触觉推理、无未来预测或无快速纠正的版本。',
          metricSummary='八项任务的成功率，正常与人为干扰分开统计；触觉预测和接触状态另用图示分析。',
          result='八项任务在正常与干扰条件下整体优于论文对照；USB的逐项设计对照中，完整模型成功率为62%，仅加入触觉输入为30%。',
          limitation='主要按完成率比较；没有报告自主执行的力误差或最大接触力，也未充分测试严重遮挡和不完整指令。',
          sections=['§4.1–4.3；Tables1–2', 'Appendix A、C'],
          openStatus='论文全文公开', openNote='论文提供平台、任务和实现说明；本轮未确认独立官方代码入口。',
          scholar=(10, '11625990079224437374'), openalex='W7166871254',
          figure=('2606.31723v1/setup.png', 'UniTacVLA硬件和任务，原文Figure 2'), tasks=[],
          comparisons=[
              ['预测触觉和快速纠正是否能应对执行中干扰？', 'UniTacVLA／π0／π0.5／重新实现的VTLA和TacVLA', '八项真机任务',
               '每任务分别比较正常与人为干扰，每种条件50次', '各任务成功率',
               '观察接触变化后还能否完成，而不是只看没有干扰的表现。', '主从示教设备不等于两个机器人臂共同完成任务。', '§4.1–4.2；Table1；Appendix A'],
              ['提升分别来自哪些设计？', '完整模型／仅触觉／去掉触觉推理、粗细预测或快速纠正／执行时不读真实触觉', 'USB无干扰测试；无真实触觉版本另测八项任务',
               '在相同基础模型中逐项加入设计；无真实触觉的版本仍在训练时用触觉监督', '任务成功率',
               '区分训练中学到的接触知识与执行时实时触觉反馈的作用。', '不能把训练时用触觉、执行时不用触觉的版本理解为完全无触觉训练。', '§4.3；Tables1–2']])
for name,purpose,condition in [
    ('调整铅笔并放入杯中','检查能否根据接触调整细长物体的朝向。','抓起铅笔，调整朝向并放入杯中。'),
    ('调整管子并放入管架','检查能否调整管子的角度并放到指定位置。','抓起管子，调整角度并放入管架。'),
    ('擦白板','检查表面位置变化后能否保持接触并擦净。','抓起白板擦并把白板擦干净。'),
    ('擦花瓶','检查曲面接触变化时能否持续擦拭。','抓起擦具并把花瓶表面擦干净。'),
    ('USB插入','检查遮挡和目标方向改变时能否接触对齐。','抓起USB并插入端口。'),
    ('两脚电源插头插入','检查能否在插接时纠正接触偏差。','抓起两脚插头并插入插座。'),
    ('大齿轮装配','检查轴方向变化时能否对齐大齿轮。','抓起大齿轮并装到对应齿轮轴上。'),
    ('小齿轮装配','检查较小零件接触时能否及时调整。','抓起小齿轮并装到对应齿轮轴上。')]:
    ut['tasks'].append(task(name,purpose,'成功率（完成／失败）',ut_setup,condition,
                            '按是否完成指定操作计成功率，正常和人为干扰分别计算；不按形变图像的大小给操作打分。', '§4.1–4.2；Table1；Appendix A.2'))
papers.append(ut)

tw_setup = '人形平台＋Wuji灵巧手＋JQ-Industries触觉手套；分别测试正常和人为干扰；原文称每任务100次评测，未明确两种条件如何分配。'
tw = dict(id='N04', name='TouchWorld', arxiv='2607.07287', first='2026-07-08',
          fullTitle='TouchWorld: A Predictive and Reactive Tactile Foundation Model for Dexterous Manipulation',
          category='dexterous', project='https://phanes-lab.github.io/TouchWorld-website/', github=None,
          signal='灵巧手触觉压力图像与近期触觉历史', sensorOrigin='指尖力 / 压力阵列',
          kind='含VLA的分层操作系统',
          profile=['人形平台＋灵巧手', '人形机器人平台', 'Wuji灵巧手；JQ-Industries触觉手套', '手部触觉压力图像',
                   '视觉语言模块拆解任务，动作策略读取图像形式的触觉，快速纠正模块读取近期触觉历史；不是腕部六维力VLA。'],
          summary='将任务规划、未来接触预测和快速触觉纠正分开，在六项真机操作中测试正常表现与受干扰后的完成能力。',
          objective='让视觉语言规划负责下一步做什么，用触觉预测和快速反馈处理滑移、对不齐及接触不稳。',
          actionOutput='先生成子任务，再输出灵巧手及机器人动作，并用触觉反馈修正。',
          baseline='π0.5、FTP-1、GR00T N1.7；另分别去掉任务规划、触觉世界模型、快速纠正和触觉输入。',
          metricSummary='六项真机任务成功率；另离线比较未来接触预测的准确程度。',
          result='六项任务的平均成功率为65.0%，人为干扰下为53.7%；论文最强对照FTP-1分别为49.3%和35.2%。',
          limitation='只在六项任务和当前触觉手套布局上验证；没有证明换传感器、换手型或更长流程也能保持提升。',
          sections=['§4.1–4.6；Tables1–3', 'Fig.3–4；§5'],
          openStatus='项目页和论文公开', openNote='项目页展示系统与实验；本轮未确认独立官方代码入口。',
          scholar=(15, '11872767412716213089'), openalex='W7167798204',
          figure=('2607.07287v2/task_setting.png', 'TouchWorld六项真机任务，原文Figure 4'), tasks=[],
          comparisons=[
              ['分层规划与触觉纠正是否比整体策略更能应对干扰？', 'TouchWorld／π0.5／FTP-1／GR00T N1.7', '六项真机任务',
               '相同任务分别测试正常和有人移动目标、干扰抓取等情况', '各任务成功率及六任务平均值',
               '把正常完成和受干扰后完成分开比较。', '不是以压力误差比较控制精度；同样没有说明所有任务都需要双臂配合。', '§4.1–4.3；Table1'],
              ['任务规划、预测和快速纠正分别有什么作用？', '完整系统／分别去掉子任务规划、触觉预测、快速纠正或触觉输入', '六项真机任务',
               '一次去掉一项设计，分别报告正常与干扰条件', '六任务平均成功率',
               '区分高层任务安排与局部接触调整的贡献。', '整套系统的提升不能只归于某一个模块。', '§4.4；Fig.5'],
              ['预测的未来接触与实际记录是否一致？', '触觉世界模型／直接复制当前触觉／按任务检索训练样本', '离线未来接触预测',
               '用未参与训练的轨迹，对齐预测片段与实际未来触觉片段', '接触时机判断准确率；接触区域和三维接触形状重合程度',
               '判断预测能否提供有用的未来接触参考。', '这是离线预测测试，不是自主执行中的用力评分。', '§4.5；Table2']])
for name,purpose,condition in [
    ('给花浇水','检查多步骤任务安排与接触操作能否连贯完成。','完成给花浇水的指令流程。'),
    ('清理桌面','检查能否按子任务持续整理场景。','完成桌面清理流程。'),
    ('杯子插入','检查精细接触时能否调整对齐。','把杯子插到目标位置。'),
    ('电源插头插入','检查接触遮挡下的精密插接。','将电源插头插入目标接口。'),
    ('擦锅','检查持续擦拭中能否保持稳定接触。','完成锅内擦拭操作。'),
    ('抽取纸巾','检查柔软物体抓取和拉取是否稳定。','完成纸巾抽取操作。')]:
    tw['tasks'].append(task(name,purpose,'成功率（完成／失败）',tw_setup,condition,
                            '按是否完成整项任务计算成功率，正常与干扰分别统计；原文未列出此任务更细的逐步判分标准。', '§4.1–4.3；Fig.4；Table1'))
tw['tasks'].append(task('未来接触的离线预测', '检查预测的接触时间和区域是否接近实际记录。',
                        '接触时机准确率；接触区域重合程度；三维接触形状重合程度',
                        '使用未参与训练的子任务片段；预测17帧，并与同轨迹实际未来片段对齐。',
                        '比较预测与记录中何时发生接触、接触在哪里，以及接触形状是否一致。',
                        '接触时机按判断正确的比例评分；重合程度按共同区域占两者合并区域的比例评分，三项都是越高越好。',
                        '§4.5；Table2', mode='离线', comparison=3))
papers.append(tw)

rt_setup = 'UR7e单臂＋XHand五指灵巧手；每指120个三维力测点。每方法每任务20次，允许自主重试，不允许人工纠正。'
rt = dict(id='N05', name='ReTouch', arxiv='2608.01824', first='2026-08-03',
          fullTitle='ReTouch: Empowering Contact-Rich Dexterous Manipulation with Online-Refined Tactile Prediction',
          category='dexterous', project=None, github=None, signal='五指密集三维力阵列', sensorOrigin='指尖力 / 压力阵列',
          profile=['单臂＋五指灵巧手', 'UR7e', 'XHand', '五指分布式三维力阵列',
                   '每指120个测点，每点记录三个方向的力；按手指和接触区域编码，不是腕部六维力。'],
          summary='执行过程中不断更新未来触觉和剩余动作，在七项真机任务中比较分步完成得分，并测试受干扰后的恢复。',
          objective='保留每根手指的局部接触信息，用最新触觉反复修正接下来将发生的接触和动作。',
          actionOutput='输出机械臂和灵巧手关节位置；执行途中更新剩余动作。',
          baseline='RDP、ViTacFormer、π0、π0.5、直接加入触觉的π0和π0.5、Tactile-VLA；另去掉预测、执行中更新或分区域触觉编码。',
          metricSummary='七任务平均完成得分；按钮按成功／失败，其余任务按完成阶段计分；另做离线触觉与动作预测检查。',
          result='七任务平均完成得分83.6%，最强平均对照65.2%；四种困难条件平均得分73.1%。这些百分数大多是分步得分，不是整项成功次数比例。',
          limitation='除按钮外，部分完成也得分，不能把83.6%理解为83.6%的任务完整成功；真机测试未报告独立用力成绩。',
          sections=['§4.1–4.4；Tables1–3', 'Appendix B.3–B.4、D.2–D.3'],
          openStatus='论文全文公开', openNote='正文和附录公开任务评分、测试划分及实现设置；本轮未确认独立官方代码入口。',
          scholar=(4, '2616597255828097126'), openalex='W7172398188',
          figure=('2608.01824v2/figure3.png', 'ReTouch七项真机任务，原文Figure 3'), tasks=[],
          comparisons=[
              ['执行中更新预测和动作，是否比一次生成整段动作更有效？', 'ReTouch／RDP／ViTacFormer／π0与π0.5及加触觉版本／Tactile-VLA', '七项真机任务',
               '使用共同训练数据池与动作接口；各方法按原文训练方式适配', '按阶段计算的任务得分，按钮为成功率',
               '比较完成程度，避免把做了一半的操作都视为同一种失败。', 'RDP和ViTacFormer按任务分别训练，VLA版本跨任务共同训练；不是完全相同的训练方法。', '§4.1–4.2；Table1；Appendix B–C'],
              ['变化和失去抓取后能否恢复？', 'ReTouch与论文对照模型', '擦白板换高度、玉米棒换位置、移液换光照、水瓶被向下拉落',
               '每种困难条件20次；水瓶稳定提起后，由同一实验者拉到脱手再让策略自主恢复', '对应任务得分',
               '把重新抓住物体的能力与原来能否抓稳区分开。', '困难测试只对应四项任务，不能扩展成全部七任务结果。', '§4.3；Table2；Appendix B.4'],
              ['触觉编码和未来动作预测是否准确？', '三项监督的触觉编码器／仅力重建；持续更新／一次预测', '离线编码器与预测测试',
               '相同100条保留轨迹，不参加训练；分别比较编码器与更新策略', '接触识别、力重建误差、接触分布；未来触觉相似程度和动作误差',
               '检查模型内部信息是否准确，帮助解释真机结果。', '离线力重建不是机器人自主用力的执行评分。', '§4.2；Appendix D.2–D.3；Tables5–6']])
rt['comparisons'].append([
    '收益来自未来触觉预测，还是执行中不断更新？',
    '完整模型／不更新整段动作／固定初始触觉预测／无未来触觉预测／异步延迟更新／无分区域触觉编码',
    '七项真机任务', '保留相同任务和评分，分别改变预测、更新安排或触觉编码',
    '七任务平均完成得分', '区分有无预测与预测是否及时更新这两件事。',
    '延迟更新版本使用完整模型的同一参数，其余删减版本分别训练。', '§4.4；Table3；Appendix D.1'])
for name,purpose,condition,score,extra in [
    ('移液器按压','检查抓取与按压深度控制。','抓住移液器并按下按钮。','抓住得0.4分；按下至少三分之一行程加0.3分；达到一半行程再加0.3分。','60秒时限。'),
    ('抓取水瓶','检查不同重量水瓶的提起与持稳。','提起水瓶并稳定保持。','提离原支撑面至少15 cm得0.5分，保持3秒再得0.5分。','60秒；另测稳定提起后被向下拉落再自主恢复。'),
    ('抓取玉米棒','检查多指抓取是否稳定且不滑落。','提起玉米棒，调整为稳定抓姿并保持。','提起得0.4分；达到稳定抓姿加0.3分；3秒不滑落再加0.3分。','60秒；另测训练区域之外的物体位置。'),
    ('海绵擦白板','检查持续接触的实际擦除效果。','抓住海绵并擦除白板字迹。','擦掉部分但仍有黑色痕迹得0.5分；无可见黑色痕迹再加0.5分。','60秒；另测未训练过的2.5和5 cm操作高度。'),
    ('按按钮','检查小按钮是否真正被触发。','按下按钮使指示灯亮起。','灯亮得1分，否则0分；20次平均值就是成功率。','60秒时限。'),
    ('开抽屉取烧杯','检查遮挡下的多步骤操作。','打开中层抽屉，取出透明烧杯并放好。','打开抽屉得0.5分；取出并放好烧杯再加0.5分。','120秒时限。'),
    ('移液到烧杯','检查吸液、移动和放液的连续完成程度。','用塑料滴管从量筒吸水，并转移到透明烧杯。','抓住滴管得0.3分；吸入液体加0.3分；移到烧杯上方并将所吸液体放入加0.4分。','120秒；另测投影仪制造的动态光照变化。')]:
    metric='成功率（指示灯亮／未亮）' if name=='按按钮' else '平均任务完成得分（可得部分分，越高越好）'
    rt['tasks'].append(task(name,purpose,metric,rt_setup+extra+'保护停止或无法恢复的越界会结束测试。',condition,
                            score+' 每次最高1分；20次取平均后换成百分数，七任务再各占同样权重求平均。', '§4.1；Appendix B.3–B.4；Tables1–2'))
rt['tasks'].extend([
    task('触觉编码器离线检查','检查压缩后的触觉是否保留接触区域和力信息。','接触识别准确程度；力重建差距；接触区域分布差距',
         '100条未参与训练的轨迹；相同编码器和训练量，比较仅力重建与三项监督。',
         '对保留样本重建各区域的接触、三维力和接触强度分布。',
         '接触识别综合考虑误报与漏报，得分越高越好；力大小和分布的差距越小越好，力方向一致程度及大小变化相关程度越高越好。',
         'Appendix D.2；Table5',mode='离线',comparison=3),
    task('未来触觉与剩余动作离线预测','检查接触后持续更新是否比固定初始预测更准确。','未来触觉特征相似程度；剩余动作的平均平方误差',
         '同100条保留轨迹；分别检查接触前后，在一段动作中的第4、8、12步更新。',
         '持续更新与一次预测使用相同测试片段，比较预测和实际未来触觉、参考动作的差距。',
         '未来触觉特征越相似越好；动作误差按预测与参考值之差的平方取平均，越小越好。不是自主执行时的用力控制误差。',
         '§4.2；Appendix D.3；Table6',mode='离线',comparison=3)])
papers.append(rt)


def register():
    additions=[]
    protocols=read('task_protocols_primary.json')
    reviews=read('verification_other_primary.json')
    modes=read('evaluation_modes.json')
    profiles=read('embodiment_force_forms.json')
    taxonomy=read('taxonomy.json')
    objectives=read('research_objectives.json')
    dates=read('publication_dates.json')
    comparisons=read('comparison_methods.json')
    sections=read('evaluation_sections.json')
    scholars=read('google_scholar.json')
    results=read('result_source_abstracts.json')
    highlights=read('evaluation_highlights.json')
    coordination=read('bimanual_evaluations.json')
    force=read('force_evaluation_tasks.json')
    attention={'works':[]}
    newids={p['id'] for p in papers}
    force['groups']=[g for g in force['groups'] if not any(t.split('-')[0] in newids for t in g['tasks'])]
    profiles['records']=[r for r in profiles['records'] if r[0] not in newids]
    metric_rows=[]; score_rows=[]; result_rows=[]; force_rows=[]; design_rows=[]; purpose_rows=[]
    seen_metrics=set()
    # Match the metric strings after the existing readability pass.
    import sys
    sys.path.insert(0,str(ROOT.parent))
    from review_data import readable
    existing_protocols={}
    for name in ('primary','tactile','contact'):
        existing_protocols.update(read('task_protocols_'+name+'.json')['works'])
    source_reviews={}
    for name in ('force_core','force_later','other_primary','other_resources'):
        source_reviews.update(read('verification_'+name+'.json')['works'])
    existing_tasks={f'{wid}-e{i:02d}':dict(t) for wid,ts in existing_protocols.items() for i,t in enumerate(ts,1) if wid not in newids}
    for wid,review in source_reviews.items():
        if wid in newids:continue
        for eid,update in review['taskUpdates'].items():
            existing_tasks[eid].update(update)
        for i,t in enumerate(review.get('additionalTasks',[]),len(existing_protocols[wid])+1):
            existing_tasks[f'{wid}-e{i:02d}']=t
    for line in (ROOT/'scoring_presentation.tsv').read_text(encoding='utf-8-sig').splitlines():
        if line and not line.startswith('#') and line.split('\t')[0] in existing_tasks:
            seen_metrics.add(readable(existing_tasks[line.split('\t')[0]]['metric']))
    for p in papers:
        wid=p['id']; source='https://arxiv.org/html/'+p['arxiv']
        raw={k:p[k] for k in ('id','name','arxiv','fullTitle','signal','sensorOrigin','summary','actionOutput','baseline','project','github')}
        raw.update(year=2026,kind=p.get('kind','VLA / VTLA'),family='touch',source=source,
                   purpose=p['summary'],platform='；'.join(p['profile'][:3]),role='利用力／触觉信息调整动作',
                   scope='核心相关' if wid=='N01' else '扩展相关',domains=['真机'],metrics=p['metricSummary'],
                   trials='；'.join(dict.fromkeys(t['setting'] for t in p['tasks'])),locators=p['sections'],
                   warning=p['limitation'],notes=p['fullTitle']+'\n原文已核对：'+'；'.join(p['sections'])+'\n'+p['limitation'],
                   openness=dict(status=p['openStatus'],url=p['github'] or p['project'] or source,note=p['openNote']),
                   benchmark='作者自建真机任务；任务、评分和对照见本论文。',
                   image=dict(url='https://arxiv.org/html/'+p['figure'][0],caption=p['figure'][1],source=source))
        additions.append(raw)
        if wid=='N02':
            raw['relations']=[
                dict(benchmark='suite-n02',type='self',label='论文自建真机评测',domain='真机',note='插入和拉抽屉任务由作者自建。'),
                dict(benchmark='suite-t08',type='adopts',label='仅离线触觉编码器力估计',domain='离线',
                     note='使用TacBench的力估计测试比较触觉编码器；不是用TacBench评价完整VLA自主操作。')]
        tasks=[]; updates={}; mode_tasks={}; moved=[]
        for i,t in enumerate(p['tasks'],1):
            eid=f'{wid}-e{i:02d}'
            entry={k:t[k] for k in ('task','purpose','metric','setting','conditions','locator')};entry['source']=source
            entry['scoringExplanation']=t['scoring']
            tasks.append(entry)
            updates[eid]={'review':dict(status='not_reported' if wid=='N04' and t['mode']=='真机' else 'verified',
                                       source=source,locator=t['locator'],note='按任务说明、评分及实验表整理；未将未报告的判分细节补写成事实。')}
            mode_tasks[eid]=dict(name=t['task'],modes=[t['mode']],source=source,locator=t['locator'])
            metric=readable(t['metric'])
            if metric not in seen_metrics:
                seen_metrics.add(metric);score_rows.append('\t'.join([eid,metric,t['scoring']]))
            purpose_rows.append(t['purpose']+'|'+t['purpose'])
            if t['comparison']:
                sections[eid]=dict(comparison=f"{wid}-comparison-{t['comparison']}",name=t['task']);moved.append(eid)
        protocols['works'][wid]=tasks
        reviews['works'][wid]=dict(checked=DATE,checkedSource=source,checkedSections=p['sections'],summary=p['result'],taskUpdates=updates)
        modes['works'][wid]={'tasks':mode_tasks}
        profiles['records'].append([wid]+p['profile'])
        profiles['sourceOverrides'][wid]=dict(url=source,locator='；'.join(p['sections']))
        for members in taxonomy['members'].values():
            if wid in members:members.remove(wid)
        taxonomy['members'][p['category']].append(wid)
        taxonomy['notes'][wid]=p['profile'][-1]
        objectives['objectives'][wid]=p['objective']
        dates[wid]=dict(firstPublicDate=p['first'],source='https://arxiv.org/abs/'+p['arxiv'],checked=DATE,dateBasis='arXiv v1 submission date',title=p['fullTitle'])
        comparisons['works'][wid]=p['comparisons']
        scholars['works'][wid]=dict(count=p['scholar'][0],source='https://scholar.google.com/scholar?cites='+p['scholar'][1],date=DATE,status='verified',title=p['fullTitle'],checkedVia='用户Edge浏览器Google Scholar结果；按论文标题匹配，不合并重复条目。')
        text=(ROOT/'new_candidate_sources'/f"{p['arxiv']}.txt").read_text(encoding='utf-8')
        start=text.find('Abstract',text.find('arXiv:'))
        abstract=text[start+8:text.find('1 Introduction',start)] if start>=0 else p['objective']
        results[wid]=dict(source='https://arxiv.org/abs/'+p['arxiv'],abstract=abstract)
        metric_rows.append(wid+'\t'+p['metricSummary'])
        result_rows.append('|'.join([wid,p['result'],p['limitation']]))
        force_rows.append('\t'.join([wid,'not_reported','；'.join(p['sections']),
                                    '已查看自主执行结果；离线触觉预测、力重建和示教采集不作为自主执行效果的力评分。']))
        design_rows.append('\t'.join([wid,'selected' if wid=='N02' else 'not_selected',
                                     '区分最终完成与一次完成，并独立比较接触力和用时。' if wid=='N02' else '已整理任务和对照；不因常规对照或任务覆盖面而单独标为值得参考。']))
        highlights['works'].pop(wid,None)
        oa=read('new_candidate_sources/openalex.json')[p['arxiv']]['results']
        matched=next(x for x in oa if x['id'].endswith(p['openalex']))
        record=dict(workId=wid,title=p['fullTitle'],arxiv=p['arxiv'],github=p['github'],
                    citations=matched['cited_by_count'],stars=None,forks=None,date=DATE,provider='OpenAlex',
                    citationSource='https://api.openalex.org/works/'+p['openalex'],citationRecord=matched['id'],
                    githubSource=None,matchStatus='原文标题与arXiv链接匹配；不合并不同发表版本')
        if wid=='N01':
            repo=read('new_candidate_sources/fm_github.json')
            record.update(stars=repo['stargazers_count'],forks=repo['forks_count'],githubSource='https://api.github.com/repos/qft-333/FM-VLA')
        attention['works'].append(record)
    force['groups'].extend([
        dict(tasks=['N01-e01','N01-e02','N01-e03'],status='reported',metrics=['自主执行中的接触力变化示例'],kind='execution',
             locator='§4.4；Fig.4',note='Fig.4给出各任务自主执行中选定方向的力变化；没有统一的力指标排序。',
             evaluatesAutonomousExecution=True,summary='用接触力变化说明机器人如何记住接触事件。',
             explanation=dict(method='把执行画面与某个方向的力曲线对齐，观察碰到物体、按钮按下或擦拭时的变化。',
                              comparison='用于解释任务行为；各方法正式按成功率比较，没有用力大小或力误差排高低。')),
        dict(tasks=[f'N02-e{i:02d}' for i in range(1,10)],status='reported',metrics=['每次最大接触力的平均值（N）'],kind='execution',
             locator='§4.1–4.2；Table1',note='按任务报告最大接触力的平均值；不把力与成功率合成总分。',
             evaluatesAutonomousExecution=True,summary='独立比较各方法是否用力过大。',
             explanation=dict(method='每次执行取最大的接触力，再求平均；完成相同任务时，平均最大力越小越好。',
                              comparison='同任务内可以按这项力指标比较方法；成功率和时间另列，没有力与成功率合成的总分。'))])
    highlights['works']['N02']=[dict(title='分别看最终完成、一次完成、用力和用时',taskIds=[f'N02-e{i:02d}' for i in range(1,10)],
                                        tasks='插销、USB、HDMI插入和拉抽屉',
                                        design='最终能完成与第一次就完成分别统计；同时比较最大接触力和完成时间。同一个OpenVLA-OFT基础模型只改变触觉融合方式。',
                                        why='能看出方法是否靠反复重试或硬推换来成功，而不只看最后成功率。',
                                        boundary='插入前已夹好物体；这套测试不评价抓取，也没有把四个指标合成总分。',
                                        source='https://arxiv.org/html/2603.14604',locator='§4.1–4.2；Table1')]
    coordination['works']['N01']=dict(type='cooperative',taskIds=['N01-e01'],description='揭杯找物块由右臂揭杯、左臂取物，随后右臂放回杯子；按钮和擦碗只用右臂，不算双臂协作任务。',
                                           sources=[dict(url='https://arxiv.org/html/2607.18231',locator='Appendix B.1–B.2')],checked=DATE,
                                           criterionReview=dict(cooperativeTaskConfirmed=True,platformOrIndependentExcluded=True,basis='任务1明确两臂分工，任务2和3为右臂操作。'))
    coordination['taskSetups']['N01-e01']=dict(description='右臂依次揭杯，左臂取物，右臂放回最后揭开的杯子。',source='https://arxiv.org/html/2607.18231',locator='Appendix B.1–B.2')
    policy=read('selection_policy.json')
    # The project confirms acceptance, but no publication month was verified.
    # Keep this in the resource note instead of inventing a publication date.
    policy['publicationEvidence'].pop('N02',None)
    additions[1]['openness']['note']='官网标注ECCV 2026已接收，代码和数据待公开；真机任务自建，离线编码器测试采用T3及TacBench。'
    write('selection_policy.json',policy)
    usage=read('resource_usage.json')
    usage['records'].setdefault('suite-t08',{})['N02']=[
        dict(label='复用内容',text='只采用TacBench的离线力估计测试，比较T3与三种Sparsh触觉编码器。'),
        dict(label='怎样评分',text='由保存的触觉样本估计力值，与参考值计算误差；误差越小越好。'),
        dict(label='比较用途',text='帮助选择用于TacFiLM的触觉编码器，结果见Table3。'),
        dict(label='适用范围',text='没有把完整VLA放入TacBench执行操作；插入和拉抽屉的真机评测另由作者自建。')]
    write('resource_usage.json',usage)
    for name,value in [('recent_additions.json',dict(checked=DATE,works=additions)),('task_protocols_primary.json',protocols),
                       ('verification_other_primary.json',reviews),('evaluation_modes.json',modes),('embodiment_force_forms.json',profiles),
                       ('taxonomy.json',taxonomy),('research_objectives.json',objectives),('publication_dates.json',dates),
                       ('comparison_methods.json',comparisons),('evaluation_sections.json',sections),('google_scholar.json',scholars),
                       ('result_source_abstracts.json',results),('evaluation_highlights.json',highlights),
                       ('bimanual_evaluations.json',coordination),('force_evaluation_tasks.json',force),('attention_additions.json',attention)]:
        write(name,value)
    merge_tsv('work_metric_summaries.tsv',metric_rows)
    merge_tsv('scoring_presentation.tsv',score_rows)
    merge_tsv('result_summaries.tsv',result_rows,'|')
    merge_tsv('force_evaluation_work_review.tsv',force_rows)
    merge_tsv('evaluation_design_review.tsv',design_rows)
    # Equal purposes intentionally map to themselves; avoid duplicate keys.
    merge_tsv('plain_task_purposes.tsv',list(dict.fromkeys(purpose_rows)),'|')
    print('Registered:', ', '.join(p['name'] for p in papers))


if __name__ == '__main__':
    register()
