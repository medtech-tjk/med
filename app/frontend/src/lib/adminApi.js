let csrfToken = null;
let pendingSession = null;

function clearSession() {
  csrfToken = null;
  // Remove credentials left by the previous application version.
  localStorage.removeItem('adminToken');
}
function apiPath(url) {
  const parsed = new URL(url, window.location.origin);
  if (parsed.origin !== window.location.origin || !parsed.pathname.startsWith('/api/')) throw new Error('Invalid API path');
  return parsed.pathname + parsed.search;
}
async function transport(url, options = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 20000);
  try {
    return await globalThis.fetch(apiPath(url), {...options, credentials:'same-origin', signal:options.signal || controller.signal});
  } finally { clearTimeout(timeout); }
}
export async function getAdminSession() {
  if (pendingSession) return pendingSession;
  clearSession();
  pendingSession = (async()=>{
    const response=await transport('/api/admin/session');
    if(!response.ok) {
      if(response.status===401 || response.status===403) window.dispatchEvent(new Event('admin-session-expired'));
      throw new Error('Сессия завершена. Войдите повторно.');
    }
    const data=await response.json();csrfToken=data.csrf_token;return data;
  })().finally(()=>{pendingSession=null;});
  return pendingSession;
}
export async function loginAdmin(token) {
  clearSession();
  const response=await transport('/api/admin/session',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({token})});
  if(!response.ok)throw new Error(response.status===503 ? 'Вход администратора пока не настроен.' : response.status===429 ? 'Слишком много попыток. Попробуйте позже.' : 'Неверный ключ доступа.');
  const data=await response.json();csrfToken=data.csrf_token;return data;
}
export async function adminFetch(url,options={}) {
  const unsafe=!['GET','HEAD','OPTIONS'].includes((options.method || 'GET').toUpperCase());
  if(unsafe && !csrfToken)await getAdminSession();
  const headers=new Headers(options.headers || {});
  headers.delete('X-Admin-Token');
  if(unsafe)headers.set('X-CSRF-Token',csrfToken);
  const response=await transport(url,{...options,headers});
  if(response.status===401 || response.status===403) {
    clearSession();window.dispatchEvent(new Event('admin-session-expired'));
    throw new Error('Сессия завершена. Войдите повторно.');
  }
  if(!response.ok)throw new Error(`Ошибка API (${response.status}). Попробуйте ещё раз.`);
  return response;
}
export async function logoutAdmin() {
  await adminFetch('/api/admin/session',{method:'DELETE'});
  clearSession();
}

export async function fetchAllProducts({pageSize=100}={}) {
  const size=Math.min(100,Math.max(1,Number(pageSize)||100));
  const firstParams=new URLSearchParams({page:'1',page_size:String(size)});
  const firstResponse=await adminFetch(`/api/products/page?${firstParams}`);
  const first=await firstResponse.json();
  const items=[...(first.items||[])];
  for(let start=2;start<=(first.pages||0);start+=4){
    const pageNumbers=Array.from({length:Math.min(4,(first.pages||0)-start+1)},(_,index)=>start+index);
    const batch=await Promise.all(pageNumbers.map(async page=>{
      const params=new URLSearchParams(firstParams);params.set('page',String(page));
      const response=await adminFetch(`/api/products/page?${params}`);
      return response.json();
    }));
    items.push(...batch.flatMap(result=>result.items||[]));
  }
  return items;
}
