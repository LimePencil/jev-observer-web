import { expect, test, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { getDocs } from "../lib/docs";

async function expectNoOverflow(page: Page) {
  const dimensions = await page.evaluate(() => ({
    viewport: document.documentElement.clientWidth,
    document: document.documentElement.scrollWidth,
    body: document.body.scrollWidth,
  }));
  expect(dimensions.document, JSON.stringify(dimensions)).toBeLessThanOrEqual(
    dimensions.viewport + 1,
  );
  expect(dimensions.body, JSON.stringify(dimensions)).toBeLessThanOrEqual(
    dimensions.viewport + 1,
  );
}

test("homepage introduces the product without runtime errors or horizontal overflow", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  const response = await page.goto("/");
  expect(response?.status()).toBe(200);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Every decision. In clear view.",
  );
  await expect(
    page.getByRole("link", { name: /install/i }).first(),
  ).toHaveAttribute("href", "/docs/installation");
  await expectNoOverflow(page);
  await page
    .getByRole("tab", { name: "Overview", exact: true })
    .scrollIntoViewIfNeeded();
  await expectNoOverflow(page);
  expect(errors).toEqual([]);
});

test("product tour changes real screenshots with mouse and keyboard", async ({
  page,
}) => {
  await page.goto("/");
  const overview = page.getByRole("tab", { name: "Overview", exact: true });
  const questions = page.getByRole("tab", {
    name: "Question groups",
    exact: true,
  });
  const requests = page.getByRole("tab", {
    name: "Request details",
    exact: true,
  });
  await expect(overview).toHaveAttribute("aria-selected", "true");
  await questions.click();
  await expect(questions).toHaveAttribute("aria-selected", "true");
  await expect(page.getByRole("tabpanel").locator("img")).toHaveAttribute(
    "src",
    /observer-questions/,
  );
  await questions.focus();
  await page.keyboard.press("ArrowRight");
  await expect(requests).toBeFocused();
  // Accept either automatic or manual tab activation, while exercising both.
  await page.keyboard.press("Enter");
  await expect(requests).toHaveAttribute("aria-selected", "true");
  await expect(page.getByRole("tabpanel").locator("img")).toHaveAttribute(
    "src",
    /observer-live/,
  );
  await overview.click();
  await expect(page.getByRole("tabpanel").locator("img")).toHaveAttribute(
    "src",
    /observer-metrics/,
  );
  await expectNoOverflow(page);
});

test("expanded screenshot is a keyboard-dismissible dialog", async ({
  page,
}) => {
  await page.goto("/");
  const expand = page.getByRole("button", {
    name: "Expand screenshot",
    exact: true,
  });
  await expand.click();
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  await expect(
    dialog.getByRole("img", { name: /^Jev Observer/ }),
  ).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(dialog).not.toBeVisible();
  await expect(expand).toBeFocused();
});

test("documentation search finds installation and navigates to it", async ({
  page,
}) => {
  await page.goto("/docs");
  await page
    .getByRole("button", { name: "Search documentation", exact: true })
    .click();
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  const input = dialog.getByLabel("Search documentation", { exact: true });
  await input.fill("install");
  const result = dialog.locator('a[href="/docs/installation"]').first();
  await expect(result).toHaveAttribute("href", "/docs/installation");
  await result.click();
  await expect(page).toHaveURL(/\/docs\/installation$/);
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    /install/i,
  );
  await expect(dialog).not.toBeVisible();
});

test("all documentation pages and internal destinations resolve", async ({
  page,
  request,
}) => {
  test.setTimeout(120_000);
  const docs = getDocs();
  expect(docs.length).toBeGreaterThan(0);
  expect(docs.some((doc) => doc.slug === "installation")).toBe(true);
  const destinations = new Set<string>();
  const loadedRoutes = new Set<string>();
  const pageAnchors = new Map<string, Set<string>>();
  const linkedAnchors: { source: string; target: string; id: string }[] = [];
  for (const route of [
    "/",
    "/docs",
    ...docs.map((doc) => `/docs/${doc.slug}`),
  ]) {
    const response = await page.goto(route);
    expect(response?.status(), route).toBe(200);
    loadedRoutes.add(route);
    pageAnchors.set(
      route,
      new Set(
        await page
          .locator("[id]")
          .evaluateAll((elements) => elements.map((element) => element.id)),
      ),
    );
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    const doc = docs.find((item) => route === `/docs/${item.slug}`);
    if (doc)
      await expect(page.getByRole("heading", { level: 1 })).toHaveText(
        doc.title,
      );
    await expectNoOverflow(page);
    const links = await page
      .locator("a[href]")
      .evaluateAll((anchors) =>
        anchors.map((anchor) => (anchor as HTMLAnchorElement).href),
      );
    for (const link of links) {
      const target = new URL(link);
      if (target.origin !== new URL(page.url()).origin) continue;
      destinations.add(target.pathname + target.search);
      if (target.hash) {
        const id = decodeURIComponent(target.hash.slice(1));
        linkedAnchors.push({ source: route, target: target.pathname, id });
      }
    }
  }
  for (const { source, target, id } of linkedAnchors) {
    const ids = pageAnchors.get(target);
    if (ids)
      expect(ids.has(id), `${source} links to ${target}#${id}`).toBe(true);
  }
  for (const destination of destinations) {
    if (loadedRoutes.has(destination)) continue;
    const response = await request.get(destination);
    expect(response.ok(), `${destination}: HTTP ${response.status()}`).toBe(
      true,
    );
  }
});

test("color theme persists across navigation and reload", async ({ page }) => {
  await page.goto("/");
  await page
    .getByRole("button", { name: "Toggle color theme", exact: true })
    .click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await page.goto("/docs/installation");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await page
    .getByRole("button", { name: "Toggle color theme", exact: true })
    .click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
});

test("mobile navigation opens, closes with Escape, and follows links", async ({
  page,
  isMobile,
}) => {
  test.skip(!isMobile, "Mobile navigation is only rendered at mobile widths.");
  await page.goto("/");
  const open = page.getByRole("button", {
    name: "Open navigation",
    exact: true,
  });
  await open.click();
  const nav = page.getByRole("navigation", {
    name: "Mobile navigation",
    exact: true,
  });
  await expect(nav).toBeVisible();
  await nav.getByRole("link", { name: "Documentation", exact: true }).focus();
  await page.keyboard.press("Escape");
  await expect(nav).not.toBeVisible();
  await expect(open).toBeFocused();
  await open.click();
  await nav.getByRole("link", { name: "Documentation", exact: true }).click();
  await expect(page).toHaveURL(/\/docs$/);
  await expect(nav).not.toBeVisible();
  await expectNoOverflow(page);
});

test("installation command copies actual code and announces success", async ({
  page,
  context,
}) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.goto("/docs/installation");
  const copy = page
    .getByRole("button", { name: "Copy code", exact: true })
    .first();
  await expect(copy).toBeVisible();
  const block = page.locator(".code-block").filter({ has: copy }).first();
  const expected = await block.locator("code").textContent();
  await copy.click();
  await expect(
    page.getByRole("button", { name: "Copied to clipboard", exact: true }),
  ).toBeVisible();
  const clipboard = await page.evaluate(() => navigator.clipboard.readText());
  expect(clipboard.trim()).toBe(expected?.trim());
  expect(clipboard.trim().length).toBeGreaterThan(0);
});

test("reduced motion keeps content visible and stops ambient animation", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await page
    .getByRole("tab", { name: "Overview", exact: true })
    .scrollIntoViewIfNeeded();
  await expect(page.getByRole("tabpanel").getByRole("img")).toBeVisible();
  await expect
    .poll(async () =>
      page.evaluate(
        () =>
          document.getAnimations().filter((animation) => {
            const duration = animation.effect?.getComputedTiming().duration;
            return (
              animation.playState === "running" &&
              typeof duration === "number" &&
              duration > 50
            );
          }).length,
      ),
    )
    .toBe(0);
  await expectNoOverflow(page);
});

for (const route of ["/", "/docs/installation"]) {
  for (const theme of ["light", "dark"] as const) {
    test(`accessible ${route} in ${theme} theme`, async ({ page }) => {
      await page.addInitScript(
        (value) => localStorage.setItem("jev-theme", value),
        theme,
      );
      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.goto(route);
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
      await expect(page.locator("html")).toHaveAttribute("data-theme", theme);
      const results = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
        .analyze();
      expect(results.violations).toEqual([]);
    });
  }
}
