import { browser } from 'k6/browser';
import { check } from 'k6';
import ShopPage from '../pages/ShopPage.js';
import { options as smokeOptions } from '../../config/options.smoke.js';

export const options = smokeOptions;

const BASE_URL = __ENV.BASE_URL || 'http://localhost:8080';

export async function shopScenario() {
  const ctx = await browser.newContext({});
  const page = await ctx.newPage();
  const shop = new ShopPage(page, BASE_URL);

  console.log('--- Bắt đầu Kịch bản Shop Smoke Test ---');

  try {
    // 1. Mở trang Shop
    console.log('Step 1: Mở trang Shop');
    const shopUrl = await shop.goto();
    check(shopUrl, {
      '[Shop] Step 1: Đã điều hướng đến /shop': (url) => url.includes('/shop'),
    });

    // 2. Kiểm tra Pagination ban đầu
    console.log('Step 2: Kiểm tra Pagination ban đầu');
    const initialStatus = await shop.getShowingStatusText();
    const initialPage = await shop.getActivePageNumber();
    
    check(initialStatus, {
      '[Shop] Step 2: Trạng thái hiển thị đúng': (s) => s.includes('Showing: 1-10'),
    });
    check(initialPage, {
      '[Shop] Step 2: Trang active là 1': (p) => p === '1',
    });
    console.log(`  -> Trạng thái: ${initialStatus}, Trang: ${initialPage}`);

    // 3. Test Pagination (Next Page)
    console.log('Step 3: Test Pagination (Next Page)');
    await shop.clickNextPage();
    const pageAfterNext = await shop.getActivePageNumber();
    
    check(pageAfterNext, {
      '[Shop] Step 3: Đã chuyển sang trang 2': (p) => p === '2',
    });
    console.log(`  -> Trang hiện tại: ${pageAfterNext}`);

    // 4. Test Pagination (Previous Page)
    console.log('Step 4: Test Pagination (Previous Page)');
    await shop.clickPreviousPage(); 
    const pageAfterPrev = await shop.getActivePageNumber();
    
    check(pageAfterPrev, {
      '[Shop] Step 4: Đã quay lại trang 1': (p) => p === '1',
    });
    console.log(`  -> Trang hiện tại: ${pageAfterPrev}`);
    

    // 5. Test lọc theo Rating
    console.log('Step 5: Test lọc theo Rating (3 sao)');
    await shop.filterByRating(3); 
    const statusAfterFilter = await shop.getShowingStatusText();
    
    check(statusAfterFilter, {
      '[Shop] Step 5: Trạng thái vẫn hiển thị sau khi lọc': (s) => s.includes('Showing:'),
    });
    console.log(`  -> Trạng thái sau khi lọc: ${statusAfterFilter}`);
    

    await shop.filterByRating('Any');
    console.log('  -> Đã reset bộ lọc về "Any"');


    // 6. Test Sắp xếp (Sort by)
    console.log('Step 6: Test sắp xếp (Newest First)');
    const sortOption = 'Newest First';

    await shop.selectSortOption(sortOption);
    const selectedSort = await page.locator(shop.sortSelectedValue).textContent();
    
    check(selectedSort, {
      '[Shop] Step 6: Đã chọn sắp xếp đúng': (s) => s === sortOption,
    });
    console.log(`  -> Đã chọn sắp xếp: ${selectedSort}`);

  // 7. Reset trạng thái trang (goto /shop)
    console.log('Step 7: Reset trạng thái trang (goto /shop)');
    await shop.goto();
    
    // 8. Chờ cho sản phẩm mục tiêu xuất hiện
    console.log('Step 8: Chờ cho sản phẩm "Handcrafted Bronze Car" xuất hiện');
    const productName = 'Handcrafted Bronze Car';
    
    // Tạo XPath selector cho sản phẩm
    // Trong shopScenario.js
const productXPath = `//h1[contains(@class, 'item-name') and contains(text(), '${productName}')]`;
await page.waitForSelector(productXPath, { state: 'visible', timeout: 10000 });

    try {
      await page.waitForSelector(productXPath, { state: 'visible', timeout: 10000 });
      console.log('  -> Đã tìm thấy sản phẩm sau khi reset.');
    } catch (e) {
      console.error(`  -> LỖI: Không tìm thấy sản phẩm "${productName}" sau khi reset trang.`);
      throw e; 
    }

    // 9. Test xem chi tiết sản phẩm
    console.log('Step 9: Test xem chi tiết sản phẩm');
    const productUrl = await shop.viewProductByName(productName); 
    
    check(productUrl, {
      '[Shop] Step 9: Đã điều hướng đến trang sản phẩm': (url) => url.includes('/product/handcrafted-bronze-car'),
    });
    console.log(`  -> Đã mở URL: ${productUrl}`);

    console.log('--- Kịch bản Shop Smoke Test HOÀN TẤT ---');

  } catch (err) {
    console.error(`Lỗi trong kịch bản shop: ${err.message}`);
    throw err;
  } finally {
    try { await page.close(); } catch (e) { console.error('Lỗi khi đóng page:', e.message); }
    try { await ctx.close(); } catch (e) { console.error('Lỗi khi đóng context:', e.message); }
  }
}