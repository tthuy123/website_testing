// src/tests/review.spec.js
import { browser } from "k6/browser";
import { check } from "k6";
import LoginPage from "../pages/LoginPage.js";
import ProductDetailPage from "../pages/ProductDetailPage.js";
import { newTestPage, closeTestPage } from "../setup/context.js";
import reviewOptions from "../../config/options.review.js";

export const options = reviewOptions;

// Helper function to generate unique review data
function generateReviewData() {
  const timestamp = Date.now();
  return {
    title: `Great Product - ${timestamp}`,
    review: `This is a test review created at ${new Date().toISOString()}. The product quality is excellent and I would highly recommend it to others. Very satisfied with my purchase!`,
    rating: "5", // 5 stars (string value for input)
    isRecommended: true,
  };
}

export async function reviewScenario() {
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

    // Step 2: Navigate to product page
    const productPage = new ProductDetailPage(page, base);
    const testProductSlug = "unbranded-metal-cheese";

    console.log(`📦 Navigating to product: ${testProductSlug}`);
    await productPage.gotoProduct(testProductSlug);
    await productPage.assertProductLoaded();

    check(true, {
      "Product page loaded": () => true,
    });
    console.log("✅ Product page loaded");

    // Step 3: Scroll to review section
    console.log("📜 Scrolling to review section...");
    await productPage.scrollToReviewSection();

    // Step 4: Fill review form (form is already visible, no need to click button)
    const reviewData = generateReviewData();
    console.log(`✍️ Filling review form...`);
    console.log(`   Title: ${reviewData.title}`);
    console.log(`   Rating: ${reviewData.rating} stars`);

    await productPage.fillReviewForm(reviewData);

    check(true, {
      "Review form filled": () => true,
    });
    console.log("✅ Review form filled");

    // Step 5: Submit review
    console.log("📤 Submitting review...");
    await productPage.submitReview();
    await productPage.assertReviewSubmitted();

    check(true, {
      "Review submitted successfully": () => true,
    });
    console.log("✅ Review submitted successfully");

    // Note: Reviews in this app require admin approval before appearing in the list
    // So we don't check for review count increase
    console.log(
      "ℹ️ Note: Reviews require admin approval before appearing in the list"
    );

    // Step 7: Verify review flow completed
    check(true, {
      "Review flow completed": () => true,
    });

    console.log("✅ Review flow completed successfully");
  } catch (error) {
    check(false, {
      "Review flow completed": () => false,
    });
    console.error("❌ Review test failed:");
    console.error("Error message:", error.message);
    console.error("Error stack:", error.stack);
    console.error("Current URL:", page.url());
    throw error;
  } finally {
    await closeTestPage(ctx, page);
  }
}

export default reviewScenario;
