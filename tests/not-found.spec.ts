import { expect, test } from "@playwright/test";

for (const route of ["/not-a-page", "/docs/not-a-page"]) {
  test(`missing page ${route} reports a 404 and offers working recovery links`, async ({
    page,
  }) => {
    const response = await page.goto(route);
    expect(response?.status()).toBe(404);
    await expect(page).toHaveTitle("Page not found | Jev Observer");
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
      "content",
      /noindex/,
    );
    const main = page.getByRole("main");
    await expect(main).toHaveCount(1);
    await expect(main.getByRole("heading", { level: 1 })).toHaveText(
      "This page is out of view.",
    );

    await main
      .getByRole("link", { name: "Documentation", exact: true })
      .click();
    await expect(page).toHaveURL(/\/docs$/);
    await expect(page).toHaveTitle("Documentation | Jev Observer");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(
      "Documentation",
    );

    await page.goBack();
    await expect(page).toHaveTitle("Page not found | Jev Observer");
    await main.getByRole("link", { name: "Back to home", exact: true }).click();
    await expect(page).toHaveURL(/\/$/);
    await expect(page).toHaveTitle(
      "Jev Observer | Every decision. In clear view.",
    );
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(
      "Every decision. In clear view.",
    );
  });
}
