// src/pages/CartPage.js
// Page Object for Cart sidebar/overlay
// Based on: mern-ecommerce/client/app/containers/Cart/index.js
//           mern-ecommerce/client/app/components/Store/Checkout/index.js

export default class CartPage {
  constructor(page, base) {
    this.page = page;
    this.base = base;

    // Cart sidebar/overlay selectors (based on Cart/index.js)
    this.cartOverlay = "div.cart";
    this.cartHeader = "div.cart-header";
    this.cartBody = "div.cart-body";
    this.cartItem = "div.cart-item, div.item-box";
    this.emptyCart = "div.empty-cart";
    this.emptyCartMessage = "div.empty-cart p";

    // Cart checkout section (based on Cart/index.js)
    this.cartCheckout = "div.cart-checkout";
    this.cartSummary = "div.cart-summary";
    this.cartTotal = "div.cart-total, p.cart-total";

    // Checkout buttons (based on Checkout/index.js and Button/index.js)
    // Buttons are rendered with class 'custom-btn-primary' and text in span.btn-text
    this.checkoutButtons = "div.easy-checkout button.custom-btn-primary";

    // Navigation cart icon (based on CartIcon/index.js)
    // CartIcon is a Button with span.cart-icon inside
    this.cartIcon = "span.cart-icon";

    // Order success page (based on OrderSuccess/index.js)
    this.orderSuccessPage = "div.order-success";
    this.orderSuccessMessage = "div.order-message";
    this.orderSuccessTitle = "div.order-message h2"; // "Thank you for your order."
    this.orderLabel = "a.order-label"; // Link with order ID
  }

  // Wait for cart to be open (usually auto-opens after adding to cart)
  async waitForCartOpen(timeoutMs = 5000) {
    console.log("⏳ Waiting for cart sidebar to open...");

    try {
      await this.page.waitForSelector(this.cartOverlay, {
        timeout: timeoutMs,
        state: "visible",
      });
      console.log("✅ Cart sidebar is open");
      return true;
    } catch (error) {
      console.log("⚠️ Cart sidebar did not open automatically");
      return false;
    }
  }

  async isCartOpen() {
    try {
      const cartVisible = await this.page.locator(this.cartOverlay).isVisible();
      return cartVisible;
    } catch {
      return false;
    }
  }

  // Open cart sidebar by clicking cart icon in navigation (fallback if not auto-opened)
  async openCart() {
    console.log("🛒 Opening cart sidebar...");

    // First check if cart is already open
    const isOpen = await this.isCartOpen();
    if (isOpen) {
      console.log("ℹ️ Cart is already open");
      return;
    }

    // Try to find and click cart icon
    const cartIconExists = await this.page.locator(this.cartIcon).count();
    if (cartIconExists === 0) {
      throw new Error(`Cart icon not found with selector: ${this.cartIcon}`);
    }

    await this.page.click(this.cartIcon);
    await this.page.waitForTimeout(500); // Wait for cart sidebar animation

    // Wait for cart overlay to be visible
    await this.page.waitForSelector(this.cartOverlay, {
      timeout: 5000,
      state: "visible",
    });

    console.log("✅ Cart sidebar opened");
  }

  async isCartEmpty() {
    const emptyCartExists = await this.page.locator(this.emptyCart).count();
    return emptyCartExists > 0;
  }

  async getCartItemsCount() {
    const itemsCount = await this.page.locator(this.cartItem).count();
    console.log(`📦 Cart items count: ${itemsCount}`);
    return itemsCount;
  }

  async getCartTotal() {
    const totalExists = await this.page.locator(this.cartTotal).count();
    if (totalExists === 0) {
      console.log("⚠️ Cart total not found");
      return null;
    }

    const total = await this.page.textContent(this.cartTotal);
    console.log(`💰 Cart total: ${total}`);
    return total;
  }

  // Place order (for authenticated users)
  // This will trigger placeOrder action -> addOrder -> redirect to /order/success/:id
  async placeOrder() {
    // Get all buttons in easy-checkout
    // There are 2 buttons: "Continue shopping" and "Place Order"
    const buttons = await this.page.locator(this.checkoutButtons).all();

    if (buttons.length < 2) {
      throw new Error(
        `Place order button not found. Found ${buttons.length} buttons in checkout`
      );
    }

    // Click the second button (Place Order)
    console.log("🛒 Clicking Place Order button...");
    await buttons[1].click();

    // Wait for navigation to order success page
    await this.page.waitForLoadState("domcontentloaded", { timeout: 10000 });
    await this.page.waitForTimeout(1000); // Additional wait for page to render

    console.log("✅ Place Order clicked");
  }

  // Assert order was placed successfully by checking URL and page content
  async assertOrderSuccess(timeoutMs = 10000) {
    const start = Date.now();
    while (Date.now() - start < timeoutMs) {
      // Check if we're on order success page
      const url = this.page.url();
      if (url.includes("/order/success/")) {
        // Also verify the success message exists
        const messageExists = await this.page
          .locator(this.orderSuccessMessage)
          .count();
        if (messageExists > 0) {
          console.log(`✅ Order success page loaded: ${url}`);
          return;
        }
      }

      await this.page.waitForTimeout(100);
    }

    throw new Error(
      `Order success not confirmed within ${timeoutMs}ms. Current URL: ${this.page.url()}`
    );
  }

  // Get order ID from success page
  // Example: "#6910b3455bf952b080609844" -> "6910b3455bf952b080609844"
  async getOrderId() {
    await this.page.waitForSelector(this.orderLabel, { timeout: 5000 });
    const orderLinkText = await this.page.textContent(this.orderLabel);

    // Extract order ID from text like "#6910b3455bf952b080609844"
    const orderId = orderLinkText?.replace("#", "").trim();
    console.log(`📦 Order ID: ${orderId}`);

    return orderId;
  }

  // Get order success message
  async getSuccessMessage() {
    await this.page.waitForSelector(this.orderSuccessTitle, { timeout: 5000 });
    const title = await this.page.textContent(this.orderSuccessTitle);
    console.log(`✅ Success message: ${title}`);
    return title;
  }

  // Get order success message
  async getSuccessMessage() {
    await this.page.waitForSelector(this.orderSuccessTitle, { timeout: 5000 });
    const title = await this.page.textContent(this.orderSuccessTitle);
    console.log(`✅ Success message: ${title}`);
    return title;
  }

  // Remove item from cart (if needed for testing)
  async removeItem(itemIndex = 0) {
    const removeButtons = await this.page
      .locator("button.remove-from-cart, button:contains('Remove')")
      .all();
    if (removeButtons.length > itemIndex) {
      await removeButtons[itemIndex].click();
      await this.page.waitForTimeout(500);
      console.log(`🗑️ Removed item ${itemIndex} from cart`);
    }
  }
}
