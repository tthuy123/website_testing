import { check } from 'k6';

import { options as smokeOptions } from '../../config/options.smoke.js';
import { options as loadOptions } from '../../config/options.load.js';
import { options as stressOptions } from '../../config/options.stress.js';
import { options as defaultOptions } from '../../k6.config.js'; // fallback

const PROFILES = {
  smoke: smokeOptions,
  load: loadOptions,
  stress: stressOptions,
};

export const options = PROFILES[__ENV.OPTIONS_FILE] || defaultOptions;

import { HomePage } from '../pages/HomePage.js';
import { newTestPage, closeTestPage } from '../setup/context.js';

const BASE_URL = __ENV.BASE_URL || 'https://www.saucedemo.com';

export async function home() {
  const { ctx, page } = await newTestPage();
  try {
    const home = new HomePage(page);
    await home.goto(BASE_URL);
    const visible = await home.hero.isVisible();
    check(visible, { 'Home visible/ready': (v) => v === true });
  } finally {
    await closeTestPage(ctx, page);
  }
}
      