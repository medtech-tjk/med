import os,sys,unittest
from pathlib import Path
from datetime import datetime,timedelta,timezone
from unittest.mock import AsyncMock,MagicMock,patch
sys.path.insert(0,str(Path(__file__).resolve().parents[1]/'backend'))
from fastapi import FastAPI,Depends
from fastapi.testclient import TestClient
from routes import admin
from middleware import verify_admin_token

class SessionTests(unittest.TestCase):
    def setUp(self):
        self.records={}
        self.fake=MagicMock()
        async def insert(record):self.records[record['_id']]=record.copy()
        async def find(query,*args):return self.records.get(query['_id'])
        async def delete(query):self.records.pop(query['_id'],None)
        self.fake.admin_sessions.insert_one=AsyncMock(side_effect=insert)
        self.fake.admin_sessions.find_one=AsyncMock(side_effect=find)
        self.fake.admin_sessions.delete_one=AsyncMock(side_effect=delete)
        self.env=patch.dict(os.environ,{'ADMIN_TOKEN':'a'*48,'APP_ENV':'test','CORS_ORIGINS':'http://testserver','SESSION_TTL_SECONDS':'1800'})
        self.env.start()
        self.store=patch('middleware.db',self.fake);self.store.start()
        app=FastAPI();app.include_router(admin.router)
        @app.post('/protected',dependencies=[Depends(verify_admin_token)])
        def protected():return {'ok':True}
        self.client=TestClient(app)
    def tearDown(self):self.store.stop();self.env.stop()
    def login(self):
        return self.client.post('/api/admin/session',json={'token':'a'*48},headers={'Origin':'http://testserver'})
    def test_cookie_is_http_only_and_master_not_reusable_as_api_token(self):
        self.assertEqual(self.client.post('/protected',headers={'X-Admin-Token':'a'*48}).status_code,401)
        response=self.login();self.assertEqual(response.status_code,200)
        cookie=response.headers['set-cookie'];self.assertIn('HttpOnly',cookie);self.assertIn('SameSite=strict',cookie)
        self.assertNotIn('a'*48,cookie)
        csrf=response.json()['csrf_token']
        self.assertEqual(self.client.post('/protected',headers={'X-CSRF-Token':csrf,'Origin':'http://testserver'}).status_code,200)
    def test_csrf_and_cross_origin_writes_rejected(self):
        csrf=self.login().json()['csrf_token']
        self.assertEqual(self.client.post('/protected').status_code,403)
        self.assertEqual(self.client.post('/protected',headers={'X-CSRF-Token':csrf,'Origin':'https://evil.example'}).status_code,403)
    def test_expiry_rotation_and_logout_revoke_server_session(self):
        csrf=self.login().json()['csrf_token']
        self.assertEqual(self.client.get('/api/admin/session').status_code,200)
        for record in self.records.values():record['expires_at']=datetime.now(timezone.utc)-timedelta(seconds=1)
        self.assertEqual(self.client.get('/api/admin/session').status_code,401)
        csrf=self.login().json()['csrf_token']
        result=self.client.delete('/api/admin/session',headers={'X-CSRF-Token':csrf,'Origin':'http://testserver'})
        self.assertEqual(result.status_code,200)
        self.assertEqual(self.client.get('/api/admin/session').status_code,401)
        self.login()
        with patch.dict(os.environ,{'ADMIN_TOKEN':'b'*48}):self.assertEqual(self.client.get('/api/admin/session').status_code,401)
    def test_unconfigured_or_short_master_fails_closed(self):
        with patch.dict(os.environ,{'ADMIN_TOKEN':''}):self.assertEqual(self.login().status_code,503)
        with patch.dict(os.environ,{'ADMIN_TOKEN':'short'}):self.assertEqual(self.client.post('/api/admin/session',json={'token':'short'}).status_code,503)

if __name__=='__main__':unittest.main()
