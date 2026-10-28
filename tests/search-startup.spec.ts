import { expect, test } from "@playwright/test";

for (const locale of ["en", "ko"] as const) {
  test(`${locale} search accepts typing immediately after the initial page load`, async ({
    page,
  }) => {
    const prefix = locale === "ko" ? "/ko" : "";
    await page.goto(`${prefix}/docs`, { waitUntil: "commit" });
    await page
      .getByRole("button", {
        name: locale === "ko" ? "문서 검색" : "Search documentation",
        exact: true,
      })
      .click();
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    const input = dialog.getByRole("searchbox");
    // Ordinary typing spans the remaining hydration work after an early click.
    await input.pressSequentially(locale === "ko" ? "설치" : "install", {
      delay: 100,
    });
    await expect(input).toHaveValue(locale === "ko" ? "설치" : "install");
    await expect(dialog).toBeVisible();
    await expect(dialog.getByRole("link").first()).toHaveAttribute(
      "href",
      `${prefix}/docs/installation`,
    );
    await input.press("Enter");
    await expect(page).toHaveURL(`${prefix}/docs/installation`);
    await expect(dialog).not.toBeVisible();
  });
}
