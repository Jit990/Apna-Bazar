# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: checkout-flow.spec.ts >> Critical Path: Login -> Add to Cart -> Checkout >> Complete purchase flow end-to-end
- Location: e2e\checkout-flow.spec.ts:8:9

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('a[href^="/products/"]').first()
Expected: visible
Timeout: 15000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 15000ms
  - waiting for locator('a[href^="/products/"]').first()

```

```yaml
- banner:
  - link "Apna Bazar Home":
    - /url: /
    - text: AB
  - button "Change delivery location": Delivering to Bajkul
  - button "Toggle search"
  - link "Cart":
    - /url: /cart
  - searchbox "Search jewelry, cosmetics, gifts..."
- main:
  - navigation:
    - link "Home":
      - /url: /
    - link "Categories":
      - /url: /categories
    - text: Makeup
  - heading "Makeup" [level=1]
  - combobox:
    - option "Relevance" [selected]
    - 'option "Price: Low to High"'
    - 'option "Price: High to Low"'
    - option "Newest First"
    - option "Most Popular"
  - paragraph: 🔌 Connect Supabase to load products for "Makeup"
- navigation "Main navigation":
  - link "Home":
    - /url: /
  - link "Categories":
    - /url: /categories
  - link "Search":
    - /url: /search
  - link "Cart":
    - /url: /cart
  - link "Account":
    - /url: /account
- region "Notifications alt+T"
- alert: Makeup | Apna Bazar
```

# Test source

```ts
  1   | import { test, expect } from '@playwright/test';
  2   | 
  3   | test.describe('Critical Path: Login -> Add to Cart -> Checkout', () => {
  4   | 
  5   |     // Generate a random mobile number starting with 9
  6   |     const testPhone = `9${Math.floor(100000000 + Math.random() * 900000000)}`;
  7   | 
  8   |     test('Complete purchase flow end-to-end', async ({ page, request }) => {
  9   |         // 1. Visit the Homepage
  10  |         console.log('1. Visit Homepage');
  11  |         await page.goto('/');
  12  |         await expect(page).toHaveTitle(/Apna Bazar/i);
  13  | 
  14  |         console.log('Ensure hydrated');
  15  |         // Ensure the page gets hydrated and store categories load
  16  |         await expect(page.locator('text=Shop by Category').first()).toBeVisible();
  17  | 
  18  |         // 2. Click on the first category to find products reliably
  19  |         console.log('2. Click on the first category');
  20  |         const firstCategory = page.locator('a[href^="/categories/"]').first();
  21  |         await firstCategory.waitFor();
  22  |         await firstCategory.click();
  23  | 
  24  |         console.log('Ensure category page loaded');
> 25  |         await expect(page.locator('a[href^="/products/"]').first()).toBeVisible({ timeout: 15000 });
      |                                                                     ^ Error: expect(locator).toBeVisible() failed
  26  | 
  27  |         console.log('Click on the first product');
  28  |         const productCard = page.locator('a[href^="/products/"]').first();
  29  |         await productCard.waitFor();
  30  |         await productCard.click();
  31  | 
  32  |         console.log('3. Add to Cart');
  33  |         // 3. Add to Cart from Product Detail Page
  34  |         const addToCartBtn = page.getByRole('button', { name: /Add to Cart/i });
  35  |         await addToCartBtn.waitFor();
  36  |         await addToCartBtn.click();
  37  | 
  38  |         console.log('Wait for quantity indicator');
  39  |         // Wait for quantity controls to appear indicating it was added
  40  |         const quantityIndicator = page.locator('text=1').first();
  41  |         await quantityIndicator.waitFor();
  42  | 
  43  |         console.log('4. Go to Cart');
  44  |         // 4. Navigate to Cart
  45  |         await page.goto('/cart');
  46  |         await expect(page.locator('text=My Cart').first()).toBeVisible();
  47  | 
  48  |         console.log('Wait for checkout button');
  49  |         // Wait for the hydration of the Cart items from localStorage
  50  |         await expect(page.getByRole('button', { name: /Checkout/i })).toBeVisible();
  51  | 
  52  |         console.log('5. Proceed to Checkout');
  53  |         // 5. Proceed to Checkout
  54  |         await page.getByRole('button', { name: /Checkout/i }).click();
  55  | 
  56  |         console.log('Wait for Login Required');
  57  |         // We should be intercepted by the "Login Required" screen since we aren't authenticated
  58  |         const loginRequiredHeading = page.locator('h2:has-text("Login Required")');
  59  |         await expect(loginRequiredHeading).toBeVisible();
  60  | 
  61  |         console.log('6. Go to Login Page');
  62  |         // 6. Navigate to Login Page
  63  |         await page.getByRole('button', { name: /Login \/ Sign Up/i }).click();
  64  |         await expect(page.url()).toContain('/account');
  65  | 
  66  |         // 7. Perform OTP Login
  67  |         console.log('Finding phone input...');
  68  |         const phoneInput = page.getByPlaceholder('Phone Number');
  69  |         await phoneInput.fill(testPhone);
  70  | 
  71  |         console.log('Intercepting send-otp...');
  72  |         // Before clicking Get OTP, intercept the API response to capture the generated DEV OTP
  73  |         const responsePromise = page.waitForResponse((response) =>
  74  |             response.url().includes('/api/auth/send-otp') && response.status() === 200
  75  |         );
  76  | 
  77  |         console.log('Clicking Get OTP...');
  78  |         await page.getByRole('button', { name: /Get OTP/i }).click();
  79  | 
  80  |         console.log('Waiting for response...');
  81  |         const response = await responsePromise;
  82  |         const body = await response.json();
  83  | 
  84  |         // In dev mode, the OTP is returned in the API payload
  85  |         const otp = body?.data?.devOtp;
  86  |         expect(otp).toBeDefined();
  87  | 
  88  |         console.log('Filling OTP...', otp);
  89  |         // Fill the OTP input
  90  |         const otpInput = page.getByPlaceholder('Enter 6-digit OTP');
  91  |         await otpInput.fill(otp);
  92  | 
  93  |         console.log('Clicking Verify...');
  94  |         await page.getByRole('button', { name: /Verify Login/i }).click();
  95  | 
  96  |         console.log('Waiting for Dashboard...');
  97  |         // Wait for successful login and dashboard visibility
  98  |         await expect(page.locator('text=My Account').nth(1)).toBeVisible();
  99  | 
  100 |         // Since we're in the account page, let's navigate back to checkout to finish
  101 |         await page.goto('/checkout');
  102 | 
  103 |         // 8. Checkout Form (Authenticated)
  104 |         // At this point we might need an address.
  105 |         // Let's create an address from the checkout page if none exists.
  106 |         const addAddressBtn = page.locator('text=Add delivery address');
  107 |         if (await addAddressBtn.isVisible()) {
  108 |             // Address Manager UI not built yet, manually seed one via our secure API
  109 |             const addressResponse = await request.post('/api/addresses', {
  110 |                 data: {
  111 |                     full_name: 'Test Customer',
  112 |                     phone: testPhone,
  113 |                     house_flat: '101 Playwright Block',
  114 |                     street_locality: 'Automated Test Street',
  115 |                     city: 'Kolkata',
  116 |                     state: 'West Bengal',
  117 |                     pincode: '700001',
  118 |                     is_default: true
  119 |                 }
  120 |             });
  121 |             expect(addressResponse.ok()).toBeTruthy();
  122 | 
  123 |             // Refresh to load the newly added address
  124 |             await page.reload();
  125 |         }
```