export class HomePage {
  /** @param {import('k6/browser').Page} page */
  constructor(page) {
    this.page = page;
    // chọn 1 site demo có selector rõ ràng: sau dùng BASE_URL trong spec
    this.hero = page.locator('[data-test="hero"], .title, h1'); // "đa dạng" để không gãy
    this.searchInput = page.locator('[data-test="search-input"], input[type="search"]');
    this.searchSubmit = page.locator('[data-test="search-submit"], button[type="submit"]');
  }

  async goto(baseUrl) {
    await this.page.goto(baseUrl + '/');
    await this.hero.waitFor(); // coi như "điểm sẵn sàng"
  }

  async search(term) {
    if (await this.searchInput.isVisible()) {
      await this.searchInput.fill(term);
      if (await this.searchSubmit.isVisible()) {
        await this.searchSubmit.click();
      }
    }
  }
}
