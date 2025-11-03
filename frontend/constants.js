export const BASE = __ENV.BASE_URL || 'http://localhost:8080/';

// Dùng chung để selector ổn định; có thể update sau
export const TEST_IDS = {
  searchInput: 'input[type="search"], input[placeholder*="Search" i]',
  productCard: 'a[href*="/product"], a:has(img), [data-testid*="product"]',
  addToCart: 'button:has-text("Add to cart"), button:has-text("Add"), [data-testid="add-to-cart"]',
  cartLink: 'a:has-text("Cart"), a[href*="cart"], [data-testid="cart-link"]',
  cartItem: '[data-testid*="cart-item"], .cart-item',
  checkoutBtn: 'button:has-text("Checkout"), a:has-text("Checkout")',
};
