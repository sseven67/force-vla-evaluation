window.RESEARCH_DATA = {
  "updated": "2026-10-15",
  "groups": [
    {
      "id": "wrist",
      "name": "末端力与力矩",
      "color": "#24768c",
      "subtitle": "腕部 wrench、目标力与快速接触纠偏"
    },
    {
      "id": "touch",
      "name": "指尖力与触觉",
      "color": "#7562a9",
      "subtitle": "夹持、接触分布、力语言与多模态表示"
    },
    {
      "id": "dex",
      "name": "灵巧手与基础策略",
      "color": "#377b60",
      "subtitle": "多指协作、跨传感器与规模化触觉学习"
    },
    {
      "id": "body",
      "name": "全身与专用工具",
      "color": "#ab7238",
      "subtitle": "移动接触、身体补偿与探头交互"
    },
    {
      "id": "related",
      "name": "相关路线与评测框架",
      "color": "#63738a",
      "subtitle": "关节扭矩、蒸馏、世界模型与统一评测"
    }
  ],
  "works": [
    {
      "id": "W01",
      "name": "ForceVLA",
      "year": 2025,
      "family": "wrist",
      "signal": "估计末端6D wrench",
      "role": "力观测",
      "platform": "Flexiv Rizon + 夹爪",
      "summary": "将末端力作为 VLA 的独立输入，研究接触任务与物理泛化。",
      "tasks": "按瓶、插头、USB、擦板、削皮",
      "metrics": "成功率、削皮长度/次数",
      "trials": "插接/按压20；擦板10；削皮15",
      "warning": "力作为观测，动作仍是位姿与夹爪宽度。",
      "domains": [
        "真机"
      ],
      "scope": "核心相关",
      "evidence": "原文核查",
      "source": "https://arxiv.org/html/2505.22159v1",
      "notes": "### W01 — ForceVLA（2025）\n\n**对应评测：ForceVLA 原论文自建五任务真机套件，训练数据名为 ForceVLA-Data。**不是在某个通用仿真榜单上得分。\n\n- 平台/力：Flexiv Rizon 7-DoF + Dahuan夹爪；TCP外部六维 wrench，原文称估计值；动作是TCP目标位姿与夹爪宽度。\n- 任务/试验：按瓶、插头、USB各20次，擦板10次，削黄瓜15次；每次削皮包含15个stroke。数据共244条轨迹。\n- 计分：以任务成功率为主；擦板区分完成擦拭动作与彻底擦除；削皮另计平均长度与清理所需stroke。\n- 泛化/对照：无力与简单加力的π0/π0-fast；新物体、高度变化、遮挡和不稳定插座。\n\n**值得收集：**五任务配置、擦板的两级成功定义、削皮质量指标、遮挡/不稳定插座测试。局限是没有系统给出外部目标 wrench 的六轴跟踪误差。\n\n来源：[ForceVLA §4.3、§5.1–5.3](https://arxiv.org/html/2505.22159v1)、[项目页](https://sites.google.com/view/forcevla2025/)。",
      "relations": [
        {
          "benchmark": "suite-w01",
          "type": "self",
          "label": "自建并评测",
          "domain": "真机",
          "note": "插接/按压20；擦板10；削皮15"
        }
      ],
      "baseline": "π0-base / π0-fast，无力与简单力输入版本；FVLMoE消融。",
      "openness": {
        "status": "公开情况待核验",
        "url": "https://arxiv.org/html/2505.22159v1",
        "note": "论文原文已核查；代码、数据、评测环境的完整公开情况尚未逐项确认，不等于未公开。"
      },
      "experiments": [
        {
          "task": "按瓶",
          "purpose": "检验轴向接触与高度变化下的动作调整",
          "metric": "任务成功率",
          "setting": "20次；另有瓶型/高度泛化"
        },
        {
          "task": "插头 / USB",
          "purpose": "检验受约束接触下对齐与纠偏",
          "metric": "完整插入成功率",
          "setting": "各20次；插头另设遮挡/不稳定插座"
        },
        {
          "task": "擦白板",
          "purpose": "区分执行擦拭动作与真正清洁",
          "metric": "擦拭动作成功、完全擦除",
          "setting": "10次；不等于目标法向力跟踪"
        },
        {
          "task": "削黄瓜",
          "purpose": "检验工具持续接触与加工质量",
          "metric": "平均削皮长度、最少stroke",
          "setting": "15次，每次15个stroke"
        }
      ],
      "purpose": "将末端力作为 VLA 的独立输入，研究接触任务与物理泛化。"
    },
    {
      "id": "W02",
      "name": "ForceVLA2",
      "year": 2026,
      "family": "wrist",
      "signal": "末端6D F/T",
      "role": "显式力—位置",
      "platform": "Flexiv Rizon 4s + DH AG-95",
      "summary": "将力引入动作接口，覆盖持续接触与装配。",
      "tasks": "按瓶、清洁花瓶、擦板、取盘、齿轮",
      "metrics": "成功率、过载与接触表现",
      "trials": "20次 / 任务",
      "warning": "任务成功不自动等于完整六轴力/矩跟踪。",
      "domains": [
        "真机"
      ],
      "scope": "核心相关",
      "evidence": "原文核查",
      "source": "https://arxiv.org/html/2603.15169v1",
      "notes": "### W02 — ForceVLA2（2026）\n\n**对应评测：ForceVLA2 原论文在 ForceVLA2-Dataset 对应的五个自建真机任务上测试。**\n\n- 平台/力：Flexiv Rizon 4s + DH AG-95夹爪；末端6D F/T，采集300 Hz；框架输出混合力—位置动作。\n- 任务：按瓶、清洁花瓶、擦板、取盘、齿轮装配；数据为1,000条轨迹。\n- 协议：每任务20次独立试验，主指标为任务成功率。\n- 对照：ACP、π0、π0.5、ForceVLA和简单力输入版本；分析力提示、融合模块与跟随/重定位表现。\n\n**值得收集：**清洁花瓶引入变化表面法向，取盘涉及受限空间与接触，齿轮装配涉及约束接触；比只做平面擦拭更丰富。不能将避免过载的现象描述等同于完整的六轴定量力控 benchmark。\n\n来源：[ForceVLA2 §4–5及附录](https://arxiv.org/html/2603.15169v1)、[CVPR正式论文](https://openaccess.thecvf.com/content/CVPR2026/papers/Li_ForceVLA2_Unleashing_Hybrid_Force-Position_Control_with_Force_Awareness_for_Contact-Rich_CVPR_2026_paper.pdf)、[项目](https://sites.google.com/view/force-vla2/home)。",
      "relations": [
        {
          "benchmark": "suite-w02",
          "type": "self",
          "label": "自建并评测",
          "domain": "真机",
          "note": "20次 / 任务"
        }
      ],
      "baseline": "ACP、π0、π0.5、ForceVLA、π0简单力输入；力提示/融合组件消融。",
      "openness": {
        "status": "公开情况待核验",
        "url": "https://arxiv.org/html/2603.15169v1",
        "note": "论文原文已核查；代码、数据、评测环境的完整公开情况尚未逐项确认，不等于未公开。"
      },
      "experiments": [
        {
          "task": "按瓶 / 取盘",
          "purpose": "检验不同接触阶段的混合力—位置操作",
          "metric": "任务成功率",
          "setting": "各20次独立试验"
        },
        {
          "task": "清洁花瓶 / 擦板",
          "purpose": "检验持续接触与变化表面",
          "metric": "任务成功率、定性接触表现",
          "setting": "各20次；没有系统六轴跟踪表"
        },
        {
          "task": "齿轮装配",
          "purpose": "检验装配约束下的接触执行",
          "metric": "任务成功率",
          "setting": "20次；对比同任务方法"
        }
      ],
      "purpose": "将力引入动作接口，覆盖持续接触与装配。"
    },
    {
      "id": "W03",
      "name": "FAVLA",
      "year": 2026,
      "family": "wrist",
      "signal": "腕部6D F/T",
      "role": "快速反馈",
      "platform": "Monte / X-ARM + 夹爪",
      "summary": "通过快慢环与自适应更新频率应对接触变化。",
      "tasks": "USB、齿轮、翻盒、擦板",
      "metrics": "成功率、平均峰值力、频率消融",
      "trials": "USB25 / 齿轮30 / 翻盒20 / 擦板10",
      "warning": "峰值力下降不等于跟踪误差下降。",
      "domains": [
        "真机"
      ],
      "scope": "核心相关",
      "evidence": "原文核查",
      "source": "https://arxiv.org/html/2602.23648v1",
      "notes": "### W03 — FAVLA（2026）\n\n**对应评测：FAVLA 四任务真机套件，无独立正式 benchmark 名称。**\n\n- 平台：Monte双臂平台，X-ARM手臂，末端法兰6轴F/T及相机。\n- 任务/次数：USB插入25、齿轮装配30、翻盒20、擦板10。示教分别80/80/50/50条。\n- 指标：任务成功率；齿轮装配、翻盒另测每trial峰值接触力，再跨trial平均，结果分别为7.7 N、9.9 N。\n- 对照：π0、π0+Force、TA-VLA、ForceVLA；比较力注入、力变化预测及固定/自适应频率。\n\n**值得收集：**“成功率+峰值力+更新频率消融”的配套评测。峰值降低是控制过程证据，但不是目标力跟踪误差，也不是独立的无损判据。\n\n来源：[FAVLA §4.1–4.3及附录A.4](https://arxiv.org/html/2602.23648v1)。",
      "relations": [
        {
          "benchmark": "suite-w03",
          "type": "self",
          "label": "自建并评测",
          "domain": "真机",
          "note": "USB25 / 齿轮30 / 翻盒20 / 擦板10"
        }
      ],
      "baseline": "π0、π0+Force、TA-VLA、ForceVLA；力注入、预测、自适应频率消融。",
      "openness": {
        "status": "公开情况待核验",
        "url": "https://arxiv.org/html/2602.23648v1",
        "note": "论文原文已核查；代码、数据、评测环境的完整公开情况尚未逐项确认，不等于未公开。"
      },
      "experiments": [
        {
          "task": "USB / 齿轮装配",
          "purpose": "检验精密接触与及时修正",
          "metric": "成功率；齿轮平均峰值力",
          "setting": "25 / 30次；频率消融"
        },
        {
          "task": "翻盒",
          "purpose": "检验动态接触与冲击控制",
          "metric": "成功率、平均峰值力",
          "setting": "20次"
        },
        {
          "task": "擦板",
          "purpose": "检验持续接触执行",
          "metric": "成功率、组件消融",
          "setting": "10次"
        }
      ],
      "purpose": "通过快慢环与自适应更新频率应对接触变化。"
    },
    {
      "id": "W04",
      "name": "DAM-VLA（异步多模态）",
      "year": 2026,
      "family": "wrist",
      "signal": "机器人内部F/T",
      "role": "快速反馈",
      "platform": "Franka Panda + 夹爪",
      "summary": "分离力、视觉记忆与异步处理的贡献。",
      "tasks": "围巾、擦板、按钮、洗手液、插座、扫珠、Lego",
      "metrics": "成功率、耗时、平滑、tracking lag",
      "trials": "15次 / 任务",
      "warning": "不要与同名 Dynamic Action Model DAM-VLA 混淆；100 Hz控制不等于100 Hz重规划。",
      "domains": [
        "真机"
      ],
      "scope": "核心相关",
      "evidence": "原文核查",
      "source": "https://arxiv.org/html/2606.12105v1",
      "notes": "### W04 — DAM-VLA: Decoupled Asynchronous Multimodal（2026）\n\n**对应评测：这篇异步多模态 DAM-VLA 的七任务真机套件。**注意它不是另一篇同名 Dynamic Action Model DAM-VLA。\n\n- 平台/信号：Franka Panda，机器人内部提供F/T，主评测记录100 Hz；夹爪操作。\n- 任务：叠围巾、擦板、按按钮、按洗手液、插座插入、扫珠入簸箕、Lego排列；每任务15次。\n- 指标：成功率、平均episode时长；附录另测SPARC平滑性与tracking lag。\n- 对照：同X-VLA骨干、同数据划分，拆分异步、力、视觉记忆与融合方式。\n\n**值得收集：**通过多组对照辨别力、记忆、异步各自贡献。主表控制器为100 Hz，但DAM-VLA重规划约5.5 Hz；不能将其写成每10 ms重新感知并规划。附录还单独测试200 Hz控制器。\n\n来源：[原文 §4、附录D–F](https://arxiv.org/html/2606.12105v1)、[官方项目](https://intuitive-robots.github.io/DAM-VLA/)。",
      "relations": [
        {
          "benchmark": "suite-w04",
          "type": "self",
          "label": "自建并评测",
          "domain": "真机",
          "note": "15次 / 任务"
        }
      ],
      "baseline": "同X-VLA骨干：同步/异步、无力、无记忆、拼接与门控融合；同数据划分。",
      "openness": {
        "status": "公开情况待核验",
        "url": "https://arxiv.org/html/2606.12105v1",
        "note": "论文原文已核查；代码、数据、评测环境的完整公开情况尚未逐项确认，不等于未公开。"
      },
      "experiments": [
        {
          "task": "七类真机任务",
          "purpose": "分辨异步、力与记忆对操作的贡献",
          "metric": "成功率、平均episode时长",
          "setting": "各15次，同X-VLA骨干与数据划分"
        },
        {
          "task": "Sweep / 频率补充实验",
          "purpose": "检验动作平滑与重规划响应",
          "metric": "SPARC、tracking lag、成功",
          "setting": "控制器100/200 Hz与实际重规划率分开"
        }
      ],
      "purpose": "分离力、视觉记忆与异步处理的贡献。"
    },
    {
      "id": "W05",
      "name": "CR-VLA-Force",
      "year": 2026,
      "family": "wrist",
      "signal": "末端6D F/T",
      "role": "显式力—位置",
      "platform": "UR5e + UMI-like 夹爪",
      "summary": "慢策略结合柔顺执行，定量检验恒力跟踪。",
      "tasks": "急停按钮、充电插头、旋转窗、恒力擦板",
      "metrics": "成功率、法向力相对误差、保护停机",
      "trials": "24–25次 / 条件",
      "warning": "主要量化法向力，不是六轴目标同时跟踪；40 N仅属于原实验。",
      "domains": [
        "真机"
      ],
      "scope": "核心相关",
      "evidence": "原文核查",
      "source": "https://arxiv.org/html/2609.05832v1",
      "notes": "### W05 — CR-VLA-Force / CC-VLA（2026）\n\n**对应评测：CR-VLA-Force论文的自建四任务、多条件真机评测；正文方法称CC-VLA。**\n\n- 平台：UR5e、UMI-like夹爪、6D F/T；慢VLA与500 Hz柔顺控制器。\n- 任务/条件：急停按钮、充电插头、旋转窗、恒力擦白板；按钮/白板降低6 cm测试OOD；另设近插座、腕相机不可见孔位的PI-pro。每条件24–25次。\n- 关键指标：成功率；白板以40 N法向力为参考，计算平均相对绝对误差，base/OOD为5.52%/8.78%；75 N触发保护停机。\n\n**值得收集：定量恒力擦板协议。**它明确测“是否跟住目标力”，比只看擦干净更贴近力控。40 N、75 N只是该论文对象和硬件设置，不能当通用阈值；该项主要检验法向力而非完整六维跟踪。\n\n来源：[原文 §4.1–4.2、Table I](https://arxiv.org/html/2609.05832v1)。",
      "relations": [
        {
          "benchmark": "suite-w05",
          "type": "self",
          "label": "自建并评测",
          "domain": "真机",
          "note": "24–25次 / 条件"
        }
      ],
      "baseline": "DP、π0、π0.5、π0+Force、ForceVLA；训练阶段、历史力编码、柔顺控制器消融。",
      "openness": {
        "status": "公开情况待核验",
        "url": "https://arxiv.org/html/2609.05832v1",
        "note": "论文原文已核查；代码、数据、评测环境的完整公开情况尚未逐项确认，不等于未公开。"
      },
      "experiments": [
        {
          "task": "恒力擦板",
          "purpose": "检验是否跟踪给定法向力",
          "metric": "相对绝对误差；保护停机",
          "setting": "参考40 N；75 N触发保护；每条件24–25次"
        },
        {
          "task": "按钮 / 擦板高度OOD",
          "purpose": "检验位置变化后的力调节",
          "metric": "成功率；擦板跟踪误差",
          "setting": "高度比示教低6 cm"
        },
        {
          "task": "插头近起点 PI-pro",
          "purpose": "检验视觉不可见孔位时的接触探索",
          "metric": "插入成功率",
          "setting": "近插座且腕相机不可见孔位"
        },
        {
          "task": "旋转窗",
          "purpose": "检验长程约束与柔顺操作",
          "metric": "分阶段成功率、过载现象",
          "setting": "先抓把手再抵住窗框打开"
        }
      ],
      "purpose": "慢策略结合柔顺执行，定量检验恒力跟踪。"
    },
    {
      "id": "W06",
      "name": "TAO-Force",
      "year": 2026,
      "family": "wrist",
      "signal": "腕部6D F/T",
      "role": "显式力—位置",
      "platform": "AgiBot G1 双臂",
      "summary": "通过反事实力输入检验动作是否真正依赖力。",
      "tasks": "重量分拣、削皮、按泵、擦板、切割",
      "metrics": "成功率、力/矩预测MSE、路由Flip Rate",
      "trials": "30次 / 任务 / ID或OOD条件",
      "warning": "反事实分析是离线轨迹响应；预测MSE不是执行误差。",
      "domains": [
        "真机"
      ],
      "scope": "核心相关",
      "evidence": "原文核查",
      "source": "https://arxiv.org/html/2609.18497v1",
      "notes": "### W06 — TAO-Force（2026）\n\n**对应评测：TAO-Force五任务ID/OOD套件与离线反事实力输入实验。**\n\n- 平台：AgiBot G1双臂，腕部六轴F/T；VLA与高速导纳执行链路分层。\n- 任务：同外观重量分拣、削黄瓜、按泵头、擦板、切黄瓜；ID/OOD各30次/任务。OOD包括高度、工具、光照变化。\n- 指标：任务成功；力/力矩预测MSE；固定视觉、交换空/满罐力信号，统计轨迹误差与路由Flip Rate，使用20条测试轨迹。\n- 口径：主比较平均值只包含除重量分拣外的四任务；无力基线在分拣任务标N/A。\n\n**值得收集：反事实力输入测试。**它比仅展示注意力图更直接检查“动作是否依赖力”。但这是离线轨迹响应，不是新一轮真机反事实成功率；预测MSE也不等于执行跟踪误差。\n\n来源：[原文 §V-A–V-D](https://arxiv.org/html/2609.18497v1)。",
      "relations": [
        {
          "benchmark": "suite-w06",
          "type": "self",
          "label": "自建并评测",
          "domain": "真机",
          "note": "30次 / 任务 / ID或OOD条件"
        }
      ],
      "baseline": "主任务对照GR00T N1.7、π0.5；离线力融合比较DePost、FVLMoE；分拣对无力基线标N/A。",
      "openness": {
        "status": "公开情况待核验",
        "url": "https://arxiv.org/html/2609.18497v1",
        "note": "论文原文已核查；代码、数据、评测环境的完整公开情况尚未逐项确认，不等于未公开。"
      },
      "experiments": [
        {
          "task": "五任务ID / OOD",
          "purpose": "检验物理和视觉变化后的执行",
          "metric": "成功率",
          "setting": "每任务每条件30次；平均值排除分拣"
        },
        {
          "task": "空 / 满罐力信号交换",
          "purpose": "检验动作是否依赖力而非仅视觉",
          "metric": "离线轨迹MSE、Flip Rate",
          "setting": "20条测试轨迹，固定视觉交换力"
        },
        {
          "task": "削皮接触段",
          "purpose": "检验未来力/矩预测",
          "metric": "Force MSE、Torque MSE",
          "setting": "离线接触窗口；不是控制跟踪误差"
        }
      ],
      "purpose": "通过反事实力输入检验动作是否真正依赖力。"
    },
    {
      "id": "W07",
      "name": "ForceDelta-VLA",
      "year": 2026,
      "family": "wrist",
      "signal": "估计末端6D wrench",
      "role": "快速反馈",
      "platform": "Franka Panda / X Square 双臂",
      "summary": "在参考动作更新间隙学习接触纠偏与延迟修正。",
      "tasks": "五单臂任务、四双臂任务",
      "metrics": "成功率、成功样本峰值/时间、延迟",
      "trials": "20次 / 任务",
      "warning": "峰值力与耗时表仅统计成功trial；夹爪命令不由快纠偏头控制。",
      "domains": [
        "真机"
      ],
      "scope": "核心相关",
      "evidence": "原文核查",
      "source": "https://arxiv.org/html/2609.18242v1",
      "notes": "### W07 — ForceDelta-VLA（2026）\n\n**对应评测：ForceDelta-VLA自建九任务，五单臂+四双臂。**\n\n- 力来源：Franka Panda与X Square平台均用机器人关节扭矩估计末端6D wrench；不是额外腕部F/T传感器。每任务200条示教、20次评测。\n- 任务：单臂翻物、USB、开柜、按键、擦板；双臂拔插头、插插头、开抽屉、擦板。\n- 指标：成功率；峰值力和时间按**成功trial**汇总；另测参考动作延迟、未见物体与组件消融。\n- 对照：ForceVLA、π0.5、TA-VLA、ImplicitRDP和Temporal Teacher；共享任务数据与控制限制。\n\n**值得收集：单/双臂任务套件及延迟鲁棒性协议。**读取峰值力表时必须保留“成功样本”分母；快纠偏只改位姿，夹爪命令来自参考动作，不应归为夹持力闭环控制。\n\n来源：[原文 §III-A、§IV](https://arxiv.org/html/2609.18242v1)。",
      "relations": [
        {
          "benchmark": "suite-w07",
          "type": "self",
          "label": "自建并评测",
          "domain": "真机",
          "note": "20次 / 任务"
        }
      ],
      "baseline": "π0.5、ForceVLA、TA-VLA、ImplicitRDP、Temporal Teacher；纠偏/延迟与历史力消融。",
      "openness": {
        "status": "公开情况待核验",
        "url": "https://arxiv.org/html/2609.18242v1",
        "note": "论文原文已核查；代码、数据、评测环境的完整公开情况尚未逐项确认，不等于未公开。"
      },
      "experiments": [
        {
          "task": "五单臂 / 四双臂任务",
          "purpose": "检验快速纠偏的任务表现",
          "metric": "成功率、成功trial峰值/时间",
          "setting": "每任务20次，同示教/初始分布/控制限制"
        },
        {
          "task": "参考动作延迟实验",
          "purpose": "检验旧参考下纠偏能力",
          "metric": "延迟变化后的任务与接触表现",
          "setting": "实际延迟设置需按原文表读取"
        },
        {
          "task": "未见物体",
          "purpose": "检验接触纠偏的泛化",
          "metric": "任务成功与力表现",
          "setting": "原文§IV-E；不与主表分母混用"
        }
      ],
      "purpose": "在参考动作更新间隙学习接触纠偏与延迟修正。"
    },
    {
      "id": "W08",
      "name": "ForceRFT",
      "year": 2026,
      "family": "wrist",
      "signal": "腕部6D F/T",
      "role": "残差适应",
      "platform": "Franka FR3 + Robotiq 2F-85",
      "summary": "以在线残差学习提升限时自主完成能力。",
      "tasks": "插头、环套柱、擦板",
      "metrics": "自主成功次数、在线预算、力反馈消融",
      "trials": "30次 / 设置",
      "warning": "正式评测固定策略；在线训练预算不等于测试时继续更新。",
      "domains": [
        "真机"
      ],
      "scope": "核心相关",
      "evidence": "原文核查",
      "source": "https://arxiv.org/html/2609.22840v1",
      "notes": "### W08 — ForceRFT（2026）\n\n**对应评测：ForceRFT自建三任务、限时自主成功协议。**\n\n- 平台：Franka FR3 + Robotiq 2F-85 + OnRobot HEX-E腕F/T。\n- 任务/判据：插头完整插入、环套柱完全就位后释放；擦板须去除全部文字、抬起擦子并停止。\n- 协议：每设置30次；插入/装配限60 s、擦板180 s；不允许人工介入、trial内重置或保护停机。每任务50条示教，在线变体统一30分钟预算，正式评测固定参数。\n- 对照：SmolVLA-SFT、力条件prior、残差模仿、ForceRFT；另消融执行时wrench及增量。\n\n**值得收集：完整自主终止与匹配在线预算。**能防止“人救回来也算成功”或“持续擦不停也算完成”。主要结果是自主成功次数，不应补写论文未报告的完整力跟踪分数。\n\n来源：[原文 §V-A–V-C](https://arxiv.org/html/2609.22840v1)。",
      "relations": [
        {
          "benchmark": "suite-w08",
          "type": "self",
          "label": "自建并评测",
          "domain": "真机",
          "note": "30次 / 设置"
        }
      ],
      "baseline": "SmolVLA-SFT、力条件prior、残差模仿；移除执行时wrench/增量，匹配在线预算。",
      "openness": {
        "status": "公开情况待核验",
        "url": "https://arxiv.org/html/2609.22840v1",
        "note": "论文原文已核查；代码、数据、评测环境的完整公开情况尚未逐项确认，不等于未公开。"
      },
      "experiments": [
        {
          "task": "插头 / 环套柱",
          "purpose": "检验无人救援下自主接触完成",
          "metric": "成功次数 / 30",
          "setting": "60秒内就位并释放；禁止介入/重置/保护停机"
        },
        {
          "task": "擦板",
          "purpose": "检验清洁及自主终止",
          "metric": "成功次数 / 30",
          "setting": "180秒内去除全部文字、抬起并停止"
        },
        {
          "task": "执行时力反馈与在线学习",
          "purpose": "检验残差对实时wrench的利用",
          "metric": "成功率、训练过程检查点",
          "setting": "各在线变体30分钟；测试固定参数"
        }
      ],
      "purpose": "以在线残差学习提升限时自主完成能力。"
    },
    {
      "id": "W09",
      "name": "Tactile-VLA",
      "year": 2025,
      "family": "touch",
      "signal": "双指触觉 / 力",
      "role": "显式力—位置",
      "platform": "触觉夹爪",
      "summary": "把力语言迁移、物理常识和失败后调力分别测试。",
      "tasks": "USB/充电器插拔、无变形抓取、擦板",
      "metrics": "成功率、施加力、无可见变形",
      "trials": "抓取10次 / 物体；其他按实验",
      "warning": "跨任务零样本指力语言迁移；充电器运动示教已见过。",
      "domains": [
        "真机"
      ],
      "scope": "扩展相关",
      "evidence": "原文核查",
      "source": "https://arxiv.org/html/2507.09160v1",
      "notes": "### W09 — Tactile-VLA（2025）\n\n**对应评测：Tactile-VLA三组自建能力测试。**\n\n1. 力语言迁移：USB学softly/hard；充电器学过运动、没学对应力副词，测试成功率和施加力；另测未见副词。\n2. 物理常识抓取：重、轻、易碎三类物体，ID/OOD；每物体10次；成功须单次抓起且无可见变形。\n3. 失败后调整：白板训练、黑板测试，比较带推理的调力行为。\n\n**值得收集：第一组的跨任务力语义benchmark，以及第二组的无变形抓取。**“零样本”指力语言迁移，不是充电器整个任务从未训练。它是双指触觉/力路线，不应写成腕部六轴F/T。\n\n来源：[Tactile-VLA §3.1–3.4、Tables 1–4](https://arxiv.org/html/2507.09160v1)。",
      "relations": [
        {
          "benchmark": "suite-w09",
          "type": "self",
          "label": "自建并评测",
          "domain": "真机",
          "note": "抓取10次 / 物体；其他按实验"
        }
      ],
      "baseline": "π0-base、π0-fast，带/不带CoT推理；语言、ID/OOD物体和任务迁移。",
      "openness": {
        "status": "公开情况待核验",
        "url": "https://arxiv.org/html/2507.09160v1",
        "note": "论文原文已核查；代码、数据、评测环境的完整公开情况尚未逐项确认，不等于未公开。"
      },
      "experiments": [],
      "purpose": "把力语言迁移、物理常识和失败后调力分别测试。"
    },
    {
      "id": "W10",
      "name": "TaF-VLA",
      "year": 2026,
      "family": "touch",
      "signal": "触觉—力对齐",
      "role": "触觉反馈",
      "platform": "触觉夹爪 / 工具",
      "summary": "利用物理接触表示覆盖抗滑、易碎与工具操作。",
      "tasks": "管插入、镊子提重、拔出、擦板、切片、抓取等八类",
      "metrics": "任务特定成功率",
      "trials": "15次 / 任务",
      "warning": "TaF-VLA与TA-VLA是不同工作。",
      "domains": [
        "真机"
      ],
      "scope": "扩展相关",
      "evidence": "原文核查",
      "source": "https://arxiv.org/html/2601.20321v1",
      "notes": "### W10 — TaF-VLA（2026）\n\n**对应评测：TaF-VLA八类自建真实接触任务。**包含管插入、镊子提重、充电宝拔出、白板擦拭、果冻切片、重部件提起、夹具食物抓取、巧克力抓取。每模型每任务15次，按任务特定二元成功条件计分。对照ACT、DP、FreeTacMan、π0.5及适配器版本。\n\n**值得收集：工具把持与不同力需求的任务覆盖。**它用易碎、抗滑、阻力与持续接触检验触觉—力对齐；主结果仍以完成率为主，不是独立的六维目标力跟踪榜单。详细成功条件见原文附录B。\n\n来源：[TaF-VLA §V及附录B](https://arxiv.org/html/2601.20321v1)。注意TaF-VLA与TA-VLA不同。",
      "relations": [
        {
          "benchmark": "suite-w10",
          "type": "self",
          "label": "自建并评测",
          "domain": "真机",
          "note": "15次 / 任务"
        }
      ],
      "baseline": "ACT、DP、FreeTacMan、π0.5，以及TaF-Adapter版本；物理对齐表示比较。",
      "openness": {
        "status": "公开情况待核验",
        "url": "https://arxiv.org/html/2601.20321v1",
        "note": "论文原文已核查；代码、数据、评测环境的完整公开情况尚未逐项确认，不等于未公开。"
      },
      "experiments": [],
      "purpose": "利用物理接触表示覆盖抗滑、易碎与工具操作。"
    },
    {
      "id": "W11",
      "name": "Tabero",
      "year": 2026,
      "family": "touch",
      "signal": "双指各3D力",
      "role": "显式力—位置",
      "platform": "Isaac Lab 触觉夹爪",
      "summary": "分开评估夹持内力、对外作用力与轻柔指令。",
      "tasks": "LIBERO衍生轻柔抓放 / 接触任务",
      "metrics": "SR、AG、MG、AA、MA",
      "trials": "统一每任务次数未确认",
      "warning": "双指各3D拼接不是腕部6D；MG/MA是最高5%样本均值。",
      "domains": [
        "仿真"
      ],
      "scope": "扩展相关",
      "evidence": "原文核查",
      "source": "https://arxiv.org/html/2605.27886v1",
      "notes": "### W11 — Tabero / Tabero-VTLA（2026）\n\n**对应评测：Tabero benchmark，复用LIBERO场景/轨迹并迁移到Isaac Lab触觉仿真。**因此应标成“LIBERO衍生的Tabero”，不能把分数直接写成原版LIBERO。\n\n- 输入是两指各3D力的拼接，不是腕部三力三力矩；输出解耦的运动与力目标。\n- 在firm/gentle指令下报告成功率，以及AG（接触期平均夹持力）、AA（接触期平均施加力）、MG/MA（对应最高5%样本均值）。本次未确认统一的每任务rollout数，不能擅自填20或50。\n- 官方仓库含环境、评测、资产/权重入口和训练仓库链接，README记录传感器绑定与版本差异。\n\n**值得收集：夹持内力和外部作用力分开计分。**MG/MA不是单点最大值，也不是P95分位数。\n\n来源：[Tabero §3.4–3.6及实验](https://arxiv.org/html/2605.27886v1)、[官方代码](https://github.com/NathanWu7/Tabero)。",
      "relations": [
        {
          "benchmark": "tabero",
          "type": "proposes",
          "label": "提出并评测",
          "domain": "仿真",
          "note": "LIBERO衍生环境；统一每任务次数未确认"
        }
      ],
      "baseline": "不同触觉表示与力反馈配置；firm/gentle条件；完整基线及次数以原表为准。",
      "openness": {
        "status": "有代码与资源入口",
        "url": "https://github.com/NathanWu7/Tabero",
        "note": "环境/评测仓库可见，有数据/权重链接；版本和传感器绑定影响复现，未实际运行。"
      },
      "experiments": [],
      "purpose": "分开评估夹持内力、对外作用力与轻柔指令。"
    },
    {
      "id": "W12",
      "name": "TORL-VLA",
      "year": 2026,
      "family": "touch",
      "signal": "双指各6D wrench（合12D）",
      "role": "残差适应",
      "platform": "Piper + Pika / Tacta",
      "summary": "将精密接触、机械锁定与易碎搬运串为完整流程。",
      "tasks": "杯子入架、搭扣、鸡蛋、串联全流程",
      "metrics": "子任务/全流程成功、耗时、60分钟吞吐",
      "trials": "子任务与全流程各30次",
      "warning": "双指6D拼为12D；对照方法已适配到共同接口。",
      "domains": [
        "真机"
      ],
      "scope": "扩展相关",
      "evidence": "原文核查",
      "source": "https://arxiv.org/html/2606.09337v1",
      "notes": "### W12 — TORL-VLA（2026）\n\n**对应评测：TORL-VLA自建latch-box套件，三子任务+一个完整流程。**\n\n- Piper+Pika夹爪、双Tacta指尖；每指SDK给6D wrench，拼为12D，不能标为单腕6D。\n- 杯子：抓取、放进狭窄杯架、释放后稳定；搭扣：翻转并压至锁定；鸡蛋：搬运放置、稳定且无可见损伤。\n- 子任务与全任务各30次；全任务须连续完成，无介入、重置、停机、掉落或损伤。另报60分钟成功吞吐量与成功全任务平均时间。\n- 正式评测不更新参数；ForceVLA/TA-VLA对照已移植到相同π0.5与双指wrench接口。\n\n**值得收集：接触、锁定、易碎抓取结合的全流程benchmark。**基线名字相同不代表原论文的原始实现条件相同。\n\n来源：[TORL-VLA §4、附录A.1–A.2](https://arxiv.org/html/2606.09337v1)。",
      "relations": [
        {
          "benchmark": "suite-w12",
          "type": "self",
          "label": "自建并评测",
          "domain": "真机",
          "note": "子任务与全流程各30次"
        }
      ],
      "baseline": "π0.5、TA-VLA、ForceVLA、w/o RL、RLT；对照均适配同π0.5与双指接口。",
      "openness": {
        "status": "公开情况待核验",
        "url": "https://arxiv.org/html/2606.09337v1",
        "note": "论文原文已核查；代码、数据、评测环境的完整公开情况尚未逐项确认，不等于未公开。"
      },
      "experiments": [],
      "purpose": "将精密接触、机械锁定与易碎搬运串为完整流程。"
    },
    {
      "id": "W13",
      "name": "TA-VLA",
      "year": 2025,
      "family": "related",
      "signal": "关节 torque / effort",
      "role": "预测监督",
      "platform": "机械臂 + 夹爪",
      "summary": "研究历史扭矩与未来预测，同时检查常规能力。",
      "tasks": "五接触任务 + 五常规任务",
      "metrics": "成功率、跨模型与跨本体测试",
      "trials": "20次 / 任务",
      "warning": "关节torque不是末端6D wrench。",
      "domains": [
        "真机"
      ],
      "scope": "扩展相关",
      "evidence": "原文核查",
      "source": "https://arxiv.org/html/2509.07962v1",
      "notes": "### W13 — TA-VLA（2025）\n\n**对应评测：TA-VLA自建十任务真机套件。**五接触任务为按键、充电器插入、USB插入、插座拔出、门把转动；五常规任务为抓放瓶、倒液、堆方块、推到目标、开抽屉。每任务20次。比较扭矩观测、扭矩预测及二者组合，并测试不同模型和机器人。\n\n**值得收集：五接触+五常规的分组方式。**它检验收益是否只在接触任务出现，以及是否损害常规能力；输入为关节effort，不应写成腕部6D wrench。正式仓库明确有observation.effort字段。\n\n来源：[TA-VLA §6、Table 5](https://arxiv.org/html/2509.07962v1)、[官方代码](https://github.com/ZZongzheng0918/TA-VLA)。",
      "relations": [
        {
          "benchmark": "suite-w13",
          "type": "self",
          "label": "自建并评测",
          "domain": "真机",
          "note": "20次 / 任务"
        }
      ],
      "baseline": "ACT、RDT、π0；torque观测、预测及组合；输入位置/历史编码消融。",
      "openness": {
        "status": "有官方代码",
        "url": "https://github.com/ZZongzheng0918/TA-VLA",
        "note": "代码与effort字段可查；完整真机资产和统一评测器未完成核验。"
      },
      "experiments": [],
      "purpose": "研究历史扭矩与未来预测，同时检查常规能力。"
    },
    {
      "id": "W14",
      "name": "FD-VLA",
      "year": 2026,
      "family": "related",
      "signal": "训练用力，部署不读真实力",
      "role": "力蒸馏",
      "platform": "UR5e + 夹爪",
      "summary": "把训练期力知识蒸馏到部署时可用表示。",
      "tasks": "擦板、急停按钮、插头",
      "metrics": "成功率、蒸馏与直接力输入对照",
      "trials": "30次 / 任务",
      "warning": "部署时不读真实力；不要与ForceDelta-VLA混淆。",
      "domains": [
        "真机"
      ],
      "scope": "扩展相关",
      "evidence": "原文核查",
      "source": "https://arxiv.org/html/2602.02142v2",
      "notes": "### W14 — FD-VLA（2026，核对v2）\n\n**对应评测：FD-VLA自建UR5e三任务套件。**擦白板、压急停按钮、插头入插座；每任务50条示教、30次独立测试。分别要求擦除全部可见标记、按钮充分压下且不回弹、插头完全就位。比较DP3、π0、SmolVLA及真实力输入/蒸馏变体。\n\n**值得收集：传感器输入与力蒸馏的相同任务对照。**训练采集真实力，部署不读真实力，所以归入力知识蒸馏分支，不能和实时力反馈方法不加标记地混排。不要把FD-VLA与ForceDelta-VLA混淆。\n\n来源：[FD-VLA v2 §IV](https://arxiv.org/html/2602.02142v2)。",
      "relations": [
        {
          "benchmark": "suite-w14",
          "type": "self",
          "label": "自建并评测",
          "domain": "真机",
          "note": "30次 / 任务"
        }
      ],
      "baseline": "DP3、π0、SmolVLA，真实力输入、蒸馏token与模块消融。",
      "openness": {
        "status": "公开情况待核验",
        "url": "https://arxiv.org/html/2602.02142v2",
        "note": "论文原文已核查；代码、数据、评测环境的完整公开情况尚未逐项确认，不等于未公开。"
      },
      "experiments": [],
      "purpose": "把训练期力知识蒸馏到部署时可用表示。"
    },
    {
      "id": "W15",
      "name": "MoSS",
      "year": 2026,
      "family": "touch",
      "signal": "触觉 + 关节 torque",
      "role": "触觉反馈",
      "platform": "FR3 + Robotiq / AnySkin",
      "summary": "在同一骨干与任务下比较多种物理模态。",
      "tasks": "拆杯、鸡蛋抓放、擦板、插头（v1）",
      "metrics": "成功率、多模态与训练消融",
      "trials": "24次 / 任务（v1）",
      "warning": "原文v1四任务与当前主页扩展演示分开。",
      "domains": [
        "真机"
      ],
      "scope": "扩展相关",
      "evidence": "原文核查",
      "source": "https://arxiv.org/html/2604.23272v1",
      "notes": "### W15 — MoSS（2026，原文v1与当前主页分开）\n\n**对应评测：MoSS v1夹爪真机四任务套件。**Unstack Cup、PnP Egg、Board Erase、Plug Insertion；每任务24次；杯子分大/小各12，插头三种各8，擦板组合高度等条件。Franka FR3+Robotiq 2F-85+双AnySkin，另用关节torque。联合多任务数据微调GR00T N1.5与π0，比较触觉、torque及其组合。\n\n**值得收集：多种物理模态在同骨干上的比较协议。**平均值旁的标准差要核对统计单位，不能自动解释成多随机训练seed。当前主页另有双OpenArm+RH56F1手的纸张/重量分拣演示，不能把它们直接并入v1的四任务分数。\n\n来源：[MoSS v1 §4与附录A](https://arxiv.org/html/2604.23272v1)、[当前主页](https://jiminlx.github.io/MoSS/)。",
      "relations": [
        {
          "benchmark": "suite-w15",
          "type": "self",
          "label": "自建并评测",
          "domain": "真机",
          "note": "24次 / 任务（v1）"
        }
      ],
      "baseline": "GR00T N1.5、π0，加Tactile-VLA/ForceVLA/TA-VLA适配；单模态和多模态组合。",
      "openness": {
        "status": "公开情况待核验",
        "url": "https://arxiv.org/html/2604.23272v1",
        "note": "论文原文已核查；代码、数据、评测环境的完整公开情况尚未逐项确认，不等于未公开。"
      },
      "experiments": [],
      "purpose": "在同一骨干与任务下比较多种物理模态。"
    },
    {
      "id": "W16",
      "name": "CompVLA",
      "year": 2026,
      "family": "related",
      "signal": "训练含F/T，评测策略不读F/T",
      "role": "柔顺性",
      "platform": "Franka FR3",
      "summary": "评估可变柔顺性，并保留普通抓放对照。",
      "tasks": "擦板、Pivot、Cup Dispense、Pick & Place",
      "metrics": "成功率、常规能力保持",
      "trials": "评测次数未确认",
      "warning": "评测时策略不读F/T；试验次数和重复seed未确认。",
      "domains": [
        "真机"
      ],
      "scope": "扩展相关",
      "evidence": "项目页核查",
      "source": "https://compvla.github.io/",
      "notes": "### W16 — CompVLA（当前官方项目资料）\n\n**对应评测：CompVLA自建柔顺性任务套件。**擦白板、Pivot、Cup Dispense，外加常规Pick & Place；平台Franka FR3。项目说明每任务100条示教、10 Hz同步，数据包含F/T，但评测时策略不使用F/T输入。\n\n**值得收集：不同柔顺需求+常规任务对照。**它回答可变柔顺性是否有用，不是测实时六维力融合。主页提供均值±标准差，但本次未确认对应训练重复数和每任务评测次数，保持未确认。\n\n来源：[CompVLA官方项目页](https://compvla.github.io/)。",
      "relations": [
        {
          "benchmark": "suite-w16",
          "type": "self",
          "label": "自建并评测",
          "domain": "真机",
          "note": "评测次数未确认"
        }
      ],
      "baseline": "π0、ForceVLA、TA-VLA、DP、ACT；项目页表格，重复次数未确认。",
      "openness": {
        "status": "项目页可查",
        "url": "https://compvla.github.io/",
        "note": "数据发布说明可查；试验次数和全部可运行资源未确认。"
      },
      "experiments": [],
      "purpose": "评估可变柔顺性，并保留普通抓放对照。"
    },
    {
      "id": "W17",
      "name": "ForceFlow",
      "year": 2026,
      "family": "related",
      "signal": "末端力历史",
      "role": "相邻系统",
      "platform": "机械臂 + 工具",
      "summary": "VLM定位与接触策略分阶段，分析力统计与物理泛化。",
      "tasks": "盖章、插头、按压、USB、擦板、花瓶",
      "metrics": "成功率、专家力统计偏差、OOD",
      "trials": "20次 / 主任务",
      "warning": "VLM定位加局部策略；Force Fidelity不是六轴逐时刻RMSE。",
      "domains": [
        "真机"
      ],
      "scope": "边界参考",
      "evidence": "原文核查",
      "source": "https://arxiv.org/html/2605.11048v1",
      "notes": "### W17 — ForceFlow（2026）\n\n**对应评测：ForceFlow自建六真机任务。**盖章、插头、按压、USB插入、擦白板、清洁花瓶；每任务20次。成功率之外，Force Fidelity比较trial的力统计量与专家参考：短接触用峰值，持续接触用接触期均值；另设物理/空间OOD测试。\n\n**值得收集：平面/曲面持续接触和物理/位置泛化分开。**该误差不是逐时刻六维wrench跟踪；其VLM定位后切换接触策略的结构，应与端到端VLA区分。\n\n来源：[ForceFlow §4.1–4.4](https://arxiv.org/html/2605.11048v1)。",
      "relations": [
        {
          "benchmark": "suite-w17",
          "type": "self",
          "label": "自建并评测",
          "domain": "真机",
          "note": "20次 / 主任务"
        }
      ],
      "baseline": "π0.5、ACT、DP、ForceVLA、无力版本；接触阶段去视觉及OOD。",
      "openness": {
        "status": "公开情况待核验",
        "url": "https://arxiv.org/html/2605.11048v1",
        "note": "论文原文已核查；代码、数据、评测环境的完整公开情况尚未逐项确认，不等于未公开。"
      },
      "experiments": [],
      "purpose": "VLM定位与接触策略分阶段，分析力统计与物理泛化。"
    },
    {
      "id": "W18",
      "name": "FAWAM",
      "year": 2026,
      "family": "related",
      "signal": "腕部6D F/T",
      "role": "相邻系统",
      "platform": "Franka + ATI F/T",
      "summary": "世界动作模型结合力预测与残差纠偏。",
      "tasks": "擦板、削皮、翻盒、擦花瓶",
      "metrics": "成功率、时间、观测/预测/残差消融",
      "trials": "20次 / 任务，最长60秒",
      "warning": "World Action Model路线，不能只因比较VLA就归为标准VLA。",
      "domains": [
        "真机"
      ],
      "scope": "边界参考",
      "evidence": "原文核查",
      "source": "https://arxiv.org/html/2606.08555v1",
      "notes": "### W18 — FAWAM（2026）\n\n**对应评测：FAWAM自建四真机任务。**擦白板、削黄瓜、翻盒、擦花瓶；每方法每任务20次、每次最长60秒。Franka平台，ATI腕传感器120 Hz。对照π0.5、GE-Act、ForceVLA、TA-VLA及无残差版本，报告成功率并分析执行时间、力观测/预测/残差贡献。\n\n**值得收集：力预测与执行时残差纠偏的消融。**它是world action model路线，不能仅因比较对象含VLA就重新归类为标准VLA；也不能默认拥有统一通用benchmark。\n\n来源：[FAWAM §4、附录A](https://arxiv.org/html/2606.08555v1)。",
      "relations": [
        {
          "benchmark": "suite-w18",
          "type": "self",
          "label": "自建并评测",
          "domain": "真机",
          "note": "20次 / 任务，最长60秒"
        }
      ],
      "baseline": "π0.5、GE-Act、ForceVLA、TA-VLA；力观测/未来预测/残差纠偏拆分。",
      "openness": {
        "status": "公开情况待核验",
        "url": "https://arxiv.org/html/2606.08555v1",
        "note": "论文原文已核查；代码、数据、评测环境的完整公开情况尚未逐项确认，不等于未公开。"
      },
      "experiments": [],
      "purpose": "世界动作模型结合力预测与残差纠偏。"
    },
    {
      "id": "E01",
      "name": "FuSe / Beyond Sight",
      "year": 2025,
      "family": "touch",
      "signal": "DIGIT触觉图像 + 声音",
      "role": "触觉反馈",
      "platform": "WidowX 250",
      "summary": "用语言连接异质感官，分别验证Octo与VLA。",
      "tasks": "桌面抓取、袋中抓取、按钮、跨模态组合",
      "metrics": "成功率、未见物体与组合语义",
      "trials": "5次 / 具体scenario",
      "warning": "多数主实验是Octo；另有PaliGemma VLA实验，不混用成绩。",
      "domains": [
        "真机"
      ],
      "scope": "扩展相关",
      "evidence": "原文核查",
      "source": "https://arxiv.org/html/2501.04693v1",
      "notes": "### E01 — FuSe / Beyond Sight: Finetuning Generalist Robot Policies with Heterogeneous Sensors via Language Grounding\n\n**对应评测：FuSe论文的自建多模态真机任务集。**WidowX有双DIGIT触觉、相机与麦克风，评测桌面/袋中抓取、按钮和组合指令，包括看起来相似但触感不同的对象，以及声音与视觉语义组合。每个具体scenario重复5次，含未见物体。\n\n论文多数主实验使用Octo，另外单独验证PaliGemma 3B VLA。收集其结果时必须标清骨干，不能把所有Octo数字记为VLA成绩。官方仓库发布26,866条多模态轨迹及模型入口。\n\n**值得收集：购物袋遮挡抓取、跨模态组合指令。**它主要测试触觉信息对任务选择/动作的帮助，没有用目标力误差证明显式力伺服。\n\n来源：[原文§IV-A–G](https://arxiv.org/html/2501.04693v1)、[项目](https://fuse-model.github.io/)、[代码](https://github.com/fuse-model/FuSe)。",
      "relations": [
        {
          "benchmark": "suite-e01",
          "type": "self",
          "label": "自建并评测",
          "domain": "真机",
          "note": "5次 / 具体scenario"
        }
      ],
      "baseline": "视觉基线、不同辅助损失；Octo主实验与PaliGemma VLA实验分开。",
      "openness": {
        "status": "有代码与资源入口",
        "url": "https://github.com/fuse-model/FuSe",
        "note": "代码、26,866条轨迹和模型入口可查；未下载运行。"
      },
      "experiments": [],
      "purpose": "用语言连接异质感官，分别验证Octo与VLA。"
    },
    {
      "id": "E02",
      "name": "VTLA",
      "year": 2025,
      "family": "touch",
      "signal": "双指触觉图像",
      "role": "触觉反馈",
      "platform": "UR3 + Robotiq / GelStereo",
      "summary": "从接触动作预测到闭环插孔，再验证仿真到真机。",
      "tasks": "五孔形、不同装配间隙",
      "metrics": "GCR、分轴L1、成功率、尝试步数",
      "trials": "真机20次 / 设置",
      "warning": "初始已握住零件；评测局部接触纠偏而非全流程抓取。",
      "domains": [
        "仿真",
        "真机"
      ],
      "scope": "扩展相关",
      "evidence": "原文核查",
      "source": "https://arxiv.org/html/2505.09577v1",
      "notes": "### E02 — VTLA: Vision-Tactile-Language-Action Model with Preference Learning for Insertion Manipulation\n\n**对应评测：VTLA自建插孔套件，沿用TLA的动作构造并扩展视觉与DPO。**仿真五类孔形、0.6–2.0 mm间隙；UR3+Robotiq 2F-85+双GelStereo 2.0进行真机验证，每设置20次。一次episode最多15次插入尝试，超过算失败。\n\n离线报告GCR（x/y/rz动作均正确）和分轴L1；闭环报告成功率和尝试步数。真实验证还比较间隙、未见孔形、TLA/VLA对照。旋转误差单位为度，不能与毫米直接求平均。\n\n**值得收集：动作预测准确度 → 闭环成功/步数 → Sim2Real的三层评测。**触觉来自接触图像，不能把其成功率当作指定牛顿力跟踪能力。\n\n来源：[VTLA原文§3–4与Tables 5–7](https://arxiv.org/html/2505.09577v1)、[正式期刊页](https://www.sciencedirect.com/science/article/pii/S2667379726000616)。",
      "relations": [
        {
          "benchmark": "suite-e02",
          "type": "self",
          "label": "自建并评测",
          "domain": "仿真 + 真机",
          "note": "真机20次 / 设置"
        }
      ],
      "baseline": "DP、VLA、TLA；DPO-1k/2k与无DPO；仿真和真机孔形/间隙比较。",
      "openness": {
        "status": "公开情况待核验",
        "url": "https://arxiv.org/html/2505.09577v1",
        "note": "论文原文已核查；代码、数据、评测环境的完整公开情况尚未逐项确认，不等于未公开。"
      },
      "experiments": [],
      "purpose": "从接触动作预测到闭环插孔，再验证仿真到真机。"
    },
    {
      "id": "E03",
      "name": "FTP-1",
      "year": 2026,
      "family": "dex",
      "signal": "多类触觉传感器",
      "role": "触觉反馈",
      "platform": "Franka / Sharpa / Dexmate / Flexiv",
      "summary": "同一触觉基础策略跨传感器与本体适配。",
      "tasks": "UniVTAC六任务 + 多本体真机任务",
      "metrics": "成功率、已见/未见传感器迁移",
      "trials": "仿真100；真机20次 / 任务",
      "warning": "只使用UniVTAC六任务；真机套件另建，非六任务原样迁移。",
      "domains": [
        "仿真",
        "真机"
      ],
      "scope": "扩展相关",
      "evidence": "原文核查",
      "source": "https://arxiv.org/html/2606.13102v1",
      "notes": "### E03 — FTP-1: A Generalist Foundation Tactile Policy Across Tactile Sensors for Contact-Rich Manipulation\n\n**对应评测：FTP-1的UniVTAC六任务子集+自建多本体真机套件。**仿真每任务100次；真机20次。六项仿真为Lift Bottle、Pull-out Key、Lift Can、Put Bottle、Insert Hole、Insert Tube；另外报告排除两个lift任务的平均，以避免视觉已能解决的任务稀释触觉贡献。\n\n真机含Sharpa North的气球、修手/小件装配、拧盖，以及Sharpa&Dexmate翻书/擦盘；Fix Hand表中有Tear/Finish两列，不能当成独立物体任务随意计数。未见传感器另测Insert Hanoi、USB、Wipe Board。\n\n**值得收集：跨传感器迁移+去除视觉容易任务的分组统计。**官方预训练覆盖多传感器类型，但输出动作并不统一等于指定力闭环。\n\n来源：[FTP-1§3–4、附录E](https://arxiv.org/html/2606.13102v1)、[项目](https://ftp1-policy.github.io/)、[代码](https://github.com/michaelyuancb/ftp1-policy)。",
      "relations": [
        {
          "benchmark": "univtac",
          "type": "adopts",
          "label": "采用6任务子集",
          "domain": "仿真",
          "note": "每任务50条官方示教；100次闭环仿真"
        },
        {
          "benchmark": "suite-e03",
          "type": "self",
          "label": "自建并评测",
          "domain": "真机",
          "note": "仿真100；真机20次 / 任务"
        }
      ],
      "baseline": "π0.5、Tactile-VLA、未做FTP-1预训练版本；原表星号基线引用原benchmark结果。",
      "openness": {
        "status": "有代码与资源入口",
        "url": "https://github.com/michaelyuancb/ftp1-policy",
        "note": "官方代码/模型/数据入口可查；各真机对象与硬件需自行搭建。"
      },
      "experiments": [],
      "purpose": "同一触觉基础策略跨传感器与本体适配。"
    },
    {
      "id": "E04",
      "name": "N₀-VTLA",
      "year": 2026,
      "family": "dex",
      "signal": "潜在触觉 tokens",
      "role": "触觉反馈",
      "platform": "单臂 / 双臂",
      "summary": "同时评估真实长流程、仿真任务与离线策略改进。",
      "tasks": "NeoReal九任务；UniVTAC八项；NeoSim十二项",
      "metrics": "成功率、100分阶段rubric",
      "trials": "按任务分配；不统一填次数",
      "warning": "NeoData是训练数据，NeoReal/NeoSim是评测；阶段进度和SR不同。",
      "domains": [
        "仿真",
        "真机"
      ],
      "scope": "扩展相关",
      "evidence": "原文核查",
      "source": "https://arxiv.org/html/2607.23782v1",
      "notes": "### E04 — N₀-VTLA: Scaling Vision–Tactile–Language–Action Model with Latent Tactile Tokens\n\n**对应评测：NeoReal九任务、UniVTAC八任务+NeoSim十二任务，以及ALTER长流程改进。**NeoReal同时报告成功率与100分阶段rubric；例如插座插接、纸箱折叠、瓶站立、毛巾折叠/装袋等任务或阶段。每任务trial预算不同，本文不擅自统一成20或30。\n\n仿真二十任务按八个UniVTAC与十二个NeoSim分别统计；每任务100条示教。ALTER是在固定部署数据上做离线策略改进，不能与未使用这些数据的基础模型无说明混排。\n\n**值得收集：NeoReal/NeoSim与阶段rubric。**预训练数据NeoData、仿真benchmark NeoSim和真实benchmark NeoReal是不同资源；任务进度分不等于全任务成功率。\n\n来源：[N₀-VTLA§5、附录E](https://arxiv.org/html/2607.23782v1)、[项目](https://research.neoteai.com/n0-vtla/)、[代码](https://github.com/neoteai/N0-VTLA)。",
      "relations": [
        {
          "benchmark": "univtac",
          "type": "adopts",
          "label": "采用8个任务",
          "domain": "仿真",
          "note": "八项原始任务，与NeoSim十二项分开统计"
        },
        {
          "benchmark": "neoreal",
          "type": "adopts",
          "label": "采用并评测",
          "domain": "真机",
          "note": "见配套报告与任务协议"
        },
        {
          "benchmark": "neosim",
          "type": "adopts",
          "label": "采用并评测",
          "domain": "仿真",
          "note": "见配套报告与任务协议"
        }
      ],
      "baseline": "ACT、π0.5及多种基础策略；无触觉退化与ALTER固定数据改进。",
      "openness": {
        "status": "有官方代码",
        "url": "https://github.com/neoteai/N0-VTLA",
        "note": "官方仓库与项目可查；NeoReal每任务资源完整性未运行核验。"
      },
      "experiments": [],
      "purpose": "同时评估真实长流程、仿真任务与离线策略改进。"
    },
    {
      "id": "E05",
      "name": "T-Rex",
      "year": 2026,
      "family": "dex",
      "signal": "指端力向量 + 形变图",
      "role": "快速反馈",
      "platform": "Dexmate Vega-1 + 双22-DoF手",
      "summary": "以触觉快速细化多指动作，覆盖复杂物体交互。",
      "tasks": "翻页、移蛋、擦盘、挤膏、拆杯、开锁等十二项",
      "metrics": "任务分数、多阶段progress rubric",
      "trials": "16次 / 任务",
      "warning": "多阶段含progress评分，不能当成全任务二元成功率。",
      "domains": [
        "真机"
      ],
      "scope": "扩展相关",
      "evidence": "原文核查",
      "source": "https://arxiv.org/html/2606.17055v1",
      "notes": "### E05 — T-Rex: Tactile-Reactive Dexterous Manipulation\n\n**对应评测：T-Rex自建12任务灵巧手套件。**双臂Dexmate Vega-1+两只22-DoF Sharpa Wave手，输入各指力向量及形变图。十二项包括翻页、移蛋、擦盘、挤膏、拆杯、麻将分拣、开锁、补药片、酸碱中和、抽卡、发牌、拧灯泡。\n\n每任务16次，位置/旋转随机；多阶段采用progress-based rubric，所以其平均“success rate”需结合附录评分读取，不能简单当192次整任务二元成功。对照π0.5、加触觉版本、EgoScale、Tactile-VLA、RDP等，另测力/形变模态、异步、示教效率。\n\n**值得收集：T-Rex十二任务及评分rubric。**覆盖夹爪难完成的多指、形变与轻柔操作；不是逐轴wrench跟踪基准。\n\n来源：[T-Rex§5.1–5.3、附录F](https://arxiv.org/html/2606.17055v1)。",
      "relations": [
        {
          "benchmark": "suite-e05",
          "type": "self",
          "label": "自建并评测",
          "domain": "真机",
          "note": "16次 / 任务"
        }
      ],
      "baseline": "ViTacFormer、RDP、Tactile-VLA、π0.5、EgoScale、π0.5+tactile；去触觉/形变/异步。",
      "openness": {
        "status": "公开情况待核验",
        "url": "https://arxiv.org/html/2606.17055v1",
        "note": "论文原文已核查；代码、数据、评测环境的完整公开情况尚未逐项确认，不等于未公开。"
      },
      "experiments": [],
      "purpose": "以触觉快速细化多指动作，覆盖复杂物体交互。"
    },
    {
      "id": "E06",
      "name": "STAR",
      "year": 2026,
      "family": "dex",
      "signal": "稀疏大面积触觉",
      "role": "触觉反馈",
      "platform": "双臂灵巧手",
      "summary": "针对触觉的空间、时间与信息稀疏性学习。",
      "tasks": "耳机翻转、叠书取出、明信片、多物体抓取",
      "metrics": "SR、TCR、去/掩码触觉消融",
      "trials": "20次 / 任务",
      "warning": "物体进入任务后训练；不是完全未见物体零样本。",
      "domains": [
        "真机"
      ],
      "scope": "扩展相关",
      "evidence": "原文核查",
      "source": "https://arxiv.org/html/2609.12549v1",
      "notes": "### E06 — STAR: Sparse Tactile Representation Learning in Vision–Tactile–Language–Action Models for Dexterous Manipulation\n\n**对应评测：STAR自建四任务真机套件。**耳机180°翻转、紧叠书取出、明信片滑移拾取、多物体分指抓取。每任务20次，共用随机初始配置；每项后训练100条轨迹，测试物体未进入200小时预训练集，但进入了任务后训练，不能称为完全未见物体零样本。\n\n同时报告SR和TCR（子任务完成比例）；例如书任务按拉出/抓取/取出/放置分阶段。另消融去触觉、推理时掩码触觉、稀疏/全局tokens和未来触觉预测。\n\n**值得收集：多指接触丰富与接触稀疏任务的成对分析。**避免所有触觉收益都来自额外数据，原文有同数据无触觉对照。\n\n来源：[STAR§V、附录任务描述](https://arxiv.org/html/2609.12549v1)。",
      "relations": [
        {
          "benchmark": "suite-e06",
          "type": "self",
          "label": "自建并评测",
          "domain": "真机",
          "note": "20次 / 任务"
        }
      ],
      "baseline": "GR00T N1.7、LDA-1B、π0.5、同数据Dex版本；去/掩码触觉与训练组件。",
      "openness": {
        "status": "公开情况待核验",
        "url": "https://arxiv.org/html/2609.12549v1",
        "note": "论文原文已核查；代码、数据、评测环境的完整公开情况尚未逐项确认，不等于未公开。"
      },
      "experiments": [],
      "purpose": "针对触觉的空间、时间与信息稀疏性学习。"
    },
    {
      "id": "E07",
      "name": "TacVLA",
      "year": 2026,
      "family": "touch",
      "signal": "15×8压力阵列",
      "role": "触觉反馈",
      "platform": "Franka Panda + 单指传感器",
      "summary": "接触门控决定何时使用触觉，验证受限/遮挡操作。",
      "tasks": "四项约束拆解 + 箱内取物",
      "metrics": "成功率、遮挡与运行扰动",
      "trials": "20次 / 主任务",
      "warning": "部分原表基线百分比与次数冲突，需逐格复核。",
      "domains": [
        "真机"
      ],
      "scope": "扩展相关",
      "evidence": "原文核查",
      "source": "https://arxiv.org/html/2603.12665v1",
      "notes": "### E07 — TacVLA: Contact-Aware Tactile Fusion for Robust Vision-Language-Action Manipulation\n\n**对应评测：TacVLA自建四类约束锁定拆解+箱内拾取。**Franka单指15×8压力阵列，π0.5骨干；每任务50条示教、主结果20次评测。拆解需要按压、扭转、滑动等特定动作；箱内取物限制相机可见性，另测遮挡与人扰动。\n\n**值得收集：约束锁定拆解与遮挡条件。**比较无触觉、无门控触觉和接触门控，回答“接触阶段才用触觉是否有效”。原表部分基线百分比与成功次数出现不一致，不建议照抄有冲突单元格；优先保存原表与复核分母。\n\n来源：[TacVLA§IV、Table II](https://arxiv.org/html/2603.12665v1)。",
      "relations": [
        {
          "benchmark": "suite-e07",
          "type": "self",
          "label": "自建并评测",
          "domain": "真机",
          "note": "20次 / 主任务"
        }
      ],
      "baseline": "π0.5、DP+tactile、3D DP+tactile、无门控；原表有个别次数/百分比冲突。",
      "openness": {
        "status": "公开情况待核验",
        "url": "https://arxiv.org/html/2603.12665v1",
        "note": "论文原文已核查；代码、数据、评测环境的完整公开情况尚未逐项确认，不等于未公开。"
      },
      "experiments": [],
      "purpose": "接触门控决定何时使用触觉，验证受限/遮挡操作。"
    },
    {
      "id": "E08",
      "name": "FWBC-VLA",
      "year": 2026,
      "family": "body",
      "signal": "关节残差估力",
      "role": "全身补偿",
      "platform": "M20S 轮足 + CM1机械臂",
      "summary": "身体参与接触补偿，单独核验力估计和流程结果。",
      "tasks": "移动开门、闭门器负载、擦白板",
      "metrics": "阶段/最终成功率、估力误差",
      "trials": "25次 / 任务",
      "warning": "身体/腿参与补偿，与固定臂结果不能直接排行。",
      "domains": [
        "真机"
      ],
      "scope": "扩展相关",
      "evidence": "原文核查",
      "source": "https://arxiv.org/html/2609.03889v2",
      "notes": "### E08 — FWBC-VLA: Force-Aware Whole-Body Compensation for Contact-Rich Loco-Manipulation\n\n**对应评测：FWBC-VLA自建移动开门与擦白板套件。**DeepRobotics M20S轮足机器人+机械臂+夹爪，核心扩展是机器人身体参与接触补偿，力由关节残差等估计，不是固定台式机械臂的腕力输入问题。\n\n每任务25次，按接近、抓取、操作、放置/推门、离开/过门分阶段；开门有/无闭门器，带闭门器需约50 N推力。擦板污迹ID/OOD比例1:2。另做估力准确度/接触识别，以及force interface、body compensation消融；对照含真实F/T输入版本。\n\n**值得收集：阶段成功率与最终完成率。**“门把压下”或“擦干净”不等于完成离开/穿门全流程；力估计误差和整任务成功也分开计分。\n\n来源：[FWBC-VLA v2§5、Tables 1–3](https://arxiv.org/html/2609.03889v2)。",
      "relations": [
        {
          "benchmark": "suite-e08",
          "type": "self",
          "label": "自建并评测",
          "domain": "真机",
          "note": "25次 / 任务"
        }
      ],
      "baseline": "OpenVLA、StarVLA、π0.5、GR00T、ACP、ForceVLA、真实力GT；全身补偿消融。",
      "openness": {
        "status": "公开情况待核验",
        "url": "https://arxiv.org/html/2609.03889v2",
        "note": "论文原文已核查；代码、数据、评测环境的完整公开情况尚未逐项确认，不等于未公开。"
      },
      "experiments": [],
      "purpose": "身体参与接触补偿，单独核验力估计和流程结果。"
    },
    {
      "id": "E09",
      "name": "Opt2VLA",
      "year": 2026,
      "family": "body",
      "signal": "关节 torque 历史",
      "role": "显式力—位置",
      "platform": "Digit 人形机器人",
      "summary": "将任务完成、力意图和实际力实现联合计分。",
      "tasks": "搬箱、推箱、擦拭；轻/中/重力指令",
      "metrics": "Task + Intent + Tracking、MAE",
      "trials": "仿真90次 / 变体；VLA真机45次",
      "warning": "主要依据官方项目页；三关联合成功与RL-only试验分开。",
      "domains": [
        "仿真",
        "真机"
      ],
      "scope": "扩展相关",
      "evidence": "项目页核查",
      "source": "https://opt2vla.github.io/",
      "notes": "### E09 — Opt2VLA: Force-Aware Vision-Language-Action for Contact-Rich Humanoid Whole-Body Manipulation\n\n**对应评测：Opt2VLA在Digit上的搬箱、架上推箱、表面擦拭。**关节torque历史作为反馈，策略输出双手/双脚位置与双手接触力参考；是全身协调和目标力接口，并非夹爪宽度控制。\n\n项目页对九种VLA配置分别运行90个仿真episode（每任务30），共用FCT低层控制器；另有45次VLA闭环真机测力。评分串联三关：任务完成、发出的力命令符合语言力区间、实际力与命令均值差满足阈值；低层控制器另测force MAE。\n\n**值得收集：Task+Intent+Tracking联合成功。**取样窗口与无效接触trial处理有单独说明；应与RL-only控制器试验分开。当前主要核查官方项目，未据此认定已是高引用经典。\n\n来源：[官方项目的Closed-loop evaluation与硬件结果](https://opt2vla.github.io/)。",
      "relations": [
        {
          "benchmark": "suite-e09",
          "type": "self",
          "label": "自建并评测",
          "domain": "仿真 + 真机",
          "note": "仿真90次 / 变体；VLA真机45次"
        }
      ],
      "baseline": "九种共同FCT控制器的VLA配置；torque历史/预测/编码与骨干微调。",
      "openness": {
        "status": "项目页可查",
        "url": "https://opt2vla.github.io/",
        "note": "含评测记录和计分说明；未核验完整可复现代码/数据包。"
      },
      "experiments": [],
      "purpose": "将任务完成、力意图和实际力实现联合计分。"
    },
    {
      "id": "E10",
      "name": "ForceU-VLA",
      "year": 2026,
      "family": "body",
      "signal": "6D F/T + 超声图像",
      "role": "力观测",
      "platform": "超声探头工具",
      "summary": "以专业成像结果与接触过程共同验证策略。",
      "tasks": "肝 / 肾五个标准超声切面",
      "metrics": "切面获取成功、扫描步数、力信号",
      "trials": "45次 / 任务，BMI组各15",
      "warning": "标准切面为专业任务结果；力曲线不等于全面舒适/安全证实。",
      "domains": [
        "真机"
      ],
      "scope": "扩展相关",
      "evidence": "原文核查",
      "source": "https://arxiv.org/html/2608.15009v1",
      "notes": "### E10 — ForceU-VLA: A Force-Aware Vision–Language–Action Model for Embodied Ultrasound Scanning\n\n**对应评测：ForceU-VLA-Data对应肝/肾五种标准超声切面。**专用探头接触身体，联合RGB、超声图像与6D F/T；不属于夹爪抓放。数据450条示教。\n\n每任务45次，三BMI组各15；成功定义为获得目标标准切面，另报扫描步数与力信号，比较π0/π0.5/ForceVLA及模态消融。这里的任务目标是成像质量/标准切面获取，接触力是过程质量因素。\n\n**值得收集：任务专业结果+交互过程的联合观察。**论文力曲线对舒适/安全属于间接证据，不能写成已验证所有受试者舒适性。原文和当前仓库对示教参与者/操作者口径存在差异，450条可核验，但不把“10名操作者”写成确定事实。\n\n来源：[原文§4–5](https://arxiv.org/html/2608.15009v1)、[官方仓库](https://github.com/VMVLab/ForceU-VLA)。",
      "relations": [
        {
          "benchmark": "suite-e10",
          "type": "self",
          "label": "自建并评测",
          "domain": "真机",
          "note": "45次 / 任务，BMI组各15"
        }
      ],
      "baseline": "π0、π0.5、ForceVLA及US/F/阶段调制消融。",
      "openness": {
        "status": "部分数据入口",
        "url": "https://github.com/VMVLab/ForceU-VLA",
        "note": "仓库与部分数据入口可查；操作者/受试者口径需进一步核对。"
      },
      "experiments": [],
      "purpose": "以专业成像结果与接触过程共同验证策略。"
    },
    {
      "id": "E11",
      "name": "TLA",
      "year": 2025,
      "family": "related",
      "signal": "触觉 + 语言，无视觉",
      "role": "前序工作",
      "platform": "插孔环境",
      "summary": "早期触觉—语言—动作模型，局部纠偏而非完整抓取。",
      "tasks": "不同孔形与间隙的插孔",
      "metrics": "GCR、L1、闭环成功率/步数",
      "trials": "闭环50次 / 设置",
      "warning": "不含视觉，作为TLA前序单列。",
      "domains": [
        "仿真"
      ],
      "scope": "边界参考",
      "evidence": "原文核查",
      "source": "https://arxiv.org/html/2503.08548v1",
      "notes": "### E11 — TLA: Tactile-Language-Action Model for Contact-Rich Manipulation\n\n**对应评测：TLA插孔数据与闭环插入套件。**这是触觉+语言动作模型，不含视觉输入，因此作为VTLA前序收集。\n\n离线用24k触觉—动作—指令样本，测GCR和分轴L1；闭环对不同孔形、1.0/1.6/2.0 mm间隙，每设置50次，最多15次尝试；报告成功率与成功episode平均步数。孔已握在手中，从近孔位开始，不涵盖完整视觉定位抓取。\n\n**值得收集：孔形/间隙泛化和局部接触纠偏。**VTLA后续加入真机Sim2Real比较，不能将后续论文的真机结果反写成TLA原论文结果。\n\n来源：[TLA§V](https://arxiv.org/html/2503.08548v1)。",
      "relations": [
        {
          "benchmark": "suite-e11",
          "type": "self",
          "label": "自建并评测",
          "domain": "仿真",
          "note": "闭环50次 / 设置"
        }
      ],
      "baseline": "BC、DP、单孔/多孔TLA；ID/OOD孔形与公差。",
      "openness": {
        "status": "公开情况待核验",
        "url": "https://arxiv.org/html/2503.08548v1",
        "note": "论文原文已核查；代码、数据、评测环境的完整公开情况尚未逐项确认，不等于未公开。"
      },
      "experiments": [],
      "purpose": "早期触觉—语言—动作模型，局部纠偏而非完整抓取。"
    },
    {
      "id": "E12",
      "name": "OmniVTA",
      "year": 2026,
      "family": "related",
      "signal": "视觉—触觉世界模型",
      "role": "相邻系统",
      "platform": "触觉机械臂 / 工具",
      "summary": "规划与反射控制结合，主动扰动接触再恢复。",
      "tasks": "擦、削、切、装配、抓取、调姿",
      "metrics": "成功/加工比例、物体/工具/扰动泛化",
      "trials": "常规10次 / 物体；泛化另设",
      "warning": "世界模型+反射控制相邻系统，非典型通用VLA。",
      "domains": [
        "真机"
      ],
      "scope": "边界参考",
      "evidence": "原文核查",
      "source": "https://arxiv.org/html/2603.19201v1",
      "notes": "### E12 — OmniVTA: Visuo-Tactile World Modeling for Contact-Rich Robotic Manipulation\n\n**对应评测：OmniVTA六类自建任务。**擦拭、削皮、切割、装配、抓取、调姿，视觉—触觉世界模型+扩散规划器+触觉反射控制。它是相邻系统，不因比较VLA就自动称为通用VLA。\n\n每类2–4物体、每物体10次；高度泛化每物体每高度5次，换刀具10次，突然上/下移动对象以破坏接触的扰动试验每任务10次。计分含加工长度比例、完整插入/无损抓取、调姿角度等，也约束不损坏触觉传感器。\n\n**值得收集：主动打断接触再恢复的扰动协议。**比只看初始位置随机化更直接测在线反馈；成功率、加工比例和传感器无损需按原文任务分别解释。\n\n来源：[OmniVTA§V-A–B](https://arxiv.org/html/2603.19201v1)。",
      "relations": [
        {
          "benchmark": "suite-e12",
          "type": "self",
          "label": "自建并评测",
          "domain": "真机",
          "note": "常规10次 / 物体；泛化另设"
        }
      ],
      "baseline": "原文视觉/触觉策略与RDP；无反射控制器版本；完整接口以原文为准。",
      "openness": {
        "status": "公开情况待核验",
        "url": "https://arxiv.org/html/2603.19201v1",
        "note": "论文原文已核查；代码、数据、评测环境的完整公开情况尚未逐项确认，不等于未公开。"
      },
      "experiments": [],
      "purpose": "规划与反射控制结合，主动扰动接触再恢复。"
    },
    {
      "id": "B01",
      "name": "ForceBench",
      "year": 2026,
      "family": "related",
      "signal": "仿真腕部6D反力",
      "role": "评测框架",
      "platform": "Isaac Lab / Franka",
      "summary": "固定数据、骨干与种子，比较六维力接入设计。",
      "tasks": "八仿真任务 + 五真机验证任务",
      "metrics": "任务/类别成功率、诊断结果",
      "trials": "仿真200；真机20次 / 任务-方法",
      "warning": "2026-10-14新发布；完整发布包未确认；主要配置50步执行完才再查询。",
      "domains": [
        "仿真",
        "真机"
      ],
      "scope": "评测研究",
      "evidence": "原文核查",
      "source": "https://arxiv.org/html/2610.19604v1",
      "notes": "### ForceBench 的使用关系\n\nForceBench包含八个仿真任务与五个真实验证任务，以统一数据、骨干与种子比较力接入方案。原文仿真每任务—方法200次。\n\nForceBench重新评估ForceVLA和ForceFlow等外部方法。这个方向是“后续评测”，不意味着早期方法原论文已采用ForceBench。\n\n来源：[原文§III、§V](https://arxiv.org/html/2610.19604v1)。",
      "relations": [
        {
          "benchmark": "forcebench",
          "type": "proposes",
          "label": "提出并评测",
          "domain": "仿真 + 真机",
          "note": "八仿真任务、五真机验证任务"
        }
      ],
      "baseline": "同π0.5骨干无力+六种融合设计；π0、ForceVLA、ForceFlow作外部比较。",
      "openness": {
        "status": "完整发布包待核验",
        "url": "https://forcebench-platform.github.io/",
        "note": "论文已发布；尚未确认完整代码、数据、权重和可运行环境。"
      },
      "experiments": [],
      "purpose": "固定数据、骨干与种子，比较六维力接入设计。"
    },
    {
      "id": "X01",
      "name": "SimpleTouch",
      "year": 2026,
      "family": "dex",
      "signal": "预训练触觉表示",
      "role": "触觉反馈",
      "platform": "UniVTAC / 真机",
      "summary": "以单阶段任务微调检验是否必须做额外触觉策略预训练。",
      "tasks": "UniVTAC六任务 + 四个真机任务",
      "metrics": "成功率、执行horizon消融",
      "trials": "仿真100；真机20次 / 任务",
      "warning": "仅为本轮补充核验；不将原表基线结果都称为重新测试。",
      "domains": [
        "仿真",
        "真机"
      ],
      "scope": "扩展相关",
      "evidence": "原文核查",
      "source": "https://arxiv.org/html/2610.02784v1",
      "notes": "### SimpleTouch：补充核验\n\n在UniVTAC六任务子集上微调与闭环评测，沿用FTP-1排除Grasp Classify和Insert HDMI。每任务50条示教、100次仿真，另有四个真实任务、20次/任务。\n\n附录明确使用官方任务随机化与成功定义。接触插入任务缩短执行horizon，控制率、预测块长、重规划间隔需要分别记录。\n\n来源：[原文与附录](https://arxiv.org/html/2610.02784v1)。",
      "relations": [
        {
          "benchmark": "univtac",
          "type": "adopts",
          "label": "采用6任务子集",
          "domain": "仿真",
          "note": "每任务50条官方示教；100次闭环仿真"
        },
        {
          "benchmark": "suite-x01",
          "type": "self",
          "label": "自建并评测",
          "domain": "真机",
          "note": "仿真100；真机20次 / 任务"
        }
      ],
      "baseline": "π0.5、Tactile-VLA、FTP-π0.5、FTP-1；编码器/未来预测/执行horizon消融。",
      "openness": {
        "status": "公开情况待核验",
        "url": "https://arxiv.org/html/2610.02784v1",
        "note": "论文原文已核查；代码、数据、评测环境的完整公开情况尚未逐项确认，不等于未公开。"
      },
      "experiments": [],
      "purpose": "以单阶段任务微调检验是否必须做额外触觉策略预训练。"
    }
  ],
  "benchmarks": [
    {
      "id": "univtac",
      "name": "UniVTAC Benchmark",
      "kind": "公开任务框架",
      "domain": "仿真",
      "focus": "视觉—触觉策略",
      "detail": "平台支持触觉仿真与数据合成；Encoder为表示学习模块；Benchmark为八个闭环操作任务。三者不混用。",
      "source": "https://arxiv.org/html/2602.10093v1",
      "tasks": [
        "Lift Bottle",
        "Pull-out Key",
        "Lift Can",
        "Put Bottle in Shelf",
        "Insert Hole",
        "Insert HDMI",
        "Insert Tube",
        "Grasp Classify"
      ]
    },
    {
      "id": "forcebench",
      "name": "ForceBench",
      "kind": "公开评测研究",
      "domain": "仿真 + 真机",
      "focus": "腕部六维力融合",
      "detail": "统一数据、骨干和测试种子比较力接入设计；新近发布，完整可运行发布包尚未确认。",
      "source": "https://arxiv.org/html/2610.19604v1",
      "tasks": [
        "Weight Sort",
        "CoM Sort",
        "Faucet Turn",
        "Faucet Direction",
        "Stove Turn",
        "Stove Press",
        "Drawer Pull",
        "Nut Thread"
      ]
    },
    {
      "id": "tabero",
      "name": "Tabero Benchmark",
      "kind": "论文提出的框架",
      "domain": "仿真",
      "focus": "轻柔指令与夹持力",
      "detail": "LIBERO场景/轨迹迁移至Isaac Lab触觉环境；属于衍生环境，不等于原版LIBERO分数。",
      "source": "https://arxiv.org/html/2605.27886v1",
      "tasks": [
        "firm / gentle指令",
        "夹持力AG / MG",
        "施加力AA / MA"
      ]
    },
    {
      "id": "libero",
      "name": "LIBERO（上游资源）",
      "kind": "上游场景/轨迹",
      "domain": "仿真",
      "focus": "通用操作资源",
      "detail": "在本关系图中标记Tabero的场景/轨迹来源，不标为所有触觉方法原论文的测试集。",
      "source": "https://arxiv.org/html/2605.27886v1",
      "tasks": []
    },
    {
      "id": "neoreal",
      "name": "NeoReal",
      "kind": "论文自建命名套件",
      "domain": "真机",
      "focus": "精细接触与长流程",
      "detail": "九项任务，成功率与100分阶段rubric并列；各任务试验预算不统一。",
      "source": "https://arxiv.org/html/2607.23782v1",
      "tasks": []
    },
    {
      "id": "neosim",
      "name": "NeoSim",
      "kind": "论文自建命名套件",
      "domain": "仿真",
      "focus": "单臂 / 双臂接触",
      "detail": "十二个任务，和UniVTAC八任务分组统计。",
      "source": "https://arxiv.org/html/2607.23782v1",
      "tasks": []
    },
    {
      "id": "suite-w01",
      "name": "ForceVLA 真机套件",
      "kind": "论文自建任务集",
      "domain": "真机",
      "focus": "将末端力作为 VLA 的独立输入，研究接触任务与物理泛化。",
      "detail": "描述名用于索引，不意味着作者发布了独立同名benchmark。具体任务与计分见对应工作的原文。",
      "source": "https://arxiv.org/html/2505.22159v1",
      "tasks": [
        "按瓶",
        "插头",
        "USB",
        "擦板",
        "削皮"
      ]
    },
    {
      "id": "suite-w02",
      "name": "ForceVLA2 真机套件",
      "kind": "论文自建任务集",
      "domain": "真机",
      "focus": "将力引入动作接口，覆盖持续接触与装配。",
      "detail": "描述名用于索引，不意味着作者发布了独立同名benchmark。具体任务与计分见对应工作的原文。",
      "source": "https://arxiv.org/html/2603.15169v1",
      "tasks": [
        "按瓶",
        "清洁花瓶",
        "擦板",
        "取盘",
        "齿轮"
      ]
    },
    {
      "id": "suite-w03",
      "name": "FAVLA 真机套件",
      "kind": "论文自建任务集",
      "domain": "真机",
      "focus": "通过快慢环与自适应更新频率应对接触变化。",
      "detail": "描述名用于索引，不意味着作者发布了独立同名benchmark。具体任务与计分见对应工作的原文。",
      "source": "https://arxiv.org/html/2602.23648v1",
      "tasks": [
        "USB",
        "齿轮",
        "翻盒",
        "擦板"
      ]
    },
    {
      "id": "suite-w04",
      "name": "DAM-VLA 真机套件",
      "kind": "论文自建任务集",
      "domain": "真机",
      "focus": "分离力、视觉记忆与异步处理的贡献。",
      "detail": "描述名用于索引，不意味着作者发布了独立同名benchmark。具体任务与计分见对应工作的原文。",
      "source": "https://arxiv.org/html/2606.12105v1",
      "tasks": [
        "围巾",
        "擦板",
        "按钮",
        "洗手液",
        "插座",
        "扫珠",
        "Lego"
      ]
    },
    {
      "id": "suite-w05",
      "name": "CR-VLA-Force 真机套件",
      "kind": "论文自建任务集",
      "domain": "真机",
      "focus": "慢策略结合柔顺执行，定量检验恒力跟踪。",
      "detail": "描述名用于索引，不意味着作者发布了独立同名benchmark。具体任务与计分见对应工作的原文。",
      "source": "https://arxiv.org/html/2609.05832v1",
      "tasks": [
        "急停按钮",
        "充电插头",
        "旋转窗",
        "恒力擦板"
      ]
    },
    {
      "id": "suite-w06",
      "name": "TAO-Force 真机套件",
      "kind": "论文自建任务集",
      "domain": "真机",
      "focus": "通过反事实力输入检验动作是否真正依赖力。",
      "detail": "描述名用于索引，不意味着作者发布了独立同名benchmark。具体任务与计分见对应工作的原文。",
      "source": "https://arxiv.org/html/2609.18497v1",
      "tasks": [
        "重量分拣",
        "削皮",
        "按泵",
        "擦板",
        "切割"
      ]
    },
    {
      "id": "suite-w07",
      "name": "ForceDelta-VLA 真机套件",
      "kind": "论文自建任务集",
      "domain": "真机",
      "focus": "在参考动作更新间隙学习接触纠偏与延迟修正。",
      "detail": "描述名用于索引，不意味着作者发布了独立同名benchmark。具体任务与计分见对应工作的原文。",
      "source": "https://arxiv.org/html/2609.18242v1",
      "tasks": [
        "五单臂任务",
        "四双臂任务"
      ]
    },
    {
      "id": "suite-w08",
      "name": "ForceRFT 真机套件",
      "kind": "论文自建任务集",
      "domain": "真机",
      "focus": "以在线残差学习提升限时自主完成能力。",
      "detail": "描述名用于索引，不意味着作者发布了独立同名benchmark。具体任务与计分见对应工作的原文。",
      "source": "https://arxiv.org/html/2609.22840v1",
      "tasks": [
        "插头",
        "环套柱",
        "擦板"
      ]
    },
    {
      "id": "suite-w09",
      "name": "Tactile-VLA 真机套件",
      "kind": "论文自建任务集",
      "domain": "真机",
      "focus": "把力语言迁移、物理常识和失败后调力分别测试。",
      "detail": "描述名用于索引，不意味着作者发布了独立同名benchmark。具体任务与计分见对应工作的原文。",
      "source": "https://arxiv.org/html/2507.09160v1",
      "tasks": [
        "USB/充电器插拔",
        "无变形抓取",
        "擦板"
      ]
    },
    {
      "id": "suite-w10",
      "name": "TaF-VLA 真机套件",
      "kind": "论文自建任务集",
      "domain": "真机",
      "focus": "利用物理接触表示覆盖抗滑、易碎与工具操作。",
      "detail": "描述名用于索引，不意味着作者发布了独立同名benchmark。具体任务与计分见对应工作的原文。",
      "source": "https://arxiv.org/html/2601.20321v1",
      "tasks": [
        "管插入",
        "镊子提重",
        "拔出",
        "擦板",
        "切片",
        "抓取等八类"
      ]
    },
    {
      "id": "suite-w12",
      "name": "TORL-VLA 真机套件",
      "kind": "论文自建任务集",
      "domain": "真机",
      "focus": "将精密接触、机械锁定与易碎搬运串为完整流程。",
      "detail": "描述名用于索引，不意味着作者发布了独立同名benchmark。具体任务与计分见对应工作的原文。",
      "source": "https://arxiv.org/html/2606.09337v1",
      "tasks": [
        "杯子入架",
        "搭扣",
        "鸡蛋",
        "串联全流程"
      ]
    },
    {
      "id": "suite-w13",
      "name": "TA-VLA 真机套件",
      "kind": "论文自建任务集",
      "domain": "真机",
      "focus": "研究历史扭矩与未来预测，同时检查常规能力。",
      "detail": "描述名用于索引，不意味着作者发布了独立同名benchmark。具体任务与计分见对应工作的原文。",
      "source": "https://arxiv.org/html/2509.07962v1",
      "tasks": [
        "五接触任务 + 五常规任务"
      ]
    },
    {
      "id": "suite-w14",
      "name": "FD-VLA 真机套件",
      "kind": "论文自建任务集",
      "domain": "真机",
      "focus": "把训练期力知识蒸馏到部署时可用表示。",
      "detail": "描述名用于索引，不意味着作者发布了独立同名benchmark。具体任务与计分见对应工作的原文。",
      "source": "https://arxiv.org/html/2602.02142v2",
      "tasks": [
        "擦板",
        "急停按钮",
        "插头"
      ]
    },
    {
      "id": "suite-w15",
      "name": "MoSS 真机套件",
      "kind": "论文自建任务集",
      "domain": "真机",
      "focus": "在同一骨干与任务下比较多种物理模态。",
      "detail": "描述名用于索引，不意味着作者发布了独立同名benchmark。具体任务与计分见对应工作的原文。",
      "source": "https://arxiv.org/html/2604.23272v1",
      "tasks": [
        "拆杯",
        "鸡蛋抓放",
        "擦板",
        "插头（v1）"
      ]
    },
    {
      "id": "suite-w16",
      "name": "CompVLA 真机套件",
      "kind": "论文自建任务集",
      "domain": "真机",
      "focus": "评估可变柔顺性，并保留普通抓放对照。",
      "detail": "描述名用于索引，不意味着作者发布了独立同名benchmark。具体任务与计分见对应工作的原文。",
      "source": "https://compvla.github.io/",
      "tasks": [
        "擦板",
        "Pivot",
        "Cup Dispense",
        "Pick & Place"
      ]
    },
    {
      "id": "suite-w17",
      "name": "ForceFlow 真机套件",
      "kind": "论文自建任务集",
      "domain": "真机",
      "focus": "VLM定位与接触策略分阶段，分析力统计与物理泛化。",
      "detail": "描述名用于索引，不意味着作者发布了独立同名benchmark。具体任务与计分见对应工作的原文。",
      "source": "https://arxiv.org/html/2605.11048v1",
      "tasks": [
        "盖章",
        "插头",
        "按压",
        "USB",
        "擦板",
        "花瓶"
      ]
    },
    {
      "id": "suite-w18",
      "name": "FAWAM 真机套件",
      "kind": "论文自建任务集",
      "domain": "真机",
      "focus": "世界动作模型结合力预测与残差纠偏。",
      "detail": "描述名用于索引，不意味着作者发布了独立同名benchmark。具体任务与计分见对应工作的原文。",
      "source": "https://arxiv.org/html/2606.08555v1",
      "tasks": [
        "擦板",
        "削皮",
        "翻盒",
        "擦花瓶"
      ]
    },
    {
      "id": "suite-e01",
      "name": "FuSe / Beyond Sight 真机套件",
      "kind": "论文自建任务集",
      "domain": "真机",
      "focus": "用语言连接异质感官，分别验证Octo与VLA。",
      "detail": "描述名用于索引，不意味着作者发布了独立同名benchmark。具体任务与计分见对应工作的原文。",
      "source": "https://arxiv.org/html/2501.04693v1",
      "tasks": [
        "桌面抓取",
        "袋中抓取",
        "按钮",
        "跨模态组合"
      ]
    },
    {
      "id": "suite-e02",
      "name": "VTLA 任务套件",
      "kind": "论文自建任务集",
      "domain": "仿真 + 真机",
      "focus": "从接触动作预测到闭环插孔，再验证仿真到真机。",
      "detail": "描述名用于索引，不意味着作者发布了独立同名benchmark。具体任务与计分见对应工作的原文。",
      "source": "https://arxiv.org/html/2505.09577v1",
      "tasks": [
        "五孔形",
        "不同装配间隙"
      ]
    },
    {
      "id": "suite-e03",
      "name": "FTP-1 真机套件",
      "kind": "论文自建任务集",
      "domain": "真机",
      "focus": "同一触觉基础策略跨传感器与本体适配。",
      "detail": "描述名用于索引，不意味着作者发布了独立同名benchmark。具体任务与计分见对应工作的原文。",
      "source": "https://arxiv.org/html/2606.13102v1",
      "tasks": [
        "UniVTAC六任务 + 多本体真机任务"
      ]
    },
    {
      "id": "suite-e05",
      "name": "T-Rex 真机套件",
      "kind": "论文自建任务集",
      "domain": "真机",
      "focus": "以触觉快速细化多指动作，覆盖复杂物体交互。",
      "detail": "描述名用于索引，不意味着作者发布了独立同名benchmark。具体任务与计分见对应工作的原文。",
      "source": "https://arxiv.org/html/2606.17055v1",
      "tasks": [
        "翻页",
        "移蛋",
        "擦盘",
        "挤膏",
        "拆杯",
        "开锁等十二项"
      ]
    },
    {
      "id": "suite-e06",
      "name": "STAR 真机套件",
      "kind": "论文自建任务集",
      "domain": "真机",
      "focus": "针对触觉的空间、时间与信息稀疏性学习。",
      "detail": "描述名用于索引，不意味着作者发布了独立同名benchmark。具体任务与计分见对应工作的原文。",
      "source": "https://arxiv.org/html/2609.12549v1",
      "tasks": [
        "耳机翻转",
        "叠书取出",
        "明信片",
        "多物体抓取"
      ]
    },
    {
      "id": "suite-e07",
      "name": "TacVLA 真机套件",
      "kind": "论文自建任务集",
      "domain": "真机",
      "focus": "接触门控决定何时使用触觉，验证受限/遮挡操作。",
      "detail": "描述名用于索引，不意味着作者发布了独立同名benchmark。具体任务与计分见对应工作的原文。",
      "source": "https://arxiv.org/html/2603.12665v1",
      "tasks": [
        "四项约束拆解 + 箱内取物"
      ]
    },
    {
      "id": "suite-e08",
      "name": "FWBC-VLA 真机套件",
      "kind": "论文自建任务集",
      "domain": "真机",
      "focus": "身体参与接触补偿，单独核验力估计和流程结果。",
      "detail": "描述名用于索引，不意味着作者发布了独立同名benchmark。具体任务与计分见对应工作的原文。",
      "source": "https://arxiv.org/html/2609.03889v2",
      "tasks": [
        "移动开门",
        "闭门器负载",
        "擦白板"
      ]
    },
    {
      "id": "suite-e09",
      "name": "Opt2VLA 任务套件",
      "kind": "论文自建任务集",
      "domain": "仿真 + 真机",
      "focus": "将任务完成、力意图和实际力实现联合计分。",
      "detail": "描述名用于索引，不意味着作者发布了独立同名benchmark。具体任务与计分见对应工作的原文。",
      "source": "https://opt2vla.github.io/",
      "tasks": [
        "搬箱",
        "推箱",
        "擦拭；轻/中/重力指令"
      ]
    },
    {
      "id": "suite-e10",
      "name": "ForceU-VLA 真机套件",
      "kind": "论文自建任务集",
      "domain": "真机",
      "focus": "以专业成像结果与接触过程共同验证策略。",
      "detail": "描述名用于索引，不意味着作者发布了独立同名benchmark。具体任务与计分见对应工作的原文。",
      "source": "https://arxiv.org/html/2608.15009v1",
      "tasks": [
        "肝 / 肾五个标准超声切面"
      ]
    },
    {
      "id": "suite-e11",
      "name": "TLA 任务套件",
      "kind": "论文自建任务集",
      "domain": "仿真",
      "focus": "早期触觉—语言—动作模型，局部纠偏而非完整抓取。",
      "detail": "描述名用于索引，不意味着作者发布了独立同名benchmark。具体任务与计分见对应工作的原文。",
      "source": "https://arxiv.org/html/2503.08548v1",
      "tasks": [
        "不同孔形与间隙的插孔"
      ]
    },
    {
      "id": "suite-e12",
      "name": "OmniVTA 真机套件",
      "kind": "论文自建任务集",
      "domain": "真机",
      "focus": "规划与反射控制结合，主动扰动接触再恢复。",
      "detail": "描述名用于索引，不意味着作者发布了独立同名benchmark。具体任务与计分见对应工作的原文。",
      "source": "https://arxiv.org/html/2603.19201v1",
      "tasks": [
        "擦",
        "削",
        "切",
        "装配",
        "抓取",
        "调姿"
      ]
    },
    {
      "id": "suite-x01",
      "name": "SimpleTouch 真机套件",
      "kind": "论文自建任务集",
      "domain": "真机",
      "focus": "以单阶段任务微调检验是否必须做额外触觉策略预训练。",
      "detail": "描述名用于索引，不意味着作者发布了独立同名benchmark。具体任务与计分见对应工作的原文。",
      "source": "https://arxiv.org/html/2610.02784v1",
      "tasks": [
        "UniVTAC六任务 + 四个真机任务"
      ]
    }
  ],
  "extraRelations": [
    {
      "fromWork": "W01",
      "toBenchmark": "forcebench",
      "type": "later",
      "label": "后续重新评测",
      "note": "ForceBench论文中的外部比较，不是ForceVLA原论文的评测。",
      "source": "https://arxiv.org/html/2610.19604v1"
    },
    {
      "fromWork": "W17",
      "toBenchmark": "forcebench",
      "type": "later",
      "label": "后续重新评测",
      "note": "由ForceBench纳入外部比较。",
      "source": "https://arxiv.org/html/2610.19604v1"
    },
    {
      "fromBenchmark": "tabero",
      "toBenchmark": "libero",
      "type": "derived",
      "label": "场景 / 轨迹衍生",
      "note": "复用资源并改变触觉/控制环境，不能直接等同原版成绩。",
      "source": "https://arxiv.org/html/2605.27886v1"
    }
  ],
  "features": [
    {
      "work": "W06",
      "title": "模型真的在利用力吗？",
      "text": "固定视觉交换力输入，区分离线路由响应与实际执行。"
    },
    {
      "work": "W07",
      "title": "参考动作延迟时还能纠偏吗？",
      "text": "单臂与双臂分别测，峰值和耗时保留成功样本口径。"
    },
    {
      "work": "W05",
      "title": "有没有跟住目标力？",
      "text": "恒力擦拭与高度OOD，明确参考力、误差和保护停机。"
    },
    {
      "work": "W09",
      "title": "“轻一点”能否跨任务？",
      "text": "把已见运动与未见力语言分开，测真实施加力。"
    },
    {
      "work": "W12",
      "title": "能否无损完成全流程？",
      "text": "杯子、搭扣、鸡蛋，子任务与完整自主流程分别计分。"
    },
    {
      "work": "E05",
      "title": "多指操作怎样计分？",
      "text": "十二类灵巧操作；完整成功与分阶段进度要读清。"
    },
    {
      "work": "E03",
      "title": "传感器换了还能用吗？",
      "text": "UniVTAC仿真与真实硬件分开，已见/未见传感器分组。"
    },
    {
      "work": "E09",
      "title": "做成了，也用对力了吗？",
      "text": "任务完成、命令力意图、实际力跟踪三关联合。"
    }
  ],
  "documents": [
    {
      "name": "带力控制VLA扩展调研_简易版",
      "url": "documents/带力控制VLA扩展调研_简易版.md"
    },
    {
      "name": "带力控制VLA扩展调研_详细版",
      "url": "documents/带力控制VLA扩展调研_详细版.md"
    },
    {
      "name": "带力控制VLA评测调研_简易版",
      "url": "documents/带力控制VLA评测调研_简易版.md"
    },
    {
      "name": "带力控制VLA评测调研_详细版",
      "url": "documents/带力控制VLA评测调研_详细版.md"
    }
  ]
};
