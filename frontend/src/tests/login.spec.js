import { browser } from 'k6/browser';
import { check } from 'k6';
import { LoginPage } from '../pages/LoginPage.js';
import { InventoryPage } from '../pages/InventoryPage.js';

export const options = {
  scenarios: {
    sauce_login: {
      executor: 'ramping-vus',
      exec: 'login_flow',
      options: {
        browsers: {
            type: 'chromium',
        }
      },
      startVUs: 0,
      stages: [
        { duration: '30s', target: 3 },
        { duration: '1m', target: 5 },
        { duration: '30s', target: 0 },
      ],
      tags: { page: 'login' },
    },
  },
  thresholds: {
    'browser_web_vitals_lcp{page:login}': ['value<2500'],
    'browser_web_vitals_cls{page:login}': ['value<0.1'],
  },
};

export async function login_flow() {
  const ctx = await browser.newContext();
  const page = await ctx.newPage();

  try {
    const loginPage = new LoginPage(page);
    const inventoryPage = new InventoryPage(page);

    await loginPage.goto();
    await loginPage.login('standard_user', 'secret_sauce');
    await inventoryPage.waitForLoaded();

    const titleText = await inventoryPage.title.textContent();
    check(titleText, { 'đăng nhập thành công': (t) => t.includes('Products') });
  } finally {
    await page.close();
    await ctx.close();
  }
}
