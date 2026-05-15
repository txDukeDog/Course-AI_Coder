import { test, expect } from '@playwright/test';

const USERNAME = 'user';
const PASSWORD = 'password';

async function login(page: import('@playwright/test').Page) {
  await page.goto('/login');
  await page.getByLabel('Username').fill(USERNAME);
  await page.getByLabel('Password').fill(PASSWORD);
  await page.getByRole('button', { name: 'Sign in' }).click();
  await page.waitForURL('/');
  await expect(page.getByText('Backlog')).toBeVisible();
}

test('login with valid credentials shows board', async ({ page }) => {
  await login(page);
  await expect(page.getByText('Backlog')).toBeVisible();
  await expect(page.getByText('Todo')).toBeVisible();
  await expect(page.getByText('In Progress')).toBeVisible();
});

test('login with invalid credentials shows error', async ({ page }) => {
  await page.goto('/login');
  await page.getByLabel('Username').fill('wrong');
  await page.getByLabel('Password').fill('bad');
  await page.getByRole('button', { name: 'Sign in' }).click();
  await expect(page.getByRole('alert')).toBeVisible();
  await expect(page.url()).toContain('/login');
});

test('add card appears in column', async ({ page }) => {
  await login(page);
  await page.getByRole('button', { name: /add card/i }).first().click();
  await page.getByPlaceholder('Card title').fill('E2E test card');
  await page.getByRole('button', { name: 'Add' }).click();
  await expect(page.getByText('E2E test card')).toBeVisible();
});

test('rename column persists', async ({ page }) => {
  await login(page);
  await page.getByRole('button', { name: 'Backlog' }).click();
  const input = page.getByDisplayValue('Backlog');
  await input.clear();
  await input.fill('Renamed Column');
  await input.press('Enter');
  await expect(page.getByText('Renamed Column')).toBeVisible();
  await page.reload();
  await expect(page.getByText('Renamed Column')).toBeVisible();
});

test('edit card updates title', async ({ page }) => {
  await login(page);
  const editButtons = page.getByRole('button', { name: 'Edit card' });
  await editButtons.first().click();
  const titleInput = page.locator('input[type="text"]').first();
  await titleInput.clear();
  await titleInput.fill('Updated card title');
  await page.getByRole('button', { name: 'Save' }).click();
  await expect(page.getByText('Updated card title')).toBeVisible();
});

test('delete card removes it from board', async ({ page }) => {
  await login(page);
  const firstCardText = await page.locator('.group span').first().textContent();
  await page.getByRole('button', { name: 'Delete card' }).first().click();
  if (firstCardText) {
    await expect(page.getByText(firstCardText)).not.toBeVisible();
  }
});

test('logout redirects to login page', async ({ page }) => {
  await login(page);
  await page.getByRole('button', { name: 'Sign out' }).click();
  await expect(page).toHaveURL(/\/login/);
});

test('board requires auth — redirects when not logged in', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveURL(/\/login/);
});

test('board selector shows all seeded boards', async ({ page }) => {
  await login(page);
  await page.getByRole('button', { name: 'Switch board' }).click();
  await expect(page.getByRole('menuitem', { name: 'My Project' })).toBeVisible();
  await expect(page.getByRole('menuitem', { name: 'Design' })).toBeVisible();
  await expect(page.getByRole('menuitem', { name: 'Operations' })).toBeVisible();
  await expect(page.getByRole('menuitem', { name: 'Marketing' })).toBeVisible();
});

test('switching boards loads correct cards', async ({ page }) => {
  await login(page);
  await page.getByRole('button', { name: 'Switch board' }).click();
  await page.getByRole('menuitem', { name: 'Design' }).click();
  await expect(page.getByText('Design - Backlog task 1')).toBeVisible();
  await page.getByRole('button', { name: 'Switch board' }).click();
  await page.getByRole('menuitem', { name: 'My Project' }).click();
  await expect(page.getByText('My Project - Backlog task 1')).toBeVisible();
});

test('create new board and confirm it is empty', async ({ page }) => {
  await login(page);
  await page.getByRole('button', { name: 'Switch board' }).click();
  await page.getByText('+ New Board').click();
  await page.getByRole('textbox', { name: 'New board name' }).fill('E2E Test Board');
  await page.getByRole('button', { name: 'Add' }).click();
  await expect(page.getByText('E2E Test Board')).toBeVisible();
  await expect(page.getByText('Backlog')).toBeVisible();
});

test('selected board persists after page reload', async ({ page }) => {
  await login(page);
  await page.getByRole('button', { name: 'Switch board' }).click();
  await page.getByRole('menuitem', { name: 'Operations' }).click();
  await expect(page.getByText('Operations - Backlog task 1')).toBeVisible();
  await page.reload();
  await expect(page.getByText('Operations - Backlog task 1')).toBeVisible();
});

test('admin sees all boards in selector', async ({ page }) => {
  await page.goto('/login');
  await page.getByLabel('Username').fill('admin');
  await page.getByLabel('Password').fill('admin123');
  await page.getByRole('button', { name: 'Sign in' }).click();
  await page.waitForURL('/');
  await page.getByRole('button', { name: 'Switch board' }).click();
  await expect(page.getByRole('menuitem', { name: 'Alpha - Engineering' })).toBeVisible();
  await expect(page.getByRole('menuitem', { name: 'Beta - Product' })).toBeVisible();
  await expect(page.getByRole('menuitem', { name: 'Gamma - Research' })).toBeVisible();
});

test('manager_a sees only Alpha boards', async ({ page }) => {
  await page.goto('/login');
  await page.getByLabel('Username').fill('manager_a');
  await page.getByLabel('Password').fill('manager123');
  await page.getByRole('button', { name: 'Sign in' }).click();
  await page.waitForURL('/');
  await page.getByRole('button', { name: 'Switch board' }).click();
  await expect(page.getByRole('menuitem', { name: 'Alpha - Engineering' })).toBeVisible();
  await expect(page.getByRole('menuitem', { name: 'Alpha - Design' })).toBeVisible();
  await expect(page.getByRole('menuitem', { name: 'Alpha - Marketing' })).toBeVisible();
  await expect(page.getByRole('menuitem', { name: 'Beta - Product' })).not.toBeVisible();
});

test('user sees only their assigned board', async ({ page }) => {
  await page.goto('/login');
  await page.getByLabel('Username').fill('user');
  await page.getByLabel('Password').fill('password');
  await page.getByRole('button', { name: 'Sign in' }).click();
  await page.waitForURL('/');
  await expect(page.getByText('Alpha - Engineering')).toBeVisible();
});
