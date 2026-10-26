import { DocsNav } from "@/components/docs-nav";
import { DocsSearch } from "@/components/docs-search";
import { getDocs } from "@/lib/docs";
import type { Locale } from "@/lib/i18n";
export function DocsLayout({
  children,
  locale = "en",
}: {
  children: React.ReactNode;
  locale?: Locale;
}) {
  const docs = getDocs(locale);
  return (
    <main id="main" className="container docs-layout">
      <aside className="docs-sidebar">
        <DocsSearch
          locale={locale}
          docs={docs.map(({ slug, title, description, content, section }) => ({
            slug,
            title,
            description,
            content,
            section,
          }))}
        />
        <DocsNav
          locale={locale}
          docs={docs.map(({ slug, title, section }) => ({
            slug,
            title,
            section,
          }))}
        />
      </aside>
      {children}
    </main>
  );
}
