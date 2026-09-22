"use client";
import Link from "next/link";
import { ArrowUpRight, MagnifyingGlass, X } from "@phosphor-icons/react";
import { useCallback, useEffect, useRef, useState } from "react";
type SearchDoc = {
  slug: string;
  title: string;
  description: string;
  content: string;
  section: string;
};
export function DocsSearch({ docs }: { docs: SearchDoc[] }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const open = useCallback(() => {
    dialog.current?.showModal();
    input.current?.focus();
  }, []);
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        if (dialog.current?.open) dialog.current.close();
        else open();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);
  const terms = query.toLowerCase().trim().split(/\s+/).filter(Boolean);
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
        Number(b.title.toLowerCase().includes(query.toLowerCase())) -
        Number(a.title.toLowerCase().includes(query.toLowerCase())),
    )
    .slice(0, 8);
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
              aria-label="Search documentation"
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
          <div className="search-results">
            <p className="search-hint" aria-live="polite">
              {query
                ? `${results.length} matching pages`
                : "Explore the documentation"}
            </p>
            {results.length ? (
              results.map((doc) => (
                <Link
                  key={doc.slug}
                  href={`/docs/${doc.slug}`}
                  onClick={() => dialog.current?.close()}
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
              <kbd>Esc</kbd> to close
            </span>
          </div>
        </div>
      </dialog>
    </>
  );
}
