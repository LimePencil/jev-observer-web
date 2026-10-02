import { expect, test } from "@playwright/test";

for (const width of [320, 768, 1024]) {
  test(`guide sections are reachable by keyboard at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/docs/installation");

    const contents = page.locator(".doc-mobile-toc");
    const summary = contents.locator("summary");
    await expect(summary).toBeVisible();
    await summary.focus();
    await page.keyboard.press("Enter");
    const navigation = page.getByRole("navigation", { name: "On this page" });
    await expect(navigation).toHaveCount(1);
    await expect(navigation.getByRole("link")).toHaveCount(
      await page.locator(".prose h2").count(),
    );
    const sample = navigation.getByRole("link", { name: "Open the sample" });
    await sample.focus();
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(/#open-the-sample$/);
    await expect(page.locator("h2#open-the-sample")).toBeInViewport();
    const dimensions = await page.evaluate(() => ({
      width: document.documentElement.clientWidth,
      content: document.documentElement.scrollWidth,
    }));
    expect(dimensions.content).toBeLessThanOrEqual(dimensions.width + 1);
  });
}

test("wide guides retain one visible section navigation", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/docs/connecting");
  await expect(page.locator(".doc-mobile-toc")).not.toBeVisible();
  const navigation = page.getByRole("navigation", { name: "On this page" });
  await expect(navigation).toHaveCount(1);
  await expect(navigation).toBeVisible();
  await navigation.getByRole("link", { name: "Verify the connection" }).click();
  await expect(page.locator("h2#verify-the-connection")).toBeInViewport();
});
