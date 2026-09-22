import Link from "next/link";
import { Aperture, ArrowUpRight } from "@phosphor-icons/react/dist/ssr";
import { site } from "@/lib/site";
export function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-top">
        <div>
          <Link className="wordmark" href="/">
            <Aperture size={27} weight="duotone" />
            <span>
              jev<span className="wordmark-light"> observer</span>
            </span>
          </Link>
          <p>A clearer view of your Jev requests.</p>
        </div>
        <nav aria-label="Footer navigation">
          <Link href="/docs/installation">Install Observer</Link>
          <Link href="/docs/dashboard">User guide</Link>
          <Link href="/docs/development">Developer guide</Link>
          <a href={site.repo} target="_blank" rel="noreferrer">
            GitHub <ArrowUpRight size={14} />
          </a>
        </nav>
      </div>
      <div className="container footer-bottom">
        <span>Independent project. Local by design.</span>
        <a
          href={`${site.repo}/blob/main/LICENSE`}
          target="_blank"
          rel="noreferrer"
        >
          MIT license (repository access required) <ArrowUpRight size={13} />
        </a>
      </div>
    </footer>
  );
}
