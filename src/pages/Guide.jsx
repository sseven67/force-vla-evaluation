import React, { useState } from "react";
import { PageIntro } from "../components/ui.jsx";

function Guide() {
  const [step, setStep] = useState(0);
  const stages = ["读取观测", "输出动作", "执行与接触", "读取新反馈"];
  return (
    <>
      <PageIntro eyebrow="READING GUIDE / 评测阅读指南" title="先分清在测什么，再读成功率。">
        同样是插入任务，有的检查能否对准，有的检查能否按要求用力。先看实验想验证什么，再看怎样评分。
      </PageIntro>
      <div className="guide-cards">
        {[
          [
            "离线预测评测",
            "读取已经保存的数据，比较模型预测和已知答案，不让机器人执行预测动作。",
            "可以测动作或力预测得准不准、物体性质判断得对不对；还不能据此判断实际操作能否成功。",
          ],
          [
            "仿真中的自主操作评测",
            "模型在仿真里执行动作，读取新的画面和接触信息，再决定下一步。",
            "UniVTAC、OpenViTac包含这类测试。比较模型时，需要使用相同的环境设置和成功标准。",
          ],
          [
            "真实机器人评测",
            "在真实机器人、物体和接触条件下执行并计分。",
            "需要说明起始位置、测试次数、是否有人帮助、何时停止，以及怎样算成功。",
          ],
        ].map(([a, b, c]) => (
          <article className="guide-card" key={a}>
            <h2>{a}</h2>
            <p>{b}</p>
            <small>{c}</small>
          </article>
        ))}
      </div>
      <div className="loop-panel">
        <div className="loop-controls">
          <div>
            <h2>机器人怎样根据反馈调整动作？</h2>
            <p className="mini-note">流程示意，非真实模型或实验数据</p>
          </div>
          <button
            className="primary-button"
            onClick={() => setStep((step + 1) % 4)}
          >
            下一步
          </button>
        </div>
        <div className="loop-steps">
          {stages.map((s, i) => (
            <div
              key={s}
              className={"loop-step " + (step === i ? "active" : "")}
            >
              {s}
            </div>
          ))}
        </div>
      </div>
      <div className="glossary">
        {[
          [
            "腕部六维力 ≠ 两指各三维力",
            "腕部六维力记录三个方向的受力和三个方向的扭转作用。指尖传感器分别测每根手指的接触力；两指相向夹紧的力，可能在腕部读数中互相抵消。",
          ],
          [
            "读取力反馈和主动设定用力，是两回事",
            "有的模型根据当前力调整动作；有的还输出“接下来要用多大力”。训练时用过力数据，也不代表执行时仍读取力。",
          ],
          [
            "最大用力和目标力误差，评价的重点不同",
            "最大接触力看有没有瞬间用力过大；目标力误差看实际用力离要求差多少。力很小也可能只是没有碰到物体。",
          ],
          [
            "读取传感器、更新动作和重新规划，频率可能不同",
            "例如每秒读取力400次，不代表模型每秒重新决定动作400次。阅读设置时要区分这些数字。",
          ],
          [
            "只统计部分测试 ≠ 统计全部测试",
            "如果只算成功操作中的力，就没有包括失败时的用力情况。比较结果前，要先确认是否包含全部测试。",
          ],
          [
            "同名任务 ≠ 同一Benchmark",
            "两篇论文都做USB插入，不代表使用同一套测试。还要看物体、起始位置、测试次数和成功标准是否一致。",
          ],
        ].map(([a, b]) => (
          <article className="glossary-item" key={a}>
            <h3>{a}</h3>
            <p>{b}</p>
          </article>
        ))}
      </div>
    </>
  );
}

export default Guide;
