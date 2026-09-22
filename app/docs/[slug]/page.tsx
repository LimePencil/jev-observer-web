import type { Metadata, ResolvingMetadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
} from "@phosphor-icons/react/dist/ssr";
import { getDoc, getDocs, getHeadings } from "@/lib/docs";
import { Markdown } from "@/components/markdown";
import { site } from "@/lib/site";
export function generateStaticParams() {
  return getDocs().map((doc) => ({ slug: doc.slug }));
}
export const dynamicParams = false;
export async function generateMetadata(
  {
    params,
  }: {
    params: Promise<{ slug: string }>;
  },
  parent: ResolvingMetadata,
): Promise<Metadata> {
  const { slug } = await params;
  const doc = getDoc(slug);
  if (!doc) return {};
  return {
    title: doc.title,
    description: doc.description,
    alternates: { canonical: `/docs/${slug}` },
    openGraph: {
      type: "website",
      siteName: site.name,
      title: `${doc.title} | ${site.name}`,
      description: doc.description,
      url: `/docs/${slug}`,
      images: (await parent).openGraph?.images,
    },
  };
}
export default async function DocPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const doc = getDoc(slug);
  if (!doc) notFound();
  const docs = getDocs();
  const index = docs.findIndex((item) => item.slug === slug);
  const previous = docs[index - 1];
  const next = docs[index + 1];
  const headings = getHeadings(doc.content);
  return (
    <>
      <article className="doc-article">
        <div className="doc-breadcrumb">
          <Link href="/docs">Docs</Link>
          <span>/</span>
          {doc.section}
        </div>
        <h1>{doc.title}</h1>
        <p className="doc-lead">{doc.description}</p>
        <Markdown content={doc.content} />
        <div className="doc-source">
          <a href={site.repo} target="_blank" rel="noreferrer">
            View project source <ArrowUpRight size={15} />
          </a>
          <span>
            Found an issue?{" "}
            <a href={`${site.repo}/issues`} target="_blank" rel="noreferrer">
              Open an issue
            </a>
          </span>
        </div>
        <nav className="doc-pagination" aria-label="Adjacent documentation">
          {previous ? (
            <Link href={`/docs/${previous.slug}`}>
              <ArrowLeft size={18} />
              <div>
                <small>Previous</small>
                <span>{previous.title}</span>
              </div>
            </Link>
          ) : (
            <span />
          )}
          {next && (
            <Link href={`/docs/${next.slug}`}>
              <div>
                <small>Next</small>
                <span>{next.title}</span>
              </div>
              <ArrowRight size={18} />
            </Link>
          )}
        </nav>
      </article>
      <aside className="doc-toc">
        <p>On this page</p>
        <nav aria-label="On this page">
          {headings.map((heading) => (
            <a key={heading.id} href={`#${heading.id}`}>
              {heading.title}
            </a>
          ))}
        </nav>
        <Link className="toc-help" href="/docs/troubleshooting">
          Need a hand?
          <span>
            Troubleshooting <ArrowUpRight size={13} />
          </span>
        </Link>
      </aside>
    </>
  );
}
