import { readCart, cartQuantity } from './cart';

test('invalid saved carts recover without crashing', () => {
  for (const value of ['broken', '{}', 'null', '[null,1]']) {
    localStorage.setItem('cart', value);
    expect(readCart()).toEqual([]);
  }
});

test('cart badge counts units and handles legacy quantities', () => {
  expect(cartQuantity([{id:'a',quantity:3},{id:'b'},{id:'c',quantity:'2'}])).toBe(6);
});
