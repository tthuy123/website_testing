// config/options.smoke.js  —— LOGIN ONLY
export const options = {
  scenarios: {
    shop_smoke: {
      executor: 'shared-iterations',
      exec: 'shopScenario',     // phải khớp tên hàm trong src/tests/shop.spec.js
      vus: 1,
      iterations: 1,
      tags: { page: 'shop', profile: 'smoke' },
      options: { browser: { type: 'chromium' } },
    },
  },
  thresholds: {
    // các metric web-vitals hợp lệ của k6 browser:
    'browser_web_vital_lcp{page:shop}': ['p(90)<3500'],
    'browser_web_vital_cls{page:shop}': ['p(90)<0.1'],
  },
};
