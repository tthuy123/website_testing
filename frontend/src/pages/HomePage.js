

export default class HomePage {
  constructor(page, baseUrl) {
    this.page = page;
    this.baseUrl = baseUrl;

    // header wrapper
    this.headerContainer = 'header.header.fixed-mobile-header';

    // ô search
    this.searchInput = `${this.headerContainer} input.react-autosuggest__input`;
    this.suggestionsList = 'div.react-autosuggest__suggestions-container--open'; 

    // start
    // menu button
    this.menuButton = `${this.headerContainer} button.d-none.d-md-block[aria-label="open the menu"]`;
    // Container của menu "Shop by Category" (sau khi click menuButton)
    this.categoryMenuContainer = `div.navigation-menu`;
    // Title "SHOP BY CATEGORY"
    this.categoryMenuTitle = `${this.categoryMenuContainer} h3.menu-title.text-uppercase`;
    // List các category links
    this.categoryMenuList = `${this.categoryMenuContainer} ul.menu-list`;
    // end

    // start
    // cart button
    this.cartButton = `${this.headerContainer} nav button[aria-label="your cart is empty"]`;
    this.closeCartButton = `button[aria-label="close the cart"]`;
    // end

    // brands dropdown menu
   // this.brandsDropdownButton = `${this.headerContainer} button[aria-label=""]`;
    this.brandsDropdownMenu = `div.nav-brand-dropdown.dropdown-menu.show`;


   // Menu "Welcome"
    this.dropdownMenu = `.dropdown-menu[role="menu"]:not(.nav-brand-dropdown)`;
    // Item "Login" bên trong menu "Welcome"
    this.dropdownItem = `${this.dropdownMenu} button.dropdown-item[role="menuitem"]`;

    // link "Shop" trong navbar
    this.shopLink = `${this.headerContainer} a.nav-link[href="/shop"]`;
  }

  // Mở trang home
  async goto() {
    await this.page.goto(`${this.baseUrl}/`, { waitUntil: 'domcontentloaded' });
    // chờ header render
    await this.page.waitForSelector(this.headerContainer, { timeout: 10000 });
    await this.page.waitForSelector(this.searchInput, { timeout: 10000 });
  }

  // Click link "Shop" để điều hướng sang trang /shop
  async goToShop() {
    await this.page.click(this.shopLink);
    // đợi chuyển trang
    await this.page.waitForLoadState('domcontentloaded');
    return this.page.url();
  }

  // Mở dropdown "Welcome!" trên header
  async openWelcomeDropdown() {
    await this.page.evaluate((headerSel) => {
      const header = document.querySelector(headerSel);
      if (!header) return;
      
      const links = header.querySelectorAll('a.nav-link');
      for (const link of links) {
        // Dùng startsWith('Welcome') vì nó có thể là "Welcome!"
        if (link.textContent && link.textContent.trim().startsWith('Welcome')) {
          link.click();
          break;
        }
      }
    }, this.headerContainer);

    await this.page.waitForSelector(`${this.dropdownMenu}.show[aria-hidden="false"]`, { state: 'visible', timeout: 5000 });
  }

  // Trong dropdown vừa mở, click Login
 async clickLoginInDropdown() {
    await this.page.evaluate((menuSel) => {
      const menu = document.querySelector(menuSel);
      if (!menu) return;
      const items = menu.querySelectorAll('button.dropdown-item[role="menuitem"]');
      for (const btn of items) {
        if (btn.textContent && btn.textContent.trim() === 'Login') {
          btn.click();
          break;
        }
      }
    }, this.dropdownMenu);

    await this.page.waitForLoadState('domcontentloaded');
    return this.page.url(); 
  }

  // Search: nhập query vào ô search và "submit"
    async searchAndSelectSuggestion(keyword, suggestionText) {
    // 1. Gõ từ khóa vào ô search
    await this.page.fill(this.searchInput, keyword);
    
    // 2. Chờ danh sách đề xuất xuất hiện
    await this.page.waitForSelector(this.suggestionsList, { state: 'visible', timeout: 5000 });

    // 3. Dùng locator để click
    const suggestionItem = this.page.locator(
      `${this.suggestionsList} li[role="option"]`,
      { hasText: suggestionText }
    );
    await suggestionItem.waitFor({ state: 'visible', timeout: 3000 });

    try {
      // Ưu tiên click vào thẻ <a> bên trong <li>
      const link = suggestionItem.locator('a');
      await link.click({ timeout: 3000 });
      console.log('Clicked <a> tag inside suggestion');
    } catch (err) {
      // Nếu không có thẻ <a>, click thẳng vào <li>
      console.warn('Could not click <a> tag, trying <li> fallback...');
      await suggestionItem.click({ timeout: 3000 });
      console.log('Clicked <li> tag as fallback');
    }

    try {
      await this.page.waitForSelector('img.item-image', { 
        state: 'visible', 
        timeout: 7000 
      });
      console.log('Trang sản phẩm đã tải (thấy img.item-image).');
      
    } catch (err) {
      console.error('Lỗi: Không thấy element trang sản phẩm (img.item-image). URL hiện tại: ' + this.page.url());
      throw new Error('Chờ trang sản phẩm thất bại sau khi click đề xuất.');
    }

    return this.page.url();
  }


 // Lấy text của title "SHOP BY CATEGORY"
  async getCategoryMenuTitle() {
    await this.openCategoryMenu();
    const title = await this.page.textContent(this.categoryMenuTitle);
    console.log('title', title);
    return title ? title.trim() : null;
  }
  // Mở menu "Shop by Category"
  async openCategoryMenu() {
    try {
      await this.page.waitForSelector(this.menuButton, { state: 'visible', timeout: 5000 });
      
      const menuButtonLocator = this.page.locator(this.menuButton);
      await menuButtonLocator.click({ timeout: 3000 });
      
    } catch (err) {
      console.error(`Lỗi khi click menuButton (openCategoryMenu): ${err}`);
      throw new Error(`Không thể click menu button: ${err}`);
    }
    
    // 3. Chờ menu category xuất hiện
    await this.page.waitForSelector(`${this.categoryMenuContainer}`, { state: 'visible', timeout: 5000 });
  }
  // Click vào một link category bằng text
  async clickCategoryLink(categoryName) {
   // await this.openCategoryMenu();
    await this.page.evaluate(({ menuListSel, name }) => {
      const menuList = document.querySelector(menuListSel);
      if (!menuList) return;
      
      const links = menuList.querySelectorAll('a');
      for (const link of links) {
        if (link.textContent && link.textContent.trim() === name) {
          link.click();
          break;
        }
      }
    }, { menuListSel: this.categoryMenuList, name: categoryName });

    await this.page.waitForLoadState('domcontentloaded');
    return this.page.url(); 
  }

async openBrandsDropdown() {
  const brandLinkLocator = this.page.getByRole('link', { name: /brands/i });
  const menuSelector = 'div.nav-brand-dropdown.dropdown-menu';
  const menuLocator = this.page.locator(menuSelector);

  console.log('DEBUG: Hover vào link "Brands" để mở dropdown...');
  await brandLinkLocator.hover({ timeout: 3000 }).catch(() => {});
  await this.page.waitForTimeout(300); // Giữ hover một chút

  console.log('DEBUG: Click link "Brands" (force) để đảm bảo menu mở)...');
  await brandLinkLocator.click({ force: true, timeout: 5000 });

  // Giữ hover tiếp để menu không auto-hide
  await brandLinkLocator.hover({ timeout: 3000 });
  await this.page.waitForTimeout(300);

  // Bước 1: chờ menu xuất hiện trong DOM
  console.log(`DEBUG: Chờ menu "${menuSelector}" attached...`);
  await this.page.waitForSelector(menuSelector, { state: 'attached', timeout: 10000 });
  await this.page.screenshot({ path: 'debug_menu_attached.png' });

  // Bước 2: ép hiển thị menu (tránh bị CSS display:none)
  await this.page.evaluate((sel) => {
    const el = document.querySelector(sel);
    if (el) {
      el.style.display = 'block';
      el.style.opacity = '1';
      el.style.visibility = 'visible';
    }
  }, menuSelector);

  // Bước 3: kiểm tra visible thật sự (sau khi ép hiển thị)
  console.log('DEBUG: Xác nhận menu visible...');
  await menuLocator.waitFor({ state: 'visible', timeout: 5000 });
  console.log('DEBUG: Menu visible.');
  await this.page.screenshot({ path: 'debug_menu_visible.png' });

  // Bước 4: xác nhận có ít nhất 1 item
  const firstItemLocator = this.page.locator(`${menuSelector} a.brand-link`).first();
  try {
    await firstItemLocator.waitFor({ state: 'visible', timeout: 5000 });
    console.log('DEBUG: Đã thấy item brand đầu tiên (menu hoạt động tốt).');
    await this.page.screenshot({ path: 'debug_menu_visible_item.png' });
  } catch (err) {
    console.error('Không thấy item brand nào trong menu:', err);
    await this.page.screenshot({ path: 'debug_menu_failed_item.png' });
    throw new Error('Menu "Brands" mở nhưng không có item visible.');
  }
}


  // (SỬA LỚN) Click vào một brand cụ thể
async clickBrand(brandName) {
  await this.openBrandsDropdown();

  const menuSelector = 'div.nav-brand-dropdown.dropdown-menu';
const brandLinks = this.page.locator(`${menuSelector} a.brand-link`);
  const count = await brandLinks.count();
  console.log(`DEBUG: Tìm thấy ${count} link thương hiệu trong menu.`);

  let targetLocator = null;

  for (let i = 0; i < count; i++) {
    const text = (await brandLinks.nth(i).innerText()).trim();
    console.log(`DEBUG: Kiểm tra brand #${i + 1}: "${text}"`);
    if (text.toLowerCase() === brandName.toLowerCase()) {
      targetLocator = brandLinks.nth(i);
      console.log(` Đã tìm thấy brand khớp: "${text}"`);
      break;
    }
  }

  if (!targetLocator) {
    await this.page.screenshot({ path: 'debug_brand_not_found.png' });
    throw new Error(` Không tìm thấy brand "${brandName}" trong dropdown.`);
  }

  await targetLocator.waitFor({ state: 'visible', timeout: 5000 });
  await this.page.screenshot({ path: 'debug_before_click_brand.png' });

  try {
    await targetLocator.click({ timeout: 5000 });
    console.log(`DEBUG: Click brand "${brandName}" thành công.`);
  } catch (err) {
    await this.page.screenshot({ path: 'debug_click_brand_failed.png' });
    console.error(`DEBUG: Lỗi khi click brand "${brandName}": ${err}`);
    throw new Error(`Không thể click brand "${brandName}": ${err}`);
  }

  const currentUrl = this.page.url();
  console.log(`DEBUG: Đã điều hướng tới: ${currentUrl}`);
  return currentUrl;

}


  // Mở giỏ hàng
  async openCart() {
    await this.page.click(this.cartButton);
    // Chờ giỏ hàng mở ra
    await this.page.waitForSelector(this.closeCartButton, { state: 'visible', timeout: 5000 });
  }

}
