const {chromium} = require('C:/Users/alijo/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs = require('fs');
const assert = require('assert/strict');
const origin = 'http://localhost:3100';
const device = {id:'audit-device',slug:'audit-device',name:'Тестовый аппарат — данные аудита',name_en:'Test device — audit fixture',price:120,brand:'Audit fixture',category_id:'audit-category',in_stock:true,description:'<p>Тестовое описание <strong>оборудования</strong></p><img src="x" onerror="window.auditXss=true">',images:[],specs:{},main_image:'/logo192.png'};
const category = {id:'audit-category',slug:'audit-category',name:'Тестовая категория — аудит',name_en:'Test category — audit',image:'/logo192.png',subcategories:[]};
(async()=>{
  const browser=await chromium.launch({channel:'msedge',headless:true});
  const context=await browser.newContext({reducedMotion:'reduce'});
  const page=await context.newPage();
  // Analytics is irrelevant to this local UI check and must not send test events.
  await page.route('**/www.googletagmanager.com/**', route=>route.abort());
  page.setDefaultNavigationTimeout(15000);
  page.setDefaultTimeout(10000);
  const errors=[];
  page.on('pageerror', error=>errors.push(error.message));
  let fixture='empty';
  await page.route('**/api/**',async route=>{
    const url=new URL(route.request().url());
    let body=[];
    if(url.pathname.includes('settings')) body={usd_to_tjs_rate:11.2};
    else if(fixture==='populated') {
      if(url.pathname.includes('/categories/')) body=[category];
      if(url.pathname.includes('/featured/')||url.pathname==='/api/products/') body=[device];
      if(url.pathname.includes('/products/slug/')) body=device;
    }
    await route.fulfill({contentType:'application/json',body:JSON.stringify(body)});
  });
  const results=[];
  for(const width of [360,390,768,1024,1280,1440]) {
    await page.setViewportSize({width,height:1000});
    await page.goto(origin,{waitUntil:'domcontentloaded'});
    await page.locator('#hero-title').waitFor();
    assert.equal(await page.locator('main').innerText().then(t=>/новый адрес|новому адресу|new address/i.test(t)),false,'No relocation announcement requested');
    const actual=await page.evaluate(()=>document.documentElement.scrollWidth);
    assert(actual<=width,`Home overflow ${width}: ${actual}`);
    assert(await page.locator('footer').innerText().then(t=>t.includes('Академика Акобира Адхамова, 11/5')));
    assert.equal(await page.locator('img').evaluateAll(imgs=>imgs.filter(i=>!i.complete||i.naturalWidth===0).length),0,'Broken home logo');
    await page.screenshot({path:__dirname+`/after-${width}.png`,fullPage:true});
    results.push({page:'home',width,documentWidth:actual,passed:true});
  }
  await page.getByRole('searchbox').fill('УЗИ');
  await page.getByRole('button',{name:'Найти оборудование'}).click();
  await page.waitForURL('**/catalog?search=*');
  assert(new URL(page.url()).searchParams.get('search')==='УЗИ');
  await page.goto(origin,{waitUntil:'domcontentloaded'});
  await page.getByRole('button',{name:'Switch to English'}).filter({visible:true}).click();
  await page.getByRole('heading',{name:'Medical equipment for your practice'}).waitFor();
  assert.equal(await page.locator('html').getAttribute('lang'),'en');
  await page.getByRole('button',{name:'Переключить на русский'}).filter({visible:true}).click();
  // Corrupted local storage must not crash the storefront.
  await page.evaluate(()=>localStorage.setItem('cart','broken json'));
  await page.reload();
  await page.locator('#hero-title').waitFor();
  fixture='populated';
  await page.evaluate(()=>localStorage.removeItem('cart'));
  for(const pathname of ['/','/catalog','/catalog/audit-category','/product/audit-device','/about','/services','/cart','/not-a-real-page','/admin']) {
    console.log('Checking',pathname);
    for(const width of [360,768,1440]) {
      await page.setViewportSize({width,height:1000});
      await page.goto(origin+pathname,{waitUntil:'domcontentloaded'});
      await page.evaluate(()=>document.fonts.ready);
      await page.waitForTimeout(350);
      const actual=await page.evaluate(()=>document.documentElement.scrollWidth);
      assert(actual<=width,`${pathname} overflow ${width}: ${actual}`);
      assert((await page.locator('body').innerText()).length>50,`Blank ${pathname}`);
      results.push({page:pathname,width,documentWidth:actual,passed:true});
    }
  }
  await page.goto(origin+'/product/audit-device',{waitUntil:'domcontentloaded'});
  await page.getByRole('heading',{name:device.name}).waitFor();
  assert.equal(await page.evaluate(()=>window.auditXss),undefined);
  assert.equal(await page.locator('link[rel="canonical"]').getAttribute('href'),'https://medtech.tj/product/audit-device');
  await page.goto(origin,{waitUntil:'domcontentloaded'});
  await page.getByRole('button',{name:/Добавить в корзину/}).first().click();
  await page.getByText('Товар добавлен в корзину',{exact:true}).waitFor();
  await page.waitForTimeout(100);
  assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem('cart'))[0].quantity),1);
  await page.goto(origin+'/cart',{waitUntil:'domcontentloaded'});
  await page.getByText(device.name,{exact:true}).first().waitFor();
  await page.screenshot({path:__dirname+'/cart-fixture.png',fullPage:true});
  for(const asset of ['/favicon.ico','/favicon-96x96.png','/apple-touch-icon.png','/logo192.png','/logo512.png','/og-image.png','/manifest.json','/robots.txt','/sitemap.xml']) {
    const response=await page.request.get(origin+asset);
    assert.equal(response.status(),200,asset);
  }
  assert.equal((await page.request.get(origin+'/not-a-real-page')).status(),404);
  assert.deepEqual(errors,[],'Browser runtime errors');
  fs.writeFileSync(__dirname+'/browser-results.json',JSON.stringify({browser:'Microsoft Edge / Playwright',fixtures:'Empty API and visibly labeled test catalog; no real orders sent',checks:results,search:true,language:true,cart:true,corruptCart:true,xssBlocked:true,assets:true,unknownRoute404:true,errors},null,2));
  console.log(`PASS: ${results.length} viewport/route checks; search, language, cart, XSS, icons and 404`);
  await browser.close();
})().catch(error=>{console.error(error);process.exit(1)});
