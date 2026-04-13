from fastapi import APIRouter
from fastapi.responses import Response
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
from pathlib import Path
import os
from datetime import datetime, timezone

ROOT_DIR = Path(__file__).parent.parent
load_dotenv(ROOT_DIR / '.env')

router = APIRouter(tags=["SEO"])

# MongoDB connection
mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ.get('DB_NAME', 'test_database')]

SITE_URL = os.environ.get('SITE_URL', 'https://medtech.tj').rstrip('/')


@router.get("/sitemap.xml")
async def sitemap():
    """Generate dynamic sitemap.xml with all products, categories and pages"""

    urls = []

    # Static pages
    static_pages = [
        {"loc": "/", "priority": "1.0", "changefreq": "daily"},
        {"loc": "/catalog", "priority": "0.9", "changefreq": "daily"},
        {"loc": "/about", "priority": "0.7", "changefreq": "monthly"},
        {"loc": "/services", "priority": "0.7", "changefreq": "monthly"},
    ]

    for page in static_pages:
        urls.append(f"""  <url>
    <loc>{SITE_URL}{page['loc']}</loc>
    <changefreq>{page['changefreq']}</changefreq>
    <priority>{page['priority']}</priority>
  </url>""")

    # Categories
    try:
        categories = await db.categories.find({}, {"_id": 0}).to_list(500)
        for cat in categories:
            slug = cat.get('slug', '')
            if slug:
                urls.append(f"""  <url>
    <loc>{SITE_URL}/catalog/{slug}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>""")

                # Subcategories
                for sub in cat.get('subcategories', []):
                    sub_slug = sub.get('slug', '')
                    if sub_slug:
                        urls.append(f"""  <url>
    <loc>{SITE_URL}/catalog/{slug}/{sub_slug}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>""")

                        # Third level categories
                        for child in sub.get('children', []):
                            child_slug = child.get('slug', '')
                            if child_slug:
                                urls.append(f"""  <url>
    <loc>{SITE_URL}/catalog/{slug}/{sub_slug}/{child_slug}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.6</priority>
  </url>""")
    except Exception:
        pass

    # Products
    try:
        products = await db.products.find({}, {"_id": 0, "slug": 1, "updated_at": 1}).to_list(5000)
        for product in products:
            slug = product.get('slug', '')
            if slug:
                lastmod = ""
                updated = product.get('updated_at')
                if updated:
                    if isinstance(updated, datetime):
                        lastmod = f"\n    <lastmod>{updated.strftime('%Y-%m-%d')}</lastmod>"
                    elif isinstance(updated, str):
                        lastmod = f"\n    <lastmod>{updated[:10]}</lastmod>"

                urls.append(f"""  <url>
    <loc>{SITE_URL}/product/{slug}</loc>{lastmod}
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>""")
    except Exception:
        pass

    xml = f"""<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
{chr(10).join(urls)}
</urlset>"""

    return Response(content=xml, media_type="application/xml")
