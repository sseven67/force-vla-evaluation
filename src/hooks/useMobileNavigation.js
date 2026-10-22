import { useCallback, useEffect, useRef, useState } from "react";
import { useScrollLock } from "./useScrollLock.js";

export function useMobileNavigation(route) {
  const [mobile, setMobile] = useState(false);
  const navigationRef = useRef(null);
  const closeNavigation = useCallback(() => setMobile(false), []);
  useScrollLock(mobile);

  useEffect(closeNavigation, [route, closeNavigation]);
  useEffect(() => {
    if (!mobile) return;
    const previousFocus = document.activeElement;
    const controls = () =>
      [...navigationRef.current.querySelectorAll("a[href], button")].filter(
        (element) => element.getClientRects().length,
      );
    controls()[0]?.focus();
    const onKey = (event) => {
      if (event.key === "Escape") closeNavigation();
      if (event.key !== "Tab") return;
      const items = controls(),
        first = items[0],
        last = items.at(-1);
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    };
    const onResize = () => {
      if (window.innerWidth > 760) closeNavigation();
    };
    document.addEventListener("keydown", onKey);
    window.addEventListener("resize", onResize);
    return () => {
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", onResize);
      // An open native dialog owns focus until it closes.
      if (!document.querySelector("dialog[open]") && previousFocus?.isConnected)
        previousFocus.focus();
    };
  }, [mobile, closeNavigation]);

  return { mobile, setMobile, navigationRef, closeNavigation };
}
