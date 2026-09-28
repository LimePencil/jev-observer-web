export const site = {
  name: "Jev Observer",
  description:
    "See the decisions behind your Jev requests. A local proxy and dashboard for questions, failures, latency, token usage, and cost estimates.",
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
