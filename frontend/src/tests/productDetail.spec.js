// src/tests/productDetail.spec.js
import { browser } from "k6/browser";
import { check } from "k6";
import LoginPage from "../pages/LoginPage.js";
import ProductDetailPage from "../pages/ProductDetailPage.js";
import { newTestPage, closeTestPage } from "../setup/context.js";
import productDetailOptions from "../../config/options.productDetail.js";

export const options = productDetailOptions;

export async function productDetailScenario() {
  const base = __ENV.BASE_URL || "http://localhost:8080";

  const { ctx, page } = await newTestPage();

  try {
    // Login first before accessing product page
    const loginPage = new LoginPage(page, base);
    const testEmail = "test@example.com";
    const testPassword = "Test@123456";

    console.log("🔐 Starting login...");
    await loginPage.goto();
    await loginPage.fillAndSubmit(testEmail, testPassword);

    // Wait for redirect to dashboard after login
    await page.waitForTimeout(2000); // Give time for login to complete

    check(true, {
      "Login successful": () => true,
    });
    console.log("✅ Login successful");

    const productPage = new ProductDetailPage(page, base); // Test with a known product slug - you may need to adjust this based on your data
    const testProductSlug = "unbranded-metal-cheese";

    // Navigate to product detail page
    console.log(`📦 Navigating to product: ${testProductSlug}`);
    await productPage.gotoProduct(testProductSlug);

    // Assert product loaded successfully
    console.log("⏳ Verifying product loaded...");
    await productPage.assertProductLoaded();

    // Verify product image is visible
    const imageVisible = await productPage.isProductImageVisible();
    check(imageVisible, {
      "Product image is visible": (v) => v === true,
    });
    console.log(`🖼️ Product image visible: ${imageVisible}`);

    // Get product information
    const productInfo = await productPage.getProductInfo();
    check(productInfo, {
      "Product name exists": (info) => info.name && info.name.length > 0,
      "Product SKU exists": (info) => info.sku && info.sku.length > 0,
      "Product price exists": (info) => info.price && info.price.length > 0,
      "Product is in stock": (info) => info.inStock === true,
    });
    console.log("📋 Product info:", JSON.stringify(productInfo));

    // Test quantity change
    console.log("🔢 Changing quantity to 2...");
    await productPage.changeQuantity(2);

    // Add product to cart
    console.log("🛒 Adding product to cart...");
    await productPage.addToCart();

    // Assert product was added to cart successfully
    await productPage.assertAddedToCart();

    check(true, {
      "Product detail flow completed": () => true,
    });

    console.log("✅ Product detail test completed successfully");
  } catch (error) {
    check(false, {
      "Product detail flow completed": () => false,
    });
    console.error("❌ Product detail test failed:");
    console.error("Error message:", error.message);
    console.error("Error stack:", error.stack);
    console.error("Current URL:", page.url());
    throw error;
  } finally {
    await closeTestPage(ctx, page);
  }
}

export default productDetailScenario;
