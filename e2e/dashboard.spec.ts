import { test, expect } from '@playwright/test';
import { registerNewUser } from './helpers';

test('dashboard reflects a booked expense', async ({ page }) => {
  await registerNewUser(page);

  // Book an expense.
  await page.getByRole('link', { name: 'Transakt.' }).click();
  await page.getByRole('button', { name: 'Neue Transaktion' }).click();
  const dialog = page.getByRole('dialog');
  await dialog.getByRole('combobox').selectOption({ label: 'Lebensmittel' });
  await dialog.getByPlaceholder('0,00').fill('42');
  await dialog.getByRole('button', { name: 'Hinzufügen' }).click();
  await expect(page.getByRole('button', { name: /Lebensmittel/ })).toBeVisible();

  // The dashboard now shows the category breakdown and the expense amount.
  await page.getByRole('link', { name: 'Dashboard' }).click();
  await expect(page.getByText('Ausgaben nach Kategorie')).toBeVisible();
  await expect(page.getByText(/42,00/).first()).toBeVisible();
});
