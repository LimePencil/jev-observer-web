/* eslint-disable @next/next/no-head-element -- Shared HTML document rendered by both App Router root layouts. */
import localFont from "next/font/local";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import type { Locale } from "@/lib/i18n";
import "@/app/globals.css";
const geist = localFont({
  src: "../public/fonts/geist-latin.woff2",
  variable: "--font-geist",
  display: "swap",
});
const mono = localFont({
  src: "../public/fonts/geist-mono-latin.woff2",
  variable: "--font-geist-mono",
  display: "swap",
  preload: false,
});
const themeScript = `(function(){try{var t=localStorage.getItem('jev-theme');if(t==='light'||t==='dark')document.documentElement.dataset.theme=t}catch(e){}})()`;
export function SiteLayout({
  children,
  locale,
}: Readonly<{ children: React.ReactNode; locale: Locale }>) {
  return (
    <html
      lang={locale}
      suppressHydrationWarning
      className={`${geist.variable} ${mono.variable}`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>
        <a className="skip-link" href="#main">
          {locale === "ko" ? "본문으로 건너뛰기" : "Skip to content"}
        </a>
        <Header locale={locale} />
        {children}
        <Footer locale={locale} />
      </body>
    </html>
  );
}
