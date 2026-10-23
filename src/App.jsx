import React, { lazy, Suspense, useEffect, useState } from "react";
import { useCatalogue } from "./data/catalogue.js";
import { names, useHashRoute } from "./hooks/useHashRoute.js";
import { useSaved } from "./hooks/useSaved.js";
import Sidebar from "./components/Sidebar.jsx";
import Topbar from "./components/Topbar.jsx";
import ComparisonTray from "./components/ComparisonTray.jsx";
import { useMobileNavigation } from "./hooks/useMobileNavigation.js";
import { usePaperLibrary } from "./hooks/usePaperLibrary.js";
import Modal from "./components/Modal.jsx";
import PaperLibrary from "./pages/PaperLibrary.jsx";

const TaskLibrary = lazy(() => import("./pages/TaskLibrary.jsx"));
const Benchmarks = lazy(() => import("./pages/Benchmarks.jsx"));
const ComparePage = lazy(() => import("./pages/ComparePage.jsx"));
const Overview = lazy(() => import("./pages/Overview.jsx"));
const Guide = lazy(() => import("./pages/Guide.jsx"));
const PaperDetail = lazy(() => import("./components/PaperDetail.jsx"));
const Sources = lazy(() => import("./components/Sources.jsx"));
function Loading() {
  return (
    <p className="loading-state" role="status">
      正在载入页面…
    </p>
  );
}

export default function App() {
  const { D, byId } = useCatalogue();

  const [route, goto] = useHashRoute();
  const [selected, setSelected] = useState([]),
    [saved, save, storageError] = useSaved(),
    [sourceOpen, setSourceOpen] = useState(false),
    [toast, setToast] = useState("");
  const library = usePaperLibrary();
  const { mobile, setMobile, navigationRef, closeNavigation } =
    useMobileNavigation(route);
  useEffect(() => {
    if (storageError) setToast(storageError);
  }, [storageError]);
  useEffect(() => {
    document.title = `${names[route.view]} · Force-VLA Evaluation Platform`;
  }, [route.view]);
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(""), 2600);
    return () => clearTimeout(t);
  }, [toast]);
  const compare = (id) => {
    if (!selected.includes(id) && selected.length >= 3) {
      setToast("最多选择3篇，请先移除一篇。");
      return;
    }
    setSelected((prev) =>
      prev.includes(id)
        ? prev.filter((x) => x !== id)
        : prev.length < 3
          ? [...prev, id]
          : prev,
    );
  };
  const search = (value) => {
    library.setQ(value);
    if (route.view !== "works") goto("works");
  };
  const showPaper = (id) => goto("paper", id);
  useEffect(() => {
    const key = (e) => {
      if (
        e.key === "/" &&
        !/INPUT|TEXTAREA|SELECT/.test(e.target.tagName) &&
        !e.target.isContentEditable &&
        !document.querySelector("dialog[open]")
      ) {
        e.preventDefault();
        location.hash = "works";
        setTimeout(() => document.getElementById("work-search")?.focus(), 0);
      }
    };
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  }, []);
  const props = { goto, showPaper, compare, selected, saved, save, setToast };
  return (
    <>
      <a
        className="skip-link"
        href="#content"
        onClick={(e) => {
          e.preventDefault();
          document.getElementById("content")?.focus();
        }}
      >
        跳到内容
      </a>
      {mobile && (
        <div
          className="nav-backdrop"
          onClick={closeNavigation}
          aria-hidden="true"
        />
      )}
      <Sidebar
        route={route}
        filters={library.filters}
        fp={library.fp}
        goto={goto}
        selectedCount={selected.length}
        mobile={mobile}
        closeNavigation={closeNavigation}
        navigationRef={navigationRef}
        openSources={() => setSourceOpen(true)}
      />
      <div
        className={"workspace " + (selected.length ? "has-comparison" : "")}
        inert={mobile ? true : undefined}
      >
        <Topbar
          view={route.view}
          query={library.q}
          search={search}
          mobile={mobile}
          toggleNavigation={() => setMobile(!mobile)}
        />
        <main id="content" tabIndex={-1}>
          <Suspense fallback={<Loading />}>
            {route.view === "works" && <PaperLibrary {...props} {...library} />}
            {route.view === "tasks" && (
              <TaskLibrary {...props} item={route.item} />
            )}
            {route.view === "benchmarks" && (
              <Benchmarks {...props} item={route.item} />
            )}
            {route.view === "compare" && (
              <ComparePage {...props} clear={() => setSelected([])} />
            )}
            {route.view === "overview" && <Overview {...props} />}
            {route.view === "guide" && <Guide />}
          </Suspense>
        </main>
        <footer className="footer">
          <span>从论文出发，围绕任务交叉阅读。</span>
          <span>文献与计数快照 {D.updated}</span>
        </footer>
      </div>
      {selected.length > 0 && route.view !== "compare" && (
        <ComparisonTray
          selected={selected}
          compare={compare}
          clear={() => setSelected([])}
          goto={goto}
        />
      )}
      {route.paper && byId.has(route.paper) && (
        <Modal
          key={route.paper}
          title={byId.get(route.paper).name}
          onClose={() => goto("works")}
          wide
        >
          <Suspense fallback={<Loading />}>
            <PaperDetail w={byId.get(route.paper)} {...props} />
          </Suspense>
        </Modal>
      )}
      {sourceOpen && (
        <Modal title="数据来源与统计说明" onClose={() => setSourceOpen(false)}>
          <Suspense fallback={<Loading />}>
            <Sources saved={saved} />
          </Suspense>
        </Modal>
      )}
      {toast && (
        <div className="toast" role="status">
          {toast}
        </div>
      )}
    </>
  );
}
