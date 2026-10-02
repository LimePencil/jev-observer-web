"use client";
import { Check, Copy } from "@phosphor-icons/react";
import { useEffect, useId, useRef, useState } from "react";
export function CopyButton({ text }: { text: string }) {
  const [status, setStatus] = useState<"idle" | "copied" | "failed">("idle");
  const [copying, setCopying] = useState(false);
  const [selected, setSelected] = useState(false);
  const button = useRef<HTMLButtonElement>(null);
  const statusId = useId();
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  function selectCode() {
    const code = button.current?.closest(".code-block")?.querySelector("code");
    const selection = window.getSelection();
    if (!code || !selection) return false;

    code.closest("pre")?.focus({ preventScroll: true });
    const range = document.createRange();
    range.selectNodeContents(code);
    selection.removeAllRanges();
    selection.addRange(range);
    return selection.toString() === text;
  }

  async function copy() {
    if (timer.current) clearTimeout(timer.current);
    setCopying(true);
    try {
      await navigator.clipboard.writeText(text);
      setStatus("copied");
      timer.current = setTimeout(() => setStatus("idle"), 2500);
    } catch {
      setSelected(selectCode());
      setStatus("failed");
    } finally {
      setCopying(false);
    }
  }
  return (
    <>
      <button
        ref={button}
        type="button"
        className="copy-button"
        onClick={copy}
        disabled={copying}
        aria-describedby={status === "failed" ? statusId : undefined}
        aria-label={
          status === "copied"
            ? "Copied to clipboard"
            : status === "failed"
              ? "Retry copying code"
              : "Copy code"
        }
      >
        {status === "copied" ? <Check size={16} /> : <Copy size={16} />}
        <span>
          {copying
            ? "Copying…"
            : status === "copied"
              ? "Copied"
              : status === "failed"
                ? "Retry copy"
                : "Copy"}
        </span>
      </button>
      <span
        id={statusId}
        className={status === "failed" ? "copy-status" : "sr-only"}
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        {status === "copied"
          ? "Copied to clipboard."
          : status === "failed"
            ? selected
              ? "Automatic copy failed. Code selected. Press Ctrl+C (⌘C on Mac), or use your device’s Copy command."
              : "Automatic copy failed. Select the code below and use your device’s Copy command, or try again."
            : ""}
      </span>
    </>
  );
}
