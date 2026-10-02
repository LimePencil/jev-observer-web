import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { getDocs } from "../lib/docs";

test("search shows every matching page and reports the full result count", async ({
  page,
}) => {
  await page.goto("/docs");
  await page
    .getByRole("button", { name: "Search documentation", exact: true })
    .click();
  const dialog = page.getByRole("dialog", { name: "Documentation search" });
  const input = dialog.getByRole("searchbox", { name: "Search documentation" });
  const matchingDocs = getDocs().filter((doc) =>
    `${doc.title} ${doc.description} ${doc.content}`
      .toLowerCase()
      .includes("request"),
  );
  expect(matchingDocs.length).toBeGreaterThan(8);
  await input.fill("request");
  await expect(dialog.getByRole("link")).toHaveCount(matchingDocs.length);
  await expect(
    dialog.getByText(`${matchingDocs.length} matching pages`, { exact: true }),
  ).toBeVisible();
  for (const doc of matchingDocs) {
    await expect(dialog.locator(`a[href="/docs/${doc.slug}"]`)).toHaveCount(1);
  }
});

test("Enter opens the first result from a whitespace-padded search", async ({
  page,
}) => {
  await page.goto("/docs");
  await page
    .getByRole("button", { name: "Search documentation", exact: true })
    .click();
  const dialog = page.getByRole("dialog", { name: "Documentation search" });
  const input = dialog.getByRole("searchbox", { name: "Search documentation" });
  await expect(input).toBeFocused();
  await input.fill("  architecture  ");
  await expect(dialog.getByRole("link").first()).toHaveAttribute(
    "href",
    "/docs/architecture",
  );
  await input.press("Enter");
  await expect(page).toHaveURL(/\/docs\/architecture$/);
  await expect(dialog).not.toBeVisible();
});

test("search keyboard traversal returns to the input and Escape restores focus", async ({
  page,
}) => {
  await page.goto("/docs");
  const trigger = page.getByRole("button", {
    name: "Search documentation",
    exact: true,
  });
  await trigger.click();
  const dialog = page.getByRole("dialog", { name: "Documentation search" });
  const input = dialog.getByRole("searchbox", { name: "Search documentation" });
  const results = dialog.getByRole("link");
  await input.fill("request");
  await input.press("ArrowDown");
  await expect(results.first()).toBeFocused();
  await page.keyboard.press("ArrowDown");
  await expect(results.nth(1)).toBeFocused();
  await page.keyboard.press("ArrowUp");
  await expect(results.first()).toBeFocused();
  await page.keyboard.press("ArrowUp");
  await expect(input).toBeFocused();
  await input.press("ArrowUp");
  await expect(results.last()).toBeFocused();
  await page.keyboard.press("ArrowDown");
  await expect(input).toBeFocused();
  await input.press("Tab");
  await expect(
    dialog.getByRole("button", { name: "Close search" }),
  ).toBeFocused();
  await page.keyboard.press("Tab");
  // Firefox includes a native keyboard stop on scroll containers.
  const scroller = dialog.locator(".search-results");
  if (await scroller.evaluate((element) => element === document.activeElement))
    await page.keyboard.press("Tab");
  await expect(results.first()).toBeFocused();
  await page.keyboard.press("Shift+Tab");
  if (await scroller.evaluate((element) => element === document.activeElement))
    await page.keyboard.press("Shift+Tab");
  await expect(
    dialog.getByRole("button", { name: "Close search" }),
  ).toBeFocused();
  await page.keyboard.press("Shift+Tab");
  await expect(input).toBeFocused();
  await input.press("Escape");
  await expect(dialog).not.toBeVisible();
  await expect(trigger).toBeFocused();
  await trigger.click();
  await expect(input).toHaveValue("request");
  await expect
    .poll(() =>
      input.evaluate((element) => {
        const search = element as HTMLInputElement;
        return [search.selectionStart, search.selectionEnd];
      }),
    )
    .toEqual([0, "request".length]);
});

test("no-result and one-result searches provide accurate feedback and recover", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/docs");
  await page
    .getByRole("button", { name: "Search documentation", exact: true })
    .click();
  const dialog = page.getByRole("dialog", { name: "Documentation search" });
  const input = dialog.getByRole("searchbox", { name: "Search documentation" });
  await input.fill("unfindable-request-zqx");
  await expect(dialog.getByRole("link")).toHaveCount(0);
  await expect(
    dialog.getByText("0 matching pages", { exact: true }),
  ).toBeVisible();
  await expect(dialog.getByText(/No pages found for/)).toBeVisible();
  await input.press("ArrowDown");
  await input.press("ArrowUp");
  await input.press("Enter");
  await expect(input).toBeFocused();
  await expect(page).toHaveURL(/\/docs$/);
  await input.press("Escape");
  await expect(dialog).not.toBeVisible();
  await page
    .getByRole("button", { name: "Search documentation", exact: true })
    .click();
  await expect(input).toHaveValue("unfindable-request-zqx");
  await input.fill("p95");
  await expect(dialog.getByRole("link")).toHaveCount(1);
  await expect(
    dialog.getByText("1 matching page", { exact: true }),
  ).toBeVisible();
  await input.fill("   ");
  await expect(
    dialog.getByText("Explore the documentation", { exact: true }),
  ).toBeVisible();
  await expect(dialog.getByRole("link")).toHaveCount(getDocs().length);
  expect(errors).toEqual([]);
});

for (const theme of ["light", "dark"] as const) {
  test(`open search is accessible without horizontal overflow in ${theme} theme`, async ({
    page,
    isMobile,
  }) => {
    if (isMobile) await page.setViewportSize({ width: 320, height: 844 });
    await page.addInitScript(
      (value) => localStorage.setItem("jev-theme", value),
      theme,
    );
    await page.goto("/docs");
    await expect(page.locator("html")).toHaveAttribute("data-theme", theme);
    await page
      .getByRole("button", { name: "Search documentation", exact: true })
      .click();
    const dialog = page.getByRole("dialog", { name: "Documentation search" });
    await dialog
      .getByRole("searchbox", { name: "Search documentation" })
      .fill("request");
    await expect(dialog.getByRole("link")).toHaveCount(getDocs().length);

    const dimensions = await page.evaluate(() =>
      [
        document.documentElement,
        document.body,
        document.querySelector(".search-dialog")!,
        document.querySelector(".search-results")!,
      ].map((element) => ({
        name: element.className || element.tagName,
        width: element.clientWidth,
        scrollWidth: element.scrollWidth,
      })),
    );
    for (const dimension of dimensions) {
      expect(
        dimension.scrollWidth,
        JSON.stringify(dimension),
      ).toBeLessThanOrEqual(dimension.width + 1);
    }
    const results = await new AxeBuilder({ page })
      .include(".search-dialog")
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .analyze();
    expect(results.violations).toEqual([]);
  });
}
