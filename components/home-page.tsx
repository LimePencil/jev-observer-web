import Link from "next/link";
import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  BracketsCurly,
  Code,
  Database,
  Desktop,
  GitBranch,
  HardDrives,
  ShieldCheck,
} from "@phosphor-icons/react/dist/ssr";
import { Reveal } from "@/components/reveal";
import { ProductTour } from "@/components/product-tour";
import { HeroFlow } from "@/components/hero-flow";
import { site } from "@/lib/site";
import { localePath, type Locale } from "@/lib/i18n";

export function HomePage({ locale = "en" }: { locale?: Locale }) {
  const ko = locale === "ko";
  const href = (path: string) => localePath(locale, path);
  return (
    <main id="main">
      <section className="hero container" aria-labelledby="hero-title">
        <div className="hero-copy">
          <p className="eyebrow hero-enter">
            <Link href={href("/docs/release-notes")}>
              {ko ? "로컬에서 살펴보는 AI의 판단" : "Local observability"} · v
              {site.version}
            </Link>
          </p>
          <h1 id="hero-title" className="hero-enter">
            {ko ? "모든 판단을," : "Every decision."} <br />
            <span>{ko ? "한눈에 선명하게." : "In clear view."}</span>
          </h1>
          <p className="hero-description hero-enter">
            <strong>
              {ko ? "요청부터 응답, 사용량까지." : "Requests. Answers. Usage."}
            </strong>
            <br />
            {ko ? "하나의 로컬 대시보드에서." : "One local dashboard."}
          </p>
          <div className="button-row hero-enter">
            <Link
              href={href("/docs/installation")}
              className="button button-primary"
            >
              {ko ? "Observer 설치" : "Install Observer"}{" "}
              <ArrowUpRight size={18} />
            </Link>
            <a href="#tour" className="button button-text">
              {ko ? "대시보드 살펴보기" : "Explore the dashboard"}{" "}
              <ArrowDown size={17} />
            </a>
          </div>
        </div>
        <div className="hero-art hero-enter">
          <HeroFlow locale={locale} />
        </div>
      </section>
      <div className="principles-strip">
        <div className="container principles-inner">
          <span>
            <Desktop size={20} />{" "}
            {ko ? "내 컴퓨터에서 실행" : "Runs on your machine"}
          </span>
          <span>
            <HardDrives size={20} />{" "}
            {ko ? "네이티브 설치 프로그램" : "Native installers"}
          </span>
          <span>
            <GitBranch size={20} /> {ko ? "MIT 라이선스" : "MIT licensed"}
          </span>
          <span>
            <ShieldCheck size={20} />{" "}
            {ko ? "Observer 계정 없이" : "No Observer account"}
          </span>
        </div>
      </div>
      <section
        className="section container"
        id="tour"
        aria-labelledby="tour-title"
      >
        <Reveal>
          <div className="section-heading">
            <h2 id="tour-title">
              {ko ? "궁금한 응답을" : "Go straight to"}{" "}
              <span>{ko ? "바로 확인하세요." : "the answer."}</span>
            </h2>
          </div>
        </Reveal>
        <ProductTour locale={locale} />
      </section>
      <section
        className="section approach-section container"
        aria-labelledby="approach-title"
      >
        <Reveal>
          <div className="section-heading">
            <h2 id="approach-title">
              {ko ? "내 작업 흐름을," : "Your workflow."}{" "}
              <span>{ko ? "더 선명하게." : "Now visible."}</span>
            </h2>
          </div>
        </Reveal>
        <div className="approach-grid">
          <Reveal className="flow-panel">
            <div
              className="flow-diagram"
              aria-label={
                ko
                  ? "애플리케이션이 로컬 Jev Observer를 통해 설정된 제공업체로 요청을 보냅니다. Observer는 실제 사용 기록을 로컬 SQLite에 암호화해 저장합니다."
                  : "Your application sends requests through local Jev Observer to your configured provider. Observer encrypts live history in local SQLite."
              }
            >
              <div className="flow-node">
                <Code size={25} />
                <strong>{ko ? "내 애플리케이션" : "Your application"}</strong>
                <span>
                  {ko ? "지원되는 SDK 또는 API" : "Supported SDK or API"}
                </span>
              </div>
              <ArrowRight className="flow-arrow" size={23} />
              <div className="flow-node flow-observer">
                <div className="flow-orbit">
                  <Database size={26} weight="duotone" />
                </div>
                <strong>Jev Observer</strong>
                <span>127.0.0.1:8765</span>
              </div>
              <ArrowRight className="flow-arrow" size={23} />
              <div className="flow-node">
                <BracketsCurly size={25} />
                <strong>{ko ? "모델 제공업체" : "Your model provider"}</strong>
                <span>{ko ? "실제 모델 추론" : "Live inference"}</span>
              </div>
            </div>
            <div className="flow-note">
              <Database size={16} />
              <span>
                {ko
                  ? "실제 사용 기록은 암호화된 SQLite에 저장됩니다."
                  : "Live history in encrypted SQLite."}
              </span>
            </div>
            <div className="panel-copy">
              <h3>
                {ko
                  ? "한 번 연결하고, 더 자세히 살펴보세요."
                  : "Connect once. See more."}
              </h3>
              <p>
                {ko
                  ? "System One 또는 네이티브 Decisions 요청을 연결하세요."
                  : "Connect System One or native Decisions requests."}
              </p>
              <Link href={href("/docs/connecting")} className="text-link">
                {ko ? "애플리케이션 연결" : "Connect your application"}{" "}
                <ArrowUpRight size={17} />
              </Link>
            </div>
          </Reveal>
          <Reveal className="privacy-panel" delay={0.1}>
            <ShieldCheck size={48} weight="duotone" />
            <h3>
              {ko ? "기록은 내 컴퓨터에." : "Local history."}
              <br />
              {ko ? "관리는 내 손으로." : "Under your control."}
            </h3>
            <p>
              {ko
                ? "로컬에 저장하며, 이벤트를 자동으로 업로드하지 않습니다."
                : "Local storage. No automatic event uploads."}
            </p>
            <div className="privacy-facts">
              <span>
                {ko ? "입력 상태 저장" : "Input-state storage"}{" "}
                <strong>{ko ? "직접 켤 때만" : "Opt-in"}</strong>
              </span>
              <span>
                {ko ? "Observer 계정" : "Observer account"}{" "}
                <strong>{ko ? "필요 없음" : "Not needed"}</strong>
              </span>
              <span>
                {ko ? "실제 사용 기록" : "Live history"}{" "}
                <strong>{ko ? "암호화된 SQLite" : "Encrypted SQLite"}</strong>
              </span>
            </div>
            <Link href={href("/docs/data-and-privacy")} className="text-link">
              {ko ? "데이터와 개인정보" : "Data & privacy"}{" "}
              <ArrowUpRight size={17} />
            </Link>
          </Reveal>
        </div>
      </section>
      <section className="section container" aria-labelledby="docs-title">
        <Reveal>
          <div className="section-heading">
            <h2 id="docs-title">
              {ko ? "내 작업에 맞게" : "Make it"}{" "}
              <span>{ko ? "활용하세요." : "your own."}</span>
            </h2>
          </div>
          <div className="docs-links">
            <Link href={href("/docs/dashboard")} className="doc-feature">
              <BookOpen size={40} weight="duotone" />
              <div>
                <h3>{ko ? "사용자를 위한 안내" : "For users"}</h3>
                <p>
                  {ko
                    ? "저장된 기록에서 필요한 응답을 찾으세요."
                    : "Find the answers in your history."}
                </p>
                <span className="text-link">
                  {ko ? "사용자 가이드 읽기" : "Read the user guide"}{" "}
                  <ArrowUpRight size={17} />
                </span>
              </div>
            </Link>
            <Link href={href("/docs/development")} className="doc-feature">
              <Code size={40} weight="duotone" />
              <div>
                <h3>{ko ? "개발자를 위한 안내" : "For developers"}</h3>
                <p>
                  {ko
                    ? "직접 빌드하고, 확장하고, 기여하세요."
                    : "Build, extend, and contribute."}
                </p>
                <span className="text-link">
                  {ko ? "개발자 가이드 읽기" : "Read the developer guide"}{" "}
                  <ArrowUpRight size={17} />
                </span>
              </div>
            </Link>
          </div>
        </Reveal>
      </section>
      <section className="container open-source-note">
        <Reveal>
          <div className="open-source-inner">
            <GitBranch size={23} />
            <p>
              <strong>
                {ko
                  ? "MIT 라이선스. 계속 발전하는 프로젝트."
                  : "MIT licensed. Still taking shape."}
              </strong>{" "}
              {ko
                ? "Jev와 호환 의사결정 모델을 위한 작동하는 프로토타입입니다. Linux, macOS, Windows 패키지를 제공합니다."
                : "A working prototype for Jev and compatible decision models, with packages for Linux, macOS and Windows."}
            </p>
            <a
              href={site.repo}
              className="text-link"
              target="_blank"
              rel="noreferrer"
            >
              GitHub <ArrowUpRight size={17} />
            </a>
          </div>
        </Reveal>
      </section>
    </main>
  );
}
