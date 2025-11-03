export const options = {
  scenarios: {
    home_load: {
      executor: 'ramping-vus',
      exec: 'home',
      startVUs: 0,
      stages: [
        { duration: '1m', target: 10 },
        { duration: '3m', target: 25 },
        { duration: '1m', target: 0 },
      ],
      tags: { page: 'home', profile: 'load' },
      options: { browser: { type: 'chromium' } },
    },
  },
  thresholds: {
    'browser_web_vitals_lcp{page:home}': ['p(95)<2500'],
    'browser_web_vitals_cls{page:home}': ['p(95)<0.1'],
    'browser_web_vitals_ttfb{page:home}': ['p(95)<800'],
  },
};
