/**
 * Custom Express server for serving the React SPA.
 * 
 * For search engine bots: proxies to the backend prerender endpoint
 * to get fully rendered HTML with meta tags, JSON-LD, and content.
 * 
 * For regular users: serves the static React build as normal SPA.
 */

const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;
const BACKEND_URL = (process.env.REACT_APP_BACKEND_URL || '').replace(/\/+$/, '');

// Bot user agents to detect
const BOT_USER_AGENTS = [
  'googlebot', 'bingbot', 'slurp', 'duckduckbot', 'baiduspider',
  'yandexbot', 'sogou', 'facebot', 'ia_archiver', 'twitterbot',
  'linkedinbot', 'embedly', 'quora link preview', 'showyoubot',
  'outbrain', 'pinterest', 'applebot', 'semrushbot', 'ahrefsbot',
  'mj12bot', 'rogerbot', 'dotbot', 'petalbot', 'seznambot',
  'developers.google.com', 'google-structured-data-testing-tool',
  'chrome-lighthouse', 'google page speed'
];

function isBot(userAgent) {
  if (!userAgent) return false;
  const ua = userAgent.toLowerCase();
  return BOT_USER_AGENTS.some(bot => ua.includes(bot));
}

// Prerender routes that should be handled by bot rendering
const PRERENDER_ROUTES = [
  /^\/$/,                                          // Home
  /^\/catalog$/,                                   // Catalog
  /^\/catalog\/[^/]+$/,                           // Category
  /^\/catalog\/[^/]+\/[^/]+$/,                    // Subcategory
  /^\/catalog\/[^/]+\/[^/]+\/[^/]+$/,             // Third level
  /^\/product\/[^/]+$/,                           // Product detail
];

function shouldPrerender(pathname) {
  return PRERENDER_ROUTES.some(pattern => pattern.test(pathname));
}

const buildPath = path.join(__dirname, 'build');

// ============================================================
// Sitemap & Robots - proxy to backend for dynamic generation
// These MUST be before static file serving to override build/ files
// ============================================================

// Proxy sitemap.xml to backend (includes all products dynamically)
app.get('/sitemap.xml', async (req, res) => {
  if (!BACKEND_URL) {
    // Fallback to static sitemap if no backend
    const staticPath = path.join(buildPath, 'sitemap.xml');
    if (fs.existsSync(staticPath)) return res.sendFile(staticPath);
    return res.status(404).send('Sitemap not found');
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);
    
    const response = await fetch(`${BACKEND_URL}/sitemap.xml`, {
      signal: controller.signal
    });
    clearTimeout(timeout);

    if (response.ok) {
      const xml = await response.text();
      console.log(`[Sitemap] Served dynamic sitemap from backend (${xml.length} bytes)`);
      return res.set('Content-Type', 'application/xml').send(xml);
    }
  } catch (err) {
    console.warn(`[Sitemap] Backend proxy failed: ${err.message}`);
  }

  // Fallback to static sitemap
  const staticPath = path.join(buildPath, 'sitemap.xml');
  if (fs.existsSync(staticPath)) {
    console.log('[Sitemap] Falling back to static sitemap');
    return res.sendFile(staticPath);
  }
  res.status(404).send('Sitemap not found');
});

// Proxy robots.txt - serve from public/ but ensure correct Sitemap URL
app.get('/robots.txt', (req, res) => {
  const robotsPath = path.join(buildPath, 'robots.txt');
  if (fs.existsSync(robotsPath)) {
    return res.type('text/plain').sendFile(robotsPath);
  }
  // Fallback if file missing
  res.type('text/plain').send(
    `User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /admin/*\nDisallow: /cart\n\nSitemap: https://medtech.tj/sitemap.xml\n`
  );
});

// Serve static files from build directory
app.use(express.static(buildPath, {
  // Don't serve index.html for missing files - we'll handle that
  index: false
}));

// Bot detection middleware for SEO-critical pages
app.use(async (req, res, next) => {
  const userAgent = req.headers['user-agent'] || '';
  
  // Only intercept for bots on prerender-able routes
  if (!isBot(userAgent) || !shouldPrerender(req.path) || !BACKEND_URL) {
    return next();
  }

  try {
    // Proxy to backend prerender endpoint
    const prerenderUrl = `${BACKEND_URL}/prerender${req.path}`;
    console.log(`[Prerender] Bot detected: ${userAgent.substring(0, 50)}... -> ${prerenderUrl}`);
    
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000); // 5s timeout
    
    const response = await fetch(prerenderUrl, {
      headers: {
        'User-Agent': userAgent,
        'Accept': 'text/html',
      },
      signal: controller.signal
    });
    
    clearTimeout(timeout);

    if (response.ok) {
      const html = await response.text();
      // Only use prerendered content if it's actually HTML
      if (html && html.includes('<!DOCTYPE html>')) {
        console.log(`[Prerender] Served prerendered HTML for: ${req.path}`);
        return res.type('html').send(html);
      }
    }
    
    // If prerender failed, fall through to SPA
    console.log(`[Prerender] Fallback to SPA for: ${req.path} (status: ${response.status})`);
    return next();
  } catch (err) {
    console.warn(`[Prerender] Error, falling back to SPA: ${err.message}`);
    return next();
  }
});

// ============================================================
// Clean up old/phantom URLs that Google indexed
// ============================================================

// Redirect /index to / (Google indexed /index which is not a valid SPA route)
app.get('/index', (req, res) => {
  console.log(`[Redirect] /index -> /`);
  res.redirect(301, '/');
});

// Redirect removed pages to appropriate alternatives
app.get('/contact', (req, res) => {
  console.log(`[Redirect] /contact -> /about`);
  res.redirect(301, '/about');
});
app.get('/news', (req, res) => {
  console.log(`[Redirect] /news -> /`);
  res.redirect(301, '/');
});

// Strip .html extension — redirect directly to FINAL clean URL (no redirect chains)
app.get('*.html', (req, res) => {
  let cleanPath = req.path.replace(/\.html$/, '');
  // Resolve old product URLs in one step: /product-foo.html -> /product/foo
  const productMatch = cleanPath.match(/^\/product-(.+)$/);
  if (productMatch) {
    cleanPath = `/product/${productMatch[1]}`;
  }
  // /index.html -> / (not /index)
  if (cleanPath === '/index') {
    cleanPath = '/';
  }
  // /contact.html -> /about
  if (cleanPath === '/contact') {
    cleanPath = '/about';
  }
  // /news.html -> /
  if (cleanPath === '/news') {
    cleanPath = '/';
  }
  console.log(`[Redirect] .html stripped: ${req.path} -> ${cleanPath}`);
  res.redirect(301, cleanPath);
});

// Redirect old product URLs: /product-diagnostic-* -> /product/diagnostic-*
app.get(/^\/product-(.+)$/, (req, res) => {
  const slug = req.params[0];
  const newUrl = `/product/${slug}`;
  console.log(`[Redirect] Old product URL: ${req.path} -> ${newUrl}`);
  res.redirect(301, newUrl);
});

// Valid SPA routes — only these should serve index.html
const VALID_SPA_ROUTES = [
  /^\/$/,
  /^\/catalog(\/.*)?$/,
  /^\/product\/[^/]+$/,
  /^\/brand\/[^/]+$/,
  /^\/cart$/,
  /^\/about$/,
  /^\/services$/,
  /^\/admin(\/.*)?$/,
];

function isValidSpaRoute(pathname) {
  return VALID_SPA_ROUTES.some(pattern => pattern.test(pathname));
}

// For valid routes, serve index.html (SPA fallback)
app.get('*', (req, res) => {
  const indexPath = path.join(buildPath, 'index.html');

  if (!isValidSpaRoute(req.path)) {
    // Unknown route — return 404 so Google doesn't index garbage URLs
    console.log(`[404] Unknown route: ${req.path}`);
    if (fs.existsSync(indexPath)) {
      return res.status(404).sendFile(indexPath);
    }
    return res.status(404).send('Page not found');
  }

  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(404).send('Build not found. Run "yarn build" first.');
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Backend URL: ${BACKEND_URL || '(not set)'}`);
  console.log(`Bot prerendering: ${BACKEND_URL ? 'ENABLED' : 'DISABLED (no BACKEND_URL)'}`);
});
