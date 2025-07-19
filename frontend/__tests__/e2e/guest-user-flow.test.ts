import { test, expect } from '@playwright/test';

test.describe('Guest User Complete Flow', () => {
  test('Complete guest user journey: Tour selection → Cart → Registration → Checkout → Order History', async ({ page }) => {
    // Step 1: Navigate to tours page as guest
    await page.goto('/en/tours');
    await expect(page.locator('h1')).toContainText('Tours');
    console.log('✅ Step 1: Successfully navigated to tours page');

    // Step 2: Select a tour from the list
    const firstTour = page.locator('[data-testid="tour-card"]').first();
    const tourTitle = await firstTour.locator('h3').textContent();
    await firstTour.click();
    await expect(page.locator('h1')).toBeVisible();
    console.log(`✅ Step 2: Selected tour: ${tourTitle}`);

    // Step 3: Configure tour details
    // Select date
    await page.locator('[data-testid="date-selector"]').click();
    await page.locator('[data-testid="calendar-day"]').first().click();
    
    // Select variant (if available)
    const variantSelector = page.locator('[data-testid="variant-selector"]');
    if (await variantSelector.isVisible()) {
      await variantSelector.click();
      await page.locator('[data-testid="variant-option"]').first().click();
    }
    
    // Set participants
    await page.locator('[data-testid="adult-plus"]').click();
    await page.locator('[data-testid="adult-plus"]').click(); // 2 adults
    await page.locator('[data-testid="child-plus"]').click(); // 1 child
    
    // Select options (if available)
    const optionCheckboxes = page.locator('[data-testid="tour-option"]');
    const optionCount = await optionCheckboxes.count();
    if (optionCount > 0) {
      await optionCheckboxes.first().click();
    }
    
    // Add special requests
    await page.locator('[data-testid="special-requests"]').fill('Please provide vegetarian meals');
    
    console.log('✅ Step 3: Configured tour details');

    // Step 4: Add to cart
    await page.locator('[data-testid="add-to-cart"]').click();
    
    // Verify success message
    await expect(page.locator('[data-testid="success-message"]')).toContainText('added to cart');
    console.log('✅ Step 4: Added tour to cart');

    // Step 5: Navigate to cart
    await page.locator('[data-testid="view-cart"]').click();
    await expect(page).toHaveURL(/.*\/cart/);
    await expect(page.locator('[data-testid="cart-item"]')).toBeVisible();
    console.log('✅ Step 5: Navigated to cart page');

    // Step 6: Edit cart items
    // Update quantity
    await page.locator('[data-testid="quantity-plus"]').click();
    await expect(page.locator('[data-testid="quantity-display"]')).toContainText('3');
    
    // Update options
    const editButton = page.locator('[data-testid="edit-item"]');
    if (await editButton.isVisible()) {
      await editButton.click();
      // Add another option
      const additionalOption = page.locator('[data-testid="additional-option"]');
      if (await additionalOption.isVisible()) {
        await additionalOption.click();
      }
      await page.locator('[data-testid="save-changes"]').click();
    }
    
    console.log('✅ Step 6: Edited cart items');

    // Step 7: Proceed to checkout (should redirect to login/register)
    await page.locator('[data-testid="checkout-button"]').click();
    await expect(page).toHaveURL(/.*\/login/);
    console.log('✅ Step 7: Redirected to login page');

    // Step 8: Register new account
    await page.locator('[data-testid="register-link"]').click();
    await expect(page).toHaveURL(/.*\/register/);
    
    // Fill registration form
    const testEmail = `test${Date.now()}@example.com`;
    const testPassword = 'TestPassword123!';
    
    await page.fill('[data-testid="first-name"]', 'John');
    await page.fill('[data-testid="last-name"]', 'Doe');
    await page.fill('[data-testid="email"]', testEmail);
    await page.fill('[data-testid="phone"]', '+1234567890');
    await page.fill('[data-testid="password"]', testPassword);
    await page.fill('[data-testid="confirm-password"]', testPassword);
    await page.check('[data-testid="terms-accepted"]');
    
    await page.locator('[data-testid="register-button"]').click();
    
    // Wait for registration success
    await expect(page.locator('[data-testid="success-message"]')).toContainText('registered');
    console.log('✅ Step 8: Registered new account');

    // Step 9: Verify email (simulate email verification)
    await page.goto('/en/verify-email');
    await page.fill('[data-testid="verification-code"]', '123456');
    await page.locator('[data-testid="verify-button"]').click();
    
    // Wait for verification success
    await expect(page.locator('[data-testid="success-message"]')).toContainText('verified');
    console.log('✅ Step 9: Verified email');

    // Step 10: Return to cart (should now be accessible)
    await page.goto('/en/cart');
    await expect(page.locator('[data-testid="cart-item"]')).toBeVisible();
    console.log('✅ Step 10: Returned to cart as authenticated user');

    // Step 11: Proceed to checkout
    await page.locator('[data-testid="checkout-button"]').click();
    await expect(page).toHaveURL(/.*\/checkout/);
    console.log('✅ Step 11: Navigated to checkout page');

    // Step 12: Fill checkout form
    await page.fill('[data-testid="customer-name"]', 'John Doe');
    await page.fill('[data-testid="customer-email"]', testEmail);
    await page.fill('[data-testid="customer-phone"]', '+1234567890');
    await page.fill('[data-testid="billing-address"]', '123 Main St');
    await page.fill('[data-testid="billing-city"]', 'New York');
    await page.fill('[data-testid="billing-postal-code"]', '10001');
    await page.selectOption('[data-testid="billing-country"]', 'US');
    
    // Payment information
    await page.fill('[data-testid="card-number"]', '4242424242424242');
    await page.fill('[data-testid="card-expiry"]', '12/25');
    await page.fill('[data-testid="card-cvc"]', '123');
    await page.fill('[data-testid="card-name"]', 'John Doe');
    
    await page.check('[data-testid="terms-accepted"]');
    console.log('✅ Step 12: Filled checkout form');

    // Step 13: Submit order
    await page.locator('[data-testid="submit-order"]').click();
    
    // Wait for order confirmation
    await expect(page).toHaveURL(/.*\/orders/);
    await expect(page.locator('[data-testid="order-confirmation"]')).toBeVisible();
    
    const orderNumber = await page.locator('[data-testid="order-number"]').textContent();
    console.log(`✅ Step 13: Order submitted successfully. Order number: ${orderNumber}`);

    // Step 14: Navigate to profile
    await page.locator('[data-testid="profile-link"]').click();
    await expect(page).toHaveURL(/.*\/profile/);
    console.log('✅ Step 14: Navigated to profile page');

    // Step 15: Check order history
    await page.locator('[data-testid="orders-tab"]').click();
    await expect(page.locator('[data-testid="order-history"]')).toBeVisible();
    
    // Verify the order appears in history
    await expect(page.locator('[data-testid="order-item"]')).toContainText(orderNumber || '');
    await expect(page.locator('[data-testid="order-status"]')).toContainText('Confirmed');
    console.log('✅ Step 15: Verified order in history');

    // Step 16: View order details
    await page.locator('[data-testid="view-order"]').first().click();
    await expect(page.locator('[data-testid="order-details"]')).toBeVisible();
    
    // Verify order details
    await expect(page.locator('[data-testid="tour-title"]')).toContainText(tourTitle || '');
    await expect(page.locator('[data-testid="participants"]')).toContainText('3');
    console.log('✅ Step 16: Viewed order details');

    console.log('🎉 Complete guest user flow test passed successfully!');
  });

  test('Error handling - insufficient capacity', async ({ page }) => {
    await page.goto('/en/tours');
    const firstTour = page.locator('[data-testid="tour-card"]').first();
    await firstTour.click();
    
    // Try to book more than available capacity
    for (let i = 0; i < 50; i++) {
      await page.locator('[data-testid="adult-plus"]').click();
    }
    
    await expect(page.locator('[data-testid="error-message"]')).toContainText('Not enough capacity');
    console.log('✅ Error handling test passed');
  });

  test('Error handling - invalid date selection', async ({ page }) => {
    await page.goto('/en/tours');
    const firstTour = page.locator('[data-testid="tour-card"]').first();
    await firstTour.click();
    
    // Try to select past date
    await page.locator('[data-testid="date-selector"]').click();
    const pastDate = page.locator('[data-testid="past-date"]');
    if (await pastDate.isVisible()) {
      await pastDate.click();
      await expect(page.locator('[data-testid="error-message"]')).toContainText('Cannot book tours in the past');
    }
    console.log('✅ Date validation test passed');
  });
}); 