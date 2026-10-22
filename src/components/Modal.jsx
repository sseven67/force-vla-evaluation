import React, { useEffect, useId, useRef } from "react";
import { useScrollLock } from "../hooks/useScrollLock.js";

export default function Modal({ title, onClose, wide = false, children }) {
  const ref = useRef(null);
  const titleId = useId();
  useScrollLock();

  useEffect(() => {
    const dialog = ref.current;
    const previousFocus = document.activeElement;
    dialog.showModal();
    return () => {
      dialog.close();
      if (previousFocus?.isConnected) previousFocus.focus();
    };
  }, []);

  function closeFromBackdrop(event) {
    if (event.target !== ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    if (
      event.clientX < rect.left ||
      event.clientX > rect.right ||
      event.clientY < rect.top ||
      event.clientY > rect.bottom
    )
      onClose();
  }

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      className={"atlas-dialog " + (wide ? "wide" : "")}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClick={closeFromBackdrop}
    >
      <header className="dialog-header">
        <span id={titleId}>{title}</span>
        <button aria-label="关闭详情" onClick={onClose}>
          ×
        </button>
      </header>
      {children}
    </dialog>
  );
}
