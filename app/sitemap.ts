import type { MetadataRoute } from "next";
import { getDocs } from "@/lib/docs";
import { siteUrl } from "@/lib/site";
export default function sitemap(): MetadataRoute.Sitemap {
  return ["/", "/docs", ...getDocs().map((doc) => `/docs/${doc.slug}`)].map(
    (path) => ({ url: new URL(path, siteUrl()).href }),
  );
}
