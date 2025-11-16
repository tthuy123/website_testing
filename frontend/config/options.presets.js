// config/options.presets.js
function webVitalThresholds(pageTag = "default") {
  return {
    [`browser_web_vital_lcp{page:${pageTag}}`]: ['p(75)<3500'],
    [`browser_web_vital_cls{page:${pageTag}}`]: ['p(90)<0.1'],
    // Thêm INP khi dữ liệu đã ổn định:
  };
}

export function smokePreset({ exec, pageTag = "smoke", vus = 1, iterations = 1, browserType = "chromium" }) {
  return {
    scenarios: {
      [exec]: {
        executor: "shared-iterations",
        exec,
        vus,
        iterations,
        tags: { page: pageTag, profile: "smoke" },
        options: { browser: { type: browserType } },
      },
    },
    thresholds: webVitalThresholds(pageTag),
  };
}

export function multiSmokePreset({ entries, vus = 1, iterations = 1, browserType = "chromium" }) {
  const scenarios = {};
  const thresholds = {};
  for (const { exec, pageTag = exec } of entries) {
    scenarios[exec] = {
      executor: "shared-iterations",
      exec,
      vus,
      iterations,
      tags: { page: pageTag, profile: "smoke" },
      options: { browser: { type: browserType } },
    };
    Object.assign(thresholds, webVitalThresholds(pageTag));
  }
  return { scenarios, thresholds };
}

export function averageLoadPreset({ exec, pageTag = "average-load", vus = 50, duration = "10m", browserType = "chromium" }) {
  return {
    scenarios: {
      [exec]: {
        executor: "ramping-vus",
        exec,
        startVUs: 0,
        stages: [
          { duration: "3m", target: vus },
          { duration: duration, target: vus },
          { duration: "3m", target: 0 },
        ],
        tags: { page: pageTag, profile: "average-load" },
        options: { browser: { type: browserType } },
      },
    },
    thresholds: webVitalThresholds(pageTag),
  };
}