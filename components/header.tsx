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
import { useRef, useState } from "react";
import { ThemeToggle } from "./theme-toggle";
import { site } from "@/lib/site";
export function Header() {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const menuButton = useRef<HTMLButtonElement>(null);
  return (
    <header
      className="site-header"
      onKeyDown={(event) => {
        if (open && event.key === "Escape") {
          event.preventDefault();
          setOpen(false);
          menuButton.current?.focus();
        }
      }}
    >
      <div className="container nav-inner">
        <Link className="wordmark" href="/" onClick={() => setOpen(false)}>
          <Aperture size={28} weight="duotone" aria-hidden="true" />
          <span>
            jev<span className="wordmark-light"> observer</span>
          </span>
        </Link>
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
            onClick={() => setOpen(!open)}
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
          <Link href="/docs" onClick={() => setOpen(false)}>
            Documentation <ArrowUpRight size={17} />
          </Link>
          <Link href="/docs/installation" onClick={() => setOpen(false)}>
            Install Observer <ArrowUpRight size={17} />
          </Link>
          <a href={site.repo} target="_blank" rel="noreferrer">
            GitHub <GithubLogo size={19} />
          </a>
        </nav>
      )}
    </header>
  );
}
