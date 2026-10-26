import Link from "next/link";
import { localePath, type Locale } from "@/lib/i18n";

export function NotFoundPage({ locale = "en" }: { locale?: Locale }) {
  const ko = locale === "ko";
  return (
    <main id="main" className="container not-found">
      <span className="eyebrow">404</span>
      <h1>{ko ? "페이지를 찾을 수 없습니다." : "This page is out of view."}</h1>
      <p>
        {ko
          ? "주소가 바뀌었을 수 있습니다. 문서에서 필요한 내용을 찾아보세요."
          : "The link may have moved. Find your next step in the documentation."}
      </p>
      <div className="button-row">
        <Link
          href={localePath(locale, "/docs")}
          className="button button-primary"
        >
          {ko ? "문서" : "Documentation"}
        </Link>
        <Link href={localePath(locale)} className="button button-secondary">
          {ko ? "홈으로 돌아가기" : "Back to home"}
        </Link>
      </div>
    </main>
  );
}
