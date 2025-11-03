import { Trend, Counter } from 'k6/metrics';

// Web Vitals
export const FCP = new Trend('web_fcp', true);
export const LCP = new Trend('web_lcp', true);

// Thời gian từng bước
export const STEP = new Trend('step_duration', true);

// Console error đếm số lượng
export const CONSOLE_ERR = new Counter('console_errors');

// Thu FCP/LCP (stub an toàn, có thể chạy ngay)
export async function collectVitals(page) {
  try {
    const { fcp, lcp } = await page.evaluate(async () => {
      let fcpVal = null, lcpVal = null;
      try {
        const po = new PerformanceObserver((list) => {
          for (const e of list.getEntries()) {
            if (e.name === 'first-contentful-paint') fcpVal = e.startTime;
          }
        });
        po.observe({ type: 'paint', buffered: true });

        const po2 = new PerformanceObserver((list) => {
          for (const e of list.getEntries()) lcpVal = e.startTime;
        });
        po2.observe({ type: 'largest-contentful-paint', buffered: true });

        await new Promise(r => setTimeout(r, 100));
      } catch (e) {}
      return { fcp: fcpVal, lcp: lcpVal };
    });
    return { fcp, lcp };
  } catch (_) {
    return { fcp: null, lcp: null };
  }
}
