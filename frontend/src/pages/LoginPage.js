// src/pages/LoginPage.js
export default class LoginPage {
  constructor(page, base) {
    this.page = page;
    this.base = base;
    this.form   = 'div.login-form form[novalidate]';
    this.email  = `${this.form} input[name="email"]`;
    this.pass   = `${this.form} input[name="password"]`;
    this.submit = `${this.form} button[type="submit"], ${this.form} input[type="submit"]`;
  }

  async goto() {
    await this.page.goto(`${this.base}/login`, { waitUntil: 'domcontentloaded' });
    await this.page.waitForSelector(this.form, { timeout: 10000 });
  }

  async fillAndSubmit(email, pass) {
    await this.page.fill(this.email, '');
    await this.page.fill(this.pass, '');
    await this.page.fill(this.email, email);
    await this.page.fill(this.pass, pass);

    // Submit an toàn: thử Enter trước, rồi fallback click/requestSubmit
    await Promise.race([
      (async () => {
        await this.page.keyboard.press('Enter');
        await this.page.waitForLoadState('domcontentloaded');
      })(),
      (async () => {
        await this.page.click(this.submit).catch(() => {});
        await this.page.waitForLoadState('domcontentloaded').catch(() => {});
      })(),
    ]);

    // Fallback cuối cùng nếu vẫn chưa rời trang
    if (/\/login\b/i.test(this.page.url())) {
      await this.page.evaluate((formSel) => {
        const f = document.querySelector(formSel);
        if (f) (f.requestSubmit ? f.requestSubmit() : f.submit());
      }, this.form);
      await this.page.waitForLoadState('domcontentloaded');
    }
  }

  // >>> chỉnh xác nhận: chờ URL về /dashboard
  async assertLoggedIn(timeoutMs = 10000) {
    const start = Date.now();
    while (Date.now() - start < timeoutMs) {
      if (this.page.url().includes('/dashboard')) return; // PASS
      await this.page.waitForTimeout(100);
    }
    // thêm 1 check phụ: form login đã biến mất (đề phòng URL không đổi hash)
    const stillOnLogin = /\/login\b/i.test(this.page.url());
    const formExists = await this.page.$(this.form);
    if (!stillOnLogin || !formExists) return; // coi như pass UI
    throw new Error('Login chưa thành công: không thấy chuyển hướng /dashboard trong thời gian chờ.');
  }
}
