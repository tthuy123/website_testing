// config/options.review.js
export const options = {
  scenarios: {
    review_smoke: {
      executor: "constant-arrival-rate",
      exec: "reviewScenario",
      rate: 1,
      timeUnit: "1s",
      duration: "2m",
      preAllocatedVUs: 1,
      maxVUs: 2,
      tags: { page: "review", profile: "smoke" },
      options: { browser: { type: "chromium" } },
    },
  },
  thresholds: {
    "browser_web_vital_lcp{page:review}": ["p(90)<4000"],
    "browser_web_vital_cls{page:review}": ["p(90)<0.1"],
    checks: ["rate>0.75"], // 75% pass rate (review submission có thể có approval)
  },
};

export default options;
