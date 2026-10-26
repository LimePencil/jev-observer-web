import { DocsHome } from "@/components/docs-home";
import { pageMetadata } from "@/lib/metadata";
export const metadata = pageMetadata(
  "ko",
  "/docs",
  "문서",
  "Jev Observer 설치, 애플리케이션 연결, 로컬 기록 탐색과 프로젝트 기여 방법을 알아보세요.",
);
export default function Page() {
  return <DocsHome locale="ko" />;
}
