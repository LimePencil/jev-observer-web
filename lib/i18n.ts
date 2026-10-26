export const locales = ["en", "ko"] as const;
export type Locale = (typeof locales)[number];

export function localePath(locale: Locale, path = "/") {
  if (locale === "en") return path;
  return path === "/" ? "/ko" : `/ko${path}`;
}

export function pathLocale(path: string): Locale {
  return path === "/ko" || path.startsWith("/ko/") ? "ko" : "en";
}

export function unlocalizedPath(path: string) {
  return pathLocale(path) === "ko" ? path.slice(3) || "/" : path;
}

export function languageAlternates(path: string) {
  return { en: path, ko: localePath("ko", path), "x-default": path };
}

export function sectionLabel(section: string, locale: Locale) {
  const labels: Record<string, string> = {
    "Getting started": "시작하기",
    "User guide": "사용자 가이드",
    "Developer guide": "개발자 가이드",
  };
  return locale === "ko" ? labels[section] || section : section;
}

export function localizedDescription(locale: Locale) {
  return locale === "ko"
    ? "Jev와 호환 의사결정 모델의 동작을 로컬에서 살펴보세요. 타입별 응답, 질문 버전, 실패, 지연 시간, 사용량과 비용을 한 대시보드에서 확인할 수 있습니다."
    : "Inspect Jev and compatible decision models locally. See typed answers, question versions, failures, latency, usage, and reported or estimated cost in one dashboard.";
}
