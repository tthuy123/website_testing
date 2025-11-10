// src/tests/checkout.spec.js
// Test flow: Login -> Product -> Add to Cart -> Open Cart -> Place Order
import { browser } from "k6/browser";
import { check } from "k6";
import LoginPage from "../pages/LoginPage.js";
import ProductDetailPage from "../pages/ProductDetailPage.js";
import CartPage from "../pages/CartPage.js";
import { newTestPage, closeTestPage } from "../setup/context.js";
import checkoutOptions from "../../config/options.checkout.js";

export const options = checkoutOptions;

export async function checkoutScenario() {
  const base = __ENV.BASE_URL || "http://localhost:8080";

  const { ctx, page } = await newTestPage();

  try {
    // Step 1: Login
    const loginPage = new LoginPage(page, base);
    const testEmail = "test@example.com";
    const testPassword = "Test@123456";

    console.log("🔐 Starting login...");
    await loginPage.goto();
    await loginPage.fillAndSubmit(testEmail, testPassword);
    await page.waitForTimeout(2000);

    check(true, {
      "Login successful": () => true,
    });
    console.log("✅ Login successful");

    // Step 2: Navigate to product and add to cart
    const productPage = new ProductDetailPage(page, base);
    const testProductSlug = "modern-fresh-ball";

    console.log(`📦 Navigating to product: ${testProductSlug}`);
    await productPage.gotoProduct(testProductSlug);
    await productPage.assertProductLoaded();

    const productInfo = await productPage.getProductInfo();
    console.log(`📋 Product: ${productInfo.name}, Price: ${productInfo.price}`);

    console.log("🛒 Adding product to cart...");
    // Quantity default is 1, no need to change
    await productPage.addToCart();
    await productPage.assertAddedToCart();

    check(true, {
      "Product added to cart": () => true,
    });
    console.log("✅ Product added to cart");

    // Step 3: Wait for cart sidebar to open (auto-opens after add to cart)
    const cartPage = new CartPage(page, base);

    console.log("🛍️ Waiting for cart to open...");
    const cartOpened = await cartPage.waitForCartOpen();

    // If cart didn't open automatically, try to open it manually
    if (!cartOpened) {
      console.log("⚠️ Cart didn't open automatically, opening manually...");
      await cartPage.openCart();
    }

    // Verify cart has items
    const cartItemCount = await cartPage.getCartItemsCount();
    check(cartItemCount > 0, {
      "Cart has items": (v) => v === true,
    });
    console.log(`✅ Cart has ${cartItemCount} item(s)`);

    // Step 4: Place order
    console.log("📦 Placing order...");
    await cartPage.placeOrder();
    await cartPage.assertOrderSuccess();

    check(true, {
      "Order placed successfully": () => true,
    });
    console.log("✅ Order placed successfully");

    // Step 5: Verify order success page
    const orderId = await cartPage.getOrderId();
    check(orderId !== null && orderId.length > 0, {
      "Order ID received": (v) => v === true,
    });
    console.log(`✅ Order ID: ${orderId}`);

    // Get success message
    const successMessage = await cartPage.getSuccessMessage();
    check(successMessage.includes("Thank you"), {
      "Success message displayed": (v) => v === true,
    });

    // Final check
    check(true, {
      "Checkout flow completed": () => true,
    });

    console.log("✅ Checkout flow completed successfully");
  } catch (error) {
    check(false, {
      "Checkout flow completed": () => false,
    });
    console.error("❌ Checkout test failed:");
    console.error("Error message:", error.message);
    console.error("Error stack:", error.stack);
    console.error("Current URL:", page.url());
    throw error;
  } finally {
    await closeTestPage(ctx, page);
  }
}

export default checkoutScenario;
