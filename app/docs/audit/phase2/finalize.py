import hashlib
import json
from pathlib import Path

audit=Path(__file__).resolve().parent
root=audit.parents[2]
def sha(path): return hashlib.sha256(path.read_bytes()).hexdigest()
files=[p for base in [root/'frontend/src',root/'backend'] for p in base.rglob('*') if p.is_file() and p.suffix in {'.js','.jsx','.css','.py'}]
files += [root/'frontend/tailwind.config.js']
hashes=[{'path':str(p),'sha256':sha(p)} for p in sorted(files)]
(audit/'final-hashes.json').write_text(json.dumps(hashes,indent=2),encoding='utf-8')
revision=sha(audit/'final-hashes.json')
def evidence(name,producer,origin='executed'):
    p=audit/name
    assert p.is_file(),name
    return {'artifact':str(p),'sha256':sha(p),'producer':producer,'revision':revision,'origin':origin}
def check(id,name,producer,reason):
    return {'id':id,'required':True,'status':'PASS','reason':reason,'evidence':[evidence(name,producer)]}
report={
    'schemaVersion':1,'runId':'medtech-2026-10-29-phase2','mode':'refine',
    'inputRevision':'phase2-local-baseline','outputRevision':revision,'inputHash':sha(audit/'baseline-hashes.json'),
    'taskStatus':'PARTIAL','uiReadiness':'NOT_VERIFIED',
    'checks':[
        check('build','build.txt','CRACO build','Production frontend build completed'),
        check('frontend-tests','frontend-tests.txt','Jest','7 tests passed'),
        check('backend-tests','backend-tests.txt','unittest','12 tests passed, including all 37 protected endpoints rejecting missing tokens'),
        check('responsive-interaction','browser-results.json','Edge / Playwright','39 responsive checks and public/admin interactions with intercepted API fixtures'),
        check('contrast','color-audit.json','colors.cjs','10 named text/background pairs >=4.5:1'),
        {'id':'live-integrations','required':True,'status':'NOT_RUN','reason':'Live database, notifications and storage not available in the local verification setup','evidence':[]},
    ],
    'findings':[],
    'changes':['Unified blue palette and shared 1320px grid','Rebuilt header/footer hierarchy and responsive layout','Shared category and product cards with restrained microanimations','Working search filters and stale-request cancellation','Product gallery and keyboard tabs','Common admin transport/session expiry and accessible order dialog','Stable identities on backend product/slide edits; unchanged updates do not return false 404'],
    'limitations':['Production integrations remain unverified; no deployment','Controlled fixtures are clearly labeled test data','Full WCAG certification and every CRUD payload permutation are outside these checks','Earlier dependency, rate-limit, upload-limit and pagination findings remain in AUDIT.md']
}
(audit/'run-report.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8')
import jsonschema
schema=Path('C:/Users/alijo/.codex/plugins/cache/awesome-codex-plugins/designer-skill/0.15.0/skills/designer-skill/schemas/run-report.schema.json')
jsonschema.validate(report,json.loads(schema.read_text()))
print('Final source hashes and validated design run report written')
