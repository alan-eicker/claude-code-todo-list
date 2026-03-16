import { test, expect } from '@playwright/test';

// Navigate to the page, then clear localStorage and reload so the app starts
// with empty state. Using evaluate (not addInitScript) means subsequent
// page.reload() calls in persistence tests do NOT re-clear storage.
test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => localStorage.clear());
  await page.reload();
});

// Helpers
const filterNav = (page: Parameters<Parameters<typeof test>[1]>[0]['page']) =>
  page.getByRole('navigation', { name: 'Filter todos' });

test.describe('Empty state', () => {
  test('shows empty state message on first visit', async ({ page }) => {
    await expect(page.getByText('No todos here. Add one above!')).toBeVisible();
  });

  test('Add button is disabled when input is empty', async ({ page }) => {
    await expect(page.getByRole('button', { name: 'Add' })).toBeDisabled();
  });
});

test.describe('Adding todos', () => {
  test('adds a todo and displays it in the list', async ({ page }) => {
    await page.getByLabel('New todo').fill('Buy milk');
    await page.getByRole('button', { name: 'Add' }).click();

    await expect(page.getByText('Buy milk')).toBeVisible();
  });

  test('clears the input after adding a todo', async ({ page }) => {
    await page.getByLabel('New todo').fill('Buy milk');
    await page.getByRole('button', { name: 'Add' }).click();

    await expect(page.getByLabel('New todo')).toHaveValue('');
  });

  test('does not add a todo for whitespace-only input', async ({ page }) => {
    await page.getByLabel('New todo').fill('   ');
    await expect(page.getByRole('button', { name: 'Add' })).toBeDisabled();
  });

  test('adds multiple todos', async ({ page }) => {
    for (const text of ['Buy milk', 'Walk dog', 'Read book']) {
      await page.getByLabel('New todo').fill(text);
      await page.getByRole('button', { name: 'Add' }).click();
    }

    await expect(page.getByText('Buy milk')).toBeVisible();
    await expect(page.getByText('Walk dog')).toBeVisible();
    await expect(page.getByText('Read book')).toBeVisible();
  });

  test('can add a todo by pressing Enter', async ({ page }) => {
    await page.getByLabel('New todo').fill('Press enter task');
    await page.keyboard.press('Enter');

    await expect(page.getByText('Press enter task')).toBeVisible();
  });
});

test.describe('Completing todos', () => {
  test.beforeEach(async ({ page }) => {
    await page.getByLabel('New todo').fill('Complete me');
    await page.getByRole('button', { name: 'Add' }).click();
  });

  test('marks a todo as complete when checkbox is clicked', async ({ page }) => {
    await page.getByRole('checkbox', { name: /mark "complete me" as completed/i }).click();
    await expect(
      page.getByRole('checkbox', { name: /mark "complete me" as active/i }),
    ).toBeChecked();
  });

  test('can uncheck a completed todo', async ({ page }) => {
    await page.getByRole('checkbox', { name: /mark "complete me" as completed/i }).click();
    await page.getByRole('checkbox', { name: /mark "complete me" as active/i }).click();
    await expect(
      page.getByRole('checkbox', { name: /mark "complete me" as completed/i }),
    ).not.toBeChecked();
  });
});

test.describe('Deleting todos', () => {
  test('removes a todo when the delete button is clicked', async ({ page }) => {
    await page.getByLabel('New todo').fill('Delete me');
    await page.getByRole('button', { name: 'Add' }).click();

    await page.getByRole('button', { name: /delete "delete me"/i }).click();

    await expect(page.getByText('Delete me')).not.toBeVisible();
    await expect(page.getByText('No todos here. Add one above!')).toBeVisible();
  });
});

test.describe('Filtering', () => {
  test.beforeEach(async ({ page }) => {
    await page.getByLabel('New todo').fill('Pending item');
    await page.getByRole('button', { name: 'Add' }).click();
    await page.getByLabel('New todo').fill('Finished item');
    await page.getByRole('button', { name: 'Add' }).click();
    await page.getByRole('checkbox', { name: /mark "finished item" as completed/i }).click();
  });

  test('Active filter shows only incomplete todos', async ({ page }) => {
    await filterNav(page).getByRole('button', { name: 'Active' }).click();

    await expect(page.getByText('Pending item')).toBeVisible();
    await expect(page.getByText('Finished item')).not.toBeVisible();
  });

  test('Completed filter shows only completed todos', async ({ page }) => {
    await filterNav(page).getByRole('button', { name: 'Completed' }).click();

    await expect(page.getByText('Finished item')).toBeVisible();
    await expect(page.getByText('Pending item')).not.toBeVisible();
  });

  test('All filter shows every todo', async ({ page }) => {
    await filterNav(page).getByRole('button', { name: 'Active' }).click();
    await filterNav(page).getByRole('button', { name: 'All' }).click();

    await expect(page.getByText('Pending item')).toBeVisible();
    await expect(page.getByText('Finished item')).toBeVisible();
  });

  test('active count updates correctly', async ({ page }) => {
    await expect(page.getByText('1 item left')).toBeVisible();
  });
});

test.describe('Persistence', () => {
  test('todos survive a full page reload', async ({ page }) => {
    await page.getByLabel('New todo').fill('Persistent task');
    await page.getByRole('button', { name: 'Add' }).click();

    await page.reload();

    await expect(page.getByText('Persistent task')).toBeVisible();
  });

  test('completed state survives a page reload', async ({ page }) => {
    await page.getByLabel('New todo').fill('Stay completed');
    await page.getByRole('button', { name: 'Add' }).click();
    await page.getByRole('checkbox', { name: /mark "stay completed" as completed/i }).click();

    await page.reload();

    await expect(
      page.getByRole('checkbox', { name: /mark "stay completed" as active/i }),
    ).toBeChecked();
  });

  test('active filter selection survives a page reload', async ({ page }) => {
    await page.getByLabel('New todo').fill('Any task');
    await page.getByRole('button', { name: 'Add' }).click();
    await filterNav(page).getByRole('button', { name: 'Completed' }).click();

    await page.reload();

    await expect(filterNav(page).getByRole('button', { name: 'Completed' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
  });
});
