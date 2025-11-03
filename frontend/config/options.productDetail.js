export const options = {
  scenarios: {
    productDetail_smoke: {
      executor: "constant-arrival-rate",
      exec: "productDetailScenario",
      rate: 1,
      timeUnit: "1s",
      duration: "2m",
      preAllocatedVUs: 1,
      maxVUs: 5,
      tags: { page: "productDetail", profile: "smoke" },
      options: { browser: { type: "chromium" } },
    },
  },
  thresholds: {
    // các metric web-vitals hợp lệ của k6 browser:
    "browser_web_vital_lcp{page:productDetail}": ["p(90)<3500"],
    "browser_web_vital_cls{page:productDetail}": ["p(90)<0.1"],
  },
};

export default options;
