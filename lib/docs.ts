import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

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
export function getDocs(): Doc[] {
  return fs
    .readdirSync(directory)
    .filter((name) => name.endsWith(".md"))
    .map((name) => {
      const { data, content } = matter(
        fs.readFileSync(path.join(directory, name), "utf8"),
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
export function getDoc(slug: string) {
  return getDocs().find((doc) => doc.slug === slug);
}
export function headingId(text: string) {
  return text
    .toLowerCase()
    .replace(/[`*_]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}
export function getHeadings(content: string) {
  const withoutFences = content.replace(/```[\s\S]*?```/g, "");
  return Array.from(withoutFences.matchAll(/^## (.+)$/gm)).map((match) => ({
    title: match[1].replace(/[`*_]/g, ""),
    id: headingId(match[1]),
  }));
}
