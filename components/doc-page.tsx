import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  CaretDown,
} from "@phosphor-icons/react/dist/ssr";
import { getDoc, getDocs, getHeadings } from "@/lib/docs";
import { Markdown } from "@/components/markdown";
import { site } from "@/lib/site";
import { localePath, sectionLabel, type Locale } from "@/lib/i18n";
export function DocPage({
  slug,
  locale = "en",
}: {
  slug: string;
  locale?: Locale;
}) {
  const ko = locale === "ko";
  const href = (path: string) => localePath(locale, path);
  const doc = getDoc(slug, locale);
  if (!doc) notFound();
  const docs = getDocs(locale);
  const index = docs.findIndex((item) => item.slug === slug);
  const previous = docs[index - 1];
  const next = docs[index + 1];
  const headings = getHeadings(doc.content);
  return (
    <>
      <article className="doc-article">
        <div className="doc-breadcrumb">
          <Link href={href("/docs")}>{ko ? "문서" : "Docs"}</Link>
          <span>/</span>
          {sectionLabel(doc.section, locale)}
        </div>
        <h1>{doc.title}</h1>
        <p className="doc-lead">{doc.description}</p>
        {headings.length > 0 && (
          <details className="doc-mobile-toc">
            <summary>
              {ko ? "이 페이지의 내용" : "On this page"}{" "}
              <CaretDown size={16} aria-hidden="true" />
            </summary>
            <nav aria-label={ko ? "이 페이지의 내용" : "On this page"}>
              {headings.map((heading) => (
                <a key={heading.id} href={`#${heading.id}`}>
                  {heading.title}
                </a>
              ))}
            </nav>
          </details>
        )}
        <Markdown content={doc.content} locale={locale} />
        <div className="doc-source">
          <a href={site.repo} target="_blank" rel="noreferrer">
            {ko ? "프로젝트 소스 보기" : "View project source"}{" "}
            <ArrowUpRight size={15} />
          </a>
          <span>
            {ko ? "문제를 발견하셨나요?" : "Found an issue?"}{" "}
            <a href={`${site.repo}/issues`} target="_blank" rel="noreferrer">
              {ko ? "이슈 등록" : "Open an issue"}
            </a>
          </span>
        </div>
        <nav
          className="doc-pagination"
          aria-label={ko ? "이전 및 다음 문서" : "Adjacent documentation"}
        >
          {previous ? (
            <Link href={href(`/docs/${previous.slug}`)}>
              <ArrowLeft size={18} />
              <div>
                <small>{ko ? "이전" : "Previous"}</small>
                <span>{previous.title}</span>
              </div>
            </Link>
          ) : (
            <span />
          )}
          {next && (
            <Link href={href(`/docs/${next.slug}`)}>
              <div>
                <small>{ko ? "다음" : "Next"}</small>
                <span>{next.title}</span>
              </div>
              <ArrowRight size={18} />
            </Link>
          )}
        </nav>
      </article>
      <aside className="doc-toc">
        <p>{ko ? "이 페이지의 내용" : "On this page"}</p>
        <nav aria-label={ko ? "이 페이지의 내용" : "On this page"}>
          {headings.map((heading) => (
            <a key={heading.id} href={`#${heading.id}`}>
              {heading.title}
            </a>
          ))}
        </nav>
        <Link className="toc-help" href={href("/docs/troubleshooting")}>
          {ko ? "도움이 필요하신가요?" : "Need a hand?"}
          <span>
            {ko ? "문제 해결" : "Troubleshooting"} <ArrowUpRight size={13} />
          </span>
        </Link>
      </aside>
    </>
  );
}
