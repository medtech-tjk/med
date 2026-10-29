const {chromium}=require('C:/Users/alijo/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs=require('fs'),assert=require('assert/strict');
const origin=process.env.AUDIT_WEB_ORIGIN||'http://localhost:3100';
assert(/^http:\/\/(localhost|127\.0\.0\.1):\d+$/.test(origin),'Only a local origin may be tested');
const product={id:'audit-device',slug:'audit-device',name:'Тестовый аппарат',name_en:'Test device',price:120,brand:'Audit fixture',category_id:'audit-category',in_stock:true,description:'<p>Тестовое описание</p><img src="x" onerror="window.auditXss=true">',images:[],specs:{'Тип':'Портативный'},main_image:'/logo192.png'};
const thirdLevel={id:'audit-third',slug:'audit-type',name:'Тестовый тип',name_en:'Test type'};
const subcategory={id:'audit-subcategory',slug:'audit-subcategory',name:'Тестовая подкатегория',name_en:'Test subcategory',children:[thirdLevel]};
const category={id:'audit-category',slug:'audit-category',name:'Тестовая категория',name_en:'Test category',image:'/logo192.png',subcategories:[subcategory]};
function fixture(url){
 const p=url.pathname;
 if(p==='/api/admin/session')return {valid:true,csrf_token:'isolated-fixture-csrf',expires_at:'2099-01-01T00:00:00Z'};
 if(p==='/api/admin/stats')return {products:1,categories:1,orders:0,newOrders:0};
 if(p==='/api/settings')return {usd_to_tjs_rate:11.2};
 if(p==='/api/products/page')return {items:[product],total:1,page:1,page_size:24,pages:1,facets:{brands:['Audit fixture'],specs:{'Тип':['Портативный']},category_ids:['audit-category']}};
 if(p.includes('/products/slug/'))return product;
 if(p.includes('/categories/specs/'))return {specs:[{key:'Тип',type:'select',options:['Портативный']}]};
 if(p==='/api/categories/'||p==='/api/categories')return [category];
 if(p.startsWith('/api/categories/'))return category;
 if(p.includes('/featured')||p==='/api/products/'||p==='/api/products')return [product];
 return [];
}
(async()=>{
 const browser=await chromium.launch({channel:'msedge',headless:true});
 const context=await browser.newContext({reducedMotion:'reduce'}),page=await context.newPage();
 const errors=[],results=[];page.on('pageerror',e=>errors.push(e.message));
 await context.route('**/*',async r=>{
  const u=new URL(r.request().url());
  if(u.pathname.startsWith('/api/'))return r.fulfill({contentType:'application/json',body:JSON.stringify(fixture(u))});
  if(!['localhost','127.0.0.1'].includes(u.hostname))return r.abort();
  return r.continue();
 });
const routes=['/','/catalog','/catalog/audit-category','/catalog/audit-category/audit-subcategory','/catalog/audit-category/audit-subcategory/audit-type','/product/audit-device','/brand/Audit%20fixture','/about','/services','/cart','/admin/login','/admin','/admin/settings','/admin/products/new'];
 for(const path of routes){for(const width of [360,1440]){
  console.log('Scan',path,width);await page.setViewportSize({width,height:1000});
  await page.goto(origin+path,{waitUntil:'networkidle'});await page.evaluate(()=>document.fonts.ready);
  const documentWidth=await page.evaluate(()=>document.documentElement.scrollWidth);
  const text=await page.locator('body').innerText();
  assert(text.length>30,`Blank ${path}`);
  await page.addScriptTag({path:require.resolve('./evidence-tools/node_modules/axe-core/axe.min.js')});
  const axe=await page.evaluate(async()=>{const r=await axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21a','wcag21aa']}});return {violations:r.violations.map(v=>({id:v.id,impact:v.impact,help:v.help,helpUrl:v.helpUrl,nodes:v.nodes.map(n=>({html:n.html,target:n.target,failureSummary:n.failureSummary}))})),passes:r.passes.length,incomplete:r.incomplete.map(v=>({id:v.id,nodes:v.nodes.length}))}});
  const result={path,width,documentWidth,noHorizontalOverflow:documentWidth<=width,axe};results.push(result);
  if(width===360||axe.violations.length)await page.screenshot({path:__dirname+'/screen-'+(path.replace(/[^a-z0-9]+/gi,'-')||'home')+'-'+width+'.png',fullPage:true});
 }}
 const filterStates=[];
 for(const path of ['/catalog/audit-category','/catalog/audit-category/audit-subcategory','/catalog/audit-category/audit-subcategory/audit-type']){
  await page.setViewportSize({width:360,height:1000});await page.goto(origin+path,{waitUntil:'networkidle'});
  const toggle=page.getByRole('button',{name:/фильтр|filters/i}).first();
  if(await toggle.count()){
   await toggle.click();
   const panel=page.locator('.filter-sidebar').first();
   const visible=await panel.isVisible();
   const measurements=await panel.evaluate(el=>({width:el.getBoundingClientRect().width,scrollWidth:el.scrollWidth,clientWidth:el.clientWidth,documentWidth:document.documentElement.scrollWidth}));
   filterStates.push({path,visible,...measurements});
   await page.screenshot({path:__dirname+'/filters-'+(path.split('/').pop())+'-360.png',fullPage:true});
   assert(visible&&measurements.documentWidth<=360&&measurements.scrollWidth<=measurements.clientWidth+1,`Clipped mobile filter panel ${path}`);
  }
 }
 await page.goto(origin+'/product/audit-device',{waitUntil:'networkidle'});
 assert.equal(await page.evaluate(()=>window.auditXss),undefined);
 const payload={timestamp:new Date().toISOString(),origin,browser:'Microsoft Edge / bundled Playwright',fixture:'Every API intercepted; external network blocked; no production writes or notifications',results,filterStates,errors,xssBlocked:true,limitations:'Axe covers only these pages/states and cannot certify WCAG conformance.'};
 fs.writeFileSync(__dirname+'/browser-axe-results.json',JSON.stringify(payload,null,2));
 console.log(JSON.stringify({routes:routes.length,states:results.length,overflow:results.filter(r=>!r.noHorizontalOverflow).length,violations:results.reduce((n,r)=>n+r.axe.violations.length,0),filterStates,errors}));
 await browser.close();
 if(errors.length||results.some(r=>!r.noHorizontalOverflow))process.exitCode=1;
})().catch(e=>{console.error(e);process.exit(1)});
