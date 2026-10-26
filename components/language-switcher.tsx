"use client";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useSyncExternalStore, type MouseEvent } from "react";
import { localePath, unlocalizedPath, type Locale } from "@/lib/i18n";

function subscribe(callback: () => void) {
  window.addEventListener("popstate", callback);
  window.addEventListener("hashchange", callback);
  return () => {
    window.removeEventListener("popstate", callback);
    window.removeEventListener("hashchange", callback);
  };
}

function locationSuffix() {
  return window.location.search + window.location.hash;
}

function serverSuffix() {
  return "";
}

export function LanguageSwitcher({ locale = "en" }: { locale?: Locale }) {
  const path = usePathname();
  const target = locale === "en" ? "ko" : "en";
  const label = locale === "en" ? "Switch to Korean" : "영어로 보기";
  const suffix = useSyncExternalStore(subscribe, locationSuffix, serverSuffix);
  const href = localePath(target, unlocalizedPath(path)) + suffix;

  function preserveLocation(event: MouseEvent<HTMLAnchorElement>) {
    // Read the latest URL even if a same-page history update did not rerender.
    event.currentTarget.href =
      localePath(target, unlocalizedPath(window.location.pathname)) +
      locationSuffix();
  }

  return (
    <a
      className="language-switcher"
      href={href}
      hrefLang={target}
      aria-label={label}
      title={label}
      onClick={preserveLocation}
      onAuxClick={preserveLocation}
      onContextMenu={preserveLocation}
    >
      <Image
        src={target === "ko" ? "/flags/kr.svg" : "/flags/us.svg"}
        alt=""
        aria-hidden="true"
        width={24}
        height={18}
        loading="eager"
      />
    </a>
  );
}
