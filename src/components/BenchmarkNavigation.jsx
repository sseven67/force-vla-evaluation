import React, { useEffect, useRef, useState } from "react";

const SECTIONS = ["资源概况", "任务与评分", "使用工作", "相关资料", "研究记录"];

export default function BenchmarkNavigation({ resourceId, sections = SECTIONS, initialSection }) {
  const nav = useRef(null);
  const [active, setActive] = useState(0);
  useEffect(() => {
    let frame;
    const update = () => {
      const header = document.querySelector(".topbar");
      const top = header?.getBoundingClientRect().height || 0;
      nav.current.style.top = `${top}px`;
      const offset = top + nav.current.offsetHeight + 24;
      let current = 0;
      sections.forEach((_, i) => {
        if (document.getElementById(`benchmark-section-${i}`)?.getBoundingClientRect().top <= offset) current = i;
      });
      if (window.scrollY > 0 && window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2) current = sections.length - 1;
      setActive(current);
    };
    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => { frame = null; update(); });
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [resourceId, sections]);

  useEffect(() => {
    if (!Number.isInteger(initialSection) || initialSection < 0 || initialSection >= sections.length) return;
    const frame = requestAnimationFrame(() => goToSection(initialSection, "instant"));
    return () => cancelAnimationFrame(frame);
  }, [resourceId, initialSection]);

  function goToSection(index, behavior) {
    const target = document.getElementById(`benchmark-section-${index}`);
    if (!target) return;
    const offset = (document.querySelector(".topbar")?.offsetHeight || 0) + nav.current.offsetHeight + 20;
    const top = window.scrollY + target.getBoundingClientRect().top - offset;
    setActive(index);
    window.scrollTo({ top, behavior: behavior || (window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth") });
    target.focus({ preventScroll: true });
  }

  return <nav ref={nav} className="benchmark-nav" aria-label="评测资源章节">
    {sections.map((label, index) => <button key={label} className={active === index ? "active" : ""}
      aria-current={active === index ? "location" : undefined} onClick={() => goToSection(index)}>
      <span aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>{label}
    </button>)}
  </nav>;
}
