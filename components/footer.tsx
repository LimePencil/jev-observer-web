import Link from "next/link";
import { Aperture, ArrowUpRight } from "@phosphor-icons/react/dist/ssr";
import { site } from "@/lib/site";
import { localePath, type Locale } from "@/lib/i18n";
export function Footer({ locale = "en" }: { locale?: Locale }) {
  const korean = locale === "ko";
  return (
    <footer className="site-footer">
      <div className="container footer-top">
        <div>
          <Link className="wordmark" href={localePath(locale)}>
            <Aperture size={27} weight="duotone" />
            <span>
              jev<span className="wordmark-light"> observer</span>
            </span>
          </Link>
          <p>
            {korean
              ? "Jev 요청을 더 선명하게 살펴보세요."
              : "A clearer view of your Jev requests."}
          </p>
        </div>
        <nav aria-label={korean ? "하단 메뉴" : "Footer navigation"}>
          <Link href={localePath(locale, "/docs/installation")}>
            {korean ? "Observer 설치" : "Install Observer"}
          </Link>
          <Link href={localePath(locale, "/docs/dashboard")}>
            {korean ? "사용자 가이드" : "User guide"}
          </Link>
          <Link href={localePath(locale, "/docs/development")}>
            {korean ? "개발자 가이드" : "Developer guide"}
          </Link>
          <a href={site.repo} target="_blank" rel="noreferrer">
            GitHub <ArrowUpRight size={14} />
          </a>
        </nav>
      </div>
      <div className="container footer-bottom">
        <span>
          {korean
            ? "독립 프로젝트. 로컬 중심 설계."
            : "Independent project. Local by design."}
        </span>
        <a
          href={`${site.repo}/blob/main/LICENSE`}
          target="_blank"
          rel="noreferrer"
        >
          {korean ? "MIT 라이선스" : "MIT license"} <ArrowUpRight size={13} />
        </a>
      </div>
    </footer>
  );
}
