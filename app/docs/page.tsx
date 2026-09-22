import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Code,
  TerminalWindow,
} from "@phosphor-icons/react/dist/ssr";
import { getDocs, sections } from "@/lib/docs";
export const metadata: Metadata = {
  title: "Documentation",
  description:
    "Install Jev Observer, connect your application, explore your local history, and learn how to contribute.",
  alternates: { canonical: "/docs" },
};
export default function DocsHome() {
  const docs = getDocs();
  const icons = [TerminalWindow, BookOpen, Code];
  return (
    <div className="docs-index">
      <div className="doc-breadcrumb">Jev Observer / Docs</div>
      <h1>Documentation</h1>
      <p className="doc-lead">
        A clearer view starts here. Set up Observer, make sense of your
        requests, or get into the code.
      </p>
      <Link href="/docs/installation" className="docs-start">
        <TerminalWindow size={28} />
        <div>
          <strong>Your first look at Observer</strong>
          <span>
            Build from source and explore the sample. No API key needed.
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
              {section}
            </h2>
            <div className="docs-index-links">
              {docs
                .filter((doc) => doc.section === section)
                .map((doc) => (
                  <Link key={doc.slug} href={`/docs/${doc.slug}`}>
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
