export const options = {
  scenarios: {
    home_default: {
      executor: 'shared-iterations',
      exec: 'home',
      vus: 1,
      iterations: 1,
      tags: { page: 'home', profile: 'default' },
    },
  },
  thresholds: {
    'browser_web_vitals_lcp{page:home}': ['p(90)<3000'],
    'browser_web_vitals_cls{page:home}': ['p(90)<0.1'],
  },
};
