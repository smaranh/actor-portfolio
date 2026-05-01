import { test, expect } from "@playwright/test";
import { HomePage } from "../pages/HomePage";

test.describe("About section", () => {
  test("renders the headshot image with the actor's name as accessible name", async ({
    page,
  }) => {
    const home = new HomePage(page);
    await home.goto();
    await expect(home.aboutImage).toBeVisible();
    await expect(home.aboutImage).toHaveAccessibleName(/smaran harihar/i);
  });

  test("about copy is visible after scrolling to the section", async ({
    page,
  }) => {
    const home = new HomePage(page);
    await home.goto();
    await home.aboutSection.scrollIntoViewIfNeeded();
    await expect(home.aboutSection).toBeInViewport();
    // Anchor on a distinctive line of copy so we know the text rendered.
    await expect(
      home.aboutSection.getByText(/I am an immigrant to the USA\./i)
    ).toBeVisible();
  });
});
