"use client";
import { Moon, Sun } from "@phosphor-icons/react";
export function ThemeToggle() {
  function toggle() {
    const root = document.documentElement;
    const dark = root.dataset.theme
      ? root.dataset.theme === "dark"
      : window.matchMedia("(prefers-color-scheme: dark)").matches;
    const theme = dark ? "light" : "dark";
    root.dataset.theme = theme;
    try {
      localStorage.setItem("jev-theme", theme);
    } catch {
      /* Theme still works when storage is unavailable. */
    }
  }
  return (
    <button
      type="button"
      className="icon-button theme-toggle"
      aria-label="Toggle color theme"
      title="Toggle color theme"
      onClick={toggle}
    >
      <Moon className="theme-moon" size={19} />
      <Sun className="theme-sun" size={19} />
    </button>
  );
}
