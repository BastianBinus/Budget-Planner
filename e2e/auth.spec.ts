import { test, expect } from '@playwright/test';
import { registerNewUser } from './helpers';

test('sign up, stay logged in after reload, log out and sign back in', async ({ page }) => {
  const user = await registerNewUser(page);

  // Session persists across reloads (localStorage).
  await page.reload();
  await expect(page.getByText('Übrig diesen Monat')).toBeVisible();

  // Log out.
  await page.getByRole('button', { name: 'Abmelden' }).click();
  await expect(page.getByRole('tab', { name: 'Anmelden' })).toBeVisible();

  // Sign in again with the email address.
  await page.getByPlaceholder('max oder du@beispiel.de').fill(user.email);
  await page.getByPlaceholder('Dein Passwort').fill(user.password);
  await page.getByRole('button', { name: 'Anmelden' }).click();
  await expect(page.getByText('Übrig diesen Monat')).toBeVisible();

  // Log out and sign in with the display name instead of the email.
  await page.getByRole('button', { name: 'Abmelden' }).click();
  await page.getByPlaceholder('max oder du@beispiel.de').fill(user.name);
  await page.getByPlaceholder('Dein Passwort').fill(user.password);
  await page.getByRole('button', { name: 'Anmelden' }).click();
  await expect(page.getByText('Übrig diesen Monat')).toBeVisible();
});

test('rejects a wrong password with a friendly error', async ({ page }) => {
  const user = await registerNewUser(page);
  await page.getByRole('button', { name: 'Abmelden' }).click();

  await page.getByPlaceholder('max oder du@beispiel.de').fill(user.email);
  await page.getByPlaceholder('Dein Passwort').fill('falschespasswort');
  await page.getByRole('button', { name: 'Anmelden' }).click();

  await expect(page.getByRole('alert')).toContainText('falsch');
});
