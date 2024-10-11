import { test, expect } from "@playwright/test";

test.describe("Authentication", () => {
  test("login with invalid credential", async ({ page }) => {
    await page.goto("/");
    await page
      .getByRole("textbox", { name: "Username or Email" })
      .fill("wrong_credential@pulsatehq.com");
    await page
      .getByRole("textbox", { name: "Password Forgot your password?" })
      .fill("wrong_password");
    await page.getByRole("button", { name: "Sign in" }).click();
    await expect(page.getByRole("button", { name: "Sign in" })).toBeVisible();
  });
});
