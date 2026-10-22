import { useCallback, useEffect, useRef, useState } from "react";

const STORAGE_KEY = "force-atlas-notes-v2";
const FAILURE = "收藏与笔记暂时无法保存到浏览器，请先导出备份。";
const isRecord = (value) =>
  value !== null && typeof value === "object" && !Array.isArray(value);

function readSaved() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { saved: {}, error: "" };
    const value = JSON.parse(raw);
    if (
      !isRecord(value) ||
      !Object.values(value).every(
        (entry) =>
          isRecord(entry) &&
          (entry.bookmark === undefined ||
            typeof entry.bookmark === "boolean") &&
          (entry.note === undefined || typeof entry.note === "string") &&
          (entry.status === undefined || typeof entry.status === "string"),
      )
    ) {
      throw new Error("Invalid notes");
    }
    return { saved: value, error: "" };
  } catch {
    return {
      saved: {},
      error: "浏览器阅读记录无法读取，请检查本地存储；可继续浏览网站。",
    };
  }
}

export function useSaved() {
  const [initial] = useState(readSaved);
  const [saved, setSaved] = useState(initial.saved);
  const [error, setError] = useState(initial.error);
  const lastSaved = useRef(initial.saved);

  useEffect(() => {
    if (saved === lastSaved.current) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
      lastSaved.current = saved;
      setError("");
    } catch {
      setError(FAILURE);
    }
  }, [saved]);

  const save = useCallback((id, value) => {
    setSaved((current) => ({ ...current, [id]: { ...current[id], ...value } }));
  }, []);
  return [saved, save, error];
}
