import { useCallback, useState } from "react";
import { DEFAULT_PAPER_FILTERS } from "../data/selectors.js";

export function usePaperLibrary() {
  const [q, setQ] = useState("");
  const [filters, setFilters] = useState(DEFAULT_PAPER_FILTERS);
  const [sort, setSort] = useState("stars");
  const [layout, setLayout] = useState("cards");
  // Accept one field or a patch so related changes form a single update.
  const fp = useCallback((key, value) => {
    setFilters((previous) => ({
      ...previous,
      ...(typeof key === "string" ? { [key]: value } : key),
    }));
  }, []);
  const reset = useCallback((overrides = {}) => {
    setQ("");
    setFilters({ ...DEFAULT_PAPER_FILTERS, ...overrides });
  }, []);
  return { q, setQ, filters, fp, reset, sort, setSort, layout, setLayout };
}
