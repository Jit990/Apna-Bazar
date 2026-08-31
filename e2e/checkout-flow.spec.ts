import { test, expect } from '@playwright/test';

test.describe('Critical Path: Login -> Add to Cart -> Checkout', () => {

    // Generate a random mobile number starting with 9
    const testPhone = `9${Math.floor(100000000 + Math.random() * 900000000)}`;

    test('Complete purchase flow end-to-end', async ({ page, request }) => {
        // 1. Visit the Homepage
        console.log('1. Visit Homepage');
        await page.goto('/');
        await expect(page).toHaveTitle(/Apna Bazar/i);

        console.log('Ensure hydrated');
        // Ensure the page gets hydrated and store categories load
        await expect(page.locator('text=Shop by Category').first()).toBeVisible();

        // 2. Click on the first category to find products reliably
        console.log('2. Click on the first category');
        const firstCategory = page.locator('a[href^="/categories/"]').first();
        await firstCategory.waitFor();
        await firstCategory.click();

        console.log('Ensure category page loaded');
        await expect(page.locator('a[href^="/products/"]').first()).toBeVisible({ timeout: 15000 });

        console.log('Click on the first product');
        const productCard = page.locator('a[href^="/products/"]').first();
        await productCard.waitFor();
        await productCard.click();

        console.log('3. Add to Cart');
        // 3. Add to Cart from Product Detail Page
        const addToCartBtn = page.getByRole('button', { name: /Add to Cart/i });
        await addToCartBtn.waitFor();
        await addToCartBtn.click();

        console.log('Wait for quantity indicator');
        // Wait for quantity controls to appear indicating it was added
        const quantityIndicator = page.locator('text=1').first();
        await quantityIndicator.waitFor();

        console.log('4. Go to Cart');
        // 4. Navigate to Cart
        await page.goto('/cart');
        await expect(page.locator('text=My Cart').first()).toBeVisible();

        console.log('Wait for checkout button');
        // Wait for the hydration of the Cart items from localStorage
        await expect(page.getByRole('button', { name: /Checkout/i })).toBeVisible();

        console.log('5. Proceed to Checkout');
        // 5. Proceed to Checkout
        await page.getByRole('button', { name: /Checkout/i }).click();

        console.log('Wait for Login Required');
        // We should be intercepted by the "Login Required" screen since we aren't authenticated
        const loginRequiredHeading = page.locator('h2:has-text("Login Required")');
        await expect(loginRequiredHeading).toBeVisible();

        console.log('6. Go to Login Page');
        // 6. Navigate to Login Page
        await page.getByRole('button', { name: /Login \/ Sign Up/i }).click();
        await expect(page.url()).toContain('/account');

        // 7. Perform OTP Login
        console.log('Finding phone input...');
        const phoneInput = page.getByPlaceholder('Phone Number');
        await phoneInput.fill(testPhone);

        console.log('Intercepting send-otp...');
        // Before clicking Get OTP, intercept the API response to capture the generated DEV OTP
        const responsePromise = page.waitForResponse((response) =>
            response.url().includes('/api/auth/send-otp') && response.status() === 200
        );

        console.log('Clicking Get OTP...');
        await page.getByRole('button', { name: /Get OTP/i }).click();

        console.log('Waiting for response...');
        const response = await responsePromise;
        const body = await response.json();

        // In dev mode, the OTP is returned in the API payload
        const otp = body?.data?.devOtp;
        expect(otp).toBeDefined();

        console.log('Filling OTP...', otp);
        // Fill the OTP input
        const otpInput = page.getByPlaceholder('Enter 6-digit OTP');
        await otpInput.fill(otp);

        console.log('Clicking Verify...');
        await page.getByRole('button', { name: /Verify Login/i }).click();

        console.log('Waiting for Dashboard...');
        // Wait for successful login and dashboard visibility
        await expect(page.locator('text=My Account').nth(1)).toBeVisible();

        // Since we're in the account page, let's navigate back to checkout to finish
        await page.goto('/checkout');

        // 8. Checkout Form (Authenticated)
        // At this point we might need an address.
        // Let's create an address from the checkout page if none exists.
        const addAddressBtn = page.locator('text=Add delivery address');
        if (await addAddressBtn.isVisible()) {
            // Address Manager UI not built yet, manually seed one via our secure API
            const addressResponse = await request.post('/api/addresses', {
                data: {
                    full_name: 'Test Customer',
                    phone: testPhone,
                    house_flat: '101 Playwright Block',
                    street_locality: 'Automated Test Street',
                    city: 'Kolkata',
                    state: 'West Bengal',
                    pincode: '700001',
                    is_default: true
                }
            });
            expect(addressResponse.ok()).toBeTruthy();

            // Refresh to load the newly added address
            await page.reload();
        }

        // Now we must have an address loaded in checkout
        await expect(page.locator('text=Delivery Address')).toBeVisible();

        // Select COD option
        const codRadio = page.locator('input[type="radio"][value="cod"]').first() || page.locator('text=Cash on Delivery');
        await codRadio.click();

        // Place Order
        const placeOrderBtn = page.getByRole('button', { name: /Place Order/i });
        await expect(placeOrderBtn).not.toBeDisabled();
        await placeOrderBtn.click();

        // 9. Order Confirmation
        await expect(page.locator('text=Order Confirmed!')).toBeVisible({ timeout: 10000 });

        // Verify our order details
        await expect(page.locator('text=Your order')).toBeVisible();
        await expect(page.locator('text=has been placed.')).toBeVisible();

    });
});
