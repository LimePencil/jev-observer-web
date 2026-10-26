import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Code,
  TerminalWindow,
} from "@phosphor-icons/react/dist/ssr";
import { getDocs, sections } from "@/lib/docs";
import { site } from "@/lib/site";
import { localePath, sectionLabel, type Locale } from "@/lib/i18n";
export function DocsHome({ locale = "en" }: { locale?: Locale }) {
  const ko = locale === "ko";
  const href = (path: string) => localePath(locale, path);
  const docs = getDocs(locale);
  const icons = [TerminalWindow, BookOpen, Code];
  return (
    <div className="docs-index">
      <div className="doc-breadcrumb">
        Jev Observer / {ko ? "문서" : "Docs"}
      </div>
      <h1>{ko ? "문서" : "Documentation"}</h1>
      <p className="doc-lead">
        {ko
          ? `Observer ${site.version}를 설치하고, 기록을 살펴보고, 프로젝트에 기여하세요.`
          : `Set up Observer ${site.version}, explore your history, or contribute to the project.`}
      </p>
      <Link href={href("/docs/installation")} className="docs-start">
        <TerminalWindow size={28} />
        <div>
          <strong>
            {ko ? "Observer 시작하기" : "Your first look at Observer"}
          </strong>
          <span>
            {ko
              ? "Observer를 설치하고 샘플을 살펴보세요. 제공업체 키는 필요하지 않습니다."
              : "Install Observer and explore the sample. No provider key needed."}
          </span>
        </div>
        <ArrowRight size={23} />
      </Link>
      {sections.map((section, index) => {
        const Icon = icons[index];
        return (
          <section className="docs-index-section" key={section}>
            <h2>
              <Icon size={23} />
              {sectionLabel(section, locale)}
            </h2>
            <div className="docs-index-links">
              {docs
                .filter((doc) => doc.section === section)
                .map((doc) => (
                  <Link key={doc.slug} href={href(`/docs/${doc.slug}`)}>
                    <div>
                      <h3>{doc.title}</h3>
                      <p>{doc.description}</p>
                    </div>
                    <ArrowUpRight size={18} />
                  </Link>
                ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
