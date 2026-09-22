import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Children, isValidElement, type ReactNode } from "react";
import Link from "next/link";
import { CodeBlock } from "./code-block";
import { headingId } from "@/lib/docs";
function plain(node: ReactNode): string {
  return Children.toArray(node)
    .map((child) =>
      isValidElement<{ children?: ReactNode }>(child)
        ? plain(child.props.children)
        : String(child),
    )
    .join("");
}
export function Markdown({ content }: { content: string }) {
  return (
    <div className="prose">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h2: ({ children }) => {
            const id = headingId(plain(children));
            return (
              <h2 id={id}>
                <a href={`#${id}`}>
                  {children}
                  <span className="heading-hash" aria-hidden="true">
                    #
                  </span>
                </a>
              </h2>
            );
          },
          h3: ({ children }) => (
            <h3 id={headingId(plain(children))}>{children}</h3>
          ),
          a: ({ href = "", children }) =>
            href.startsWith("/") ? (
              <Link href={href}>{children}</Link>
            ) : (
              <a
                href={href}
                {...(href.startsWith("http")
                  ? { target: "_blank", rel: "noreferrer" }
                  : {})}
              >
                {children}
              </a>
            ),
          pre: ({ children }) => {
            const code = Children.toArray(children)[0];
            if (
              isValidElement<{ children?: ReactNode; className?: string }>(code)
            )
              return (
                <CodeBlock
                  code={plain(code.props.children).replace(/\n$/, "")}
                  language={
                    code.props.className?.replace("language-", "") || "text"
                  }
                />
              );
            return <pre>{children}</pre>;
          },
          table: ({ children }) => (
            <div
              className="table-scroll"
              tabIndex={0}
              role="region"
              aria-label="Reference table"
            >
              <table>{children}</table>
            </div>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
