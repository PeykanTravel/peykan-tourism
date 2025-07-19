import { test, expect } from '@playwright/test';

test.describe('Event Booking Flow', () => {
  test('Complete event booking flow - guest user', async ({ page }) => {
    console.log('🚀 Starting event booking flow test...');

    // Step 1: Navigate to events page
    await page.goto('/en/events');
    await expect(page.locator('h1')).toContainText('Events');
    console.log('✅ Step 1: Navigated to events page');

    // Step 2: Select an event
    const firstEvent = page.locator('[data-testid="event-card"], .event-card, .product-card').first();
    const eventTitle = await firstEvent.locator('h3, .event-title').textContent();
    await firstEvent.click();
    await expect(page.locator('h1, .event-title')).toBeVisible();
    console.log(`✅ Step 2: Selected event: ${eventTitle}`);

    // Step 3: Select performance
    const performanceSelector = page.locator('[data-testid="performance-selector"], .performance-selector');
    if (await performanceSelector.isVisible()) {
      await performanceSelector.click();
      await page.locator('[data-testid="performance-option"], .performance-option').first().click();
      console.log('✅ Step 3: Selected performance');
    }

    // Step 4: Select section
    const sectionSelector = page.locator('[data-testid="section-selector"], .section-selector');
    if (await sectionSelector.isVisible()) {
      await sectionSelector.click();
      await page.locator('[data-testid="section-option"], .section-option').first().click();
      console.log('✅ Step 4: Selected section');
    }

    // Step 5: Select seats
    const seatMap = page.locator('[data-testid="seat-map"], .seat-map');
    if (await seatMap.isVisible()) {
      // Select available seats
      const availableSeats = page.locator('[data-testid="available-seat"], .seat-available');
      const seatCount = await availableSeats.count();
      
      if (seatCount > 0) {
        // Select first 2 available seats
        for (let i = 0; i < Math.min(2, seatCount); i++) {
          await availableSeats.nth(i).click();
        }
        console.log('✅ Step 5: Selected seats');
      }
    }

    // Step 6: Select ticket type (if available)
    const ticketTypeSelector = page.locator('[data-testid="ticket-type-selector"], .ticket-type-selector');
    if (await ticketTypeSelector.isVisible()) {
      await ticketTypeSelector.click();
      await page.locator('[data-testid="ticket-type-option"], .ticket-type-option').first().click();
      console.log('✅ Step 6: Selected ticket type');
    }

    // Step 7: Add options (if available)
    const optionsSection = page.locator('[data-testid="options-section"], .options-section');
    if (await optionsSection.isVisible()) {
      const optionCheckboxes = page.locator('[data-testid="event-option"], .event-option');
      const optionCount = await optionCheckboxes.count();
      
      if (optionCount > 0) {
        await optionCheckboxes.first().click();
        console.log('✅ Step 7: Added options');
      }
    }

    // Step 8: Add to cart
    const addToCartButton = page.locator('[data-testid="add-to-cart"], .add-to-cart, button:has-text("Add to Cart")');
    if (await addToCartButton.isVisible()) {
      await addToCartButton.click();
      console.log('✅ Step 8: Added to cart');
      
      // Check if redirected to login or cart
      const currentUrl = page.url();
      if (currentUrl.includes('/login') || currentUrl.includes('/register')) {
        console.log('✅ Redirected to authentication page as expected');
      } else if (currentUrl.includes('/cart')) {
        console.log('✅ Navigated to cart page');
      }
    } else {
      console.log('⚠️ No add to cart button found');
    }

    console.log('🎉 Event booking flow test completed!');
  });

  test('Event seat selection validation', async ({ page }) => {
    await page.goto('/en/events');
    const firstEvent = page.locator('[data-testid="event-card"], .event-card').first();
    await firstEvent.click();

    // Try to select unavailable seats
    const unavailableSeats = page.locator('[data-testid="unavailable-seat"], .seat-unavailable');
    if (await unavailableSeats.isVisible()) {
      await unavailableSeats.first().click();
      
      // Should show error message
      const errorMessage = page.locator('[data-testid="error-message"], .error-message');
      if (await errorMessage.isVisible()) {
        await expect(errorMessage).toContainText('unavailable');
        console.log('✅ Seat validation working');
      }
    }
  });

  test('Event performance selection', async ({ page }) => {
    await page.goto('/en/events');
    const firstEvent = page.locator('[data-testid="event-card"], .event-card').first();
    await firstEvent.click();

    // Check if performance selector exists
    const performanceSelector = page.locator('[data-testid="performance-selector"], .performance-selector');
    if (await performanceSelector.isVisible()) {
      console.log('✅ Performance selector found');
      
      // Check if performances are loaded
      const performances = page.locator('[data-testid="performance-option"], .performance-option');
      const performanceCount = await performances.count();
      console.log(`Found ${performanceCount} performances`);
    } else {
      console.log('⚠️ No performance selector found');
    }
  });
}); 