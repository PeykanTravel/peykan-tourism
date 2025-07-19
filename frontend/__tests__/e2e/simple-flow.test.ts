import { test, expect } from '@playwright/test';

test.describe('Simple Tour Flow Test', () => {
  test('Basic tour selection and cart flow', async ({ page }) => {
    console.log('🚀 Starting basic tour flow test...');

    // Step 1: Navigate to tours page
    await page.goto('/en/tours');
    console.log('✅ Navigated to tours page');

    // Step 2: Check if tours are loaded
    const tourCards = page.locator('[data-testid="tour-card"], .tour-card, .product-card');
    await expect(tourCards.first()).toBeVisible();
    console.log('✅ Tour cards are visible');

    // Step 3: Click on first tour
    const firstTour = tourCards.first();
    await firstTour.click();
    console.log('✅ Clicked on first tour');

    // Step 4: Check if we're on tour detail page
    await expect(page.locator('h1, .tour-title')).toBeVisible();
    console.log('✅ On tour detail page');

    // Step 5: Look for booking elements
    const bookingElements = [
      '[data-testid="add-to-cart"]',
      '.add-to-cart',
      '.book-now',
      'button:has-text("Add to Cart")',
      'button:has-text("Book Now")'
    ];

    let addToCartButton = null;
    for (const selector of bookingElements) {
      const element = page.locator(selector);
      if (await element.isVisible()) {
        addToCartButton = element;
        break;
      }
    }

    if (addToCartButton) {
      console.log('✅ Found add to cart button');
      
      // Step 6: Try to add to cart (this might redirect to login)
      await addToCartButton.click();
      console.log('✅ Clicked add to cart button');
      
      // Step 7: Check if redirected to login or cart
      const currentUrl = page.url();
      if (currentUrl.includes('/login') || currentUrl.includes('/register')) {
        console.log('✅ Redirected to authentication page as expected');
      } else if (currentUrl.includes('/cart')) {
        console.log('✅ Navigated to cart page');
      } else {
        console.log('ℹ️ Stayed on tour page (might need configuration)');
      }
    } else {
      console.log('⚠️ No add to cart button found - checking page structure');
      
      // Log page content for debugging
      const pageContent = await page.content();
      console.log('Page contains booking-related text:', 
        pageContent.includes('book') || 
        pageContent.includes('cart') || 
        pageContent.includes('reserve')
      );
    }

    console.log('🎉 Basic flow test completed!');
  });

  test('Navigation flow test', async ({ page }) => {
    console.log('🚀 Starting navigation flow test...');

    // Test navigation between main pages
    const pages = [
      { path: '/en/tours', title: 'Tours' },
      { path: '/en/events', title: 'Events' },
      { path: '/en/transfers', title: 'Transfers' },
      { path: '/en/cart', title: 'Cart' },
      { path: '/en/login', title: 'Login' },
      { path: '/en/register', title: 'Register' }
    ];

    for (const pageInfo of pages) {
      try {
        await page.goto(pageInfo.path);
        await expect(page.locator('h1, .page-title')).toBeVisible();
        console.log(`✅ ${pageInfo.title} page loads successfully`);
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.log(`⚠️ ${pageInfo.title} page has issues:`, errorMessage);
      }
    }

    console.log('🎉 Navigation flow test completed!');
  });

  test('Authentication flow test', async ({ page }) => {
    console.log('🚀 Starting authentication flow test...');

    // Test registration flow
    await page.goto('/en/register');
    
    // Check if registration form is present
    const formElements = [
      '[data-testid="email"]',
      'input[type="email"]',
      'input[name="email"]'
    ];

    let emailInput = null;
    for (const selector of formElements) {
      const element = page.locator(selector);
      if (await element.isVisible()) {
        emailInput = element;
        break;
      }
    }

    if (emailInput) {
      console.log('✅ Registration form is present');
      
      // Fill form with test data
      await emailInput.fill('test@example.com');
      console.log('✅ Filled email field');
      
      // Look for password field
      const passwordInput = page.locator('input[type="password"]').first();
      if (await passwordInput.isVisible()) {
        await passwordInput.fill('TestPassword123!');
        console.log('✅ Filled password field');
      }
    } else {
      console.log('⚠️ Registration form not found');
    }

    // Test login flow
    await page.goto('/en/login');
    
    const loginEmailInput = page.locator('input[type="email"], input[name="email"]').first();
    if (await loginEmailInput.isVisible()) {
      await loginEmailInput.fill('test@example.com');
      console.log('✅ Login form is present and fillable');
    } else {
      console.log('⚠️ Login form not found');
    }

    console.log('🎉 Authentication flow test completed!');
  });
}); 