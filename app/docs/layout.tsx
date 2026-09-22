import { DocsNav } from "@/components/docs-nav";
import { DocsSearch } from "@/components/docs-search";
import { getDocs } from "@/lib/docs";
export default function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const docs = getDocs();
  return (
    <main id="main" className="container docs-layout">
      <aside className="docs-sidebar">
        <DocsSearch
          docs={docs.map(({ slug, title, description, content, section }) => ({
            slug,
            title,
            description,
            content,
            section,
          }))}
        />
        <DocsNav
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
