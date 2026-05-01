import { test, expect } from "@playwright/test";
import { HomePage } from "../pages/HomePage";

test.describe("Contact section", () => {
  test("exposes the booking email as a mailto link", async ({ page }) => {
    const home = new HomePage(page);
    await home.goto();
    await home.contactSection.scrollIntoViewIfNeeded();

    await expect(home.contactEmailLink).toBeVisible();
    await expect(home.contactEmailLink).toHaveAttribute(
      "href",
      "mailto:trappedactor@gmail.com"
    );
  });
});

test.describe("Footer", () => {
  test("exposes the booking email as a mailto link", async ({ page }) => {
    const home = new HomePage(page);
    await home.goto();
    await home.footer.scrollIntoViewIfNeeded();

    await expect(home.footerEmailLink).toBeVisible();
    await expect(home.footerEmailLink).toHaveAttribute(
      "href",
      "mailto:trappedactor@gmail.com"
    );
  });

  test("exposes 5 social links that open in a new tab safely", async ({
    page,
  }) => {
    const home = new HomePage(page);
    await home.goto();
    await home.footer.scrollIntoViewIfNeeded();

    await expect(home.footerSocialLinks).toHaveCount(5);

    for (const name of [
      "IMDB",
      "YouTube",
      "Facebook",
      "Instagram",
      "Twitter",
    ]) {
      const link = home.footerSocialLink(name);
      await expect(link).toBeVisible();
      await expect(link).toHaveAttribute("target", "_blank");
      await expect(link).toHaveAttribute("rel", /noopener/);
      await expect(link).toHaveAttribute("rel", /noreferrer/);
    }
  });
});
