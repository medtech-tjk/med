import DOMPurify from 'dompurify';

export const sanitizeDescription = html => {
  const clean = DOMPurify.sanitize(html || '', { USE_PROFILES: { html: true } });
  // Content images without authored alternatives are treated as decorative.
  const template = document.createElement('template');
  template.innerHTML = clean;
  template.content.querySelectorAll('img:not([alt])').forEach(image => image.setAttribute('alt', ''));
  return template.innerHTML;
};
