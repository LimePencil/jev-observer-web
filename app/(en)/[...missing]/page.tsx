import { notFound } from "next/navigation";
import { notFoundMetadata } from "@/lib/metadata";
export const metadata = notFoundMetadata("en");
export default function MissingPage() {
  notFound();
}
