import { expect, test } from "@playwright/test";

test("denied clipboard access selects the requested code and offers an announced recovery", async ({
  page,
}) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: {
        writeText: async () => {
          throw new DOMException("Clipboard access denied", "NotAllowedError");
        },
      },
    });
  });
  await page.goto("/docs/installation");
  const block = page.locator(".code-block").first();
  const code = await block.locator("code").innerText();
  await block.getByRole("button", { name: "Copy code", exact: true }).click();

  await expect(block.getByRole("status")).toContainText(
    "Automatic copy failed. Code selected",
  );
  await expect(block.getByRole("status")).toContainText("Ctrl+C (⌘C on Mac)");
  await expect(block.locator("pre")).toBeFocused();
  await expect
    .poll(() => page.evaluate(() => window.getSelection()?.toString()))
    .toBe(code);
  const retry = block.getByRole("button", {
    name: "Retry copying code",
    exact: true,
  });
  await expect(retry).toBeVisible();
  await expect(retry).toHaveAccessibleDescription(/Automatic copy failed/);
  await expect(block.getByRole("status")).toHaveAttribute(
    "aria-live",
    "polite",
  );

  // Guidance remains available after the usual success indicator would reset.
  await page.clock.install();
  await page.clock.fastForward(3000);
  await expect(block.getByRole("status")).toContainText("Code selected");
  await expect(retry).toBeVisible();

  // Retry uses a browser-local stub so this test never writes to the OS clipboard.
  const copied: string[] = [];
  await page.exposeFunction("recordCopiedCode", (value: string) => {
    copied.push(value);
  });
  await page.evaluate(() => {
    navigator.clipboard.writeText = async (value: string) => {
      await (
        window as Window & {
          recordCopiedCode?: (value: string) => Promise<void>;
        }
      ).recordCopiedCode?.(value);
    };
  });
  await retry.click();
  await expect(
    block.getByRole("button", { name: "Copied to clipboard", exact: true }),
  ).toBeVisible();
  await expect(block.getByRole("status")).toHaveText("Copied to clipboard.");
  expect(copied).toEqual([code]);
  await page.clock.fastForward(2500);
  await expect(
    block.getByRole("button", { name: "Copy code", exact: true }),
  ).toBeVisible();
  await expect(block.getByRole("status")).toBeEmpty();
});

test("an unavailable clipboard API still provides manual copying", async ({
  page,
}) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "clipboard", { value: undefined });
  });
  await page.goto("/docs/installation");
  const block = page.locator(".code-block").nth(1);
  const code = await block.locator("code").innerText();
  await block.getByRole("button", { name: "Copy code", exact: true }).click();

  await expect(block.getByRole("status")).toContainText("Code selected");
  await expect
    .poll(() => page.evaluate(() => window.getSelection()?.toString()))
    .toBe(code);
  await expect(
    block.getByRole("button", { name: "Retry copying code", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Copied to clipboard", exact: true }),
  ).toHaveCount(0);
});
