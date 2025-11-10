// config/options.checkout.js
export const options = {
  scenarios: {
    checkout_smoke: {
      executor: "constant-arrival-rate",
      exec: "checkoutScenario",
      rate: 1,
      timeUnit: "1s",
      duration: "2m", // Smoke test 2m
      preAllocatedVUs: 1,
      maxVUs: 3,
      tags: { page: "checkout", profile: "smoke" },
      options: { browser: { type: "chromium" } },
    },
  },
  thresholds: {
    "browser_web_vital_lcp{page:checkout}": ["p(90)<5000"], // Checkout page có thể chậm hơn
    "browser_web_vital_cls{page:checkout}": ["p(90)<0.1"],
    checks: ["rate>0.8"], // 80% pass rate
  },
};

export default options;
