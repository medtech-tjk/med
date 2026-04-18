from fastapi import Request, HTTPException
from pathlib import Path

ROOT_DIR = Path(__file__).parent
TOKEN_FILE = ROOT_DIR / 'admin_token.txt'

def load_admin_token():
    """Load admin token from file"""
    if TOKEN_FILE.exists():
        return TOKEN_FILE.read_text().strip()
    return None

async def verify_admin_token(request: Request):
    """Middleware to verify admin token"""
    token = request.headers.get('X-Admin-Token')
    valid_token = load_admin_token()
    
    if not token or token != valid_token:
        raise HTTPException(status_code=401, detail="Unauthorized: Invalid admin token")
    
    return True
