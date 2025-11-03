import { browser } from 'k6/browser';
import HomePage from '../pages/HomePage.js';
import { options as smokeOptions } from '../../config/options.smoke.js';
export const options = smokeOptions;

const BASE_URL = __ENV.BASE_URL || 'http://localhost:8080';

export async function homeScenario() {
  const ctx = await browser.newContext({});
  const page = await ctx.newPage();
  const home = new HomePage(page, BASE_URL);

  try {
    // 1. Mở trang chủ
    console.log('Step 1: Mở trang chủ');
    await home.goto();

    // 2. Test luồng Welcome > Login
    console.log('Step 2: Test Welcome > Login');
    await home.openWelcomeDropdown();
    const loginUrl = await home.clickLoginInDropdown();
    console.log('  -> URL sau khi click Login:', loginUrl);
    if (!loginUrl.includes('/login')) {
      throw new Error('Lỗi: Không điều hướng đến /login');
    }

    // 3. Quay lại Home & Test Search (ĐÃ CẬP NHẬT HOÀN TOÀN)
    console.log('Step 3: Test Search Autosuggest');
    await home.goto(); // Quay lại trang chủ
    
    const searchKeyword = 'sho'; 
    const suggestionToClick = 'Sleek Plastic Shoes'; 
    
    const productUrl = await home.searchAndSelectSuggestion(searchKeyword, suggestionToClick);
    
    console.log(`  -> Gõ '${searchKeyword}', click '${suggestionToClick}'. URL mới:`, productUrl);

    const expectedUrlPart = '/product/sleek-plastic-shoes'; 
    if (!productUrl.includes(expectedUrlPart)) {
      throw new Error(`Lỗi: URL (${productUrl}) không phải trang sản phẩm mong đợi (${expectedUrlPart})`);
    }

    // 4. Quay lại Home & Test link "Shop"
    console.log('Step 4: Test link "Shop"');
    await home.goto(); // Quay lại trang chủ
    const shopUrl = await home.goToShop();
    console.log('  -> URL sau khi click Shop:', shopUrl);
    if (!shopUrl.includes('/shop')) {
      throw new Error('Lỗi: Không điều hướng đến /shop');
    }

    // 5. Quay lại Home & Test "Shop by Category"
    console.log('Step 5: Test Shop by Category');
    await home.goto(); // Quay lại trang chủ
    const menuTitle = await home.getCategoryMenuTitle();
    console.log('  -> Tiêu đề menu:', menuTitle);
    if (menuTitle !== 'Shop By Category') {
        throw new Error('Lỗi: Tiêu đề Category Menu không đúng');
    }
    
    const categoryUrl = await home.clickCategoryLink('Games');
    console.log('  -> URL sau khi click "Games":', categoryUrl);
    if (!categoryUrl.includes('/shop/category/games')) { 
        throw new Error('Lỗi: Không điều hướng đến trang category "Games"');
    }

    // 6. Quay lại Home & Test "Brands" dropdown
    console.log('Step 6: Test Brands Dropdown');
    await home.goto(); // Quay lại trang chủ
    await home.openBrandsDropdown();
    const brandUrl = await home.clickBrand('Sawayn Group');
    console.log('  -> URL sau khi click "Sawayn Group":', brandUrl);
    // SỬA 5: Check URL brand (thường là query param)
    if (!brandUrl.includes('sawayn-group')) { 
        throw new Error('Lỗi: Không điều hướng đến trang brand "Sawayn Group"');
    }

    // 7. Quay lại Home & Test mở giỏ hàng
    console.log('Step 7: Test mở giỏ hàng');
    await home.goto(); // Quay lại trang chủ
    await home.openCart();
    console.log('  -> Mở giỏ hàng thành công');

    console.log('--- Kịch bản Home Smoke Test HOÀN TẤT ---');

  } catch (err) {
    console.error(`Lỗi trong kịch bản home: ${err.message}`);
    throw err;
  } finally {
    try { await page.close(); } catch (e) { console.error('Lỗi khi đóng page:', e.message); }
    try { await ctx.close(); } catch (e) { console.error('Lỗi khi đóng context:', e.message); }
  }
}

