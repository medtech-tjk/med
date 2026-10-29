const {chromium}=require('C:/Users/alijo/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs=require('fs');const assert=require('assert/strict');
const origin='http://localhost:3100';
const stamp='2026-10-29T10:00:00Z';
const category={id:'test-category',name:'Диагностика — тестовые данные',name_en:'Diagnostics — test data',slug:'test-category',image:'/logo192.png',subcategories:[]};
const product={id:'test-product',name:'Диагностический аппарат — тестовые данные',name_en:'Diagnostic device — test data',slug:'test-product',category_id:category.id,price:12000,old_price:14500,in_stock:true,is_new:true,is_popular:true,brand:'Test brand A',main_image:'/logo192.png',images:['/logo512.png'],description:'<p>Описание тестового оборудования.</p>',specs:{'Тип':'Портативный','Экран':'Высокое разрешение'},spec_groups:[],documents:[],created_at:stamp};
const product2={...product,id:'test-product-2',slug:'test-product-2',name:'Второй аппарат — тестовые данные',brand:'Test brand B',price:20000,in_stock:false,is_new:false};
const order={id:'test-order',full_name:'Тестовый покупатель',phone:'+992000000000',address:'Тестовый адрес',status:'new',created_at:stamp,total:12000,items:[{...product,quantity:1}]};
(async()=>{
 const browser=await chromium.launch({channel:'msedge',headless:true});
 const context=await browser.newContext();const page=await context.newPage();page.setDefaultTimeout(10000);
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.route('**/www.googletagmanager.com/**',r=>r.abort());
 let mode='normal',rate=11.2;const writes=[];
 await page.route('**/api/**',async route=>{
   const req=route.request(), url=new URL(req.url()),p=url.pathname,m=req.method();
   if(p==='/api/admin/verify') return route.fulfill({status:mode==='expired'?401:200,contentType:'application/json',body:JSON.stringify({valid:true})});
   if(mode==='expired'&&p==='/api/admin/stats') return route.fulfill({status:401,body:'{}',contentType:'application/json'});
   if(mode==='server-error'&&p==='/api/products/') return route.fulfill({status:503,body:'{}',contentType:'application/json'});
   if(!['GET','HEAD'].includes(m)) writes.push({path:p,method:m,body:(req.headers()['content-type'] || '').includes('application/json')?req.postDataJSON():'FormData',token:req.headers()['x-admin-token']});
   let body=[];
   if(p==='/api/settings') {if(m==='PUT')rate=req.postDataJSON().usd_to_tjs_rate;body=m==='PUT'?{settings:{usd_to_tjs_rate:rate,updated_at:stamp}}:{usd_to_tjs_rate:rate,updated_at:stamp};}
   else if(p==='/api/admin/stats')body={products:2,categories:1,orders:1,newOrders:1};
   else if(p.includes('/categories/specs/'))body={specs:[]};
   else if(p==='/api/categories/')body=[category];
   else if(p==='/api/products/')body=m==='GET'?[product,product2]:{id:'created-offline',message:'saved'};
   else if(p.startsWith('/api/products/slug/'))body=product;
   else if(p==='/api/products/test-product')body=m==='GET'?product:{message:'saved'};
   else if(p==='/api/featured/')body=[product];
   else if(p==='/api/slides/all')body=[{id:'test-slide',title:'Тестовый слайд',image:'/logo192.png',is_active:true,order:0}];
   else if(p==='/api/orders/')body=[order];
   else if(p==='/api/upload/')body={url:'/logo192.png',filename:'offline-fixture.png'};
   else if(p.includes('/api/orders/')&&m==='PATCH'){order.status=req.postDataJSON().status;body={message:'updated'};}
   await route.fulfill({contentType:'application/json',body:JSON.stringify(body)});
 });
 const results=[];
 async function visit(path,width=1440){await page.setViewportSize({width,height:1000});await page.goto(origin+path,{waitUntil:'domcontentloaded'});await page.evaluate(()=>document.fonts.ready);await page.waitForTimeout(250);}
 async function measure(path,width){const size=await page.evaluate(()=>document.documentElement.scrollWidth);assert(size<=width,`${path} overflow at ${width}: ${size}`);results.push({path,width,documentWidth:size});}
 if(process.env.DIAG_PATH) {
   await visit('/');await page.evaluate(()=>localStorage.setItem('adminToken','offline-test-token'));
   await visit(process.env.DIAG_PATH,360);await page.waitForTimeout(500);
   console.log(await page.locator('body *').evaluateAll(es=>es.filter(e=>e.getBoundingClientRect().right>361).map(e=>({tag:e.tagName,cls:e.className,text:e.textContent.slice(0,70),right:e.getBoundingClientRect().right})).slice(0,24)));
   await page.screenshot({path:__dirname+'/diagnostic.png',fullPage:true});await browser.close();return;
 }
 for(const path of ['/','/catalog','/catalog?search=аппарат','/catalog/test-category','/product/test-product']) {
   console.log('Public',path);
   for(const width of [360,768,1024,1440]){await visit(path,width);await measure(path,width);}
 }
 await visit('/',1440);await page.screenshot({path:__dirname+'/home-desktop.png',fullPage:true});
 const alignment=await page.evaluate(()=>{const h=document.querySelector('.site-header .container').getBoundingClientRect(),f=document.querySelector('footer .container').getBoundingClientRect();return {headerLeft:h.left,footerLeft:f.left,headerWidth:h.width,footerWidth:f.width};});
 assert.equal(alignment.headerLeft,alignment.footerLeft);assert.equal(alignment.headerWidth,alignment.footerWidth);
 await visit('/catalog',1440);await page.screenshot({path:__dirname+'/catalog-desktop.png',fullPage:true});
 await visit('/catalog?search=аппарат',1440);
 assert.equal(await page.locator('.product-card').count(),2);
 await page.getByLabel('Test brand A',{exact:true}).check();assert.equal(await page.locator('.product-card').count(),1);
 await page.getByLabel('Test brand A',{exact:true}).uncheck();
 await page.getByLabel('Только в наличии',{exact:true}).check();assert.equal(await page.locator('.product-card').count(),1);
 await page.getByLabel('Только в наличии',{exact:true}).uncheck();
 await page.locator('aside input[type="number"]').nth(1).fill('15000');assert.equal(await page.locator('.product-card').count(),1);
 await page.getByRole('button',{name:'Очистить фильтры'}).click();assert.equal(await page.locator('.product-card').count(),2);
 await page.locator('.product-card-action').first().click();assert.equal(await page.locator('.product-card-action').first().getAttribute('data-added'),'true');
 await page.screenshot({path:__dirname+'/search-desktop.png',fullPage:true});
 await visit('/catalog?search=аппарат',360);await page.getByRole('button',{name:'Фильтры',exact:true}).click();await page.locator('aside input[type="number"]').first().waitFor({state:'visible'});await measure('open-filters',360);await page.screenshot({path:__dirname+'/search-mobile.png',fullPage:true});
 await visit('/product/test-product',1440);await page.screenshot({path:__dirname+'/product-desktop.png',fullPage:true});
 const tab=page.getByRole('tab',{name:'Описание',exact:true});await tab.focus();await page.keyboard.press('ArrowRight');assert.equal(await page.getByRole('tab',{name:'Характеристики',exact:true}).getAttribute('aria-selected'),'true');
 await page.getByRole('button',{name:'Фото 2',exact:true}).click();assert.equal(await page.getByRole('button',{name:'Фото 2',exact:true}).getAttribute('aria-pressed'),'true');
 await visit('/product/test-product',360);await page.screenshot({path:__dirname+'/product-mobile.png',fullPage:true});
 mode='server-error';await visit('/catalog?search=test');await page.getByRole('alert').waitFor();mode='normal';
 await visit('/');await page.evaluate(()=>localStorage.setItem('adminToken','offline-test-token'));
 for(const path of ['/admin/dashboard','/admin/products','/admin/products/new','/admin/products/test-product/edit','/admin/categories','/admin/slides','/admin/featured','/admin/orders','/admin/settings']) {
   console.log('Admin',path);
   for(const width of [360,1440]) {await visit(path,width);await page.locator('.admin-shell').waitFor();await measure(path,width);}
 }
 await visit('/admin/dashboard',1440);await page.screenshot({path:__dirname+'/admin-desktop.png',fullPage:true});
 await visit('/admin/products/new',1440);
 await page.getByRole('textbox',{name:'Название товара',exact:true}).fill('Новый аппарат — тестовая запись');
 await page.getByLabel('Категория товара',{exact:true}).selectOption(category.id);
 await page.getByLabel('Цена товара в TJS',{exact:true}).fill('1500');
 await page.locator('input[type="file"]').first().setInputFiles({name:'fixture.png',mimeType:'image/png',buffer:fs.readFileSync(__dirname+'/../../../frontend/public/favicon-96x96.png')});
 await page.waitForTimeout(200);
 await page.getByRole('button',{name:'Сохранить',exact:true}).click();await page.waitForURL('**/admin/products');
 assert(writes.some(w=>w.path==='/api/products/'&&w.method==='POST'&&w.body.name==='Новый аппарат — тестовая запись'));
 assert(writes.some(w=>w.path==='/api/upload/'&&w.body==='FormData'&&w.token==='offline-test-token'));
 await visit('/admin/products/test-product/edit',1440);await page.getByRole('textbox',{name:'Название товара',exact:true}).fill('Изменённый аппарат — тестовая запись');await page.getByRole('button',{name:'Сохранить',exact:true}).click();await page.waitForURL('**/admin/products');
 assert(writes.some(w=>w.path==='/api/products/test-product'&&w.method==='PUT'));
 await visit('/admin/orders',1440);await page.getByRole('button',{name:'Открыть заявку test-order'}).click();await page.getByRole('button',{name:'В работе',exact:true}).last().click();await page.waitForTimeout(200);assert.equal(order.status,'processing');
 await visit('/admin/settings',360);await page.getByRole('spinbutton',{name:'Курс USD к TJS'}).fill('0');await page.getByRole('button',{name:'Сохранить',exact:true}).click();assert.equal(writes.filter(w=>w.path==='/api/settings').length,0);
 await page.getByRole('spinbutton',{name:'Курс USD к TJS'}).fill('12.5');await page.getByRole('button',{name:'Сохранить',exact:true}).click();await page.waitForTimeout(150);assert.equal(rate,12.5);assert.equal(writes.find(w=>w.path==='/api/settings').token,'offline-test-token');
 await page.getByRole('button',{name:'Открыть меню администратора'}).click();await page.keyboard.press('Escape');assert.equal(await page.getByRole('button',{name:'Открыть меню администратора'}).getAttribute('aria-expanded'),'false');
 await page.screenshot({path:__dirname+'/admin-mobile.png',fullPage:true});
 mode='expired';await visit('/admin/dashboard');await page.waitForURL(origin+'/admin');assert.equal(await page.evaluate(()=>localStorage.getItem('adminToken')),null);mode='normal';
 await page.emulateMedia({reducedMotion:'reduce'});await visit('/catalog?search=test');
 const reduced=await page.locator('.product-card').first().evaluate(e=>({transition:getComputedStyle(e).transitionDuration,animation:getComputedStyle(e).animationName}));assert.equal(reduced.transition,'0s');
 assert.deepEqual(errors,[]);
 fs.writeFileSync(__dirname+'/browser-results.json',JSON.stringify({checks:results,alignment,filters:true,cartFeedback:true,gallery:true,keyboardTabs:true,adminSessionExpiry:true,adminSettingsWrite:true,serverErrorVisible:true,reducedMotion:reduced,fixture:'All API calls intercepted; visibly labeled test catalog; no production writes',writes,errors},null,2));
 console.log(`PASS ${results.length} responsive checks; catalog filters, cart feedback, gallery/tabs, all admin screens, settings validation/write, expired session and reduced motion`);
 await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});
