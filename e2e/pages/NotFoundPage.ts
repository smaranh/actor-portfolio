import type { Page, Locator } from "@playwright/test";

export class NotFoundPage {
  constructor(private readonly page: Page) {}

  get heading(): Locator {
    return this.page.getByRole("heading", { name: /page not found/i });
  }
  get backHomeLink(): Locator {
    return this.page.getByRole("link", { name: /back to home/i });
  }

  async goto(path: string) {
    await this.page.goto(path);
  }
}
