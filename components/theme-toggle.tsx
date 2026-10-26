"use client";
import { Moon, Sun } from "@phosphor-icons/react";
import type { Locale } from "@/lib/i18n";
export function ThemeToggle({ locale = "en" }: { locale?: Locale }) {
  const label = locale === "ko" ? "색상 테마 전환" : "Toggle color theme";
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
      aria-label={label}
      title={label}
      onClick={toggle}
    >
      <Moon className="theme-moon" size={19} />
      <Sun className="theme-sun" size={19} />
    </button>
  );
}
