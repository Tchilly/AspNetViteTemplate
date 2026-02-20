import { test, expect, Page } from '@playwright/test';

// Title inputs in the todo list have no explicit type attribute (defaults to text),
// while checkboxes have type="checkbox". Use :not([type]) to select title inputs.
const titleInput = 'ul li input:not([type])';

async function clearTodos(page: Page) {
  // Delete all existing todos to start each test from a clean state
  while (true) {
    const deleteButtons = page.getByRole('button', { name: 'Delete' });
    if ((await deleteButtons.count()) === 0) break;
    await deleteButtons.first().click();
    await page.waitForLoadState('networkidle');
  }
}

test.describe('Todos GUI', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/todos');
    await clearTodos(page);
  });

  test('shows the page heading', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Todo App' })).toBeVisible();
  });

  test('shows empty list when no todos exist', async ({ page }) => {
    await expect(page.locator('ul li')).toHaveCount(0);
  });

  test('adds a new todo', async ({ page }) => {
    await page.getByPlaceholder('Add a todo...').fill('Buy milk');
    await page.getByRole('button', { name: 'Add' }).click();
    await page.waitForLoadState('networkidle');

    await expect(page.locator('ul li')).toHaveCount(1);
    await expect(page.locator(titleInput).first()).toHaveValue('Buy milk');
  });

  test('edits a todo title', async ({ page }) => {
    // Create a todo first
    await page.getByPlaceholder('Add a todo...').fill('Original title');
    await page.getByRole('button', { name: 'Add' }).click();
    await page.waitForLoadState('networkidle');

    // Edit the title
    await page.locator(titleInput).first().fill('Updated title');
    await page.getByRole('button', { name: 'Save' }).first().click();
    await page.waitForLoadState('networkidle');

    await expect(page.locator(titleInput).first()).toHaveValue('Updated title');
  });

  test('marks a todo as completed', async ({ page }) => {
    // Create a todo first
    await page.getByPlaceholder('Add a todo...').fill('Task to complete');
    await page.getByRole('button', { name: 'Add' }).click();
    await page.waitForLoadState('networkidle');

    // Check the checkbox and save
    await page.locator('ul li input[type="checkbox"]').first().check();
    await page.getByRole('button', { name: 'Save' }).first().click();
    await page.waitForLoadState('networkidle');

    await expect(page.locator('ul li input[type="checkbox"]').first()).toBeChecked();
  });

  test('deletes a todo', async ({ page }) => {
    // Create a todo first
    await page.getByPlaceholder('Add a todo...').fill('Todo to delete');
    await page.getByRole('button', { name: 'Add' }).click();
    await page.waitForLoadState('networkidle');

    await expect(page.locator('ul li')).toHaveCount(1);

    // Delete it
    await page.getByRole('button', { name: 'Delete' }).first().click();
    await page.waitForLoadState('networkidle');

    await expect(page.locator('ul li')).toHaveCount(0);
  });

  test('add, edit, and delete a todo in sequence', async ({ page }) => {
    // Add
    await page.getByPlaceholder('Add a todo...').fill('Sequential test');
    await page.getByRole('button', { name: 'Add' }).click();
    await page.waitForLoadState('networkidle');
    await expect(page.locator('ul li')).toHaveCount(1);

    // Edit
    await page.locator(titleInput).first().fill('Sequential test \u2013 edited');
    await page.getByRole('button', { name: 'Save' }).first().click();
    await page.waitForLoadState('networkidle');
    await expect(page.locator(titleInput).first()).toHaveValue('Sequential test \u2013 edited');

    // Delete
    await page.getByRole('button', { name: 'Delete' }).first().click();
    await page.waitForLoadState('networkidle');
    await expect(page.locator('ul li')).toHaveCount(0);
  });
});
