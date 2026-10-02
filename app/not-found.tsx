import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Page not found",
  description:
    "This page could not be found. Continue with the Jev Observer documentation or return to the homepage.",
};

export default function NotFound() {
  return (
    <main id="main" className="container not-found">
      <span className="eyebrow">404</span>
      <h1>This page is out of view.</h1>
      <p>The link may have moved. Find your next step in the documentation.</p>
      <div className="button-row">
        <Link href="/docs" className="button button-primary">
          Documentation
        </Link>
        <Link href="/" className="button button-secondary">
          Back to home
        </Link>
      </div>
    </main>
  );
}
