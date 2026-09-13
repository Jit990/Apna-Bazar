import { test, expect } from '@playwright/test';

test.describe('Production smoke', () => {
    test('storefront renders', async ({ page }) => {
        const response = await page.goto('/');
        expect(response?.ok()).toBeTruthy();
        await expect(page).toHaveTitle(/Apna Bazar/i);
    });

    test('admin login is publicly reachable and dashboard is gated', async ({ page }) => {
        const login = await page.goto('/admin/login');
        expect(login?.ok()).toBeTruthy();
        await expect(page.getByRole('heading', { name: /Admin Panel/i })).toBeVisible();

        await page.goto('/admin');
        await expect(page).toHaveURL(/\/admin\/login/);
    });
});
