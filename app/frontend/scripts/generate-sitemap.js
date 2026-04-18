/**
 * Генерация sitemap.xml при сборке приложения
 * Запускать: node scripts/generate-sitemap.js
 * 
 * Этот скрипт подтягивает все товары и категории из API бэкенда
 * и генерирует статический sitemap.xml в папку build/
 */

const fs = require('fs');
const path = require('path');

const SITE_URL = process.env.SITE_URL || 'https://medtech.tj';
const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || '';

async function generateSitemap() {
  console.log('Generating sitemap.xml...');
  console.log('SITE_URL:', SITE_URL);
  console.log('BACKEND_URL:', BACKEND_URL);

  const urls = [];

  // Static pages
  const staticPages = [
    { loc: '/', priority: '1.0', changefreq: 'daily' },
    { loc: '/catalog', priority: '0.9', changefreq: 'daily' },
    { loc: '/about', priority: '0.7', changefreq: 'monthly' },
    { loc: '/services', priority: '0.7', changefreq: 'monthly' },
  ];

  staticPages.forEach(page => {
    urls.push(`  <url>
    <loc>${SITE_URL}${page.loc}</loc>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`);
  });

  // Fetch categories from API
  if (BACKEND_URL) {
    try {
      const catResponse = await fetch(`${BACKEND_URL}/api/categories/`);
      if (catResponse.ok) {
        const categories = await catResponse.json();
        categories.forEach(cat => {
          if (cat.slug) {
            urls.push(`  <url>
    <loc>${SITE_URL}/catalog/${cat.slug}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`);

            // Subcategories
            (cat.subcategories || []).forEach(sub => {
              if (sub.slug) {
                urls.push(`  <url>
    <loc>${SITE_URL}/catalog/${cat.slug}/${sub.slug}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`);

                // Third level
                (sub.children || []).forEach(child => {
                  if (child.slug) {
                    urls.push(`  <url>
    <loc>${SITE_URL}/catalog/${cat.slug}/${sub.slug}/${child.slug}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.6</priority>
  </url>`);
                  }
                });
              }
            });
          }
        });
        console.log(`Found ${categories.length} categories`);
      }
    } catch (err) {
      console.warn('Warning: Could not fetch categories:', err.message);
    }

    // Fetch products from API
    try {
      const prodResponse = await fetch(`${BACKEND_URL}/api/products/?limit=5000`);
      if (prodResponse.ok) {
        const products = await prodResponse.json();
        products.forEach(product => {
          if (product.slug) {
            urls.push(`  <url>
    <loc>${SITE_URL}/product/${product.slug}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`);
          }
        });
        console.log(`Found ${products.length} products`);
      }
    } catch (err) {
      console.warn('Warning: Could not fetch products:', err.message);
    }
  } else {
    console.warn('Warning: REACT_APP_BACKEND_URL not set, generating sitemap with static pages only');
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('\n')}
</urlset>`;

  // Write to build directory
  const buildDir = path.join(__dirname, '..', 'build');
  if (!fs.existsSync(buildDir)) {
    fs.mkdirSync(buildDir, { recursive: true });
  }
  
  const outputPath = path.join(buildDir, 'sitemap.xml');
  fs.writeFileSync(outputPath, xml, 'utf8');
  console.log(`Sitemap generated: ${outputPath} (${urls.length} URLs)`);
}

generateSitemap().catch(err => {
  console.error('Error generating sitemap:', err);
  process.exit(1);
});
