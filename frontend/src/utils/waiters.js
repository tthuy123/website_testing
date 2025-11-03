// Chờ network “đứng yên” ngắn để đo UX ổn định
export async function waitForNetworkIdle(page, idleMs = 500, maxWaitMs = 10000) {
  const start = Date.now();
  let last = Date.now();
  page.on('requestfinished', () => (last = Date.now()));
  page.on('requestfailed', () => (last = Date.now()));
  while (Date.now() - start < maxWaitMs) {
    if (Date.now() - last >= idleMs) return;
    await page.waitForTimeout(100);
  }
}

// Think-time ngẫu nhiên
export function randThink(minMs = 500, maxMs = 2000) {
  return Math.floor(Math.random() * (maxMs - minMs + 1)) + minMs;
}
