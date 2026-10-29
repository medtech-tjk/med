import { sanitizeDescription } from './sanitize';

test('product descriptions keep formatting and remove executable content', () => {
  const result = sanitizeDescription('<p><strong>Device</strong></p><img src="x" onerror="alert(1)"><script>alert(1)</script><a href="javascript:alert(1)">link</a>');
  expect(result).toContain('<strong>Device</strong>');
  expect(result).not.toMatch(/onerror|<script|javascript:/i);
  expect(result).toContain('<img src="x" alt="">');
});
