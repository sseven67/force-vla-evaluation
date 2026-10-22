import { useCallback, useEffect, useState } from "react";

export const names = {
  works: "论文库",
  tasks: "评测任务库",
  benchmarks: "Benchmark 与资源",
  compare: "横向比较",
  overview: "研究路线",
  guide: "读懂评测",
};

export function parseHash(hash = window.location.hash) {
  try {
    const raw = hash.replace(/^#/, "");
    if (raw.startsWith("work="))
      return { view: "works", paper: decodeURIComponent(raw.slice(5)) };
    const [view, encodedItem] = raw.split("/");
    const item = encodedItem ? decodeURIComponent(encodedItem) : undefined;
    if (view === "paper") return { view: "works", paper: item };
    return { view: Object.hasOwn(names, view) ? view : "works", item };
  } catch {
    return { view: "works" };
  }
}

export function useHashRoute() {
  const [route, setRoute] = useState(parseHash);
  useEffect(() => {
    const onChange = () => {
      setRoute(parseHash());
      window.scrollTo(0, 0);
    };
    window.addEventListener("hashchange", onChange);
    return () => window.removeEventListener("hashchange", onChange);
  }, []);
  const goto = useCallback((view, item) => {
    window.location.hash = view + (item ? "/" + encodeURIComponent(item) : "");
  }, []);
  return [route, goto];
}
