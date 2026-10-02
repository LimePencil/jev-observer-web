import { expect, test, type Locator, type Page } from "@playwright/test";

async function finishScrollFrame(page: Page) {
  await page.evaluate(
    () =>
      new Promise<void>((resolve) =>
        requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
      ),
  );
}

async function confirmSearchIsInteractive(page: Page) {
  await page
    .getByRole("button", { name: "Search documentation", exact: true })
    .click();
  const dialog = page.getByRole("dialog", { name: "Documentation search" });
  await expect(dialog).toBeVisible();
  await dialog.getByRole("button", { name: "Close search" }).click();
  await expect(dialog).not.toBeVisible();
}

async function finishNativeScroll(region: Locator) {
  await region.evaluate(
    (element) =>
      new Promise<void>((resolve) => {
        let top = element.scrollTop;
        let left = element.scrollLeft;
        let stableFrames = 0;
        function check() {
          const nextTop = element.scrollTop;
          const nextLeft = element.scrollLeft;
          stableFrames =
            nextTop === top && nextLeft === left ? stableFrames + 1 : 0;
          top = nextTop;
          left = nextLeft;
          if (stableFrames === 3) resolve();
          else requestAnimationFrame(check);
        }
        requestAnimationFrame(check);
      }),
  );
}

test("search keeps the input, close button, and help visible in a short landscape viewport", async ({
  page,
}) => {
  await page.setViewportSize({ width: 667, height: 320 });
  await page.goto("/docs");
  await page
    .getByRole("button", { name: "Search documentation", exact: true })
    .click();
  const dialog = page.getByRole("dialog", { name: "Documentation search" });
  const input = dialog.getByRole("searchbox");
  await input.fill("request");
  await input.press("ArrowUp");
  await expect(dialog.getByRole("link").last()).toBeFocused();
  await expect(dialog.getByRole("link").last()).toBeInViewport();
  await expect(input).toBeInViewport({ ratio: 1 });
  await expect(
    dialog.getByRole("button", { name: "Close search" }),
  ).toBeInViewport({ ratio: 1 });
  await expect(dialog.locator(".search-footer")).toBeInViewport({ ratio: 1 });
  await page.keyboard.press("ArrowDown");
  await expect(input).toBeFocused();
  await input.press("Escape");
  await expect(dialog).not.toBeVisible();
});

test("holding the search shortcut opens once until the keys are released", async ({
  page,
}) => {
  await page.goto("/docs");
  await confirmSearchIsInteractive(page);
  const dialog = page.getByRole("dialog", { name: "Documentation search" });
  await page.keyboard.down("Control");
  await page.keyboard.down("k");
  await expect(dialog).toBeVisible();
  await page.keyboard.down("k");
  await expect(dialog).toBeVisible();
  await page.keyboard.up("k");
  await page.keyboard.up("Control");
  await page.keyboard.press("Control+k");
  await expect(dialog).not.toBeVisible();
});

test("browser history navigation dismisses a search left open on the previous page", async ({
  page,
}) => {
  await page.goto("/docs");
  await page.locator(".docs-start").click();
  await expect(page).toHaveURL(/\/docs\/installation$/);
  await page.keyboard.press("Control+k");
  const dialog = page.getByRole("dialog", { name: "Documentation search" });
  await dialog.getByRole("searchbox").fill("privacy");
  await page.goBack();
  await expect(page).toHaveURL(/\/docs$/);
  await expect(dialog).not.toBeVisible();
  await expect(
    page.getByRole("heading", { level: 1, name: "Documentation", exact: true }),
  ).toBeVisible();
});

test.describe("desktop pointer at narrow widths", () => {
  // Native wheel input requires a desktop pointer context; the viewport remains narrow.
  test.use({ isMobile: false, hasTouch: false });

  test("search preserves the reading position while open and restores page scrolling on close", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 667, height: 375 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/docs/installation");
    await confirmSearchIsInteractive(page);
    await page.evaluate(() => window.scrollTo(0, 700));
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(700);
    await page.keyboard.press("Control+k");
    const dialog = page.getByRole("dialog", { name: "Documentation search" });
    await expect(dialog).toBeVisible();
    await page.mouse.move(1, 200);
    await page.mouse.wheel(0, 700);
    await finishScrollFrame(page);
    expect(await page.evaluate(() => window.scrollY)).toBe(700);
    await dialog.getByRole("searchbox").press("Escape");
    await expect(dialog).not.toBeVisible();
    expect(await page.evaluate(() => window.scrollY)).toBe(700);
    await page.mouse.wheel(0, 400);
    await expect
      .poll(() => page.evaluate(() => window.scrollY))
      .toBeGreaterThan(700);
  });

  test("the screenshot scrolls by keyboard while the underlying page keeps its position", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 667, height: 375 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");
    const expand = page.getByRole("button", {
      name: "Expand screenshot",
      exact: true,
    });
    await expand.click();
    const dialog = page.getByRole("dialog", { name: "Overview screenshot" });
    await expect(dialog).toBeVisible();
    const readingPosition = await page.evaluate(() => window.scrollY);
    await page.mouse.move(1, 200);
    await page.mouse.wheel(0, 700);
    await finishScrollFrame(page);
    expect(await page.evaluate(() => window.scrollY)).toBe(readingPosition);

    const close = dialog.getByRole("button", { name: "Close screenshot" });
    const viewport = dialog.locator(".image-dialog-viewport");
    await expect
      .poll(() =>
        viewport.evaluate(
          (element) => element.scrollHeight - element.clientHeight,
        ),
      )
      .toBeGreaterThan(0);
    await expect
      .poll(() =>
        viewport.evaluate(
          (element) => element.scrollWidth - element.clientWidth,
        ),
      )
      .toBeGreaterThan(0);
    await close.focus();
    await page.keyboard.press("Tab");
    await expect(viewport).toBeFocused();
    await page.keyboard.press("ArrowDown");
    await expect
      .poll(() => viewport.evaluate((element) => element.scrollTop))
      .toBeGreaterThan(0);
    // The first movement can occur mid-animation. Let the native scroll settle
    // before switching axes so Chromium does not coalesce the next key gesture.
    await finishNativeScroll(viewport);
    await page.keyboard.press("ArrowRight");
    await expect
      .poll(() => viewport.evaluate((element) => element.scrollLeft))
      .toBeGreaterThan(0);
    await finishNativeScroll(viewport);
    await expect(close).toBeInViewport({ ratio: 1 });
    await page.keyboard.press("Escape");
    await expect(dialog).not.toBeVisible();
    await expect(expand).toBeFocused();
    expect(await page.evaluate(() => window.scrollY)).toBe(readingPosition);
  });
});
