import { expect, test, type Locator, type Page } from "@playwright/test";

function heroFlow(page: Page) {
  return page.getByRole("figure", { name: "Interactive request example" });
}

async function runningParticles(figure: Locator) {
  return figure.evaluate(
    (element) =>
      element
        .getAnimations({ subtree: true })
        .filter(
          (animation) =>
            animation.playState === "running" &&
            animation.effect instanceof KeyframeEffect &&
            animation.effect.target instanceof SVGCircleElement,
        ).length,
  );
}

test("hero questions reveal their sample answers with mouse and keyboard", async ({
  page,
}) => {
  await page.goto("/");
  const figure = heroFlow(page);
  await expect(figure.getByRole("radio", { name: "Routing" })).toBeChecked();
  await expect(figure.getByText("Technical", { exact: true })).toBeVisible();

  await figure.getByText("Urgency", { exact: true }).click();
  await expect(figure.getByRole("radio", { name: "Urgency" })).toBeChecked();
  await expect(figure.getByText("88%", { exact: true })).toBeVisible();
  await expect(
    figure.getByText("Model output, not measured accuracy", { exact: true }),
  ).toBeVisible();

  await figure.getByText("Frustration", { exact: true }).click();
  await expect(
    figure.getByRole("radio", { name: "Frustration" }),
  ).toBeChecked();
  await expect(figure.getByText("1.7 / 2", { exact: true })).toBeVisible();

  await figure.getByText("Routing", { exact: true }).click();
  const routing = figure.getByRole("radio", { name: "Routing" });
  await routing.focus();
  await page.keyboard.press("ArrowRight");
  await expect(figure.getByRole("radio", { name: "Urgency" })).toBeFocused();
  await expect(figure.getByRole("radio", { name: "Urgency" })).toBeChecked();
  await expect(figure.getByText("88%", { exact: true })).toBeVisible();
  await page.keyboard.press("ArrowRight");
  await expect(
    figure.getByRole("radio", { name: "Frustration" }),
  ).toBeFocused();
  await expect(figure.getByText("1.7 / 2", { exact: true })).toBeVisible();
  await page.keyboard.press("ArrowRight");
  await expect(routing).toBeFocused();
  await expect(routing).toBeChecked();
  await expect(figure.getByText("Technical", { exact: true })).toBeVisible();
});

test("request animation pauses, plays, and replays without changing the selected question", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/");
  const figure = heroFlow(page);
  await figure.scrollIntoViewIfNeeded();
  await expect.poll(() => runningParticles(figure)).toBeGreaterThan(0);

  await figure.getByRole("button", { name: "Pause request animation" }).click();
  await expect(
    figure.getByRole("button", { name: "Play request animation" }),
  ).toBeVisible();
  await expect.poll(() => runningParticles(figure)).toBe(0);

  await figure.getByRole("button", { name: "Play request animation" }).click();
  await expect.poll(() => runningParticles(figure)).toBeGreaterThan(0);
  await figure.getByText("Urgency", { exact: true }).click();
  await figure.getByRole("button", { name: "Pause request animation" }).click();
  await expect.poll(() => runningParticles(figure)).toBe(0);

  await figure.getByRole("button", { name: "Replay sample request" }).click();
  await expect(
    figure.getByRole("button", { name: "Pause request animation" }),
  ).toBeVisible();
  await expect.poll(() => runningParticles(figure)).toBeGreaterThan(0);
  await expect(figure.getByRole("radio", { name: "Urgency" })).toBeChecked();
  await expect(figure.getByText("88%", { exact: true })).toBeVisible();
});

test("reduced motion keeps hero questions usable without animated particles", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  const figure = heroFlow(page);
  await figure.scrollIntoViewIfNeeded();
  await expect.poll(() => runningParticles(figure)).toBe(0);

  await figure.getByText("Urgency", { exact: true }).click();
  await expect(figure.getByText("88%", { exact: true })).toBeVisible();
  await figure.getByRole("radio", { name: "Urgency" }).focus();
  await page.keyboard.press("ArrowRight");
  await expect(
    figure.getByRole("radio", { name: "Frustration" }),
  ).toBeChecked();
  await expect(figure.getByText("1.7 / 2", { exact: true })).toBeVisible();
  await figure.getByRole("button", { name: "Replay sample request" }).click();
  await expect.poll(() => runningParticles(figure)).toBe(0);
  await expect(figure.getByText("1.7 / 2", { exact: true })).toBeVisible();
});

for (const width of [320, 390]) {
  test(`hero answers fit within a ${width}px viewport`, async ({ page }) => {
    await page.setViewportSize({ width, height: 844 });
    await page.goto("/");
    const figure = heroFlow(page);
    for (const [question, answer] of [
      ["Routing", "Technical"],
      ["Urgency", "88%"],
      ["Frustration", "1.7 / 2"],
    ]) {
      await figure.getByText(question, { exact: true }).click();
      const result = figure.getByText(answer, { exact: true });
      await expect(result).toBeVisible();
      const dimensions = await page.evaluate(() => ({
        viewport: document.documentElement.clientWidth,
        document: document.documentElement.scrollWidth,
        body: document.body.scrollWidth,
      }));
      expect(
        dimensions.document,
        JSON.stringify(dimensions),
      ).toBeLessThanOrEqual(dimensions.viewport + 1);
      expect(dimensions.body, JSON.stringify(dimensions)).toBeLessThanOrEqual(
        dimensions.viewport + 1,
      );
      const figureBounds = await figure.boundingBox();
      const answerBounds = await result.boundingBox();
      expect(figureBounds).not.toBeNull();
      expect(answerBounds).not.toBeNull();
      expect(figureBounds!.x).toBeGreaterThanOrEqual(0);
      expect(figureBounds!.x + figureBounds!.width).toBeLessThanOrEqual(width);
      expect(answerBounds!.x).toBeGreaterThanOrEqual(figureBounds!.x);
      expect(answerBounds!.x + answerBounds!.width).toBeLessThanOrEqual(
        figureBounds!.x + figureBounds!.width,
      );
    }
  });
}
