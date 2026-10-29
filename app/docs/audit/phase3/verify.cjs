const {chromium}=require('C:/Users/alijo/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs=require('fs'),assert=require('assert/strict');
const origin='http://localhost:3100';
const brands=Array.from({length:12},(_,i)=>`Производитель ${i+1} — медицинские диагностические системы и оборудование для специализированных клинических исследований`);
const options=Array.from({length:12},(_,i)=>`Исполнение ${i+1}: расширенная комплектация с дополнительными модулями и ДлинныйНеразрывныйИдентификаторОборудованияДляПроверкиПереносаТекста`);
const specKey='Тип оборудования и особенности комплектации с длинным названием';
const children=Array.from({length:12},(_,i)=>({id:`type${i}`,slug:`type${i}`,name:`Тип ${i+1} — диагностическое оборудование с длинным названием и дополнительными возможностями`}));
const sub={id:'sub',slug:'sub',name:'Подкатегория — тест длинных фильтров',children};
const category={id:'cat',slug:'cat',name:'Категория — тест длинных фильтров',subcategories:[sub,...Array.from({length:10},(_,i)=>({id:`sub${i}`,slug:`sub${i}`,name:`Дополнительная подкатегория ${i+1} с длинным названием для проверки отображения`,children:[]}))]};
const products=brands.map((brand,i)=>({id:`p${i}`,slug:`p${i}`,name:`Тестовый аппарат ${i+1}`,category_id:'cat',subcategory_id:'sub',third_level_id:'type0',brand,price:1000+i,in_stock:true,main_image:'/logo192.png',specs:{[specKey]:options[i],...(i===0?{Класс:'Экспертный'}:{})}}));
(async()=>{
 const browser=await chromium.launch({channel:'msedge',headless:true});const page=await browser.newPage();page.setDefaultTimeout(10000);const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.route('**/www.googletagmanager.com/**',r=>r.abort());
 await page.route('**/api/**',route=>{const p=new URL(route.request().url()).pathname;let body=[];if(p.includes('/categories/specs/'))body={specs:[{key:'Бренд',type:'input',options:brands},{key:specKey,type:'select',options},{key:'Класс',type:'select',options:['Экспертный','Базовый']}]};else if(p==='/api/categories/')body=[category];else if(p==='/api/products/')body=products;else if(p==='/api/settings')body={usd_to_tjs_rate:11.2};else if(p==='/api/admin/verify')body={valid:true};return route.fulfill({contentType:'application/json',body:JSON.stringify(body)});});
 const results=[];
 for(const path of ['/catalog?search=test','/catalog/cat','/catalog/cat/sub','/catalog/cat/sub/type0']){
  for(const width of [360,768,1024,1440]){
   console.log(path,width);
   await page.setViewportSize({width,height:width>=1024?650:850});await page.goto(origin+path,{waitUntil:'domcontentloaded'});await page.evaluate(()=>document.fonts.ready);await page.locator('.product-card').first().waitFor();
   if(width<1024)await page.getByRole('button',{name:/^Фильтры/}).click();
   const aside=page.locator('aside').first();await aside.waitFor({state:'visible'});
   const group=aside.locator('fieldset.filter-group').filter({has:page.locator('legend',{hasText:'Бренд'})}).first();await group.getByRole('button',{name:/Показать ещё/}).click();
   for(const button of await aside.getByRole('button',{name:/Показать ещё/}).all())await button.click();
   assert.equal(await group.locator('.filter-option').count(),path.includes('search=')||path.endsWith('/sub')?12:13);
   const clipped=await aside.locator('.filter-option span, .filter-group legend, a').evaluateAll(es=>es.filter(e=>e.scrollWidth>e.clientWidth+1||e.scrollHeight>e.clientHeight+1).map(e=>({text:e.textContent,scrollWidth:e.scrollWidth,clientWidth:e.clientWidth})));
   assert.deepEqual(clipped,[],`Clipped labels ${path} ${width}`);
   assert((await page.evaluate(()=>document.documentElement.scrollWidth))<=width,`Page overflow ${path} ${width}`);
   const last=aside.locator('button, input, a').last();await last.evaluate(e=>e.scrollIntoView({block:'center'}));await last.click({trial:true});const box=await last.boundingBox();const headerBottom=await page.locator('.site-header').evaluate(e=>e.getBoundingClientRect().bottom);const navHeight=width<1280?await page.locator('nav.fixed').evaluate(e=>e.getBoundingClientRect().height):0;assert(box.y>=headerBottom&&box.y+box.height<=await page.evaluate(()=>innerHeight)-navHeight+1,'Bottom filter controls overlapped by navigation');
   await group.getByLabel(brands[8],{exact:true}).check();assert.equal(await page.locator('.product-card').count(),1);
   await group.getByRole('searchbox').fill('Производитель 9');assert.equal(await group.locator('.filter-option').filter({hasText:brands[8]}).count(),1);await group.getByRole('searchbox').fill('');
   await group.getByRole('button',{name:/Свернуть/}).click();assert(await group.getByLabel(brands[8],{exact:true}).isVisible(),'Selected option hidden when collapsed');
   if(await group.getByLabel(brands[8],{exact:true}).getAttribute('type')==='radio')await group.getByLabel('Все',{exact:true}).check();else await group.getByLabel(brands[8],{exact:true}).uncheck();
   if(path.endsWith('/sub')){const cls=aside.locator('fieldset').filter({has:page.locator('legend',{hasText:'Класс'})});await cls.getByLabel('Экспертный',{exact:true}).check();assert.equal(await page.locator('.product-card').count(),1);await cls.getByLabel('Экспертный',{exact:true}).uncheck();}
   await page.evaluate(()=>window.scrollTo(0,0));
   await page.screenshot({path:__dirname+`/filters-${path.includes('search=')?'search':path.endsWith('type0')?'third':path.endsWith('/sub')?'sub':'category'}-${width}.png`,fullPage:false});
   results.push({path,width,labelsFullyVisible:true,noHorizontalOverflow:true,controlsReachable:true,brandSelection:true});
  }
 }
 await page.setViewportSize({width:1440,height:1000});await page.goto(origin,{waitUntil:'domcontentloaded'});await page.evaluate(()=>localStorage.setItem('adminToken','offline-test-token'));
 for(const path of ['/admin/settings','/admin/categories','/admin/featured','/admin/products/new']){
  await page.goto(origin+path,{waitUntil:'domcontentloaded'});await page.locator('.admin-shell').waitFor();await page.waitForTimeout(100);const text=await page.locator('body').innerText();assert(!/Как это работает|Структура каталога \(3 уровня\)|Информация:|Добавьте характеристики с заголовками|Add specifications in English/.test(text),path+' tutorial remains');
  if(path==='/admin/settings')await page.screenshot({path:__dirname+'/settings-without-hints.png',fullPage:true});
 }
 assert.deepEqual(errors,[]);
 fs.writeFileSync(__dirname+'/browser-results.json',JSON.stringify({checks:results,removedHintsPages:4,fixture:'12 long brands, 12 long option labels, nested categories and missing specification values; all API requests intercepted',errors},null,2));
 console.log(`PASS ${results.length} long-filter checks and 4 hint-free admin pages`);await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});
