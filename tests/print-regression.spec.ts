import { expect, test } from "@playwright/test";

for (const route of ["/", "/ko"]) {
  test(`printing ${route} includes content that has not been scrolled into view`, async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await page.goto(route);
    const workflow = page.locator(".flow-panel");
    await expect(workflow).toHaveClass(/reveal-ready/);
    await expect(workflow).toHaveCSS("opacity", "0");

    await page.emulateMedia({ media: "print" });
    for (const section of await page.locator(".reveal-ready").all()) {
      await expect(section).toHaveCSS("opacity", "1");
      await expect(section).toHaveCSS("transform", "none");
    }
  });
}
