import { expect, test } from "@playwright/test";

test.describe("mobile navigation state", () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");
  });

  test("Escape closes navigation and returns focus to its trigger", async ({
    page,
  }) => {
    await page
      .getByRole("button", { name: "Open navigation", exact: true })
      .click();
    const nav = page.getByRole("navigation", {
      name: "Mobile navigation",
      exact: true,
    });
    await nav.getByRole("link", { name: "Documentation", exact: true }).focus();
    await page.keyboard.press("Escape");
    await expect(nav).not.toBeVisible();
    await expect(
      page.getByRole("button", { name: "Open navigation", exact: true }),
    ).toBeFocused();
  });

  test("dismisses after browser history navigation", async ({ page }) => {
    await page
      .getByRole("button", { name: "Open navigation", exact: true })
      .click();
    await page
      .getByRole("navigation", { name: "Mobile navigation", exact: true })
      .getByRole("link", { name: "Documentation", exact: true })
      .click();
    await expect(page).toHaveURL(/\/docs$/);
    await page
      .getByRole("button", { name: "Open navigation", exact: true })
      .click();
    await page.goBack();
    await expect(page).toHaveURL(/\/$/);
    await expect(
      page.getByRole("navigation", { name: "Mobile navigation", exact: true }),
    ).not.toBeVisible();
    await expect(
      page.getByRole("button", { name: "Open navigation", exact: true }),
    ).toHaveAttribute("aria-expanded", "false");
    await page
      .getByRole("button", { name: "Open navigation", exact: true })
      .click();
    await page.goForward();
    await expect(page).toHaveURL(/\/docs$/);
    await expect(
      page.getByRole("navigation", { name: "Mobile navigation", exact: true }),
    ).not.toBeVisible();
  });

  test("dismisses when returning from an in-page destination", async ({
    page,
  }) => {
    await page
      .getByRole("button", { name: "Open navigation", exact: true })
      .click();
    await page
      .getByRole("navigation", { name: "Mobile navigation", exact: true })
      .getByRole("link", { name: "Product", exact: true })
      .click();
    await expect(page).toHaveURL(/\/#tour$/);
    await page
      .getByRole("button", { name: "Open navigation", exact: true })
      .click();
    await page.goBack();
    await expect(page).toHaveURL(/\/$/);
    await expect(
      page.getByRole("navigation", { name: "Mobile navigation", exact: true }),
    ).not.toBeVisible();
  });

  test("stays closed after moving through a desktop viewport", async ({
    page,
  }) => {
    await page
      .getByRole("button", { name: "Open navigation", exact: true })
      .click();
    await page.setViewportSize({ width: 1440, height: 1000 });
    await expect(
      page.getByRole("navigation", { name: "Mobile navigation", exact: true }),
    ).not.toBeVisible();
    // CSS hides the menu immediately; wait for the breakpoint event to reset
    // its open state before resizing back into the mobile layout.
    await expect(page.locator(".mobile-menu-button")).toHaveAttribute(
      "aria-expanded",
      "false",
    );
    await page.setViewportSize({ width: 390, height: 844 });
    await expect(
      page.getByRole("navigation", { name: "Mobile navigation", exact: true }),
    ).not.toBeVisible();
    await expect(
      page.getByRole("button", { name: "Open navigation", exact: true }),
    ).toHaveAttribute("aria-expanded", "false");
  });

  test("dismisses when keyboard focus moves into page content", async ({
    page,
  }) => {
    await page
      .getByRole("button", { name: "Open navigation", exact: true })
      .click();
    const nav = page.getByRole("navigation", {
      name: "Mobile navigation",
      exact: true,
    });
    await nav.getByRole("link", { name: "GitHub", exact: true }).focus();
    await page.keyboard.press("Tab");
    await expect(nav).not.toBeVisible();
    await expect(
      page
        .getByRole("main")
        .getByRole("link", { name: "Install Observer", exact: true })
        .first(),
    ).toBeFocused();
  });

  test("dismisses on an outside pointer click without stealing focus", async ({
    page,
  }) => {
    await page
      .getByRole("button", { name: "Open navigation", exact: true })
      .click();
    await page
      .getByText("Independent project. Local by design.", { exact: true })
      .click();
    await expect(
      page.getByRole("navigation", { name: "Mobile navigation", exact: true }),
    ).not.toBeVisible();
    await expect(
      page.getByRole("button", { name: "Open navigation", exact: true }),
    ).not.toBeFocused();
  });

  test("marks the current documentation section in mobile navigation", async ({
    page,
  }) => {
    await page.goto("/docs/installation");
    await page
      .getByRole("button", { name: "Open navigation", exact: true })
      .click();
    const nav = page.getByRole("navigation", {
      name: "Mobile navigation",
      exact: true,
    });
    await expect(
      nav.getByRole("link", { name: "Documentation", exact: true }),
    ).toHaveAttribute("aria-current", "page");
  });
});

test("system theme remains usable when preference storage is unavailable", async ({
  page,
}) => {
  await page.emulateMedia({ colorScheme: "dark" });
  await page.addInitScript(() => {
    Storage.prototype.getItem = () => {
      throw new DOMException("Storage unavailable", "SecurityError");
    };
    Storage.prototype.setItem = () => {
      throw new DOMException("Storage unavailable", "SecurityError");
    };
  });
  await page.goto("/");
  const toggle = page.getByRole("button", {
    name: "Toggle color theme",
    exact: true,
  });
  await toggle.click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  await toggle.click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
});
