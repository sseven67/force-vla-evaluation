import React from "react";
import { useCatalogue } from "../data/catalogue.js";

function Sources({ saved }) {
  const { D } = useCatalogue();
  const counts = {
    scholar: D.works.filter((w) => w.attention.googleScholar != null).length,
    citation: D.works.filter((w) => w.attention.citations != null).length,
    stars: D.works.filter((w) => w.attention.stars != null).length,
  };
  return (
    <div className="source-body">
      <h2>文献与关注度记录：{D.updated}</h2>
      <p>
        目录共{D.works.length}项，其中{counts.scholar}项取得Google Scholar引用，{counts.citation}项取得OpenAlex收录引用，
        {counts.stars}项取得官方仓库Stars/Forks。每个可用数值都提供记录链接。
      </p>
      <div className="evidence-warning">
        引用按平台分别统计；Stars 仅反映关注度。
      </div>
      <p>
        “—”表示缺失，缺失项排在最后。
      </p>
      <h3>原始调研文档</h3>
      {D.documents.map((d) => (
        <a className="document-link" href={d.url} download key={d.url}>
          {d.name}
          <small>Markdown ↓</small>
        </a>
      ))}
      <h3>研究目录与个人笔记</h3>
      <a className="document-link" href="catalogue.json" download>
        下载完整研究目录 JSON ↓
      </a>
      <a
        className="document-link"
        href={
          "data:application/json;charset=utf-8," +
          encodeURIComponent(
            JSON.stringify({ exported: D.updated, notes: saved }, null, 2),
          )
        }
        download="force-atlas-personal-notes.json"
      >
        导出当前浏览器的收藏与笔记 JSON ↓
      </a>
      <p className="mini-note">
        资料来自公开论文与作者资源，图片版权归原作者。
      </p>
    </div>
  );
}

export default Sources;
