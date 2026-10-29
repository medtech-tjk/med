import { vi, afterEach, test, expect } from 'vitest';
import { adminFetch, loginAdmin, logoutAdmin } from './adminApi';

afterEach(() => { vi.restoreAllMocks(); localStorage.clear(); });

test('login keeps the master key out of storage and writes use the CSRF session cookie', async () => {
  global.fetch = vi.fn()
    .mockResolvedValueOnce({ok:true,status:200,json:async()=>({csrf_token:'csrf-value'})})
    .mockResolvedValueOnce({ok:true,status:200});
  await loginAdmin('secret-master-key');
  expect(localStorage.getItem('adminToken')).toBeNull();
  const body = new FormData(); body.append('example','file');
  await adminFetch('/api/upload/',{method:'POST',body});
  const [url,options] = global.fetch.mock.calls[1];
  expect(url).toBe('/api/upload/');
  expect(options.credentials).toBe('same-origin');
  expect(options.headers.get('X-CSRF-Token')).toBe('csrf-value');
  expect(options.headers.has('X-Admin-Token')).toBe(false);
  expect(options.body).toBe(body);
  expect(options.headers.has('Content-Type')).toBe(false);
});

test('expired sessions are cleared and reported to the layout', async () => {
  const listener=vi.fn(); window.addEventListener('admin-session-expired',listener);
  global.fetch=vi.fn().mockResolvedValue({ok:false,status:401});
  await expect(adminFetch('/api/admin/stats')).rejects.toThrow('Сессия');
  expect(listener).toHaveBeenCalledTimes(1);
  window.removeEventListener('admin-session-expired',listener);
});

test('API calls cannot be redirected to a different origin', async () => {
  await expect(adminFetch('https://attacker.example/api/admin/stats')).rejects.toThrow('Invalid API path');
});

test('logout revokes the server session before clearing local state', async () => {
  global.fetch=vi.fn()
    .mockResolvedValueOnce({ok:true,status:200,json:async()=>({csrf_token:'csrf-value'})})
    .mockResolvedValueOnce({ok:true,status:200});
  // Load the CSRF token through the authenticated session endpoint.
  const {getAdminSession}=await import('./adminApi');
  await getAdminSession();
  await logoutAdmin();
  expect(global.fetch.mock.calls[1][1].method).toBe('DELETE');
  expect(global.fetch.mock.calls[1][1].headers.get('X-CSRF-Token')).toBe('csrf-value');
});
