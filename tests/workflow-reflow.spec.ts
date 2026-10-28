import { expect, test } from "@playwright/test";

for (const route of ["/", "/ko"]) {
  for (const width of [320, 768]) {
    for (const increasedSpacing of [false, true]) {
      test(`${route} workflow labels fit a ${width}px screen with ${increasedSpacing ? "increased" : "default"} text spacing`, async ({
        page,
      }) => {
        await page.setViewportSize({ width, height: 568 });
        await page.emulateMedia({ reducedMotion: "reduce" });
        await page.goto(route);
        await page.evaluate(() => document.fonts.ready);
        if (increasedSpacing) {
          await page.addStyleTag({
            content: `
            * {
              line-height: 1.5 !important;
              letter-spacing: 0.12em !important;
              word-spacing: 0.16em !important;
            }
            p { margin-bottom: 2em !important; }
          `,
          });
        }

        const diagram = page.locator(".flow-diagram");
        await diagram.scrollIntoViewIfNeeded();
        const dimensions = await diagram.evaluate((element) => {
          const bounds = element.getBoundingClientRect();
          return {
            left: bounds.left,
            right: bounds.right,
            width: element.clientWidth,
            contentWidth: element.scrollWidth,
            labels: Array.from(element.querySelectorAll("strong, span")).map(
              (label) => {
                const range = document.createRange();
                range.selectNodeContents(label);
                const text = range.getBoundingClientRect();
                return {
                  text: label.textContent,
                  left: text.left,
                  right: text.right,
                };
              },
            ),
          };
        });

        expect(dimensions.labels).toHaveLength(6);
        expect(dimensions.contentWidth).toBeLessThanOrEqual(
          dimensions.width + 1,
        );
        for (const label of dimensions.labels) {
          expect(label.left, label.text!).toBeGreaterThanOrEqual(
            dimensions.left,
          );
          expect(label.right, label.text!).toBeLessThanOrEqual(
            dimensions.right,
          );
        }
      });
    }
  }
}
