import { expect, test } from "@playwright/test";

test("pages send security headers", async ({ request }) => {
  for (const route of ["/", "/docs/installation"]) {
    const response = await request.get(route);
    expect(response.ok(), route).toBe(true);
    const headers = response.headers();
    expect(headers["content-security-policy"]).toContain(
      "frame-ancestors 'none'",
    );
    expect(headers["content-security-policy"]).toContain("object-src 'none'");
    expect(headers["x-frame-options"]).toBe("DENY");
    expect(headers["x-content-type-options"]).toBe("nosniff");
    expect(headers["referrer-policy"]).toBe("strict-origin-when-cross-origin");
    expect(headers["permissions-policy"]).toContain("camera=()");
  }
});

test("homepage and documentation publish canonical URLs and working share images", async ({
  page,
  request,
}) => {
  const images = new Set<string>();
  for (const route of ["/", "/docs", "/docs/installation"]) {
    await page.goto(route);
    const canonical = await page
      .locator('link[rel="canonical"]')
      .getAttribute("href");
    expect(canonical).toBeTruthy();
    expect(new URL(canonical!).pathname).toBe(route);

    await expect(page.locator('meta[property="og:site_name"]')).toHaveAttribute(
      "content",
      "Jev Observer",
    );
    await expect(page.locator('meta[property="og:type"]')).toHaveAttribute(
      "content",
      "website",
    );
    const image = await page
      .locator('meta[property="og:image"]')
      .getAttribute("content");
    expect(image).toBeTruthy();
    await expect(page.locator('meta[name="twitter:image"]')).toHaveAttribute(
      "content",
      image!,
    );
    const imageUrl = new URL(image!);
    expect(imageUrl.origin).toBe(new URL(canonical!).origin);
    images.add(imageUrl.pathname + imageUrl.search);

    if (route !== "/") {
      await expect(page.locator('meta[property="og:title"]')).toHaveAttribute(
        "content",
        await page.title(),
      );
      await expect(page.locator('meta[name="twitter:title"]')).toHaveAttribute(
        "content",
        await page.title(),
      );
      await expect(page.locator('meta[property="og:url"]')).toHaveAttribute(
        "content",
        canonical!,
      );
      const description = await page
        .locator('meta[name="description"]')
        .getAttribute("content");
      await expect(
        page.locator('meta[property="og:description"]'),
      ).toHaveAttribute("content", description!);
      await expect(
        page.locator('meta[name="twitter:description"]'),
      ).toHaveAttribute("content", description!);
    }
  }

  for (const image of images) {
    const response = await request.get(image);
    expect(response.ok(), image).toBe(true);
    expect(response.headers()["content-type"]).toMatch(/^image\//);
  }
});
