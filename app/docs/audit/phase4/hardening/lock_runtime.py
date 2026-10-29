from importlib import metadata
from packaging.requirements import Requirement
from packaging.utils import canonicalize_name
from pathlib import Path
roots = Path('backend/requirements.in').read_text().splitlines()
seen = set()
def visit(name):
    name = canonicalize_name(name)
    if name in seen:
        return
    seen.add(name)
    dist = metadata.distribution(name)
    for raw in dist.requires or []:
        dep = Requirement(raw)
        if dep.marker is None or dep.marker.evaluate({'extra': ''}):
            visit(dep.name)
for root in roots:
    if root.strip() and not root.startswith('#'):
        visit(root)
lock = '# Fully resolved runtime lock; generated from requirements.in using PyPI metadata.\n' + '\n'.join(f'{name}=={metadata.version(name)}' for name in sorted(seen)) + '\n'
Path('backend/requirements.txt').write_text(lock)
Path('backend/requirements-dev.txt').write_text('-r requirements.txt\npytest==' + metadata.version('pytest') + '\npip-audit==' + metadata.version('pip-audit') + '\n')
print(lock)
