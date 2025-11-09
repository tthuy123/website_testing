// src/tests/flow.signup-login-browse.spec.js
import { smokePreset } from "../../config/options.presets.js";
import SignupPage from "../pages/SignupPage.js";
import LoginPage from "../pages/LoginPage.js";
import HomePage from "../pages/HomePage.js";
import { newTestPage, closeTestPage } from "../setup/context.js";

export const options = smokePreset({ exec: "defaultScenario", pageTag: "signup-login-browse-search-flow" });

const BASE_URL = __ENV.BASE_URL || "http://localhost:8080";

function generateTestUser() {
  const ts = Date.now();
  const rand = Math.floor(Math.random() * 10000);
  return {
    email: `testuser${ts}${rand}@example.com`,
    firstName: "Test",
    lastName: "User",
    password: "Password123!",
    subscribe: false,
  };
}

function expectUrlIncludes(url, part, msgIfFail) {
  if (!url.includes(part)) {
    throw new Error(`${msgIfFail}. URL hiện tại: ${url}`);
  }
}

// Entry cho k6
export async function defaultScenario() {
  const { ctx, page } = await newTestPage();
  const signup = new SignupPage(page, BASE_URL);
  const login  = new LoginPage(page, BASE_URL);
  const home   = new HomePage(page, BASE_URL);

  const user = generateTestUser();

  try {
    console.log("=== FLOW: SIGNUP → LOGIN → BROWSE (HEADER) ===");
    console.log("BASE_URL:", BASE_URL);

    // 1) SIGNUP
    console.log("[1] SIGNUP");
    await signup.goto();
    await signup.fillAndSubmit(
      user.email,
      user.firstName,
      user.lastName,
      user.password,
      user.subscribe
    );
    await signup.assertSignupSuccess();
    console.log("[1] SIGNUP done:", user.email);
    console.log("URL sau signup:", page.url());

    // 2) LOGIN (bằng user vừa tạo)
    console.log("[2] LOGIN");
    await home.logout();
    await login.goto();
    await login.fillAndSubmit(user.email, user.password);
    await login.assertLoggedIn();
    console.log("[2] LOGIN done. URL:", page.url());

    // 3) BROWSE HEADER (Home → test các nút/đường dẫn ở header)
    console.log("[3] BROWSE (HEADER)");

    // 3.1 Home
    await home.goto();
    expectUrlIncludes(page.url(), "/", "Không quay lại được trang chủ");

    // 3.2 Search autosuggest → tới trang product mong đợi
    console.log("    - Search autosuggest");
    const searchKeyword = "sho";
    const suggestionToClick = "Sleek Plastic Shoes";
    const productUrl = await home.searchAndSelectSuggestion(searchKeyword, suggestionToClick);
    console.log(`      -> '${searchKeyword}' → '${suggestionToClick}' =>`, productUrl);
    expectUrlIncludes(
      productUrl,
      "/product/sleek-plastic-shoes",
      "Chọn autosuggest nhưng không vào đúng trang sản phẩm"
    );

    // 3.3 Link "Shop"
    console.log("    - Link 'Shop'");
    await home.goto();
    const shopUrl = await home.goToShop();
    console.log("      ->", shopUrl);
    expectUrlIncludes(shopUrl, "/shop", "Không điều hướng đến /shop");

    // 3.4 "Shop by Category" → Games
    console.log("    - Shop by Category → 'Games'");
    await home.goto();
    const menuTitle = await home.getCategoryMenuTitle();
    if (menuTitle !== "Shop By Category") {
      throw new Error(`Tiêu đề Category Menu sai. Thấy: '${menuTitle}'`);
    }
    const categoryUrl = await home.clickCategoryLink("Games");
    console.log("      ->", categoryUrl);
    expectUrlIncludes(categoryUrl, "/shop/category/games", "Không điều hướng đến category 'Games'");

    // 3.5 Brands dropdown → 'Sawayn Group'
    console.log("    - Brands dropdown → 'Sawayn Group'");
    await home.goto();
    await home.openBrandsDropdown();
    const brandUrl = await home.clickBrand("Sawayn Group");
    console.log("      ->", brandUrl);
    if (!brandUrl.includes("sawayn-group")) {
      throw new Error(`Không điều hướng đúng brand 'Sawayn Group'. URL: ${brandUrl}`);
    }

    // 3.6 Mở giỏ hàng
    console.log("    - Open Cart");
    await home.goto();
    await home.openCart();
    console.log("      -> Mở giỏ hàng OK");

    console.log("=== FLOW HOÀN TẤT ===");
  } catch (err) {
    console.error("❌ Lỗi FLOW:", err.message);
    throw err;
  } finally {
    try { await page.close(); } catch (e) { console.error("Đóng page lỗi:", e.message); }
    try { await ctx.close(); } catch (e) { console.error("Đóng context lỗi:", e.message); }
  }
}
