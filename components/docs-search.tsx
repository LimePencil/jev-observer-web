"use client";
import Link from "next/link";
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
export function DocsSearch({ docs }: { docs: SearchDoc[] }) {
  const pathname = usePathname();
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
    dialog.current?.close();
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
        aria-label="Search documentation"
      >
        <MagnifyingGlass size={18} />
        <span>Search docs</span>
        <kbd>⌘ K</kbd>
      </button>
      <dialog
        ref={dialog}
        className="search-dialog"
        aria-label="Documentation search"
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
              aria-label="Search documentation"
              aria-controls="documentation-search-results"
              placeholder="Search the documentation..."
              type="search"
              autoComplete="off"
            />
            <button
              type="button"
              className="icon-button"
              onClick={() => dialog.current?.close()}
              aria-label="Close search"
            >
              <X size={21} />
            </button>
          </div>
          <div className="search-results" id="documentation-search-results">
            <p className="search-hint" aria-live="polite">
              {normalizedQuery
                ? `${results.length} matching ${results.length === 1 ? "page" : "pages"}`
                : "Explore the documentation"}
            </p>
            {results.length ? (
              results.map((doc, index) => (
                <Link
                  key={doc.slug}
                  ref={(element) => {
                    resultLinks.current[index] = element;
                  }}
                  href={`/docs/${doc.slug}`}
                  onClick={() => dialog.current?.close()}
                  onKeyDown={(event) => navigateResults(event, index)}
                  className="search-result"
                >
                  <div>
                    <span>{doc.section}</span>
                    <strong>{doc.title}</strong>
                    <p>{doc.description}</p>
                  </div>
                  <ArrowUpRight size={18} />
                </Link>
              ))
            ) : (
              <div className="search-empty">
                <strong>No pages found for “{query}”</strong>
                <p>Try “install”, “SDK”, “privacy”, or “configuration”.</p>
              </div>
            )}
          </div>
          <div className="search-footer">
            <span>Searches all guides, including code examples.</span>
            <span>
              <kbd>↑</kbd> <kbd>↓</kbd> to browse · <kbd>Enter</kbd> to open ·{" "}
              <kbd>Esc</kbd> to close
            </span>
          </div>
        </div>
      </dialog>
    </>
  );
}
