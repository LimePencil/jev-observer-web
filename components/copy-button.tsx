"use client";
import { Check, Copy } from "@phosphor-icons/react";
import { useEffect, useRef, useState } from "react";
export function CopyButton({ text }: { text: string }) {
  const [status, setStatus] = useState<"idle" | "copied" | "failed">("idle");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );
  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setStatus("copied");
    } catch {
      setStatus("failed");
    }
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setStatus("idle"), 2500);
  }
  return (
    <button
      type="button"
      className="copy-button"
      onClick={copy}
      aria-label={status === "copied" ? "Copied to clipboard" : "Copy code"}
    >
      {status === "copied" ? <Check size={16} /> : <Copy size={16} />}
      <span aria-live="polite">
        {status === "copied"
          ? "Copied"
          : status === "failed"
            ? "Select to copy"
            : "Copy"}
      </span>
    </button>
  );
}
