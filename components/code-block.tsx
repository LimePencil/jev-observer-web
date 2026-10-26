import type { Locale } from "@/lib/i18n";
import { CopyButton } from "./copy-button";
export function CodeBlock({
  code,
  language = "bash",
  title,
  locale = "en",
}: {
  code: string;
  language?: string;
  title?: string;
  locale?: Locale;
}) {
  return (
    <div className="code-block">
      <div className="code-heading">
        <span>{title || language}</span>
        <CopyButton text={code} locale={locale} />
      </div>
      <pre tabIndex={0}>
        <code>{code}</code>
      </pre>
    </div>
  );
}
