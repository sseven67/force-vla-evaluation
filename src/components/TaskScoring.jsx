import React from "react";

export default function TaskScoring({ task }) {
  return <p>{task.subtasks?.length ? task.metricSummary : `${task.metricLabel}：${task.scoring}`}</p>;
}
