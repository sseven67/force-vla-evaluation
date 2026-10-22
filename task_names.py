# coding: utf-8
"""Chinese task labels applied after source matching and task indexing."""
import re


TASK_TERMS = {
    'Pivot': '支点翻转', 'Cup Dispense': '按压取杯器',
    'Pick & Place': '抓取与放置', 'Lego排列': '乐高积木排列',
    'Square方形': '方形', 'Triangle三角': '三角形',
    'Hexagon六角': '六边形', 'Pentagon五角': '五边形', 'Round圆形': '圆形',
    'Lift Bottle': '提起瓶子', 'Pull-out Key': '旋转并拔出钥匙',
    'Pull Out Key': '旋转并拔出钥匙', 'Lift Can': '提起罐子',
    'Put Bottle in Shelf': '将瓶子放入架子', 'Put Bottle': '将瓶子放入架子',
    'Insert Hole': '斜孔插管', 'Insert Tube': '小间隙插管',
    'Draw Balloon': '在气球上画图', 'Fix Hand': '修复模型手',
    'Twist Cap': '旋拧瓶盖', 'Flip Book': '翻书页', 'Wipe Dish': '擦盘子',
    'Insert Hanoi': '河内塔套环插入', 'Insert USB': 'USB插入',
    'Wipe Board': '擦白板', 'Cup Stacking': '叠杯子',
    'Fruit Collection': '收集水果', 'Board Wiping': '擦白板',
    'Bottle Standing': '竖立瓶子', 'Towel Folding': '折毛巾',
    'Socket Plugging': '插头插入插座', 'Board Insertion': '插板',
    'Cardboard Box Folding': '折纸箱', 'Bag Packing': '装袋',
    'Insert HDMI': 'HDMI插入', 'Grasp Classify': '抓取并分类',
    'Pour Ball': '倒球', 'Unplug and Plug Charger': '拔插充电器',
    'Plug USB': 'USB插入', 'Grasp Chip': '抓取薯片',
    'Insert Screw': '插入螺钉', 'Place Gears': '放置齿轮',
    'Unstack Bowl': '拆开叠碗', 'Cup Handover': '传递杯子',
    'Stack Cups': '叠杯子', 'Stack Plates': '叠盘子',
    'Stack Bowls': '叠碗', 'Unstack Cup': '拆开叠杯',
    'Flip Page': '翻页', 'Transfer Egg': '转移鸡蛋', 'Wipe Plate': '擦盘子',
    'Apply Toothpaste': '挤牙膏', 'Split Cup': '分离套叠杯',
    'Sort Mahjong': '整理麻将', 'Open Lock': '开锁',
    'Refill Tablet': '补装药片', 'Acid-Base Neutralization': '酸碱中和',
    'Extract Card': '抽取卡片', 'Deal Poker': '发扑克牌', 'Screw Bulb': '旋入灯泡',
    'Earbud flipping': '翻转耳机', 'Stacked-book retrieval': '取出堆叠书籍',
    'Postcard retrieval': '拾取明信片', 'Multi-object grasping': '多物体抓取',
    'Constraint-locked Disassembly Task': '结构锁定拆卸任务',
    'In-box Picking': '箱内抓取', 'Weight Sort': '重量分拣', 'CoM Sort': '重心分拣',
    'Faucet Turn': '旋转水龙头', 'Faucet Direction': '判断水龙头旋转方向',
    'Stove Turn': '旋转炉灶旋钮', 'Stove Press': '按压炉灶旋钮',
    'Drawer Pull': '拉抽屉', 'Nut Thread': '旋拧螺母',
    'Plate Retrieve': '取出盘子', 'Stamp Press': '按压印章',
    'Plug Insert': '插头插入', 'Block Insert': '积木插入',
    'Play Mahjong': '操作麻将牌', 'Pick Up Chips': '拾取薯片',
    'Peg-in-Hole': '销孔插入', 'Bead Maze': '穿珠迷宫',
    'Peg Insertion': '销孔插入', 'Cap Twist': '旋拧瓶盖',
    'Vase Wipe': '擦花瓶', 'Book Flip': '翻书页',
    'Cloth识别': '布料识别', 'Delta-force预测': '力变化量预测',
    'Dense Packing': '密集装箱', 'Pouring': '倾倒',
    'Peg placement（销放置）': '销放置', 'Peg insertion（销插入）': '销孔插入',
    'Peg insertion': '销孔插入', 'USB insertion': 'USB插入',
    'Power plug insertion': '电源插头插入', 'Gear assembly': '齿轮装配',
    'Nut–bolt assembly': '螺母与螺栓装配', 'Bulb installation': '安装灯泡',
    'Peg reorientation': '调整销的朝向', 'Object search': '物体搜索',
    'Ball sorting': '球体分拣', 'wrench预测': '力与力矩预测',
    'Cup-on-Plate': '杯子放到盘子上', 'Door': '开门', 'Lift': '提起物体',
    'Wipe': '擦拭', '3D打印': '三维打印', '3D位姿': '三维位姿',
    '6D位姿': '六维位姿', 'PCB开关': '电路板开关',
    'v1': '版本一', 'v2': '版本二', '10 N': '10牛顿',
}
_TERMS = re.compile('|'.join(re.escape(k) for k in sorted(TASK_TERMS, key=len, reverse=True)))


def chinese_task_name(value):
    return _TERMS.sub(lambda match: TASK_TERMS[match.group()], value)


def apply_chinese_task_names(data):
    def visit(value):
        if isinstance(value, list):
            for item in value:
                visit(item)
        elif isinstance(value, dict):
            for key, item in list(value.items()):
                if key == 'task' and isinstance(item, str):
                    translated = chinese_task_name(item)
                    if translated != item:
                        value.setdefault('originalTask', item)
                        value[key] = translated
                elif key == 'tasks':
                    if isinstance(item, str):
                        value[key] = chinese_task_name(item)
                    elif isinstance(item, list):
                        value[key] = [chinese_task_name(t) if isinstance(t, str) else t for t in item]
                        visit(item)
                elif key != 'originalTask':
                    visit(item)

    visit(data)
    for w in data['works']:
        w['tasks'] = '；'.join(e['task'] for e in w['experiments'])
    for b in data['benchmarks']:
        for group in b.get('reading', {}).get('taskGroups', []):
            for task in group['items']:
                task['name'] = chinese_task_name(task['name'])
                # Existing bilingual labels already contain their Chinese translation.
                task['name'] = re.sub(r'（([^（）]+)）', lambda m: '' if m[1] in task['name'][:m.start()] else m[0], task['name'])
    return data
