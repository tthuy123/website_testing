// src/pages/ProductDetailPage.js
export default class ProductDetailPage {
  constructor(page, base) {
    this.page = page;
    this.base = base;

    // Selectors for product detail page
    this.productContainer = "div.product-shop";
    this.productImage = "img.item-image";
    this.productName = "h1.item-name";
    this.productSku = "p.sku";
    this.productPrice = "p.price";
    this.productDescription = "p.item-desc";
    this.stockStatus = "p.stock";
    this.brandLink = "a.default-link";

    // Quantity input and add to cart
    this.quantityInput = 'input[name="quantity"]';
    this.addToCartButton = "button.bag-btn";

    // Product reviews section - based on ProductReviews/Add.js
    this.reviewsSection = "div.product-reviews";
    this.addReviewForm = "div.add-review"; // Form is always visible
    this.reviewTitleInput = 'input[name="title"]';
    this.reviewTextarea = 'textarea[name="review"]';
    this.reviewRatingStars = "div.add-review div.input-box i.fa-star"; // Star icons in rating component wrapped in input-box
    this.reviewIsRecommendedSelect = 'select[name="isRecommended"]';
    this.submitReviewButton = 'button[type="submit"]';
    this.reviewItem = "div.review-item, div.review-box";
    this.successMessage = "div.success-message, div.alert-success";
  }

  async gotoProduct(productSlug) {
    await this.page.goto(`${this.base}/product/${productSlug}`, {
      waitUntil: "domcontentloaded",
    });
    await this.page.waitForSelector(this.productContainer, { timeout: 10000 });
  }

  async getProductInfo() {
    // Wait for product to load
    await this.page.waitForSelector(this.productName, { timeout: 5000 });

    // Extract product information
    const name = await this.page.textContent(this.productName);
    const sku = await this.page.textContent(this.productSku);
    const price = await this.page.textContent(this.productPrice);
    const description = await this.page.textContent(this.productDescription);
    const stockStatus = await this.page.textContent(this.stockStatus);

    return {
      name: name?.trim(),
      sku: sku?.trim(),
      price: price?.trim(),
      description: description?.trim(),
      inStock: stockStatus?.toLowerCase().includes("in stock"),
    };
  }

  async isProductImageVisible() {
    const imageCount = await this.page.locator(this.productImage).count();
    if (imageCount === 0) return false;

    return await this.page.locator(this.productImage).isVisible();
  }

  async changeQuantity(quantity) {
    const quantityExists = await this.page.locator(this.quantityInput).count();
    if (quantityExists === 0) {
      throw new Error(`Quantity input not found: ${this.quantityInput}`);
    }

    // Select all and type new value (more reliable than clear)
    await this.page.click(this.quantityInput, { clickCount: 3 }); // Triple click to select all
    await this.page.keyboard.type(quantity.toString());
    console.log(`✏️ Set quantity to: ${quantity}`);
  }

  async addToCart() {
    // Wait for button to be visible and enabled
    await this.page.waitForSelector(this.addToCartButton, {
      state: "visible",
      timeout: 10000,
    });

    const buttonText = await this.page.textContent(this.addToCartButton);

    // Check if product is already in cart
    if (buttonText?.toLowerCase().includes("remove from bag")) {
      console.log("⚠️ Product already in cart, skipping add");
      return;
    }

    console.log(`🛒 Clicking "Add To Bag" button...`);
    await this.page.click(this.addToCartButton);

    // Wait a bit for cart action to process
    await this.page.waitForTimeout(1000);
    console.log("✅ Add to cart clicked");
  }

  async assertProductLoaded(timeoutMs = 10000) {
    const start = Date.now();
    while (Date.now() - start < timeoutMs) {
      const nameExists = await this.page.locator(this.productName).count();
      const priceExists = await this.page.locator(this.productPrice).count();

      if (nameExists > 0 && priceExists > 0) {
        return; // PASS - product loaded
      }

      await this.page.waitForTimeout(100);
    }
    throw new Error(
      `Product detail did not load within ${timeoutMs}ms. URL: ${this.page.url()}`
    );
  }

  async assertAddedToCart(timeoutMs = 5000) {
    const start = Date.now();
    while (Date.now() - start < timeoutMs) {
      const buttonText = await this.page.textContent(this.addToCartButton);

      // After adding to cart, button text should change to "Remove From Bag"
      if (buttonText?.toLowerCase().includes("remove from bag")) {
        return; // PASS - added to cart successfully
      }

      await this.page.waitForTimeout(100);
    }
    throw new Error(
      `Product was not added to cart within ${timeoutMs}ms. Button text: ${await this.page.textContent(
        this.addToCartButton
      )}`
    );
  }

  async getBrandName() {
    const brandExists = await this.page.locator(this.brandLink).count();
    if (brandExists === 0) return null;

    return await this.page.textContent(this.brandLink);
  }

  async clickBrandLink() {
    const brandExists = await this.page.locator(this.brandLink).count();
    if (brandExists === 0) {
      throw new Error("Brand link not found");
    }

    await this.page.click(this.brandLink);
    await this.page.waitForLoadState("domcontentloaded");
  }

  // ============ REVIEW METHODS ============

  async scrollToReviewSection() {
    const sectionExists = await this.page.locator(this.reviewsSection).count();
    if (sectionExists > 0) {
      await this.page.evaluate((selector) => {
        const element = document.querySelector(selector);
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }, this.reviewsSection);
      await this.page.waitForTimeout(500);
      console.log("📜 Scrolled to review section");
    }
  }

  async fillReviewForm(reviewData) {
    const { title, review, rating } = reviewData;

    // Wait for form to be visible
    await this.page.waitForSelector(this.addReviewForm, { timeout: 5000 });

    // Fill title
    await this.page.fill(this.reviewTitleInput, title);
    console.log(`✏️ Filled title: ${title}`);

    // Fill review text
    await this.page.fill(this.reviewTextarea, review);
    console.log(`✏️ Filled review text`);

    // Select rating using ReactStars - click on the star
    // Rating is 1-5, click on the nth star
    const stars = await this.page.locator(this.reviewRatingStars).all();
    if (stars.length >= rating) {
      await stars[rating - 1].click();
      console.log(`⭐ Selected rating: ${rating} stars`);
    }

    // Note: isRecommended uses react-select which is complex to automate
    // Skip it for now as it's not required field
    console.log(`ℹ️ Skipping isRecommended field (react-select component)`);
  }

  async submitReview() {
    const buttonExists = await this.page
      .locator(this.submitReviewButton)
      .count();
    if (buttonExists === 0) {
      throw new Error(
        `Submit review button not found: ${this.submitReviewButton}`
      );
    }

    await this.page.click(this.submitReviewButton);
    await this.page
      .waitForLoadState("networkidle", { timeout: 5000 })
      .catch(() => {});
    await this.page.waitForTimeout(1000);
  }

  async assertReviewSubmitted(timeoutMs = 10000) {
    const start = Date.now();
    while (Date.now() - start < timeoutMs) {
      // Check for notification (react-notification-system-redux)
      const notificationExists = await this.page
        .locator(".notification, .notifications-tr")
        .count();
      if (notificationExists > 0) {
        console.log("✅ Review submitted successfully (notification appeared)");
        return; // PASS
      }

      // Check if form was reset (title input is empty)
      const titleValue = await this.page.inputValue(this.reviewTitleInput);
      if (titleValue === "") {
        console.log("✅ Review submitted successfully (form was reset)");
        return; // PASS - form was reset
      }

      await this.page.waitForTimeout(100);
    }
    throw new Error(
      `Review submission not confirmed within ${timeoutMs}ms. URL: ${this.page.url()}`
    );
  }

  async getReviewsCount() {
    const reviewsCount = await this.page.locator(this.reviewItem).count();
    return reviewsCount;
  }
}
