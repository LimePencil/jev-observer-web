export const site = {
  name: "Jev Observer",
  version: "0.4.0",
  description:
    "Inspect Jev and compatible decision models locally. See typed answers, question versions, failures, latency, usage, and reported or estimated cost in one dashboard.",
  repo: "https://github.com/LimePencil/jev-observer",
};
export function siteUrl() {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (configured) return new URL(configured);
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL)
    return new URL(`https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`);
  if (process.env.VERCEL_URL)
    return new URL(`https://${process.env.VERCEL_URL}`);
  return new URL("http://localhost:3000");
}
