import lighthouse from './evidence-tools/node_modules/lighthouse/core/index.js';
import {launch} from './evidence-tools/node_modules/chrome-launcher/dist/index.js';
import fs from 'node:fs';
const origin=process.env.AUDIT_WEB_ORIGIN||'http://localhost:3100';
if(!/^http:\/\/(localhost|127\.0\.0\.1):\d+$/.test(origin))throw new Error('Only local origins permitted');
const chromePath='C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
const chrome=await launch({chromePath,chromeFlags:['--headless=new','--no-first-run','--disable-background-networking','--disable-extensions']});
const results=[];
try{
 for(const path of ['/','/catalog','/product/audit-device']){
  console.log('Lighthouse mobile',path);
  const run=await lighthouse(origin+path,{port:chrome.port,output:['json','html'],logLevel:'error',onlyCategories:['performance','accessibility','best-practices','seo'],blockedUrlPatterns:['*googletagmanager.com*','*google-analytics.com*','*mc.yandex.ru*'],disableStorageReset:false});
  const name=path==='/'?'home':path.replace(/[^a-z0-9]+/gi,'-');
  fs.writeFileSync(new URL('./lighthouse-'+name+'.json',import.meta.url),run.report[0]);
  fs.writeFileSync(new URL('./lighthouse-'+name+'.html',import.meta.url),run.report[1]);
  const l=run.lhr;results.push({path,fetchTime:l.fetchTime,environment:l.environment,settings:{formFactor:l.configSettings.formFactor,throttlingMethod:l.configSettings.throttlingMethod,throttling:l.configSettings.throttling},scores:Object.fromEntries(Object.entries(l.categories).map(([k,v])=>[k,v.score])),metrics:Object.fromEntries(['first-contentful-paint','largest-contentful-paint','total-blocking-time','cumulative-layout-shift','speed-index'].map(k=>[k,{value:l.audits[k]?.numericValue,unit:l.audits[k]?.numericUnit}])),warnings:l.runWarnings,failedAudits:Object.values(l.audits).filter(a=>a.score!==null&&a.score<1&&a.details).map(a=>({id:a.id,title:a.title,score:a.score,displayValue:a.displayValue}))});
 }
 fs.writeFileSync(new URL('./lighthouse-summary.json',import.meta.url),JSON.stringify({timestamp:new Date().toISOString(),origin,limitations:'Single local lab runs on synthetic catalog fixtures. These are not field Core Web Vitals or production results.',results},null,2));
}finally{await chrome.kill()}
