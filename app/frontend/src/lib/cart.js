// A corrupt or older saved cart must never prevent the storefront from opening.
export function readCart() {
  try {
    const value = JSON.parse(localStorage.getItem('cart') || '[]');
    return Array.isArray(value) ? value.filter(item => item && typeof item === 'object' && item.id) : [];
  } catch {
    return [];
  }
}

export function cartQuantity(items) {
  return items.reduce((sum, item) => sum + (Number.isFinite(Number(item.quantity)) && Number(item.quantity) > 0 ? Math.floor(Number(item.quantity)) : 1), 0);
}
