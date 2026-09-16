const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const FPS = 30;
const OUT_DIR = path.join(__dirname, 'frames');

(async () => {
  fs.rmSync(OUT_DIR, { recursive: true, force: true });
  fs.mkdirSync(OUT_DIR, { recursive: true });

  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
  await page.goto('http://localhost:8420/index.html?capture=1');
  await page.evaluate(() => document.fonts.ready);

  const totalMs = await page.evaluate(() => window.__TOTAL_MS__);
  const totalFrames = Math.ceil((totalMs / 1000) * FPS);
  console.log(`Total duration: ${(totalMs / 1000).toFixed(2)}s, ${totalFrames} frames at ${FPS}fps`);

  const start = Date.now();
  for (let n = 0; n < totalFrames; n++) {
    const ms = (n * 1000) / FPS;
    await page.evaluate((t) => window.renderFrame(t), ms);
    const fname = path.join(OUT_DIR, `frame-${String(n).padStart(5, '0')}.png`);
    await page.screenshot({ path: fname });
    if (n % 60 === 0) {
      console.log(`frame ${n}/${totalFrames} (t=${(ms / 1000).toFixed(2)}s)`);
    }
  }
  const elapsed = ((Date.now() - start) / 1000).toFixed(1);
  console.log(`Captured ${totalFrames} frames in ${elapsed}s (real time)`);

  await browser.close();
})();
