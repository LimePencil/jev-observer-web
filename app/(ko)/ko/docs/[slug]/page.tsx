import { DocPage } from "@/components/doc-page";
import { getDoc, getDocs } from "@/lib/docs";
import { pageMetadata, notFoundMetadata } from "@/lib/metadata";
// Known guides are prerendered; unknown slugs reach the localized 404 metadata.
export const dynamicParams = true;
export function generateStaticParams() {
  return getDocs("ko").map((doc) => ({ slug: doc.slug }));
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const doc = getDoc(slug, "ko");
  return doc
    ? pageMetadata("ko", `/docs/${slug}`, doc.title, doc.description)
    : notFoundMetadata("ko");
}
export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <DocPage slug={slug} locale="ko" />;
}
