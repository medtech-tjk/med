const { chromium } = require('C:/Users/alijo/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
(async () => {
  const browser = await chromium.launch({headless:true, channel:'msedge'});
  const page = await browser.newPage();
  await page.route('**/api/**', route => route.fulfill({contentType:'application/json', body: JSON.stringify(route.request().url().includes('settings') ? {usd_to_tjs_rate:11.2} : [])}));
  for (const width of [360,768,1440]) {
    await page.setViewportSize({width,height:1000});
    await page.goto('http://localhost:3100');
    await page.screenshot({path:__dirname+`/before-${width}.png`,fullPage:true});
    console.log(JSON.stringify({width,documentWidth:await page.evaluate(()=>document.documentElement.scrollWidth)}));
  }
  await browser.close();
})();
