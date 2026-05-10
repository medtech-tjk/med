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
    """Generate dynamic sitemap.xml with only pages that have actual content.
    Empty categories/subcategories are excluded to avoid thin content issues."""

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

    # ================================================================
    # First: load ALL products to determine which categories have content
    # ================================================================
    products = []
    try:
        products = await db.products.find(
            {},
            {"_id": 0, "slug": 1, "updated_at": 1, "category_id": 1,
             "subcategory_id": 1, "third_level_id": 1}
        ).to_list(10000)
    except Exception as e:
        logger.error(f"[Sitemap] Error loading products: {e}")

    # Build sets of IDs that actually have products
    cat_ids_with_products = set()
    sub_ids_with_products = set()
    third_ids_with_products = set()

    for p in products:
        cat_id = p.get('category_id')
        sub_id = p.get('subcategory_id')
        third_id = p.get('third_level_id')
        if cat_id:
            cat_ids_with_products.add(cat_id)
        if sub_id:
            sub_ids_with_products.add(sub_id)
        if third_id:
            third_ids_with_products.add(third_id)

    logger.info(f"[Sitemap] Categories with products: {len(cat_ids_with_products)}, "
                f"subcategories: {len(sub_ids_with_products)}, "
                f"third-level: {len(third_ids_with_products)}")

    # ================================================================
    # Categories — only include those that have at least one product
    # ================================================================
    try:
        categories = await db.categories.find({}, {"_id": 0}).to_list(500)
        cat_slug_map = {}  # category_id -> category_slug (for ALL categories)
        cats_in_sitemap = 0

        for cat in categories:
            slug = cat.get('slug', '')
            cat_id = cat.get('id', '')
            if slug and cat_id:
                cat_slug_map[cat_id] = slug  # Always build the map for URL resolution
                # Only add to sitemap if category has products
                if cat_id in cat_ids_with_products:
                    lastmod = format_lastmod(cat.get('updated_at'))
                    urls.append(f"""  <url>
    <loc>{SITE_URL}/catalog/{slug}</loc>{lastmod}
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>""")
                    cats_in_sitemap += 1

        # Subcategories — only include those with products
        subcategories = await db.subcategories.find({}, {"_id": 0}).to_list(2000)
        sub_slug_map = {}  # sub_id -> (cat_slug, sub_slug) for ALL
        subs_in_sitemap = 0

        for sub in subcategories:
            sub_slug = sub.get('slug', '')
            sub_id = sub.get('id', '')
            parent_id = sub.get('parent_id', '')
            cat_slug = cat_slug_map.get(parent_id, '')
            if sub_slug and cat_slug:
                sub_slug_map[sub_id] = (cat_slug, sub_slug)
                if sub_id in sub_ids_with_products:
                    lastmod = format_lastmod(sub.get('updated_at'))
                    urls.append(f"""  <url>
    <loc>{SITE_URL}/catalog/{cat_slug}/{sub_slug}</loc>{lastmod}
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>""")
                    subs_in_sitemap += 1

        # Third level — only include those with products
        third_levels = await db.third_level_categories.find({}, {"_id": 0}).to_list(5000)
        thirds_in_sitemap = 0

        for child in third_levels:
            child_slug = child.get('slug', '')
            child_id = child.get('id', '')
            parent_id = child.get('parent_id', '')
            parent_info = sub_slug_map.get(parent_id)
            if child_slug and parent_info and child_id in third_ids_with_products:
                cat_slug, sub_slug = parent_info
                lastmod = format_lastmod(child.get('updated_at'))
                urls.append(f"""  <url>
    <loc>{SITE_URL}/catalog/{cat_slug}/{sub_slug}/{child_slug}</loc>{lastmod}
    <changefreq>weekly</changefreq>
    <priority>0.6</priority>
  </url>""")
                thirds_in_sitemap += 1

        logger.info(f"[Sitemap] Included in sitemap: {cats_in_sitemap}/{len(categories)} categories, "
                    f"{subs_in_sitemap}/{len(subcategories)} subcategories, "
                    f"{thirds_in_sitemap}/{len(third_levels)} third-level")
    except Exception as e:
        logger.error(f"[Sitemap] Error loading categories: {e}")

    # Products
    for product in products:
        slug = product.get('slug', '')
        if slug:
            lastmod = format_lastmod(product.get('updated_at'))
            urls.append(f"""  <url>
    <loc>{SITE_URL}/product/{slug}</loc>{lastmod}
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>""")

    logger.info(f"[Sitemap] Total URLs in sitemap: {len(urls)} "
                f"(was ~213 before filtering)")

    xml = f"""<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
{chr(10).join(urls)}
</urlset>"""

    return Response(content=xml, media_type="application/xml")
