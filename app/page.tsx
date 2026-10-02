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
import { HeroFlow } from "@/components/hero-flow";
import { site } from "@/lib/site";

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
            <strong>Requests. Answers. Usage.</strong>
            <br />
            One local dashboard.
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
            <HardDrives size={20} /> Native installers
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
            <h2 id="tour-title">
              Go straight to <span>the answer.</span>
            </h2>
          </div>
        </Reveal>
        <ProductTour />
      </section>
      <section
        className="section approach-section container"
        aria-labelledby="approach-title"
      >
        <Reveal>
          <div className="section-heading">
            <h2 id="approach-title">
              Your workflow. <span>Now visible.</span>
            </h2>
          </div>
        </Reveal>
        <div className="approach-grid">
          <Reveal className="flow-panel">
            <div
              className="flow-diagram"
              aria-label="Your application sends requests through local Jev Observer to your configured provider. Observer encrypts live history in local SQLite."
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
              <span>Live history in encrypted SQLite.</span>
            </div>
            <div className="panel-copy">
              <h3>Connect once. See more.</h3>
              <p>Point your supported SDK at Observer.</p>
              <Link href="/docs/connecting" className="text-link">
                Connect your application <ArrowUpRight size={17} />
              </Link>
            </div>
          </Reveal>
          <Reveal className="privacy-panel" delay={0.1}>
            <ShieldCheck size={48} weight="duotone" />
            <h3>
              Local history.
              <br />
              Under your control.
            </h3>
            <p>Local storage. No automatic event uploads.</p>
            <div className="privacy-facts">
              <span>
                Input-state storage <strong>Opt-in</strong>
              </span>
              <span>
                Observer account <strong>Not needed</strong>
              </span>
              <span>
                Live history <strong>Encrypted SQLite</strong>
              </span>
            </div>
            <Link href="/docs/data-and-privacy" className="text-link">
              Data & privacy <ArrowUpRight size={17} />
            </Link>
          </Reveal>
        </div>
      </section>
      <section className="section container" aria-labelledby="docs-title">
        <Reveal>
          <div className="section-heading">
            <h2 id="docs-title">
              Make it <span>your own.</span>
            </h2>
          </div>
          <div className="docs-links">
            <Link href="/docs/dashboard" className="doc-feature">
              <BookOpen size={40} weight="duotone" />
              <div>
                <h3>For users</h3>
                <p>Find the answers in your history.</p>
                <span className="text-link">
                  Read the user guide <ArrowUpRight size={17} />
                </span>
              </div>
            </Link>
            <Link href="/docs/development" className="doc-feature">
              <Code size={40} weight="duotone" />
              <div>
                <h3>For developers</h3>
                <p>Build, extend, and contribute.</p>
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
              <strong>MIT licensed. Still taking shape.</strong> A working
              prototype with public source and native packages for Linux, macOS
              and Windows.
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
