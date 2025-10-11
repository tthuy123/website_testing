export const options = {
  scenarios: {
    home_stress: {
      executor: 'ramping-vus',
      exec: 'home',
      startVUs: 0,
      stages: [
        { duration: '1m', target: 10 },
        { duration: '2m', target: 40 },
        { duration: '2m', target: 80 },
        { duration: '1m', target: 0 },
      ],
      tags: { page: 'home', profile: 'stress' },
      options: { browser: { type: 'chromium' } },
    },
  },
  thresholds: {
    'browser_web_vitals_lcp{page:home}': ['value<3000'],
    'browser_web_vitals_cls{page:home}': ['value<0.1'],
    'browser_web_vitals_ttfb{page:home}': ['value<900'],
  },
};
