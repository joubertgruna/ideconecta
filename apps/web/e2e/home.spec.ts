import { test, expect } from '@playwright/test';

test.describe('Home Page', () => {
  test('should display hero section with search bar', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(page.getByPlaceholder(/busqu/i)).toBeVisible();
  });

  test('should display category grid', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByText('Restaurantes')).toBeVisible();
    await expect(page.getByText('Saúde')).toBeVisible();
    await expect(page.getByText('Tecnologia')).toBeVisible();
  });

  test('should navigate to search when query is entered', async ({ page }) => {
    await page.goto('/');

    const searchInput = page.getByPlaceholder(/busqu/i).first();
    await searchInput.fill('restaurante');

    const searchButton = page.getByRole('button', { name: /buscar/i }).first();
    await searchButton.click();

    await expect(page).toHaveURL(/\/buscar\?q=restaurante/);
  });

  test('should have navigation links', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByRole('link', { name: /anunciar/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /entrar/i })).toBeVisible();
  });

  test('should show AI features section', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByText(/busca semântica/i)).toBeVisible();
    await expect(page.getByText(/inteligência artificial/i)).toBeVisible();
  });
});
