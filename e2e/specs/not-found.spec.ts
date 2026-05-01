import { test, expect } from "@playwright/test";
import { NotFoundPage } from "../pages/NotFoundPage";
import { HomePage } from "../pages/HomePage";

test.describe("404 page", () => {
  test("unknown route renders the not-found page", async ({ page }) => {
    const notFound = new NotFoundPage(page);
    await notFound.goto("/this-route-does-not-exist");

    await expect(notFound.heading).toBeVisible();
    await expect(notFound.backHomeLink).toBeVisible();
  });

  test("Back to home returns to / and renders the nav", async ({ page }) => {
    const notFound = new NotFoundPage(page);
    await notFound.goto("/this-route-does-not-exist");

    await notFound.backHomeLink.click();

    const home = new HomePage(page);
    await expect(page).toHaveURL("/");
    await expect(home.nav).toBeVisible();
  });
});
