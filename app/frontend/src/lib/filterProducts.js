export function matchesSpecification(product, key, selected, language = 'ru') {
  const values = Array.isArray(selected) ? selected : selected ? [selected] : [];
  if (!values.length) return true;
  const brand = /^(бренд|brand)$/i.test(key);
  const localized = language === 'en' ? product.specs_en : product.specs;
  const actual = brand ? product.brand : localized?.[key] ?? product.specs?.[key] ?? product[key];
  if (actual === undefined || actual === null) return false;
  const actualValues = (Array.isArray(actual) ? actual : [actual]).map(value=>String(value).trim().toLocaleLowerCase());
  return values.some(value=>actualValues.includes(String(value).trim().toLocaleLowerCase()));
}
