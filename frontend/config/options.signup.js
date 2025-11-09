
export const options = {
  scenarios: {
    signup_smoke: {
      executor: "constant-arrival-rate",
      exec: "signupScenario", 
      rate: 1,
      timeUnit: "1s",
      duration: "2m",
      preAllocatedVUs: 1,
      maxVUs: 5,
      tags: { page: "signup", profile: "smoke" },
      options: { browser: { type: "chromium" } },
    },
  },
  thresholds: {
    "browser_web_vital_lcp{page:signup}": ["p(75)<3500"],
    "browser_web_vital_cls{page:signup}": ["p(75)<0.1"],
  },
};
