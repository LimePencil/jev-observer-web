"use client";
import Link from "next/link";
import { localePath, sectionLabel, type Locale } from "@/lib/i18n";
import { usePathname } from "next/navigation";
import { ArrowUpRight, MagnifyingGlass, X } from "@phosphor-icons/react";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
type SearchDoc = {
  slug: string;
  title: string;
  description: string;
  content: string;
  section: string;
};
export function DocsSearch({
  docs,
  locale = "en",
}: {
  docs: SearchDoc[];
  locale?: Locale;
}) {
  const ko = locale === "ko";
  const pathname = usePathname();
  const previousPathname = useRef(pathname);
  const dialog = useRef<HTMLDialogElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const resultLinks = useRef<(HTMLAnchorElement | null)[]>([]);
  const [query, setQuery] = useState("");
  const open = useCallback(() => {
    dialog.current?.showModal();
    input.current?.focus();
    input.current?.select();
  }, []);
  useEffect(() => {
    // The initial effect may run after a click replayed during hydration.
    // Only navigation should dismiss a search the user has already opened.
    if (previousPathname.current !== pathname) dialog.current?.close();
    previousPathname.current = pathname;
  }, [pathname]);
  useEffect(() => {
    const onKey = (event: globalThis.KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        if (event.repeat) return;
        if (dialog.current?.open) dialog.current.close();
        else open();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);
  const normalizedQuery = query.toLowerCase().trim().replace(/\s+/g, " ");
  const terms = normalizedQuery.split(" ").filter(Boolean);
  const results = docs
    .filter((doc) =>
      terms.every((term) =>
        `${doc.title} ${doc.description} ${doc.content}`
          .toLowerCase()
          .includes(term),
      ),
    )
    .sort(
      (a, b) =>
        Number(b.title.toLowerCase().includes(normalizedQuery)) -
        Number(a.title.toLowerCase().includes(normalizedQuery)),
    );
  function navigateResults(event: KeyboardEvent, index?: number) {
    if (
      event.nativeEvent.isComposing ||
      event.altKey ||
      event.ctrlKey ||
      event.metaKey ||
      event.shiftKey
    )
      return;
    if (event.key === "Escape") {
      // Search inputs consume Escape to clear their value before the dialog
      // can dismiss. Keep dismissal consistent and retain the previous query.
      event.preventDefault();
      dialog.current?.close();
      return;
    }
    if (results.length === 0) return;
    if (index === undefined && event.key === "Enter") {
      event.preventDefault();
      resultLinks.current[0]?.click();
      return;
    }
    if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;
    event.preventDefault();
    const next =
      index === undefined
        ? event.key === "ArrowDown"
          ? 0
          : results.length - 1
        : index + (event.key === "ArrowDown" ? 1 : -1);
    if (next < 0 || next >= results.length) input.current?.focus();
    else resultLinks.current[next]?.focus();
  }
  return (
    <>
      <button
        className="search-trigger"
        type="button"
        onClick={open}
        aria-label={ko ? "문서 검색" : "Search documentation"}
      >
        <MagnifyingGlass size={18} />
        <span>{ko ? "문서 검색" : "Search docs"}</span>
        <kbd>⌘ K</kbd>
      </button>
      <dialog
        ref={dialog}
        className="search-dialog"
        aria-label={ko ? "문서 검색" : "Documentation search"}
        onClick={(event) => {
          if (event.target === event.currentTarget) dialog.current?.close();
        }}
      >
        <div className="search-dialog-inner">
          <div className="search-input-row">
            <MagnifyingGlass size={22} />
            <input
              ref={input}
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              onKeyDown={(event) => navigateResults(event)}
              aria-label={ko ? "문서 검색" : "Search documentation"}
              aria-controls="documentation-search-results"
              placeholder={
                ko ? "문서에서 검색..." : "Search the documentation..."
              }
              type="search"
              autoComplete="off"
            />
            <button
              type="button"
              className="icon-button"
              onClick={() => dialog.current?.close()}
              aria-label={ko ? "검색 닫기" : "Close search"}
            >
              <X size={21} />
            </button>
          </div>
          <div className="search-results" id="documentation-search-results">
            <p className="search-hint" aria-live="polite">
              {normalizedQuery
                ? ko
                  ? `검색 결과 ${results.length}개`
                  : `${results.length} matching ${results.length === 1 ? "page" : "pages"}`
                : ko
                  ? "문서를 둘러보세요"
                  : "Explore the documentation"}
            </p>
            {results.length ? (
              results.map((doc, index) => (
                <Link
                  key={doc.slug}
                  ref={(element) => {
                    resultLinks.current[index] = element;
                  }}
                  href={localePath(locale, `/docs/${doc.slug}`)}
                  onClick={() => dialog.current?.close()}
                  onKeyDown={(event) => navigateResults(event, index)}
                  className="search-result"
                >
                  <div>
                    <span>{sectionLabel(doc.section, locale)}</span>
                    <strong>{doc.title}</strong>
                    <p>{doc.description}</p>
                  </div>
                  <ArrowUpRight size={18} />
                </Link>
              ))
            ) : (
              <div className="search-empty">
                <strong>
                  {ko
                    ? `“${query}” 검색 결과가 없습니다`
                    : `No pages found for “${query}”`}
                </strong>
                <p>
                  {ko
                    ? "“설치”, “SDK”, “개인정보”, “설정”을 검색해 보세요."
                    : "Try “install”, “SDK”, “privacy”, or “configuration”."}
                </p>
              </div>
            )}
          </div>
          <div className="search-footer">
            <span>
              {ko
                ? "코드 예제를 포함한 모든 가이드에서 검색합니다."
                : "Searches all guides, including code examples."}
            </span>
            <span>
              <kbd>↑</kbd> <kbd>↓</kbd> {ko ? "이동" : "to browse"} ·{" "}
              <kbd>Enter</kbd> {ko ? "열기" : "to open"} · <kbd>Esc</kbd>{" "}
              {ko ? "닫기" : "to close"}
            </span>
          </div>
        </div>
      </dialog>
    </>
  );
}
