import { DocsHome } from "@/components/docs-home";
import { pageMetadata } from "@/lib/metadata";
export const metadata = pageMetadata(
  "en",
  "/docs",
  "Documentation",
  "Install Jev Observer, connect your application, explore your local history, and learn how to contribute.",
);
export default function Page() {
  return <DocsHome />;
}
