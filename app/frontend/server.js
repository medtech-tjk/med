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

// For all other routes, serve index.html (SPA fallback)
app.get('*', (req, res) => {
  const indexPath = path.join(buildPath, 'index.html');
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
