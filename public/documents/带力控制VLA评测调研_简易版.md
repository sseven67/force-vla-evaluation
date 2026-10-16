# 带力控制 VLA 工作及其评测：简易版

更新：2026-10-15。主线：**先找带末端六维力、用夹爪操作的VLA工作，再看各自用什么benchmark、如何评测。**详细来源与协议见[详细版](./带力控制VLA评测调研_详细版.md)。

## 核心结论

大多数论文使用**自建真机任务集**，不是都在同一个标准benchmark上测试。插头、擦板等名字相同，也不能直接比较论文间成功率。使用夹爪不等于论文专门控制或评测夹持力。

本次整理18项方法工作，另有ForceBench统一评测研究。优先阅读ForceVLA、ForceVLA2、FAVLA；TA-VLA和Tactile-VLA是重要相关分支。ForceVLA/TA-VLA被多篇后续工作作为对照，是选入代表工作的直接依据；新论文因评测设计有特色收录，不统一称为高引用。

## 核心工作分别怎么评测

| 对应工作 | 使用的benchmark/任务集 | 怎么测 |
|---|---|---|
| **ForceVLA** | 自建五任务：按瓶、插头、USB、擦板、削皮 | 成功率+削皮质量；插接/按压20次、擦板10、削皮15；另测遮挡/物体泛化 |
| **ForceVLA2** | 自建五任务：按瓶、花瓶清洁、擦板、取盘、齿轮 | 每任务20次；成功率与混合力—位置控制表现 |
| **FAVLA** | 自建USB、齿轮、翻盒、擦板 | 25/30/20/10次；成功率+平均峰值力+频率消融 |
| **DAM-VLA（异步多模态）** | 自建七任务，含按压、插座、Lego、扫珠 | 每任务15次；成功、耗时、平滑性；拆分力/记忆/异步贡献 |
| **CR-VLA-Force / CC-VLA** | 自建按键、插头、旋转窗、恒力擦板 | 每条件24–25次；恒力擦板目标40 N，测跟踪误差与高度OOD |
| **TAO-Force** | 自建重量分拣、削皮、按泵、擦板、切割 | ID/OOD每任务各30次；另固定视觉交换力，检查动作是否随力改变 |
| **ForceDelta-VLA** | 自建五单臂+四双臂任务 | 每任务20次；成功率、成功trial峰值力/时间、延迟鲁棒性 |
| **ForceRFT** | 自建插头、环套柱、擦板 | 每设置30次；限时、无介入/重置/保护停机；匹配在线学习预算 |

上述核心工作来源依次为：[ForceVLA](https://arxiv.org/html/2505.22159v1)、[ForceVLA2](https://arxiv.org/html/2603.15169v1)、[FAVLA](https://arxiv.org/html/2602.23648v1)、[DAM-VLA](https://arxiv.org/html/2606.12105v1)、[CR-VLA-Force](https://arxiv.org/html/2609.05832v1)、[TAO-Force](https://arxiv.org/html/2609.18497v1)、[ForceDelta-VLA](https://arxiv.org/html/2609.18242v1)、[ForceRFT](https://arxiv.org/html/2609.22840v1)。

## 扩展相关工作

| 对应工作 | 所用评测与特点 | 与核心范围的区别 |
|---|---|---|
| **Tactile-VLA** | 自建力语言迁移、无变形抓取、擦板 | 双指触觉/力 |
| **TaF-VLA** | 自建八类接触任务，每任务15次 | 触觉—力对齐 |
| **Tabero** | LIBERO衍生Tabero；成功率+夹持力/作用力过程指标 | 两指各3D力，不是腕部6D wrench |
| **TORL-VLA** | 杯子、搭扣、鸡蛋与串联全流程；各30次、无损且不介入 | 两指各6D，合12D wrench |
| **TA-VLA** | 自建五接触+五常规任务，各20次 | 关节torque输入 |
| **FD-VLA** | 自建擦板、按钮、插头，各30次 | 用力训练，部署不读真实力 |
| **MoSS** | v1自建拆杯、鸡蛋抓放、擦板、插头，各24次 | 触觉+关节torque |
| **CompVLA** | 自建三种柔顺任务+Pick & Place | 评测策略不使用F/T输入 |
| **ForceFlow** | 自建六真机任务，各20次，另测力统计偏差/OOD | VLM定位+接触策略分阶段 |
| **FAWAM** | 自建擦板、削皮、翻盒、擦花瓶，各20次 | World Action Model相邻路线 |

来源：[Tactile-VLA](https://arxiv.org/html/2507.09160v1)、[TaF-VLA](https://arxiv.org/html/2601.20321v1)、[Tabero](https://arxiv.org/html/2605.27886v1)、[TORL-VLA](https://arxiv.org/html/2606.09337v1)、[TA-VLA](https://arxiv.org/html/2509.07962v1)、[FD-VLA](https://arxiv.org/html/2602.02142v2)、[MoSS](https://arxiv.org/html/2604.23272v1)、[CompVLA](https://compvla.github.io/)、[ForceFlow](https://arxiv.org/html/2605.11048v1)、[FAWAM](https://arxiv.org/html/2606.08555v1)。

## 其中最值得收集的评测套件

| 收集什么 | 明确对应哪项工作 | 有特色在哪里 |
|---|---|---|
| **恒力擦板** | **CR-VLA-Force** | 直接测目标力跟踪，不只看擦没擦干净 |
| **力语言跨任务迁移** | **Tactile-VLA** | 看“轻一点/重一点”能否迁移到另一任务 |
| **夹持力与作用力指标** | **Tabero** | 分开测夹紧物体和对环境施力；有专门benchmark仓库 |
| **杯子—搭扣—鸡蛋全流程** | **TORL-VLA** | 测连续可靠性、无损、无介入与吞吐量 |
| **单/双臂+延迟** | **ForceDelta-VLA** | 接触纠偏是否能抵抗参考动作延迟 |
| **反事实力注入** | **TAO-Force** | 检验模型是否真正利用力 |
| **自主完成与停止** | **ForceRFT** | 擦完必须抬起并停下，人工救援不算自主成功 |
| **统一六维力融合比较** | **ForceBench论文** | 同数据、同骨干、同测试种子比较力接入设计 |

[ForceBench](https://arxiv.org/html/2610.19604v1)于2026-10-14刚发布，八个仿真任务，另做真机验证；本次尚未确认完整可运行发布包。**它重新评测ForceVLA等方法，不代表这些方法原论文使用过ForceBench。**

这里多数“套件”是论文自建实验协议，不能默认都有独立开源环境。详细版逐项给出来源、次数、判据、指标与尚未确认的信息。

引用/热度：本次核验TA-VLA官方仓库123 stars、Tabero 59 stars（2026-10-15快照）；引用数据库覆盖不完整，未制作不可靠的高引用排名。后续作为基线的采用证据在详细版单列。

已完成文献与协议整理；没有执行benchmark、安装环境或修改项目代码。