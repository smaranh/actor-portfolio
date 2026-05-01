import { test, expect } from "@playwright/test";
import { HomePage } from "../pages/HomePage";

test.describe("Headshots carousel", () => {
  test("first headshot and indicator are visible on load", async ({ page }) => {
    const home = new HomePage(page);
    await home.goto();
    await home.headshotsSection.scrollIntoViewIfNeeded();

    await expect(home.headshotsImage).toBeVisible();
    await expect(home.headshotsImage).toHaveAccessibleName(/headshot 1/i);
    await expect(home.headshotsIndicator).toHaveText("1 / 4");
  });

  test("Next advances the carousel to the second headshot", async ({
    page,
  }) => {
    const home = new HomePage(page);
    await home.goto();
    await home.headshotsSection.scrollIntoViewIfNeeded();

    await home.headshotsNext.click();
    await expect(home.headshotsIndicator).toHaveText("2 / 4");
    await expect(home.headshotsImage).toHaveAccessibleName(/headshot 2/i);
  });

  test("Previous from index 0 wraps to the last headshot", async ({ page }) => {
    const home = new HomePage(page);
    await home.goto();
    await home.headshotsSection.scrollIntoViewIfNeeded();

    await home.headshotsPrev.click();
    await expect(home.headshotsIndicator).toHaveText("4 / 4");
    await expect(home.headshotsImage).toHaveAccessibleName(/headshot 4/i);
  });

  test("carousel buttons expose accessible names", async ({ page }) => {
    const home = new HomePage(page);
    await home.goto();
    await home.headshotsSection.scrollIntoViewIfNeeded();

    await expect(home.headshotsPrev).toHaveAccessibleName(/previous headshot/i);
    await expect(home.headshotsNext).toHaveAccessibleName(/next headshot/i);
  });
});
