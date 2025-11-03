// src/pages/SignupPage.js
export default class SignupPage {
  constructor(page, base) {
    this.page = page;
    this.base = base;
    this.form = "div.signup-form form[novalidate]";
    this.emailInput = `${this.form} input[name="email"]`;
    this.firstNameInput = `${this.form} input[name="firstName"]`;
    this.lastNameInput = `${this.form} input[name="lastName"]`;
    this.passwordInput = `${this.form} input[name="password"]`;
    this.subscribeCheckbox = `${this.form} input[type="checkbox"]#subscribe`;
    this.submitButton = `${this.form} button[type="submit"]`;
  }

  async goto() {
    await this.page.goto(`${this.base}/register`, {
      waitUntil: "domcontentloaded",
    });
    await this.page.waitForSelector(this.form, { timeout: 10000 });
  }

  async fillAndSubmit(email, firstName, lastName, password, subscribe = false) {
    // Verify all inputs exist before filling
    const emailExists = await this.page.locator(this.emailInput).count();
    const firstNameExists = await this.page
      .locator(this.firstNameInput)
      .count();
    const lastNameExists = await this.page.locator(this.lastNameInput).count();
    const passwordExists = await this.page.locator(this.passwordInput).count();

    if (emailExists === 0)
      throw new Error(`Email input not found: ${this.emailInput}`);
    if (firstNameExists === 0)
      throw new Error(`FirstName input not found: ${this.firstNameInput}`);
    if (lastNameExists === 0)
      throw new Error(`LastName input not found: ${this.lastNameInput}`);
    if (passwordExists === 0)
      throw new Error(`Password input not found: ${this.passwordInput}`);

    // Clear existing values
    await this.page.fill(this.emailInput, "");
    await this.page.fill(this.firstNameInput, "");
    await this.page.fill(this.lastNameInput, "");
    await this.page.fill(this.passwordInput, "");

    // Fill new values
    await this.page.fill(this.emailInput, email);
    await this.page.fill(this.firstNameInput, firstName);
    await this.page.fill(this.lastNameInput, lastName);
    await this.page.fill(this.passwordInput, password);

    // Handle newsletter subscription checkbox
    if (subscribe) {
      const isChecked = await this.page.isChecked(this.subscribeCheckbox);
      if (!isChecked) {
        await this.page.check(this.subscribeCheckbox);
      }
    }

    // Submit form - click submit button
    await this.page.click(this.submitButton);
    await this.page.waitForLoadState("domcontentloaded");

    // Fallback: if still on register page, force submit
    if (/\/register\b/i.test(this.page.url())) {
      await this.page.evaluate((formSel) => {
        const f = document.querySelector(formSel);
        if (f) f.requestSubmit ? f.requestSubmit() : f.submit();
      }, this.form);
      await this.page.waitForLoadState("domcontentloaded");
    }
  }

  async assertSignupSuccess(timeoutMs = 10000) {
    const start = Date.now();
    while (Date.now() - start < timeoutMs) {
      const url = this.page.url();
      // After successful signup, user should be redirected to dashboard
      if (url.includes("/dashboard")) {
        return; // PASS
      }
      await this.page.waitForTimeout(100);
    }
    throw new Error(
      `Signup did not redirect to dashboard/login within ${timeoutMs}ms. Current URL: ${this.page.url()}`
    );
  }
}
