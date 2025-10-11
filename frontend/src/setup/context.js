import { browser } from 'k6/browser';
import { browserConfig } from '../../config/browsers.js';

export async function newTestPage() {
  const ctx = await browser.newContext(browserConfig);
  const page = await ctx.newPage();
  return { ctx, page };
}

export async function closeTestPage(ctx, page) {
  try { await page.close(); } catch (_) {}
  try { await ctx.close(); } catch (_) {}
}
