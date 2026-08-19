import { test, expect } from '@playwright/test';
import { registerNewUser } from './helpers';

test('add, edit and delete an expense', async ({ page }) => {
  await registerNewUser(page);

  await page.getByRole('link', { name: 'Transakt.' }).click();
  await expect(page.getByRole('heading', { name: 'Transaktionen' })).toBeVisible();
  await expect(page.getByText('Noch keine Transaktionen')).toBeVisible();

  // Create an expense.
  await page.getByRole('button', { name: 'Neue Transaktion' }).click();
  const dialog = page.getByRole('dialog');
  await expect(dialog.getByText('Neue Transaktion')).toBeVisible();
  await dialog.getByRole('combobox').selectOption({ label: 'Lebensmittel' });
  await dialog.getByPlaceholder('0,00').fill('12.50');
  await dialog.getByPlaceholder('z. B. Wocheneinkauf').fill('Testeinkauf');
  await dialog.getByRole('button', { name: 'Hinzufügen' }).click();

  const row = page.getByRole('button', { name: /Lebensmittel/ });
  await expect(row).toBeVisible();
  await expect(page.getByText('Testeinkauf', { exact: false })).toBeVisible();
  await expect(page.getByText(/12,50/)).toBeVisible();

  // Edit the amount.
  await row.click();
  const editDialog = page.getByRole('dialog');
  await expect(editDialog.getByText('Transaktion bearbeiten')).toBeVisible();
  await editDialog.getByPlaceholder('0,00').fill('20');
  await editDialog.getByRole('button', { name: 'Speichern' }).click();
  await expect(page.getByText(/20,00/)).toBeVisible();

  // Delete it.
  await page.getByRole('button', { name: /Lebensmittel/ }).click();
  await page.getByRole('dialog').getByRole('button', { name: 'Löschen' }).click();
  await expect(page.getByText('Noch keine Transaktionen')).toBeVisible();
});
