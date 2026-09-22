"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { CaretDown } from "@phosphor-icons/react";
type Item = { slug: string; title: string; section: string };
export function DocsNav({ docs }: { docs: Item[] }) {
  const pathname = usePathname();
  const groups = [...new Set(docs.map((doc) => doc.section))];
  function links() {
    return (
      <>
        <Link
          href="/docs"
          className="docs-overview-link"
          aria-current={pathname === "/docs" ? "page" : undefined}
        >
          Documentation
        </Link>
        {groups.map((section) => (
          <div className="docs-nav-group" key={section}>
            <h2>{section}</h2>
            {docs
              .filter((doc) => doc.section === section)
              .map((doc) => (
                <Link
                  key={doc.slug}
                  href={`/docs/${doc.slug}`}
                  aria-current={
                    pathname === `/docs/${doc.slug}` ? "page" : undefined
                  }
                >
                  {doc.title}
                </Link>
              ))}
          </div>
        ))}
      </>
    );
  }
  return (
    <>
      <nav className="docs-nav" aria-label="Documentation navigation">
        {links()}
      </nav>
      <details className="docs-mobile-nav" key={pathname}>
        <summary>
          Browse documentation <CaretDown size={16} />
        </summary>
        <nav aria-label="Mobile documentation navigation">{links()}</nav>
      </details>
    </>
  );
}
