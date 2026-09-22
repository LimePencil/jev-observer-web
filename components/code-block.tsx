import { CopyButton } from "./copy-button";
export function CodeBlock({
  code,
  language = "bash",
  title,
}: {
  code: string;
  language?: string;
  title?: string;
}) {
  return (
    <div className="code-block">
      <div className="code-heading">
        <span>{title || language}</span>
        <CopyButton text={code} />
      </div>
      <pre tabIndex={0}>
        <code>{code}</code>
      </pre>
    </div>
  );
}
