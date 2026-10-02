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
import { site } from "@/lib/site";
export function Header() {
  const path = usePathname();
  return <HeaderNavigation key={path} path={path} />;
}

function HeaderNavigation({ path }: { path: string }) {
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
          <Link className="wordmark" href="/" onClick={() => setOpen(false)}>
            <Aperture size={28} weight="duotone" aria-hidden="true" />
            <span>
              jev<span className="wordmark-light"> observer</span>
            </span>
          </Link>
          <span className="beta-badge">Beta</span>
        </div>
        <nav className="desktop-nav" aria-label="Main navigation">
          <Link href="/#tour">Product</Link>
          <Link
            href="/docs"
            aria-current={path.startsWith("/docs") ? "page" : undefined}
          >
            Documentation
          </Link>
          <a href={site.repo} target="_blank" rel="noreferrer">
            GitHub <ArrowUpRight size={13} />
          </a>
        </nav>
        <div className="nav-actions">
          <ThemeToggle />
          <Link
            className="button button-small button-primary nav-install"
            href="/docs/installation"
          >
            Install Observer <ArrowUpRight size={15} />
          </Link>
          <button
            ref={menuButton}
            className="icon-button mobile-menu-button"
            type="button"
            onClick={() => setOpen((current) => !current)}
            aria-expanded={open}
            aria-controls="mobile-navigation"
            aria-label={open ? "Close navigation" : "Open navigation"}
          >
            {open ? <X size={22} /> : <List size={22} />}
          </button>
        </div>
      </div>
      {open && (
        <nav
          className="mobile-nav"
          id="mobile-navigation"
          aria-label="Mobile navigation"
        >
          <Link href="/#tour" onClick={() => setOpen(false)}>
            Product <ArrowUpRight size={17} />
          </Link>
          <Link
            href="/docs"
            onClick={() => setOpen(false)}
            aria-current={path.startsWith("/docs") ? "page" : undefined}
          >
            Documentation <ArrowUpRight size={17} />
          </Link>
          <Link href="/docs/installation" onClick={() => setOpen(false)}>
            Install Observer <ArrowUpRight size={17} />
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
