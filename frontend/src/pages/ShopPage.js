
export default class ShopPage {

  constructor(page, baseUrl) {
    this.page = page;
    this.baseUrl = baseUrl;

    // filter
    this.filterContainer = '.product-filter';
    this.priceSlider = '.product-filter .card:nth-of-type(1) .rc-slider';
    this.priceMinHandle = '.product-filter .card:nth-of-type(1) .rc-slider-handle-1';
    this.priceMaxHandle = '.product-filter .card:nth-of-type(1) .rc-slider-handle-2';
    this.ratingSlider = '.product-filter .card:nth-of-type(2) .rc-slider';
    this.ratingHandle = '.product-filter .card:nth-of-type(2) .rc-slider-handle';
    this.ratingMark3Star = 'span.rc-slider-dot:nth-child(3)';

    this.ratingMarkAny = 'div.card:nth-child(2) > div:nth-child(2) > div:nth-child(1) > div:nth-child(1) > div:nth-child(4)'; 
  
    // product list
    this.productListContainer = '.product-list';
    this.productItems = '.product-list .product-container';
    this.productName = 'h1.item-name';
    this.productPrice = 'p.price';
    this.productLink = 'a.item-link';
    this.productWishlistButton = 'label[for^="checkbox_"]';

    // toolbar & pagination
    this.toolbar = '.shop-toolbar';
    this.showingStatus = '.shop-toolbar div[class*="order-lg-1"]';
    this.sortDropdown = '.react-select__control';
    this.sortSelectedValue = '.react-select__single-value';
    
    // pagination
    this.paginationContainer = '.pagination-box';

  }


  async goto() {
    await this.page.goto(`${this.baseUrl}/shop`, { waitUntil: 'domcontentloaded' });
    // Chờ một phần tử chính của trang (ví dụ: header) để đảm bảo trang đã tải
    await this.page.waitForSelector('header.header.fixed-mobile-header', { state: 'visible', timeout: 10000 });
    await this.page.waitForTimeout(1000); // Chờ thêm 1s để chắc chắn trang ổn định
    return this.page.url();
  }


  async getDisplayedProductCount() {
    const products = this.page.locator(this.productItems);
    return products.count();
  }


  async getShowingStatusText() {
    return this.page.locator(this.showingStatus).textContent();
  }


async viewProductByName(productName) {
    const productLinkXPath = `//h1[contains(@class, 'item-name') and contains(text(), '${productName}')]/ancestor::a[1]`;
    
    // 1. Tìm trực tiếp liên kết sản phẩm
    const productLinkLocator = this.page.locator(productLinkXPath);

    await productLinkLocator.click();
    await this.page.waitForLoadState('networkidle');

    // 3. Trả về URL mới
    return this.page.url();
  }

async filterByRating(stars) {
    let selector;
    if (stars === 'Any') {
      selector = `//span[contains(@class, 'rc-slider-mark-text') and .//span[text()='Any']]`;
    } else {
      selector = `//span[contains(@class, 'rc-slider-mark-text') and .//span[text()='${stars}']]`;
    }

    // SỬA LỖI: Nhấp, SAU ĐÓ chờ mạng rảnh rỗi (networkidle)
    // Không cần Promise.all nữa vì không có "race condition"
    await this.page.locator(selector).click();
    await this.page.waitForLoadState('networkidle'); // Chờ AJAX hoàn tất
    await this.page.screenshot({ path: `debug_after_filter_rating_${stars}.png` });
    await this.page.waitForTimeout(500); // Chờ thêm 0.5s để chắc chắn trang ổn định
    return this.page.url();
  }

  async selectSortOption(optionText) {
    await this.page.locator(this.sortDropdown).click();
    // Chờ menu xuất hiện và nhấp vào tùy chọn
    const optionLocator = this.page.locator(`//*[contains(@id, 'react-select') and text()='${optionText}']`);
    await optionLocator.click();
    await this.page.waitForLoadState('networkidle'); // Chờ AJAX hoàn tất
    await this.page.screenshot({ path: `debug_after_select_sort_${optionText}.png` });
    return this.page.url();
  }

 
  async clickNextPage() {
    const selector = `//div[contains(@class, 'pagination-box')]//a[text()='next >']`;
    const nextButton = this.page.locator(selector);
    
    await nextButton.click();
    await this.page.waitForLoadState('networkidle');

    return this.page.url();
  }

  async clickPreviousPage() {
    // SỬA LỖI: Văn bản chính xác là '< previous' (dựa trên ảnh)
    const selector = `//div[contains(@class, 'pagination-box')]//a[text()='< previous']`;
    const prevButton = this.page.locator(selector);
    
    await prevButton.click();
    await this.page.waitForLoadState('networkidle');

    return this.page.url();
  }

 
  async clickPageNumber(pageNumber) {
    const selector = `//div[contains(@class, 'pagination-box')]//a[contains(@class, 'page-link') and text()='${pageNumber}']`;
    const pageLink = this.page.locator(selector);

    await pageLink.click();
    await this.page.waitForLoadState('networkidle');

    return this.page.url();
  }

  
  async getActivePageNumber() {
    const activePage = this.page.locator(`${this.paginationContainer} li.page-item.active .page-link`);
    return activePage.textContent();
  }
}