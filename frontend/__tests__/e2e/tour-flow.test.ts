import { test, expect } from '@playwright/test';

test.describe('Tour Booking Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to tours page
    await page.goto('/en/tours');
  });

  test('Complete tour booking flow - guest user', async ({ page }) => {
    // 1. Browse tours
    await expect(page.locator('h1')).toContainText('Tours');
    
    // 2. Click on first tour
    const firstTour = page.locator('[data-testid="tour-card"]').first();
    await firstTour.click();
    
    // 3. Verify tour detail page
    await expect(page.locator('h1')).toBeVisible();
    
    // 4. Select date and participants
    await page.locator('[data-testid="date-selector"]').click();
    await page.locator('[data-testid="calendar-day"]').first().click();
    
    // Increase adult count
    await page.locator('[data-testid="adult-plus"]').click();
    
    // 5. Add to cart
    await page.locator('[data-testid="add-to-cart"]').click();
    
    // 6. Verify cart page
    await expect(page).toHaveURL(/.*\/cart/);
    await expect(page.locator('[data-testid="cart-item"]')).toBeVisible();
    
    // 7. Proceed to checkout
    await page.locator('[data-testid="checkout-button"]').click();
    
    // 8. Verify login redirect
    await expect(page).toHaveURL(/.*\/login/);
  });

  test('Complete tour booking flow - authenticated user', async ({ page }) => {
    // Login first
    await page.goto('/en/login');
    await page.fill('[data-testid="username"]', 'testuser');
    await page.fill('[data-testid="password"]', 'testpass');
    await page.click('[data-testid="login-button"]');
    
    // Wait for login to complete
    await page.waitForURL(/.*\/profile/);
    
    // 1. Navigate to tours
    await page.goto('/en/tours');
    
    // 2. Select a tour
    const firstTour = page.locator('[data-testid="tour-card"]').first();
    await firstTour.click();
    
    // 3. Configure booking
    await page.locator('[data-testid="date-selector"]').click();
    await page.locator('[data-testid="calendar-day"]').first().click();
    await page.locator('[data-testid="adult-plus"]').click();
    
    // 4. Add to cart
    await page.locator('[data-testid="add-to-cart"]').click();
    
    // 5. Verify cart
    await expect(page).toHaveURL(/.*\/cart/);
    await expect(page.locator('[data-testid="cart-item"]')).toBeVisible();
    
    // 6. Proceed to checkout
    await page.locator('[data-testid="checkout-button"]').click();
    
    // 7. Fill checkout form
    await page.fill('[data-testid="customer-name"]', 'John Doe');
    await page.fill('[data-testid="customer-email"]', 'john@example.com');
    await page.fill('[data-testid="customer-phone"]', '+1234567890');
    await page.check('[data-testid="terms-accepted"]');
    
    // 8. Submit order
    await page.locator('[data-testid="submit-order"]').click();
    
    // 9. Verify order confirmation
    await expect(page).toHaveURL(/.*\/orders/);
    await expect(page.locator('[data-testid="order-confirmation"]')).toBeVisible();
  });

  test('Error handling - tour not available', async ({ page }) => {
    // Navigate to tour detail
    await page.goto('/en/tours/test-tour');
    
    // Try to select past date
    await page.locator('[data-testid="date-selector"]').click();
    // Select a past date (this would need specific implementation)
    
    // Verify error message
    await expect(page.locator('[data-testid="error-message"]')).toContainText('Cannot book tours in the past');
  });

  test('Error handling - insufficient capacity', async ({ page }) => {
    // Navigate to tour detail
    await page.goto('/en/tours/test-tour');
    
    // Try to book more than available capacity
    for (let i = 0; i < 100; i++) {
      await page.locator('[data-testid="adult-plus"]').click();
    }
    
    // Verify error message
    await expect(page.locator('[data-testid="error-message"]')).toContainText('Not enough capacity');
  });
}); 