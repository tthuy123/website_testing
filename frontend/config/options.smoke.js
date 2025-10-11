export const options = {
  scenarios: {
    home_smoke: {
      executor: 'shared-iterations',
      exec: 'home', // trùng với tên hàm export chạy trong file test
      vus: 1,
      iterations: 1,
      tags: { page: 'home', profile: 'smoke' },
      options: { browser: { type: 'chromium' } },
    },

  },

  thresholds: {
    'browser_web_vital_lcp{page:home}': ['p(90)<2500'],
    'browser_web_vital_cls': ['p(90)<0.1'],
  },
};
