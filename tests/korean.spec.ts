import { expect, test, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { getDocs, getHeadings } from "../lib/docs";
import { site } from "../lib/site";

async function expectNoOverflow(page: Page) {
  const dimensions = await page.evaluate(() => ({
    viewport: document.documentElement.clientWidth,
    document: document.documentElement.scrollWidth,
    body: document.body.scrollWidth,
  }));
  expect(dimensions.document, JSON.stringify(dimensions)).toBeLessThanOrEqual(
    dimensions.viewport + 1,
  );
  expect(dimensions.body, JSON.stringify(dimensions)).toBeLessThanOrEqual(
    dimensions.viewport + 1,
  );
}

test("Korean pages publish their language, canonical URLs and bilingual metadata before hydration", async ({
  page,
  request,
}) => {
  const images = new Set<string>();
  for (const route of ["/ko", "/ko/docs", "/ko/docs/installation"]) {
    const response = await request.get(route);
    expect(response.status(), route).toBe(200);
    expect(await response.text(), route).toMatch(/<html\b[^>]*\blang="ko"/);
    await page.goto(route);
    await expect(page.locator("html")).toHaveAttribute("lang", "ko");
    const canonical = await page
      .locator('link[rel="canonical"]')
      .getAttribute("href");
    expect(new URL(canonical!).pathname).toBe(route);
    const english = route.replace(/^\/ko/, "") || "/";
    for (const [language, path] of [
      ["en", english],
      ["ko", route],
    ]) {
      const alternate = await page
        .locator(`link[rel="alternate"][hreflang="${language}"]`)
        .getAttribute("href");
      expect(new URL(alternate!).pathname).toBe(path);
    }
    await expect(page.locator('meta[property="og:locale"]')).toHaveAttribute(
      "content",
      "ko_KR",
    );
    const description = await page
      .locator('meta[name="description"]')
      .getAttribute("content");
    expect(description).toMatch(/[가-힣]/);
    const image = await page
      .locator('meta[property="og:image"]')
      .getAttribute("content");
    expect(image).toBeTruthy();
    const imageUrl = new URL(image!);
    images.add(imageUrl.pathname + imageUrl.search);
  }
  for (const image of images) {
    const response = await request.get(image);
    expect(response.ok(), image).toBe(true);
    expect(response.headers()["content-type"]).toMatch(/^image\//);
  }
  const sitemap = await request.get("/sitemap.xml");
  expect(sitemap.ok()).toBe(true);
  const xml = await sitemap.text();
  expect(xml).toContain('hreflang="ko"');
  for (const path of [
    "/ko",
    "/ko/docs",
    ...getDocs("ko").map((doc) => `/ko/docs/${doc.slug}`),
  ])
    expect(xml, path).toContain(`${path}</loc>`);
});

test("every Korean guide and internal anchor resolves without exposing translation markers", async ({
  page,
}) => {
  test.setTimeout(120_000);
  await page.emulateMedia({ reducedMotion: "reduce" });
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  const englishDocs = getDocs();
  const docs = getDocs("ko");
  expect(docs.map((doc) => doc.slug)).toEqual(
    englishDocs.map((doc) => doc.slug),
  );
  const pageAnchors = new Map<string, Set<string>>();
  const linkedAnchors: { source: string; target: string; id: string }[] = [];
  const linkedRoutes = new Set<string>();
  for (const route of [
    "/ko",
    "/ko/docs",
    ...docs.map((doc) => `/ko/docs/${doc.slug}`),
  ]) {
    const response = await page.goto(route);
    expect(response?.status(), route).toBe(200);
    expect(await response!.text(), route).toMatch(/<html\b[^>]*\blang="ko"/);
    await expect(page.locator("html")).toHaveAttribute("lang", "ko");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    const doc = docs.find((item) => route === `/ko/docs/${item.slug}`);
    if (doc) {
      await expect(page.getByRole("heading", { level: 1 })).toHaveText(
        doc.title,
      );
      await expect(page.locator(".prose")).not.toContainText("{#");
      const englishDoc = englishDocs.find((item) => item.slug === doc.slug)!;
      expect(
        doc.content.match(/```[\s\S]*?```/g) ?? [],
        `${doc.slug}: translated instructions must preserve executable examples`,
      ).toEqual(englishDoc.content.match(/```[\s\S]*?```/g) ?? []);
      const ids = await page
        .locator(".prose h2[id]")
        .evaluateAll((headings) => headings.map((heading) => heading.id));
      expect(ids, doc.slug).toEqual(
        getHeadings(englishDoc.content).map((heading) => heading.id),
      );
    }
    await expectNoOverflow(page);
    pageAnchors.set(
      route,
      new Set(
        await page
          .locator("[id]")
          .evaluateAll((elements) => elements.map((element) => element.id)),
      ),
    );
    const links = await page
      .locator("main a[href]")
      .evaluateAll((elements) =>
        elements.map((element) => (element as HTMLAnchorElement).href),
      );
    for (const link of links) {
      const target = new URL(link);
      if (target.origin !== new URL(page.url()).origin) continue;
      expect(target.pathname, `${route} links to ${target.pathname}`).toMatch(
        /^\/ko(?:\/|$)/,
      );
      linkedRoutes.add(target.pathname);
      if (target.hash)
        linkedAnchors.push({
          source: route,
          target: target.pathname,
          id: decodeURIComponent(target.hash.slice(1)),
        });
    }
  }
  for (const route of linkedRoutes)
    expect(pageAnchors.has(route), route).toBe(true);
  for (const { source, target, id } of linkedAnchors)
    expect(
      pageAnchors.get(target)?.has(id),
      `${source} links to ${target}#${id}`,
    ).toBe(true);

  for (const route of ["/ko/not-a-page", "/ko/docs/not-a-page"]) {
    const response = await page.goto(route);
    expect(response?.status(), route).toBe(404);
    await expect(page).toHaveTitle("페이지를 찾을 수 없습니다 | Jev Observer");
    await expect(page.locator("html")).toHaveAttribute("lang", "ko");
    await expect(page.locator('main a[href="/ko/docs"]')).toBeVisible();
  }
  expect(errors).toEqual([]);
});

test("language switching preserves the guide, query, fragment and theme with a no-JavaScript fallback", async ({
  page,
  browser,
}) => {
  await page.goto("/ko/docs/installation?from=language-test#open-the-sample");
  await page
    .getByRole("button", { name: "색상 테마 전환", exact: true })
    .click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  const switcher = page.locator(".language-switcher");
  await expect(switcher).toHaveAccessibleName("영어로 보기");
  await expect(switcher.locator("img")).toHaveAttribute("src", "/flags/us.svg");
  await expect(switcher).toHaveAttribute("hreflang", "en");
  await expect(switcher).toHaveAttribute(
    "href",
    "/docs/installation?from=language-test#open-the-sample",
  );
  await switcher.click();
  await expect(page).toHaveURL(
    /\/docs\/installation\?from=language-test#open-the-sample$/,
  );
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await expect(page.locator("h2#open-the-sample")).toBeInViewport();
  await expect(page.locator(".language-switcher")).toHaveAccessibleName(
    "Switch to Korean",
  );
  await expect(page.locator(".language-switcher img")).toHaveAttribute(
    "src",
    "/flags/kr.svg",
  );
  await page.locator(".language-switcher").click();
  await expect(page).toHaveURL(
    /\/ko\/docs\/installation\?from=language-test#open-the-sample$/,
  );
  await expect(page.locator("html")).toHaveAttribute("lang", "ko");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await expect(page.locator("h2#open-the-sample")).toBeInViewport();

  const context = await browser.newContext({ javaScriptEnabled: false });
  try {
    const noScript = await context.newPage();
    const origin = new URL(page.url()).origin;
    await noScript.goto(`${origin}/docs/installation`);
    await noScript.locator(".language-switcher").click();
    await expect(noScript).toHaveURL(`${origin}/ko/docs/installation`);
    await expect(noScript.locator("html")).toHaveAttribute("lang", "ko");
    await expect(noScript.getByRole("heading", { level: 1 })).toHaveText(
      "설치 및 실행",
    );
  } finally {
    await context.close();
  }
});

test("Korean search finds translated content and does not navigate while IME composition is active", async ({
  page,
}) => {
  await page.goto("/ko/docs");
  await page.getByRole("button", { name: "문서 검색", exact: true }).click();
  const dialog = page.getByRole("dialog", { name: "문서 검색", exact: true });
  const input = dialog.getByRole("searchbox", {
    name: "문서 검색",
    exact: true,
  });
  await input.fill("암호화");
  const matches = getDocs("ko").filter((doc) =>
    `${doc.title} ${doc.description} ${doc.content}`.includes("암호화"),
  );
  expect(matches.length).toBeGreaterThan(0);
  await expect(dialog.getByRole("link")).toHaveCount(matches.length);
  await expect(dialog.locator(".search-hint")).toHaveText(
    `검색 결과 ${matches.length}개`,
  );
  for (const doc of matches)
    await expect(dialog.locator(`a[href="/ko/docs/${doc.slug}"]`)).toHaveCount(
      1,
    );
  await input.fill("찾을수없는문서zqx");
  await expect(dialog.getByRole("link")).toHaveCount(0);
  await expect(dialog.locator(".search-empty")).toContainText(
    "검색 결과가 없습니다",
  );
  await input.fill("설치");
  await expect(dialog.getByRole("link").first()).toHaveAttribute(
    "href",
    "/ko/docs/installation",
  );
  await input.dispatchEvent("keydown", {
    key: "Enter",
    code: "Enter",
    isComposing: true,
  });
  await expect(dialog).toBeVisible();
  await expect(page).toHaveURL(/\/ko\/docs$/);
  await input.press("Enter");
  await expect(page).toHaveURL(/\/ko\/docs\/installation$/);
  await expect(dialog).not.toBeVisible();
});

test("Korean hero and screenshot tour retain keyboard controls and truthful image labels", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/ko");
  const example = page.getByRole("figure", { name: "직접 살펴보는 요청 예시" });
  await example.getByRole("radio", { name: "긴급도", exact: true }).check();
  await expect(example).toContainText("88%");
  await expect(example).toContainText("모델 출력값이며 실제 정확도가 아닙니다");
  await example.getByRole("radio", { name: "긴급도", exact: true }).focus();
  await page.keyboard.press("ArrowRight");
  await expect(
    example.getByRole("radio", { name: "불만도", exact: true }),
  ).toBeChecked();
  await expect(example).toContainText("1.7 / 2");
  const questions = page.getByRole("tab", { name: "질문 그룹", exact: true });
  await questions.click();
  await questions.focus();
  await page.keyboard.press("ArrowRight");
  await expect(
    page.getByRole("tab", { name: "요청 상세", exact: true }),
  ).toBeFocused();
  await expect(page.getByRole("tabpanel").locator("img")).toHaveAttribute(
    "src",
    /observer-live/,
  );
  await expect(page.getByRole("tabpanel").locator("img")).toHaveAttribute(
    "alt",
    /영문 요청 상세/,
  );
  await expect(page.locator(".tour-caption")).toContainText(
    "영문 UI · 합성 샘플 데이터",
  );
  const expand = page.getByRole("button", {
    name: "스크린샷 확대",
    exact: true,
  });
  await expand.click();
  const dialog = page.getByRole("dialog", {
    name: "요청 상세 스크린샷",
    exact: true,
  });
  await expect(dialog).toBeVisible();
  await expect(
    dialog.getByRole("button", { name: "스크린샷 닫기", exact: true }),
  ).toBeInViewport();
  await page.keyboard.press("Escape");
  await expect(dialog).not.toBeVisible();
  await expect(expand).toBeFocused();
  await expectNoOverflow(page);
});

test("Korean code-copy recovery and retry preserve the actual installation command", async ({
  page,
}) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: {
        writeText: async () => {
          throw new DOMException("Denied", "NotAllowedError");
        },
      },
    });
  });
  await page.goto("/ko/docs/installation");
  const block = page.locator(".code-block").first();
  const code = await block.locator("code").innerText();
  expect(code).toContain(`sh install.sh --version ${site.version}`);
  await block.getByRole("button", { name: "코드 복사", exact: true }).click();
  await expect(block.getByRole("status")).toContainText(
    "자동 복사에 실패했습니다. 코드가 선택되었습니다.",
  );
  await expect
    .poll(() => page.evaluate(() => window.getSelection()?.toString()))
    .toBe(code);
  const retry = block.getByRole("button", {
    name: "코드 복사 다시 시도",
    exact: true,
  });
  await expect(retry).toHaveAccessibleDescription(/자동 복사에 실패했습니다/);
  const copied: string[] = [];
  await page.exposeFunction("recordKoreanCopiedCode", (value: string) => {
    copied.push(value);
  });
  await page.evaluate(() => {
    navigator.clipboard.writeText = async (value: string) => {
      await (
        window as Window & {
          recordKoreanCopiedCode?: (value: string) => Promise<void>;
        }
      ).recordKoreanCopiedCode?.(value);
    };
  });
  await retry.click();
  await expect(
    block.getByRole("button", { name: "클립보드에 복사했습니다", exact: true }),
  ).toBeVisible();
  await expect(block.getByRole("status")).toHaveText(
    "클립보드에 복사했습니다.",
  );
  expect(copied).toEqual([code]);
});

for (const theme of ["light", "dark"] as const) {
  test(`Korean pages and navigation remain accessible without overflow in ${theme} theme`, async ({
    page,
  }) => {
    await page.addInitScript(
      (value) => localStorage.setItem("jev-theme", value),
      theme,
    );
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.setViewportSize({ width: 320, height: 900 });
    for (const route of ["/ko", "/ko/docs/installation"]) {
      await page.goto(route);
      await expect(page.locator("html")).toHaveAttribute("data-theme", theme);
      await expectNoOverflow(page);
      const results = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
        .analyze();
      expect(results.violations, route).toEqual([]);
    }
    await page.getByRole("button", { name: "메뉴 열기", exact: true }).click();
    const navigation = page.getByRole("navigation", {
      name: "모바일 메뉴",
      exact: true,
    });
    await expect(
      navigation.getByRole("link", { name: "문서", exact: true }),
    ).toHaveAttribute("aria-current", "page");
    await navigation.getByRole("link", { name: "문서", exact: true }).click();
    await expect(page).toHaveURL(/\/ko\/docs$/);
    await expect(navigation).not.toBeVisible();
    await expectNoOverflow(page);
  });
}
