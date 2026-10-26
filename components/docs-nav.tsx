"use client";
import Link from "next/link";
import { localePath, sectionLabel, type Locale } from "@/lib/i18n";
import { usePathname } from "next/navigation";
import { CaretDown } from "@phosphor-icons/react";
type Item = { slug: string; title: string; section: string };
export function DocsNav({
  docs,
  locale = "en",
}: {
  docs: Item[];
  locale?: Locale;
}) {
  const ko = locale === "ko";
  const href = (path: string) => localePath(locale, path);
  const pathname = usePathname();
  const groups = [...new Set(docs.map((doc) => doc.section))];
  function links() {
    return (
      <>
        <Link
          href={href("/docs")}
          className="docs-overview-link"
          aria-current={pathname === href("/docs") ? "page" : undefined}
        >
          {ko ? "문서" : "Documentation"}
        </Link>
        {groups.map((section) => (
          <div className="docs-nav-group" key={section}>
            <h2>{sectionLabel(section, locale)}</h2>
            {docs
              .filter((doc) => doc.section === section)
              .map((doc) => (
                <Link
                  key={doc.slug}
                  href={href(`/docs/${doc.slug}`)}
                  aria-current={
                    pathname === href(`/docs/${doc.slug}`) ? "page" : undefined
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
      <nav
        className="docs-nav"
        aria-label={ko ? "문서 탐색" : "Documentation navigation"}
      >
        {links()}
      </nav>
      <details className="docs-mobile-nav" key={pathname}>
        <summary>
          {ko ? "문서 둘러보기" : "Browse documentation"}{" "}
          <CaretDown size={16} />
        </summary>
        <nav
          aria-label={
            ko ? "모바일 문서 탐색" : "Mobile documentation navigation"
          }
        >
          {links()}
        </nav>
      </details>
    </>
  );
}
