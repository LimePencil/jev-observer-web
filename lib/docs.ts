import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import type { Locale } from "./i18n";

export type Doc = {
  slug: string;
  title: string;
  description: string;
  section: string;
  order: number;
  content: string;
};
const directory = path.join(process.cwd(), "content/docs");
export const sections = ["Getting started", "User guide", "Developer guide"];
export function getDocs(locale: Locale = "en"): Doc[] {
  const localizedDirectory =
    locale === "ko" ? path.join(directory, "ko") : directory;
  return fs
    .readdirSync(localizedDirectory)
    .filter((name) => name.endsWith(".md"))
    .map((name) => {
      const { data, content } = matter(
        fs.readFileSync(path.join(localizedDirectory, name), "utf8"),
      );
      return {
        slug: name.replace(/\.md$/, ""),
        title: String(data.title),
        description: String(data.description),
        section: String(data.section),
        order: Number(data.order),
        content,
      };
    })
    .sort((a, b) => a.order - b.order);
}
export function getDoc(slug: string, locale: Locale = "en") {
  return getDocs(locale).find((doc) => doc.slug === slug);
}
export function headingId(text: string) {
  const explicit = text.match(/\s*\{#([a-zA-Z0-9_-]+)\}\s*$/);
  if (explicit) return explicit[1];
  return text
    .toLowerCase()
    .replace(/[`*_]/g, "")
    .replace(/[^\p{L}\p{N}\s-]/gu, "")
    .trim()
    .replace(/\s+/g, "-");
}
export function headingText(text: string) {
  return text.replace(/\s*\{#[a-zA-Z0-9_-]+\}\s*$/, "");
}
export function getHeadings(content: string) {
  const withoutFences = content.replace(/```[\s\S]*?```/g, "");
  return Array.from(withoutFences.matchAll(/^## (.+)$/gm)).map((match) => ({
    title: headingText(match[1]).replace(/[`*_]/g, ""),
    id: headingId(match[1]),
  }));
}
