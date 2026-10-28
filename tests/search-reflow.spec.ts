import { expect, test } from "@playwright/test";

for (const height of [180, 240]) {
  for (const locale of ["en", "ko"] as const) {
    test(`${locale} search results remain readable at 320×${height}`, async ({
      page,
    }) => {
      await page.setViewportSize({ width: 320, height });
      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.goto(locale === "en" ? "/docs" : "/ko/docs");
      await page
        .getByRole("button", {
          name: locale === "en" ? "Search documentation" : "문서 검색",
          exact: true,
        })
        .click();
      const dialog = page.getByRole("dialog");
      await expect(dialog).toBeVisible();
      const input = dialog.getByRole("searchbox");
      await input.fill(locale === "en" ? "install" : "설치");
      const firstResult = dialog.getByRole("link").first();
      await expect(firstResult).toHaveAttribute(
        "href",
        locale === "en" ? "/docs/installation" : "/ko/docs/installation",
      );
      await expect(firstResult.locator("strong")).toBeInViewport({ ratio: 1 });
      await input.press("ArrowDown");
      await expect(firstResult).toBeFocused();
      await expect(firstResult.locator("strong")).toBeInViewport({ ratio: 1 });
      await expect(input).toBeInViewport({ ratio: 1 });
      await expect(dialog.getByRole("button")).toBeInViewport({ ratio: 1 });
      await expect(dialog.locator(".search-footer")).toBeInViewport({
        ratio: 1,
      });
      await expect(dialog).toBeInViewport({ ratio: 1 });
      await page.keyboard.press("Enter");
      await expect(page).toHaveURL(/\/docs\/installation$/);
      await expect(dialog).not.toBeVisible();
    });
  }
}
