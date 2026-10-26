import { NotFoundPage } from "@/components/not-found-page";
import { notFoundMetadata } from "@/lib/metadata";
export const metadata = notFoundMetadata("ko");
export default function NotFound() {
  return <NotFoundPage locale="ko" />;
}
