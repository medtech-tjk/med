import hashlib
import json
from pathlib import Path

audit = Path(__file__).resolve().parent
root = audit.parents[1]
def digest(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()
def evidence(name, producer, origin='executed'):
    path = audit / name
    assert path.is_file(), name
    return {'artifact': str(path), 'sha256': digest(path), 'producer': producer, 'revision': 'local-2026-10-29-final', 'origin': origin}
checks = [
    {'id':'browser-routes','required':True,'status':'PASS','reason':'33 viewport/route checks plus search, language, cart, XSS, assets and 404 with controlled fixtures','evidence':[evidence('browser-results.json','Microsoft Edge / Playwright')]},
    {'id':'backend-regressions','required':True,'status':'PASS','reason':'8 offline security/SEO/API regression tests','evidence':[evidence('backend-tests.txt','Python unittest')]},
    {'id':'frontend-regressions','required':True,'status':'PASS','reason':'3 Jest unit tests','evidence':[evidence('frontend-tests.txt','CRACO / Jest')]},
    {'id':'dependency-audit','required':True,'status':'FAIL','reason':'0 critical but 36 unresolved dependency warnings remain','evidence':[evidence('npm-after.json','npm audit')]},
    {'id':'production-integrations','required':False,'status':'NOT_RUN','reason':'Production database, notifications and publishing were not accessed','evidence':[]},
]
report = {
    'schemaVersion':1,'runId':'medtech-2026-10-29','mode':'refine',
    'inputRevision':'no-git-local-baseline','outputRevision':'local-2026-10-29-final','inputHash':digest(audit/'baseline-hashes.json'),
    'taskStatus':'PARTIAL','uiReadiness':'NOT_VERIFIED','checks':checks,
    'findings':[{'id':'remaining-dependencies','severity':'major','blocking':True,'resolved':False,'summary':'36 dependency warnings; remediation of legacy build stack remains','evidence':[evidence('npm-after.json','npm audit')]}],
    'changes':['Existing address replaced; no relocation blocks on homepage','Brand favicon in visitor and crawler HTML','Responsive header and mobile About timeline repaired','Order access, catalog pricing, validation and HTML escaping repaired','Product HTML sanitized with DOMPurify','Compatible npm dependency updates and consistent deployment configuration'],
    'limitations':['See AUDIT.md for remaining findings','Rendered verification uses controlled fixtures, not production DB','Carousel keyboard/pause branch reviewed statically only','No deployment, Search Console or production integration verification','Overall readiness is not certified while dependency findings and integration gaps remain'],
}
(audit/'run-report.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8')
paths=[]
for directory in [root/'frontend/src',root/'frontend/public',root/'backend']:
    paths += [p for p in directory.rglob('*') if p.is_file() and p.suffix in {'.js','.jsx','.py','.html','.css','.svg','.png','.ico','.json'}]
(audit/'final-hashes.json').write_text(json.dumps([{'path':str(p),'sha256':digest(p)} for p in paths],indent=2),encoding='utf-8')
print('Evidence report and final hashes written')
