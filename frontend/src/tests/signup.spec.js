// src/tests/signup.spec.js
import { options as signupOptions } from "../../config/options.signup.js";
import SignupPage from "../pages/SignupPage.js";
import { newTestPage, closeTestPage } from "../setup/context.js";

export const options = signupOptions;

const BASE_URL = __ENV.BASE_URL || "http://localhost:8080";

// Generate unique test user data
function generateTestUser() {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 10000);
  return {
    email: `testuser${timestamp}${random}@example.com`,
    firstName: "Test",
    lastName: "User",
    password: "Password123!",
    subscribe: false,
  };
}

export async function signupScenario() {
  const { ctx, page } = await newTestPage();
  try {
    console.log("SIGNUP start at:", BASE_URL);
    const signup = new SignupPage(page, BASE_URL);

    // Generate unique user to avoid duplicate email errors
    const testUser = generateTestUser();

    await signup.goto();
    await signup.fillAndSubmit(
      testUser.email,
      testUser.firstName,
      testUser.lastName,
      testUser.password,
      testUser.subscribe
    );

    // Assert successful signup (redirects to dashboard or login)
    await signup.assertSignupSuccess();

    console.log("SIGNUP done. User created:", testUser.email);
    console.log("Final URL:", page.url());
  } finally {
    await closeTestPage(ctx, page);
  }
}
