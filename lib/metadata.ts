import type { Metadata } from "next";
import {
  languageAlternates,
  localePath,
  localizedDescription,
  type Locale,
} from "./i18n";
import { site, siteUrl } from "./site";

export function pageMetadata(
  locale: Locale,
  path: string,
  title: string,
  description: string,
): Metadata {
  const url = localePath(locale, path);
  return {
    title,
    description,
    alternates: { canonical: url, languages: languageAlternates(path) },
    openGraph: {
      type: "website",
      siteName: site.name,
      title: `${title} | ${site.name}`,
      description,
      url,
      locale: locale === "ko" ? "ko_KR" : "en_US",
      alternateLocale: locale === "ko" ? "en_US" : "ko_KR",
      images: [
        {
          url: locale === "ko" ? "/ko/opengraph-image" : "/opengraph-image",
          width: 1200,
          height: 630,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | ${site.name}`,
      description,
    },
  };
}

export function rootMetadata(locale: Locale): Metadata {
  return {
    metadataBase: siteUrl(),
    ...pageMetadata(
      locale,
      "/",
      locale === "ko"
        ? "모든 판단을, 한눈에 선명하게."
        : "Every decision. In clear view.",
      localizedDescription(locale),
    ),
    title: {
      default:
        locale === "ko"
          ? "Jev Observer | 모든 판단을, 한눈에 선명하게."
          : "Jev Observer | Every decision. In clear view.",
      template: "%s | Jev Observer",
    },
  };
}

export function notFoundMetadata(locale: Locale): Metadata {
  return {
    title: locale === "ko" ? "페이지를 찾을 수 없습니다" : "Page not found",
    description:
      locale === "ko"
        ? "요청한 페이지를 찾을 수 없습니다. Jev Observer 문서를 확인하거나 홈페이지로 돌아가세요."
        : "This page could not be found. Continue with the Jev Observer documentation or return to the homepage.",
    alternates: { canonical: null, languages: {} },
  };
}
