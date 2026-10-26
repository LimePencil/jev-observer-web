"use client";
import type { Locale } from "@/lib/i18n";
import { Check, Copy } from "@phosphor-icons/react";
import { useEffect, useId, useRef, useState } from "react";
export function CopyButton({
  text,
  locale = "en",
}: {
  text: string;
  locale?: Locale;
}) {
  const ko = locale === "ko";
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
            ? ko
              ? "클립보드에 복사했습니다"
              : "Copied to clipboard"
            : status === "failed"
              ? ko
                ? "코드 복사 다시 시도"
                : "Retry copying code"
              : ko
                ? "코드 복사"
                : "Copy code"
        }
      >
        {status === "copied" ? <Check size={16} /> : <Copy size={16} />}
        <span>
          {copying
            ? ko
              ? "복사 중…"
              : "Copying…"
            : status === "copied"
              ? ko
                ? "복사 완료"
                : "Copied"
              : status === "failed"
                ? ko
                  ? "다시 복사"
                  : "Retry copy"
                : ko
                  ? "복사"
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
          ? ko
            ? "클립보드에 복사했습니다."
            : "Copied to clipboard."
          : status === "failed"
            ? selected
              ? ko
                ? "자동 복사에 실패했습니다. 코드가 선택되었습니다. Ctrl+C(Mac은 ⌘C)를 누르거나 기기의 복사 명령을 사용하세요."
                : "Automatic copy failed. Code selected. Press Ctrl+C (⌘C on Mac), or use your device’s Copy command."
              : ko
                ? "자동 복사에 실패했습니다. 아래 코드를 선택한 뒤 기기의 복사 명령을 사용하거나 다시 시도하세요."
                : "Automatic copy failed. Select the code below and use your device’s Copy command, or try again."
            : ""}
      </span>
    </>
  );
}
