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

    // Product reviews section
    this.reviewsSection = "div.product-reviews";
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

    await this.page.fill(this.quantityInput, "");
    await this.page.fill(this.quantityInput, quantity.toString());
  }

  async addToCart() {
    const buttonExists = await this.page.locator(this.addToCartButton).count();
    if (buttonExists === 0) {
      throw new Error(`Add to cart button not found: ${this.addToCartButton}`);
    }

    const buttonText = await this.page.textContent(this.addToCartButton);

    // Check if product is already in cart
    if (buttonText?.toLowerCase().includes("remove from bag")) {
      throw new Error("Product already in cart");
    }

    await this.page.click(this.addToCartButton);
    await this.page
      .waitForLoadState("networkidle", { timeout: 5000 })
      .catch(() => {});
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
}
