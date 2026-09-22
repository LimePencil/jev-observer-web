import { expect, test } from "@playwright/test";

test("mobile navigation dismisses with Escape while its trigger retains focus", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  const trigger = page.getByRole("button", {
    name: "Open navigation",
    exact: true,
  });
  await trigger.focus();
  await page.keyboard.press("Enter");
  await expect(
    page.getByRole("navigation", { name: "Mobile navigation", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Close navigation", exact: true }),
  ).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(
    page.getByRole("navigation", { name: "Mobile navigation", exact: true }),
  ).not.toBeVisible();
  await expect(trigger).toBeFocused();
  await expect(trigger).toHaveAttribute("aria-expanded", "false");
});

test("each tour tab controls an existing panel and only its selected panel is exposed", async ({
  page,
}) => {
  await page.goto("/");
  const tabs = page.getByRole("tab");
  for (const tab of await tabs.all()) {
    const panelId = await tab.getAttribute("aria-controls");
    expect(panelId).toBeTruthy();
    const panel = page.locator(`[id="${panelId}"]`);
    await expect(panel).toHaveCount(1);
    await expect(panel).toHaveAttribute("role", "tabpanel");
    await expect(panel).toHaveAttribute(
      "aria-labelledby",
      (await tab.getAttribute("id"))!,
    );
  }
  for (const tab of await tabs.all()) {
    await tab.click();
    await expect(tab).toHaveAttribute("aria-selected", "true");
    await expect(page.getByRole("tabpanel")).toHaveCount(1);
    await expect(page.getByRole("tabpanel")).toHaveAttribute(
      "id",
      (await tab.getAttribute("aria-controls"))!,
    );
    await expect(page.getByRole("tabpanel").getByRole("img")).toBeVisible();
  }
});
