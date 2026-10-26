"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Aperture,
  ArrowUpRight,
  GithubLogo,
  List,
  X,
} from "@phosphor-icons/react";
import { useEffect, useRef, useState } from "react";
import { ThemeToggle } from "./theme-toggle";
import { LanguageSwitcher } from "./language-switcher";
import { localePath, unlocalizedPath, type Locale } from "@/lib/i18n";
import { site } from "@/lib/site";
export function Header({ locale = "en" }: { locale?: Locale }) {
  const path = usePathname();
  return <HeaderNavigation key={path} path={path} locale={locale} />;
}

function HeaderNavigation({ path, locale }: { path: string; locale: Locale }) {
  const korean = locale === "ko";
  const localPath = unlocalizedPath(path);
  const [open, setOpen] = useState(false);
  const header = useRef<HTMLElement>(null);
  const menuButton = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (!open) return;
    const dismissOutside = (event: Event) => {
      if (
        event.target instanceof Node &&
        !header.current?.contains(event.target)
      )
        setOpen(false);
    };
    const dismissOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !event.defaultPrevented) {
        event.preventDefault();
        setOpen(false);
        menuButton.current?.focus();
      }
    };
    const desktop = window.matchMedia("(min-width: 768px)");
    const dismissOnNavigation = () => setOpen(false);
    const dismissOnDesktop = (event: MediaQueryListEvent) => {
      if (event.matches) setOpen(false);
    };
    document.addEventListener("pointerdown", dismissOutside);
    document.addEventListener("focusin", dismissOutside);
    document.addEventListener("keydown", dismissOnEscape);
    window.addEventListener("popstate", dismissOnNavigation);
    window.addEventListener("hashchange", dismissOnNavigation);
    desktop.addEventListener("change", dismissOnDesktop);
    return () => {
      document.removeEventListener("pointerdown", dismissOutside);
      document.removeEventListener("focusin", dismissOutside);
      document.removeEventListener("keydown", dismissOnEscape);
      window.removeEventListener("popstate", dismissOnNavigation);
      window.removeEventListener("hashchange", dismissOnNavigation);
      desktop.removeEventListener("change", dismissOnDesktop);
    };
  }, [open]);

  return (
    <header ref={header} className="site-header">
      <div className="container nav-inner">
        <div className="brand">
          <Link
            className="wordmark"
            href={localePath(locale)}
            onClick={() => setOpen(false)}
          >
            <Aperture size={28} weight="duotone" aria-hidden="true" />
            <span>
              jev<span className="wordmark-light"> observer</span>
            </span>
          </Link>
          <span className="beta-badge">{korean ? "베타" : "Beta"}</span>
        </div>
        <nav
          className="desktop-nav"
          aria-label={korean ? "주요 메뉴" : "Main navigation"}
        >
          <Link href={`${localePath(locale)}#tour`}>
            {korean ? "제품 소개" : "Product"}
          </Link>
          <Link
            href={localePath(locale, "/docs")}
            aria-current={localPath.startsWith("/docs") ? "page" : undefined}
          >
            {korean ? "문서" : "Documentation"}
          </Link>
          <a href={site.repo} target="_blank" rel="noreferrer">
            GitHub <ArrowUpRight size={13} />
          </a>
        </nav>
        <div className="nav-actions">
          <LanguageSwitcher locale={locale} />
          <ThemeToggle locale={locale} />
          <Link
            className="button button-small button-primary nav-install"
            href={localePath(locale, "/docs/installation")}
          >
            {korean ? "Observer 설치" : "Install Observer"}{" "}
            <ArrowUpRight size={15} />
          </Link>
          <button
            ref={menuButton}
            className="icon-button mobile-menu-button"
            type="button"
            onClick={() => setOpen((current) => !current)}
            aria-expanded={open}
            aria-controls="mobile-navigation"
            aria-label={
              open
                ? korean
                  ? "메뉴 닫기"
                  : "Close navigation"
                : korean
                  ? "메뉴 열기"
                  : "Open navigation"
            }
          >
            {open ? <X size={22} /> : <List size={22} />}
          </button>
        </div>
      </div>
      {open && (
        <nav
          className="mobile-nav"
          id="mobile-navigation"
          aria-label={korean ? "모바일 메뉴" : "Mobile navigation"}
        >
          <Link
            href={`${localePath(locale)}#tour`}
            onClick={() => setOpen(false)}
          >
            {korean ? "제품 소개" : "Product"} <ArrowUpRight size={17} />
          </Link>
          <Link
            href={localePath(locale, "/docs")}
            onClick={() => setOpen(false)}
            aria-current={localPath.startsWith("/docs") ? "page" : undefined}
          >
            {korean ? "문서" : "Documentation"} <ArrowUpRight size={17} />
          </Link>
          <Link
            href={localePath(locale, "/docs/installation")}
            onClick={() => setOpen(false)}
          >
            {korean ? "Observer 설치" : "Install Observer"}{" "}
            <ArrowUpRight size={17} />
          </Link>
          <a
            href={site.repo}
            target="_blank"
            rel="noreferrer"
            onClick={() => setOpen(false)}
          >
            GitHub <GithubLogo size={19} />
          </a>
        </nav>
      )}
    </header>
  );
}
