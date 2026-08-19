import { test, expect } from '@playwright/test';
import { registerNewUser } from './helpers';

test('set a monthly limit for a category', async ({ page }) => {
  await registerNewUser(page);

  await page.getByRole('link', { name: 'Budget' }).click();
  await expect(page.getByText('Budget gesamt')).toBeVisible();

  // Open the limit dialog for Lebensmittel and set a limit.
  await page.getByRole('button', { name: /Lebensmittel/ }).click();
  const dialog = page.getByRole('dialog');
  await expect(dialog.getByText(/Lebensmittel/)).toBeVisible();
  await dialog.getByPlaceholder('0,00').fill('300');
  await dialog.getByRole('button', { name: 'Limit speichern' }).click();

  // The category row and the summary now reflect the 300 limit.
  await expect(page.getByText(/300,00/).first()).toBeVisible();

  // Remove the limit again.
  await page.getByRole('button', { name: /Lebensmittel/ }).click();
  await page.getByRole('dialog').getByRole('button', { name: 'Limit entfernen' }).click();
  await expect(page.getByRole('button', { name: /Kein Limit/ }).first()).toBeVisible();
});
