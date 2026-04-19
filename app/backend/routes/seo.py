from fastapi import APIRouter
from fastapi.responses import Response
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
from pathlib import Path
import os
import logging
from datetime import datetime, timezone

ROOT_DIR = Path(__file__).parent.parent
load_dotenv(ROOT_DIR / '.env')

logger = logging.getLogger(__name__)

router = APIRouter(tags=["SEO"])

# MongoDB connection
mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ.get('DB_NAME', 'test_database')]

SITE_URL = os.environ.get('SITE_URL', 'https://medtech.tj').rstrip('/')


def format_lastmod(updated) -> str:
    """Format lastmod date for sitemap XML"""
    if not updated:
        return ""
    if isinstance(updated, datetime):
        return f"\n    <lastmod>{updated.strftime('%Y-%m-%d')}</lastmod>"
    elif isinstance(updated, str) and len(updated) >= 10:
        return f"\n    <lastmod>{updated[:10]}</lastmod>"
    return ""


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

    # Categories, subcategories, and third-level categories
    # NOTE: These are stored in SEPARATE collections, not nested in the category document
    try:
        categories = await db.categories.find({}, {"_id": 0}).to_list(500)
        # Build a lookup: category_id -> category_slug
        cat_slug_map = {}
        for cat in categories:
            slug = cat.get('slug', '')
            cat_id = cat.get('id', '')
            if slug and cat_id:
                cat_slug_map[cat_id] = slug
                lastmod = format_lastmod(cat.get('updated_at'))
                urls.append(f"""  <url>
    <loc>{SITE_URL}/catalog/{slug}</loc>{lastmod}
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>""")

        # Subcategories (separate collection)
        subcategories = await db.subcategories.find({}, {"_id": 0}).to_list(2000)
        sub_slug_map = {}  # sub_id -> (cat_slug, sub_slug)
        for sub in subcategories:
            sub_slug = sub.get('slug', '')
            sub_id = sub.get('id', '')
            parent_id = sub.get('parent_id', '')
            cat_slug = cat_slug_map.get(parent_id, '')
            if sub_slug and cat_slug:
                sub_slug_map[sub_id] = (cat_slug, sub_slug)
                lastmod = format_lastmod(sub.get('updated_at'))
                urls.append(f"""  <url>
    <loc>{SITE_URL}/catalog/{cat_slug}/{sub_slug}</loc>{lastmod}
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>""")

        # Third level categories (separate collection)
        third_levels = await db.third_level_categories.find({}, {"_id": 0}).to_list(5000)
        for child in third_levels:
            child_slug = child.get('slug', '')
            parent_id = child.get('parent_id', '')
            parent_info = sub_slug_map.get(parent_id)
            if child_slug and parent_info:
                cat_slug, sub_slug = parent_info
                lastmod = format_lastmod(child.get('updated_at'))
                urls.append(f"""  <url>
    <loc>{SITE_URL}/catalog/{cat_slug}/{sub_slug}/{child_slug}</loc>{lastmod}
    <changefreq>weekly</changefreq>
    <priority>0.6</priority>
  </url>""")

        logger.info(f"[Sitemap] Generated {len(categories)} categories, {len(subcategories)} subcategories, {len(third_levels)} third-level")
    except Exception as e:
        logger.error(f"[Sitemap] Error loading categories: {e}")

    # Products
    try:
        products = await db.products.find(
            {},
            {"_id": 0, "slug": 1, "updated_at": 1, "main_image": 1, "name": 1}
        ).to_list(10000)

        for product in products:
            slug = product.get('slug', '')
            if slug:
                lastmod = format_lastmod(product.get('updated_at'))
                urls.append(f"""  <url>
    <loc>{SITE_URL}/product/{slug}</loc>{lastmod}
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>""")

        logger.info(f"[Sitemap] Generated {len(products)} product URLs")
    except Exception as e:
        logger.error(f"[Sitemap] Error loading products: {e}")

    logger.info(f"[Sitemap] Total URLs in sitemap: {len(urls)}")

    xml = f"""<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
{chr(10).join(urls)}
</urlset>"""

    return Response(content=xml, media_type="application/xml")
