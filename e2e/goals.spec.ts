import { test, expect } from '@playwright/test';
import { registerNewUser } from './helpers';

test('create a savings goal, add a contribution and delete it', async ({ page }) => {
  await registerNewUser(page);

  await page.getByRole('link', { name: 'Ziele' }).click();
  await expect(page.getByRole('heading', { name: 'Sparziele' })).toBeVisible();
  await expect(page.getByText('Noch keine Sparziele')).toBeVisible();

  // Create a goal.
  await page.getByRole('button', { name: 'Neues Sparziel' }).click();
  let dialog = page.getByRole('dialog');
  await dialog.getByPlaceholder('z. B. Urlaub').fill('Urlaub');
  await dialog.getByPlaceholder('0,00').fill('500');
  await dialog.getByRole('button', { name: 'Anlegen' }).click();

  await expect(page.getByRole('button', { name: /Urlaub/ })).toBeVisible();
  await expect(page.getByText(/500,00/).first()).toBeVisible();

  // Add a contribution.
  await page.getByRole('button', { name: 'Einzahlen' }).click();
  dialog = page.getByRole('dialog');
  await expect(dialog.getByText(/Einzahlung/)).toBeVisible();
  await dialog.getByPlaceholder('0,00').fill('100');
  await dialog.getByRole('button', { name: 'Einzahlen' }).click();

  await expect(page.getByText(/100,00/).first()).toBeVisible();

  // Delete the goal.
  await page.getByText('Urlaub').click();
  await page.getByRole('dialog').getByRole('button', { name: 'Löschen' }).click();
  await expect(page.getByText('Noch keine Sparziele')).toBeVisible();
});
