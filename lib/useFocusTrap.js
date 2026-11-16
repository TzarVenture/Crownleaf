"use client";

import { useEffect } from "react";

const FOCUSABLE =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Keeps keyboard focus inside a dialog while it is open, closes it on Escape, and returns focus to
 * the element that opened it afterwards.
 */
export function useFocusTrap(containerRef, active, onEscape) {
  useEffect(() => {
    if (!active) return undefined;
    const container = containerRef.current;
    if (!container) return undefined;

    const previouslyFocused = document.activeElement;
    const focusable = () => [...container.querySelectorAll(FOCUSABLE)].filter((el) => el.offsetParent !== null);

    // Move focus into the dialog (prefer an input, e.g. the search box).
    const initial = container.querySelector("input:not([disabled])") || focusable()[0];
    initial?.focus();

    function onKeyDown(event) {
      if (event.key === "Escape") {
        onEscape?.();
        return;
      }
      if (event.key !== "Tab") return;
      const items = focusable();
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      if (previouslyFocused instanceof HTMLElement) previouslyFocused.focus();
    };
  }, [active, containerRef, onEscape]);
}
