// src/tests/login.spec.js
import { options as smokeOptions } from '../../config/options.smoke.js';
import LoginPage from '../pages/LoginPage.js';
import { newTestPage, closeTestPage } from '../setup/context.js';

export const options = smokeOptions;

const BASE_URL = __ENV.BASE_URL || 'http://localhost:8080';
const EMAIL    = __ENV.LOGIN_EMAIL || 'you@example.com';
const PASSWORD = __ENV.LOGIN_PASSWORD || 'yourPassword';

export async function loginScenario() {
  const { ctx, page } = await newTestPage();
  try {
    console.log('LOGIN start at:', BASE_URL);
    const login = new LoginPage(page, BASE_URL);
    await login.goto();
    await login.fillAndSubmit(EMAIL, PASSWORD);
    await login.assertLoggedIn();
    console.log('LOGIN done at URL:', page.url());
  } finally {
    await closeTestPage(ctx, page);
  }
}
