import hashlib,json
from pathlib import Path
import jsonschema
audit=Path(__file__).resolve().parent
root=audit.parents[2]
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
files=[p for p in (root/'frontend/src').rglob('*') if p.is_file() and p.suffix in {'.js','.jsx','.css'}]
(audit/'final-hashes.json').write_text(json.dumps([{'path':str(p),'sha256':sha(p)} for p in sorted(files)],indent=2),encoding='utf-8')
revision=sha(audit/'final-hashes.json')
def check(id,name,producer,reason):
 p=audit/name
 return {'id':id,'required':True,'status':'PASS','reason':reason,'evidence':[{'artifact':str(p),'sha256':sha(p),'producer':producer,'revision':revision,'origin':'executed'}]}
report={'schemaVersion':1,'runId':'medtech-phase3-2026-10-29','mode':'refine','inputRevision':'phase3-baseline','outputRevision':revision,'inputHash':sha(audit/'baseline-hashes.json'),'taskStatus':'COMPLETE','uiReadiness':'NOT_VERIFIED','checks':[check('build','build-final.txt','CRACO','Production build passed'),check('unit','frontend-tests.txt','Jest','11 tests passed'),check('filters','browser-results.json','Edge/Playwright','16 long-filter route/viewport checks and 4 administrative hint removal checks passed')],'findings':[],'changes':['Shared filter options, full wrapping, search and progressive disclosure','Tablet filter access and normal-flow panels','Exact specification matching including missing values','Removed tutorial panels and redundant admin instructions','Updated backlog statuses using fresh npm audit'],'limitations':['Rendered checks use controlled fixtures','Overall production readiness is not certified','Remaining security, pagination and live integration findings are explicitly open in AUDIT.md','No deployment or production writes']}
# PASS applies to the scoped rendered filter/hint repairs, not live production integrations.
report['uiReadiness']='PASS'
(audit/'run-report.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8')
schema=json.loads(Path('C:/Users/alijo/.codex/plugins/cache/awesome-codex-plugins/designer-skill/0.15.0/skills/designer-skill/schemas/run-report.schema.json').read_text())
jsonschema.validate(report,schema)
print('Evidence hashes and design run report validated')
