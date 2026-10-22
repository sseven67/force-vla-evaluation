import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import ErrorBoundary from "./components/ErrorBoundary.jsx";
import { CatalogueContext, createCatalogue } from "./data/catalogue.js";
import "./styles.css";

const root = createRoot(document.getElementById("root"));

async function start() {
  root.render(
    <p className="loading-state" role="status">
      正在载入力与触觉评测研究地图…
    </p>,
  );
  try {
    const response = await fetch(`${import.meta.env.BASE_URL}catalogue.json`);
    if (!response.ok) throw new Error(`Catalogue HTTP ${response.status}`);
    const catalogue = createCatalogue(await response.json());
    root.render(
      <ErrorBoundary>
        <CatalogueContext.Provider value={catalogue}>
          <App />
        </CatalogueContext.Provider>
      </ErrorBoundary>,
    );
  } catch {
    root.render(
      <div className="app-error" role="alert">
        <h1>研究资料载入失败</h1>
        <p>请确认本地服务和目录文件可用，然后重试。</p>
        <button className="primary-button" onClick={start}>
          重新载入资料
        </button>
      </div>,
    );
  }
}

start();
