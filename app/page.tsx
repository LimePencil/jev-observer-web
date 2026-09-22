import type { Metadata } from "next";
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
import { CodeBlock } from "@/components/code-block";
import { HeroFlow } from "@/components/hero-flow";
import { installCommand, site } from "@/lib/site";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

export default function Home() {
  return (
    <main id="main">
      <section className="hero container" aria-labelledby="hero-title">
        <div className="hero-copy">
          <p className="eyebrow hero-enter">Local observability for Jev</p>
          <h1 id="hero-title" className="hero-enter">
            Every decision. <br />
            <span>In clear view.</span>
          </h1>
          <p className="hero-description hero-enter">
            Understand your Jev questions, inspect requests, and track usage.
            All in one local dashboard.
          </p>
          <div className="button-row hero-enter">
            <Link href="/docs/installation" className="button button-primary">
              Install Observer <ArrowUpRight size={18} />
            </Link>
            <a href="#tour" className="button button-text">
              Explore the dashboard <ArrowDown size={17} />
            </a>
          </div>
        </div>
        <div className="hero-art hero-enter">
          <HeroFlow />
        </div>
      </section>
      <div className="principles-strip">
        <div className="container principles-inner">
          <span>
            <Desktop size={20} /> Runs on your machine
          </span>
          <span>
            <HardDrives size={20} /> One executable after build
          </span>
          <span>
            <GitBranch size={20} /> MIT licensed
          </span>
          <span>
            <ShieldCheck size={20} /> No Observer account
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
            <h2 id="tour-title">From a request to the full picture.</h2>
            <p>
              Spot a failure. Open an answer. Follow a question over time.
              <br className="desktop-break" /> The context stays connected.
            </p>
          </div>
          <ProductTour />
        </Reveal>
      </section>
      <section
        className="section approach-section container"
        aria-labelledby="approach-title"
      >
        <Reveal>
          <div className="section-heading">
            <h2 id="approach-title">Your workflow. A little more visible.</h2>
            <p>
              Point your supported SDK at Observer. Keep your credentials in
              your application.
            </p>
          </div>
        </Reveal>
        <div className="approach-grid">
          <Reveal className="flow-panel">
            <div
              className="flow-diagram"
              aria-label="Your application sends requests through local Jev Observer to your configured provider. Observer stores captured history in local SQLite."
            >
              <div className="flow-node">
                <Code size={25} />
                <strong>Your application</strong>
                <span>TypeSafe SDK</span>
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
                <strong>Your provider</strong>
                <span>Live inference</span>
              </div>
            </div>
            <div className="flow-note">
              <Database size={16} />
              <span>Captured history stays in your local SQLite database.</span>
            </div>
            <div className="panel-copy">
              <h3>A small change at the source.</h3>
              <p>
                Use the local origin as your SDK base URL. Observer forwards
                supported requests and records a bounded copy for inspection.
              </p>
              <Link href="/docs/connecting" className="text-link">
                Connect your application <ArrowUpRight size={17} />
              </Link>
            </div>
          </Reveal>
          <Reveal className="privacy-panel" delay={0.1}>
            <ShieldCheck size={34} weight="duotone" />
            <h3>
              Local history.
              <br />
              Under your control.
            </h3>
            <p>
              No analytics or automatic event uploads. Export your records, set
              retention, and decide what to capture.
            </p>
            <div className="privacy-facts">
              <span>
                Input-state storage <strong>Opt-in</strong>
              </span>
              <span>
                Observer account <strong>Not needed</strong>
              </span>
              <span>
                History format <strong>SQLite</strong>
              </span>
            </div>
            <Link href="/docs/data-and-privacy" className="text-link">
              Data & privacy <ArrowUpRight size={17} />
            </Link>
          </Reveal>
        </div>
      </section>
      <section
        className="section install-section"
        id="install"
        aria-labelledby="install-title"
      >
        <div className="container install-grid">
          <Reveal className="install-copy">
            <p className="eyebrow">From source to first look</p>
            <h2 id="install-title">
              Make yourself
              <br />
              at home.
            </h2>
            <p>
              Build Observer, then explore 720 synthetic requests. No API key
              needed for the sample.
            </p>
            <div className="requirements">
              <span>Before you begin</span>
              <p>
                Git, stable Rust, a C compiler,
                <br />
                and Node.js 22.12+ with npm.
              </p>
              <p>Source build requires repository access.</p>
            </div>
            <Link href="/docs/installation" className="text-link">
              Install Observer <ArrowUpRight size={17} />
            </Link>
          </Reveal>
          <Reveal className="install-code" delay={0.1}>
            <CodeBlock code={installCommand} title="Build & run the sample" />
            <p className="install-footnote">
              Then open{" "}
              <a href="http://127.0.0.1:8765" target="_blank" rel="noreferrer">
                127.0.0.1:8765 <ArrowUpRight size={13} />
              </a>
              . Sample mode is isolated and disables upstream forwarding.
            </p>
          </Reveal>
        </div>
      </section>
      <section className="section container" aria-labelledby="docs-title">
        <Reveal>
          <div className="section-heading">
            <h2 id="docs-title">A good place to go deeper.</h2>
            <p>
              Start with your first request. Stay to understand how it works.
            </p>
          </div>
          <div className="docs-links">
            <Link href="/docs/dashboard" className="doc-feature">
              <BookOpen size={29} weight="duotone" />
              <div>
                <h3>For users</h3>
                <p>
                  Explore requests, understand question groups, and make your
                  history useful.
                </p>
                <span className="text-link">
                  Read the user guide <ArrowUpRight size={17} />
                </span>
              </div>
            </Link>
            <Link href="/docs/development" className="doc-feature">
              <Code size={29} weight="duotone" />
              <div>
                <h3>For developers</h3>
                <p>
                  Set up your environment, follow the architecture, and
                  contribute a change.
                </p>
                <span className="text-link">
                  Read the developer guide <ArrowUpRight size={17} />
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
              <strong>MIT licensed. Still taking shape.</strong> Jev Observer is
              a working prototype. Source access currently requires a repository
              invitation. The guides cover its capabilities and limits.
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
