import { notFound } from "next/navigation";
import { notFoundMetadata } from "@/lib/metadata";
export const metadata = notFoundMetadata("ko");
export default function MissingPage() {
  notFound();
}
