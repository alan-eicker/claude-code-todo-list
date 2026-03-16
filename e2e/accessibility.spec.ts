import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => localStorage.clear());
  await page.reload();
});

const filterNav = (page: Parameters<Parameters<typeof test>[1]>[0]['page']) =>
  page.getByRole('navigation', { name: 'Filter todos' });

test.describe('Accessibility', () => {
  test('empty app has no accessibility violations', async ({ page }) => {
    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations).toEqual([]);
  });

  test('app with todos has no accessibility violations', async ({ page }) => {
    await page.getByLabel('New todo').fill('Buy milk');
    await page.getByRole('button', { name: 'Add' }).click();
    await page.getByLabel('New todo').fill('Walk dog');
    await page.getByRole('button', { name: 'Add' }).click();

    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations).toEqual([]);
  });

  test('app with completed todos has no accessibility violations', async ({ page }) => {
    await page.getByLabel('New todo').fill('Done task');
    await page.getByRole('button', { name: 'Add' }).click();
    await page.getByRole('checkbox', { name: /mark "done task" as completed/i }).click();

    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations).toEqual([]);
  });

  test('filtered view has no accessibility violations', async ({ page }) => {
    await page.getByLabel('New todo').fill('Pending task');
    await page.getByRole('button', { name: 'Add' }).click();
    await filterNav(page).getByRole('button', { name: 'Active' }).click();

    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations).toEqual([]);
  });

  test('page heading is an h1', async ({ page }) => {
    await expect(page.getByRole('heading', { level: 1, name: /todo list/i })).toBeVisible();
  });

  test('form input has an associated label', async ({ page }) => {
    await expect(page.getByLabel('New todo')).toBeVisible();
  });

  test('filter buttons communicate pressed state', async ({ page }) => {
    await expect(filterNav(page).getByRole('button', { name: 'All' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    await filterNav(page).getByRole('button', { name: 'Active' }).click();
    await expect(filterNav(page).getByRole('button', { name: 'Active' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    await expect(filterNav(page).getByRole('button', { name: 'All' })).toHaveAttribute(
      'aria-pressed',
      'false',
    );
  });
});
