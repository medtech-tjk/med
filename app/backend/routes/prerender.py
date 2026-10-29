"""
Prerender middleware for SEO bots.
When a search engine bot (Googlebot, Bingbot, etc.) visits a page,
this middleware returns a fully rendered HTML page with all meta tags,
JSON-LD structured data, and visible text content.
Regular users get the normal React SPA.
"""

from fastapi import APIRouter, Request, Response
from database import db, client
from dotenv import load_dotenv
from pathlib import Path
import os
import re
import html

ROOT_DIR = Path(__file__).parent.parent
load_dotenv(ROOT_DIR / '.env')

router = APIRouter(prefix="/prerender", tags=["Prerender"])

# MongoDB connection

SITE_URL = os.environ.get('SITE_URL', 'https://medtech.tj').rstrip('/')
FRONTEND_URL = os.environ.get('FRONTEND_URL', SITE_URL).rstrip('/')

# Bot user agents to detect
BOT_USER_AGENTS = [
    'googlebot', 'bingbot', 'slurp', 'duckduckbot', 'baiduspider',
    'yandexbot', 'sogou', 'facebot', 'ia_archiver', 'twitterbot',
    'linkedinbot', 'embedly', 'quora link preview', 'showyoubot',
    'outbrain', 'pinterest', 'applebot', 'semrushbot', 'ahrefsbot',
    'mj12bot', 'rogerbot', 'dotbot', 'petalbot', 'seznambot',
    'developers.google.com', 'google-structured-data-testing-tool',
    'chrome-lighthouse', 'google page speed'
]


def is_bot(user_agent: str) -> bool:
    """Check if the request is from a search engine bot."""
    if not user_agent:
        return False
    ua_lower = user_agent.lower()
    return any(bot in ua_lower for bot in BOT_USER_AGENTS)


def escape(text: str) -> str:
    """HTML escape text."""
    if not text:
        return ''
    return html.escape(str(text))


def strip_html(text: str) -> str:
    """Remove HTML tags from text."""
    if not text:
        return ''
    return re.sub(r'<[^>]*>?', '', str(text))


def build_base_html(title: str, description: str, canonical: str, 
                     og_image: str = '', body_content: str = '',
                     json_ld: str = '', breadcrumb_ld: str = '') -> str:
    """Build a complete HTML page for bots with SEO content."""
    # JSON strings can contain a literal closing script tag from product content.
    json_ld = json_ld.replace('<', '\\u003c').replace('>', '\\u003e').replace('&', '\\u0026')
    breadcrumb_ld = breadcrumb_ld.replace('<', '\\u003c').replace('>', '\\u003e').replace('&', '\\u0026')
    og_image = og_image or f'{SITE_URL}/og-image.png'
    return f"""<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>{escape(title)}</title>
    <meta name="description" content="{escape(description)}">
    <meta name="robots" content="index, follow">
    <link rel="canonical" href="{escape(canonical)}">
    <link rel="icon" type="image/png" sizes="96x96" href="{SITE_URL}/favicon-96x96.png">
    <link rel="shortcut icon" href="{SITE_URL}/favicon.ico">
    <link rel="apple-touch-icon" sizes="180x180" href="{SITE_URL}/apple-touch-icon.png">
    
    <!-- Open Graph -->
    <meta property="og:type" content="website">
    <meta property="og:title" content="{escape(title)}">
    <meta property="og:description" content="{escape(description)}">
    <meta property="og:url" content="{escape(canonical)}">
    {f'<meta property="og:image" content="{escape(og_image)}">' if og_image else ''}
    <meta property="og:site_name" content="Tib Technology">
    <meta property="og:locale" content="ru_RU">
    
    <!-- Twitter -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="{escape(title)}">
    <meta name="twitter:description" content="{escape(description)}">
    {f'<meta name="twitter:image" content="{escape(og_image)}">' if og_image else ''}
    
    {f'<script type="application/ld+json">{json_ld}</script>' if json_ld else ''}
    {f'<script type="application/ld+json">{breadcrumb_ld}</script>' if breadcrumb_ld else ''}
</head>
<body>
    <header>
        <h1><a href="{SITE_URL}/">Tib Technology — Медицинское оборудование</a></h1>
        <nav>
            <a href="{SITE_URL}/catalog">Каталог</a>
            <a href="{SITE_URL}/about">О нас</a>
            <a href="{SITE_URL}/services">Услуги</a>
        </nav>
    </header>
    <main>
        {body_content}
    </main>
    <footer>
        <p>© Tib Technology — Магазин медицинского оборудования в Душанбе, Таджикистан</p>
        <p>Телефон: +992 93 333 96 39 | Email: tjkmedtech@gmail.com</p>
        <p>Душанбе, улица Академика Акобира Адхамова, 11/5</p>
        <p>Пн-Пт: 9:00-18:00</p>
    </footer>
</body>
</html>"""


def get_image_url(image_path: str) -> str:
    """Get full image URL."""
    if not image_path:
        return ''
    if image_path.startswith('http'):
        return image_path
    return f"{SITE_URL}{image_path}"


import json


@router.get("/product/{slug}")
async def prerender_product(slug: str, request: Request):
    """Prerender product page for bots."""
    product = await db.products.find_one({"slug": slug}, {"_id": 0})
    if not product:
        return Response(content="Not found", status_code=404)

    name = product.get('name', '')
    desc_raw = product.get('description', '')
    desc_clean = strip_html(desc_raw)[:160] if desc_raw else f"{name} — купить медицинское оборудование в Таджикистане. Tib Technology, Душанбе."
    title = f"{name} — купить в Душанбе | Tib Technology"
    canonical = f"{SITE_URL}/product/{slug}"
    main_image = get_image_url(product.get('main_image', ''))
    price = product.get('price', 0)
    brand = product.get('brand', '')
    in_stock = product.get('in_stock', True)
    sku = product.get('sku', product.get('id', ''))

    # JSON-LD Product
    structured_data = {
        "@context": "https://schema.org",
        "@type": "Product",
        "name": name,
        "description": desc_clean,
        "image": main_image,
        "sku": sku,
    }
    if not product.get('price_on_request') and isinstance(price, (int, float)) and price > 0:
        structured_data['offers'] = {
            "@type": "Offer", "url": canonical, "priceCurrency": "TJS", "price": price,
            "availability": "https://schema.org/InStock" if in_stock else "https://schema.org/OutOfStock",
            "seller": {"@type": "Organization", "name": "Tib Technology"}
        }
    if brand:
        structured_data["brand"] = {"@type": "Brand", "name": brand}

    # Breadcrumb JSON-LD
    breadcrumb_items = [
        {"@type": "ListItem", "position": 1, "name": "Главная", "item": f"{SITE_URL}/"},
        {"@type": "ListItem", "position": 2, "name": "Каталог", "item": f"{SITE_URL}/catalog"},
        {"@type": "ListItem", "position": 3, "name": name}
    ]
    breadcrumb_ld = json.dumps({
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": breadcrumb_items
    }, ensure_ascii=False)

    # Build specs HTML
    specs_html = ''
    specs = product.get('specs', {})
    if specs:
        specs_rows = ''.join(
            f'<tr><td>{escape(k)}</td><td>{escape(str(v))}</td></tr>'
            for k, v in specs.items()
        )
        specs_html = f'<h2>Характеристики</h2><table>{specs_rows}</table>'

    # Body content
    body = f"""
    <article itemscope itemtype="https://schema.org/Product">
        <nav aria-label="breadcrumb">
            <a href="{SITE_URL}/">Главная</a> /
            <a href="{SITE_URL}/catalog">Каталог</a> /
            <span>{escape(name)}</span>
        </nav>
        
        <h1 itemprop="name">{escape(name)}</h1>
        
        {f'<p>Бренд: <span itemprop="brand">{escape(brand)}</span></p>' if brand else ''}
        {f'<p>Артикул: <span itemprop="sku">{escape(sku)}</span></p>' if sku else ''}
        
        {f'<img src="{escape(main_image)}" alt="{escape(name)}" itemprop="image">' if main_image else ''}
        
        <div itemprop="offers" itemscope itemtype="https://schema.org/Offer">
            <p>Цена: <span itemprop="price" content="{price}">{price}</span> 
               <span itemprop="priceCurrency" content="TJS">TJS</span></p>
            <p>Наличие: <link itemprop="availability" href="{'https://schema.org/InStock' if in_stock else 'https://schema.org/OutOfStock'}" />
               {'В наличии' if in_stock else 'Под заказ'}</p>
        </div>
        
        <div itemprop="description">
            {desc_raw if desc_raw else f'<p>{escape(name)} — купить медицинское оборудование в Таджикистане.</p>'}
        </div>
        
        {specs_html}
        
        <p><a href="tel:+992933339639">Позвонить: +992 93 333 96 39</a></p>
    </article>
    """

    html_content = build_base_html(
        title=title,
        description=desc_clean,
        canonical=canonical,
        og_image=main_image,
        body_content=body,
        json_ld=json.dumps(structured_data, ensure_ascii=False),
        breadcrumb_ld=breadcrumb_ld
    )

    return Response(content=html_content, media_type="text/html")


@router.get("/catalog")
async def prerender_catalog(request: Request):
    """Prerender catalog page for bots."""

    categories = await db.categories.find({}, {"_id": 0}).sort("order", 1).to_list(100)
    
    # Get subcategories
    for cat in categories:
        subs = await db.subcategories.find(
            {"parent_id": cat['id']}, {"_id": 0}
        ).sort("order", 1).to_list(100)
        cat['subcategories'] = subs

    title = "Каталог медицинского оборудования — Tib Technology, Душанбе"
    desc = "Каталог медицинского оборудования от ведущих мировых производителей. УЗИ аппараты, эндоскопы, хирургическое оборудование. Доставка по Таджикистану."
    canonical = f"{SITE_URL}/catalog"

    # Build categories HTML
    cats_html = ''
    for cat in categories:
        cat_name = cat.get('name', '')
        cat_slug = cat.get('slug', '')
        subs_html = ''
        for sub in cat.get('subcategories', []):
            sub_name = sub.get('name', '')
            sub_slug = sub.get('slug', '')
            subs_html += f'<li><a href="{SITE_URL}/catalog/{cat_slug}/{sub_slug}">{escape(sub_name)}</a></li>\n'
        
        cats_html += f"""
        <section>
            <h2><a href="{SITE_URL}/catalog/{cat_slug}">{escape(cat_name)}</a></h2>
            {f'<ul>{subs_html}</ul>' if subs_html else ''}
        </section>
        """

    # Organization JSON-LD
    org_ld = json.dumps({
        "@context": "https://schema.org",
        "@type": "MedicalBusiness",
        "name": "Tib Technology",
        "url": SITE_URL,
        "logo": f"{SITE_URL}/logo512.png",
        "telephone": "+992933339639",
        "email": "tjkmedtech@gmail.com",
        "address": {
            "@type": "PostalAddress",
            "streetAddress": "улица Академика Акобира Адхамова, 11/5",
            "addressLocality": "Душанбе",
            "addressCountry": "TJ"
        },
        "description": desc
    }, ensure_ascii=False)

    body = f"""
    <h1>Каталог медицинского оборудования</h1>
    <p>Профессиональное медицинское оборудование от ведущих мировых производителей. 
       Доставка по всему Таджикистану.</p>
    {cats_html}
    """

    html_content = build_base_html(
        title=title, description=desc, canonical=canonical,
        body_content=body, json_ld=org_ld
    )

    return Response(content=html_content, media_type="text/html")


@router.get("/catalog/{category_slug}")
async def prerender_category(category_slug: str, request: Request):
    """Prerender category page for bots."""
    # Find category
    category = await db.categories.find_one({"slug": category_slug}, {"_id": 0})
    if not category:
        return Response(content="Not found", status_code=404)

    cat_name = category.get('name', '')
    cat_desc = strip_html(category.get('description', ''))
    title = f"{cat_name} — купить в Душанбе | Tib Technology"
    desc = cat_desc[:160] if cat_desc else f"{cat_name} — медицинское оборудование. Купить в Tib Technology, Душанбе."
    canonical = f"{SITE_URL}/catalog/{category_slug}"

    # Get subcategories
    subs = await db.subcategories.find(
        {"parent_id": category['id']}, {"_id": 0}
    ).sort("order", 1).to_list(100)

    # Get products
    products = await db.products.find(
        {"category_id": category['id']}, {"_id": 0}
    ).limit(50).to_list(50)

    subs_html = ''
    for sub in subs:
        subs_html += f'<li><a href="{SITE_URL}/catalog/{category_slug}/{sub.get("slug", "")}">{escape(sub.get("name", ""))}</a></li>\n'

    products_html = ''
    for p in products:
        p_name = p.get('name', '')
        p_slug = p.get('slug', '')
        p_price = p.get('price', 0)
        p_brand = p.get('brand', '')
        p_img = get_image_url(p.get('main_image', ''))
        products_html += f"""
        <li>
            <a href="{SITE_URL}/product/{p_slug}">
                {f'<img src="{escape(p_img)}" alt="{escape(p_name)}" width="200">' if p_img else ''}
                <h3>{escape(p_name)}</h3>
            </a>
            {f'<p>Бренд: {escape(p_brand)}</p>' if p_brand else ''}
            <p>Цена: от {p_price} TJS</p>
        </li>
        """

    breadcrumb_ld = json.dumps({
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
            {"@type": "ListItem", "position": 1, "name": "Главная", "item": f"{SITE_URL}/"},
            {"@type": "ListItem", "position": 2, "name": "Каталог", "item": f"{SITE_URL}/catalog"},
            {"@type": "ListItem", "position": 3, "name": cat_name}
        ]
    }, ensure_ascii=False)

    body = f"""
    <nav aria-label="breadcrumb">
        <a href="{SITE_URL}/">Главная</a> /
        <a href="{SITE_URL}/catalog">Каталог</a> /
        <span>{escape(cat_name)}</span>
    </nav>
    <h1>{escape(cat_name)}</h1>
    {f'<p>{escape(cat_desc)}</p>' if cat_desc else ''}
    
    {f'<h2>Подкатегории</h2><ul>{subs_html}</ul>' if subs_html else ''}
    
    <h2>Товары ({len(products)})</h2>
    <ul>{products_html}</ul>
    """

    html_content = build_base_html(
        title=title, description=desc, canonical=canonical,
        body_content=body, breadcrumb_ld=breadcrumb_ld
    )

    return Response(content=html_content, media_type="text/html")


@router.get("/catalog/{category_slug}/{subcategory_slug}")
async def prerender_subcategory(category_slug: str, subcategory_slug: str, request: Request):
    """Prerender subcategory page for bots."""
    category = await db.categories.find_one({"slug": category_slug}, {"_id": 0})
    if not category:
        return Response(content="Not found", status_code=404)

    sub = await db.subcategories.find_one(
        {"slug": subcategory_slug, "parent_id": category['id']}, {"_id": 0}
    )
    if not sub:
        return Response(content="Not found", status_code=404)

    cat_name = category.get('name', '')
    sub_name = sub.get('name', '')
    sub_desc = strip_html(sub.get('description', ''))
    title = f"{sub_name} — {cat_name} | Tib Technology"
    desc = sub_desc[:160] if sub_desc else f"{sub_name} — купить в Tib Technology, Душанбе. Медицинское оборудование."
    canonical = f"{SITE_URL}/catalog/{category_slug}/{subcategory_slug}"

    # Get products
    products = await db.products.find(
        {"subcategory_id": sub['id']}, {"_id": 0}
    ).limit(50).to_list(50)

    products_html = ''
    for p in products:
        p_name = p.get('name', '')
        p_slug = p.get('slug', '')
        p_price = p.get('price', 0)
        p_brand = p.get('brand', '')
        p_img = get_image_url(p.get('main_image', ''))
        products_html += f"""
        <li>
            <a href="{SITE_URL}/product/{p_slug}">
                {f'<img src="{escape(p_img)}" alt="{escape(p_name)}" width="200">' if p_img else ''}
                <h3>{escape(p_name)}</h3>
            </a>
            {f'<p>Бренд: {escape(p_brand)}</p>' if p_brand else ''}
            <p>Цена: от {p_price} TJS</p>
        </li>
        """

    breadcrumb_ld = json.dumps({
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
            {"@type": "ListItem", "position": 1, "name": "Главная", "item": f"{SITE_URL}/"},
            {"@type": "ListItem", "position": 2, "name": "Каталог", "item": f"{SITE_URL}/catalog"},
            {"@type": "ListItem", "position": 3, "name": cat_name, "item": f"{SITE_URL}/catalog/{category_slug}"},
            {"@type": "ListItem", "position": 4, "name": sub_name}
        ]
    }, ensure_ascii=False)

    body = f"""
    <nav aria-label="breadcrumb">
        <a href="{SITE_URL}/">Главная</a> /
        <a href="{SITE_URL}/catalog">Каталог</a> /
        <a href="{SITE_URL}/catalog/{category_slug}">{escape(cat_name)}</a> /
        <span>{escape(sub_name)}</span>
    </nav>
    <h1>{escape(sub_name)}</h1>
    {f'<p>{escape(sub_desc)}</p>' if sub_desc else ''}
    
    <h2>Товары ({len(products)})</h2>
    <ul>{products_html}</ul>
    """

    html_content = build_base_html(
        title=title, description=desc, canonical=canonical,
        body_content=body, breadcrumb_ld=breadcrumb_ld
    )

    return Response(content=html_content, media_type="text/html")


@router.get("/")
async def prerender_home(request: Request):
    """Prerender home page for bots."""

    title = "Tib Technology — Купить медицинское оборудование в Душанбе | УЗИ, эндоскопы, рентген"
    desc = "ООО «Тиб Технология» - Магазин современного медицинского оборудования в Душанбе, Таджикистане. УЗИ аппараты, эндоскопы, хирургическое оборудование от Fujifilm, Mindray, Samsung."
    canonical = f"{SITE_URL}/"

    # Get categories
    categories = await db.categories.find({}, {"_id": 0}).sort("order", 1).to_list(100)
    
    # Get popular products
    popular = await db.products.find(
        {"is_popular": True}, {"_id": 0}
    ).limit(12).to_list(12)

    cats_html = ''
    for cat in categories:
        cats_html += f'<li><a href="{SITE_URL}/catalog/{cat.get("slug", "")}">{escape(cat.get("name", ""))}</a></li>\n'

    products_html = ''
    for p in popular:
        p_name = p.get('name', '')
        p_slug = p.get('slug', '')
        p_price = p.get('price', 0)
        p_img = get_image_url(p.get('main_image', ''))
        products_html += f"""
        <li>
            <a href="{SITE_URL}/product/{p_slug}">
                {f'<img src="{escape(p_img)}" alt="{escape(p_name)}" width="200">' if p_img else ''}
                <h3>{escape(p_name)}</h3>
            </a>
            <p>Цена: от {p_price} TJS</p>
        </li>
        """

    # Organization + WebSite JSON-LD
    org_ld = json.dumps({
        "@context": "https://schema.org",
        "@graph": [
            {
                "@type": "Organization",
                "name": "Tib Technology",
                "alternateName": "ООО «Тиб Технология»",
                "url": SITE_URL,
                "logo": f"{SITE_URL}/logo512.png",
                "telephone": "+992933339639",
                "email": "tjkmedtech@gmail.com",
                "address": {
                    "@type": "PostalAddress",
                    "streetAddress": "улица Академика Акобира Адхамова, 11/5",
            "addressLocality": "Душанбе",
                    "addressCountry": "TJ"
                },
                "description": desc
            },
            {
                "@type": "WebSite",
                "name": "Tib Technology",
                "url": SITE_URL,
                "potentialAction": {
                    "@type": "SearchAction",
                    "target": f"{SITE_URL}/catalog?search={{search_term_string}}",
                    "query-input": "required name=search_term_string"
                }
            }
        ]
    }, ensure_ascii=False)

    body = f"""
    <h1>Tib Technology — Медицинское оборудование в Душанбе</h1>
    <p>Профессиональное медицинское оборудование от ведущих мировых производителей.
       Доставка по всему Таджикистану.</p>
    
    <h2>Категории</h2>
    <ul>{cats_html}</ul>
    
    <h2>Популярные товары</h2>
    <ul>{products_html}</ul>
    
    <section>
        <h2>Почему мы?</h2>
        <ul>
            <li>Качественное оборудование — только проверенные бренды и производители</li>
            <li>Быстрая доставка — доставка по всему Таджикистану в кратчайшие сроки</li>
            <li>Поддержка 24/7 — квалифицированная помощь в любое время</li>
        </ul>
    </section>
    
    <section>
        <h2>Контакты</h2>
        <p>Телефон: <a href="tel:+992933339639">+992 93 333 96 39</a></p>
        <p>Email: <a href="mailto:tjkmedtech@gmail.com">tjkmedtech@gmail.com</a></p>
        <p>Адрес: Душанбе, Таджикистан</p>
    </section>
    """

    html_content = build_base_html(
        title=title, description=desc, canonical=canonical,
        body_content=body, json_ld=org_ld
    )

    return Response(content=html_content, media_type="text/html")
