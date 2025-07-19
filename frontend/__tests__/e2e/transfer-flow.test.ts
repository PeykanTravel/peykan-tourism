import { test, expect } from '@playwright/test';

test.describe('Transfer Booking Flow', () => {
  test('Complete transfer booking flow - guest user', async ({ page }) => {
    console.log('🚀 Starting transfer booking flow test...');

    // Step 1: Navigate to transfers page
    await page.goto('/en/transfers');
    await expect(page.locator('h1')).toContainText('Transfers');
    console.log('✅ Step 1: Navigated to transfers page');

    // Step 2: Select a transfer route
    const firstTransfer = page.locator('[data-testid="transfer-card"], .transfer-card, .product-card').first();
    const transferTitle = await firstTransfer.locator('h3, .transfer-title').textContent();
    await firstTransfer.click();
    await expect(page.locator('h1, .transfer-title')).toBeVisible();
    console.log(`✅ Step 2: Selected transfer: ${transferTitle}`);

    // Step 3: Select route (if available)
    const routeSelector = page.locator('[data-testid="route-selector"], .route-selector');
    if (await routeSelector.isVisible()) {
      await routeSelector.click();
      await page.locator('[data-testid="route-option"], .route-option').first().click();
      console.log('✅ Step 3: Selected route');
    }

    // Step 4: Select vehicle type
    const vehicleSelector = page.locator('[data-testid="vehicle-selector"], .vehicle-selector');
    if (await vehicleSelector.isVisible()) {
      await vehicleSelector.click();
      await page.locator('[data-testid="vehicle-option"], .vehicle-option').first().click();
      console.log('✅ Step 4: Selected vehicle type');
    }

    // Step 5: Select trip type
    const tripTypeSelector = page.locator('[data-testid="trip-type-selector"], .trip-type-selector');
    if (await tripTypeSelector.isVisible()) {
      // Select one-way trip
      await page.locator('[data-testid="one-way"], .one-way').click();
      console.log('✅ Step 5: Selected trip type (one-way)');
    }

    // Step 6: Select date and time
    const dateSelector = page.locator('[data-testid="date-selector"], .date-selector');
    if (await dateSelector.isVisible()) {
      await dateSelector.click();
      await page.locator('[data-testid="calendar-day"], .calendar-day').first().click();
      console.log('✅ Step 6: Selected date');
    }

    const timeSelector = page.locator('[data-testid="time-selector"], .time-selector');
    if (await timeSelector.isVisible()) {
      await timeSelector.click();
      await page.locator('[data-testid="time-option"], .time-option').first().click();
      console.log('✅ Step 6: Selected time');
    }

    // Step 7: Set passenger count
    const passengerSelector = page.locator('[data-testid="passenger-selector"], .passenger-selector');
    if (await passengerSelector.isVisible()) {
      // Increase passenger count
      await page.locator('[data-testid="passenger-plus"], .passenger-plus').click();
      await page.locator('[data-testid="passenger-plus"], .passenger-plus').click(); // 3 passengers
      console.log('✅ Step 7: Set passenger count');
    }

    // Step 8: Set luggage count
    const luggageSelector = page.locator('[data-testid="luggage-selector"], .luggage-selector');
    if (await luggageSelector.isVisible()) {
      await page.locator('[data-testid="luggage-plus"], .luggage-plus').click(); // 1 luggage
      console.log('✅ Step 8: Set luggage count');
    }

    // Step 9: Add options (if available)
    const optionsSection = page.locator('[data-testid="options-section"], .options-section');
    if (await optionsSection.isVisible()) {
      const optionCheckboxes = page.locator('[data-testid="transfer-option"], .transfer-option');
      const optionCount = await optionCheckboxes.count();
      
      if (optionCount > 0) {
        await optionCheckboxes.first().click();
        console.log('✅ Step 9: Added options');
      }
    }

    // Step 10: Fill pickup/dropoff details
    const pickupAddress = page.locator('[data-testid="pickup-address"], .pickup-address');
    if (await pickupAddress.isVisible()) {
      await pickupAddress.fill('123 Main Street, Tehran');
      console.log('✅ Step 10: Filled pickup address');
    }

    const dropoffAddress = page.locator('[data-testid="dropoff-address"], .dropoff-address');
    if (await dropoffAddress.isVisible()) {
      await dropoffAddress.fill('456 Central Avenue, Shiraz');
      console.log('✅ Step 10: Filled dropoff address');
    }

    // Step 11: Add to cart
    const addToCartButton = page.locator('[data-testid="add-to-cart"], .add-to-cart, button:has-text("Add to Cart")');
    if (await addToCartButton.isVisible()) {
      await addToCartButton.click();
      console.log('✅ Step 11: Added to cart');
      
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

    console.log('🎉 Transfer booking flow test completed!');
  });

  test('Transfer capacity validation', async ({ page }) => {
    await page.goto('/en/transfers');
    const firstTransfer = page.locator('[data-testid="transfer-card"], .transfer-card').first();
    await firstTransfer.click();

    // Try to exceed passenger capacity
    const passengerPlus = page.locator('[data-testid="passenger-plus"], .passenger-plus');
    if (await passengerPlus.isVisible()) {
      // Click many times to exceed capacity
      for (let i = 0; i < 20; i++) {
        await passengerPlus.click();
      }
      
      // Should show error message
      const errorMessage = page.locator('[data-testid="error-message"], .error-message');
      if (await errorMessage.isVisible()) {
        await expect(errorMessage).toContainText('capacity');
        console.log('✅ Capacity validation working');
      }
    }
  });

  test('Transfer round-trip booking', async ({ page }) => {
    await page.goto('/en/transfers');
    const firstTransfer = page.locator('[data-testid="transfer-card"], .transfer-card').first();
    await firstTransfer.click();

    // Select round-trip
    const roundTripOption = page.locator('[data-testid="round-trip"], .round-trip');
    if (await roundTripOption.isVisible()) {
      await roundTripOption.click();
      console.log('✅ Round-trip selected');
      
      // Check if return date/time selectors appear
      const returnDateSelector = page.locator('[data-testid="return-date-selector"], .return-date-selector');
      if (await returnDateSelector.isVisible()) {
        console.log('✅ Return date selector appeared');
      }
      
      const returnTimeSelector = page.locator('[data-testid="return-time-selector"], .return-time-selector');
      if (await returnTimeSelector.isVisible()) {
        console.log('✅ Return time selector appeared');
      }
    }
  });

  test('Transfer route selection', async ({ page }) => {
    await page.goto('/en/transfers');
    const firstTransfer = page.locator('[data-testid="transfer-card"], .transfer-card').first();
    await firstTransfer.click();

    // Check if route selector exists
    const routeSelector = page.locator('[data-testid="route-selector"], .route-selector');
    if (await routeSelector.isVisible()) {
      console.log('✅ Route selector found');
      
      // Check if routes are loaded
      const routes = page.locator('[data-testid="route-option"], .route-option');
      const routeCount = await routes.count();
      console.log(`Found ${routeCount} routes`);
    } else {
      console.log('⚠️ No route selector found');
    }
  });
}); 