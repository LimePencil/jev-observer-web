import type { MetadataRoute } from "next";
import { getDocs } from "@/lib/docs";
import { siteUrl } from "@/lib/site";
import { locales, localePath, languageAlternates } from "@/lib/i18n";
export default function sitemap(): MetadataRoute.Sitemap {
  return locales.flatMap((locale) =>
    ["/", "/docs", ...getDocs(locale).map((doc) => `/docs/${doc.slug}`)].map(
      (path) => ({
        url: new URL(localePath(locale, path), siteUrl()).href,
        alternates: {
          languages: Object.fromEntries(
            Object.entries(languageAlternates(path)).map(([lang, url]) => [
              lang,
              new URL(url, siteUrl()).href,
            ]),
          ),
        },
      }),
    ),
  );
}
