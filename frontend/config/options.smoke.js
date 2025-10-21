// config/options.smoke.js  —— LOGIN ONLY
export const options = {
  scenarios: {
    login_smoke: {
      executor: 'constant-arrival-rate',
      exec: 'loginScenario',     // phải khớp tên hàm trong src/tests/login.spec.js
      rate: 1,
      timeUnit: '1s',
      duration: '2m',
      preAllocatedVUs: 1,
      maxVUs: 5,
      tags: { page: 'login', profile: 'smoke' },
      options: { browser: { type: 'chromium' } },
    },
  },
  thresholds: {
    // các metric web-vitals hợp lệ của k6 browser:
    'browser_web_vital_lcp{page:login}': ['p(90)<3500'],
    'browser_web_vital_cls{page:login}': ['p(90)<0.1'],
  },
};
