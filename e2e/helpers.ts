import { expect, type Page } from '@playwright/test';

export interface TestUser {
  name: string;
  email: string;
  password: string;
}

/** Registers a fresh account and waits for the dashboard to appear. */
export async function registerNewUser(page: Page): Promise<TestUser> {
  const stamp = `${Date.now()}${Math.floor(Math.random() * 1000)}`;
  const user: TestUser = {
    name: `test${stamp}`,
    email: `test${stamp}@example.com`,
    password: 'passwort123',
  };

  await page.goto('/');
  await page.getByRole('tab', { name: 'Registrieren' }).click();
  await page.getByPlaceholder('z. B. max').fill(user.name);
  await page.getByPlaceholder('du@beispiel.de').fill(user.email);
  await page.getByPlaceholder('Mindestens 6 Zeichen').fill(user.password);
  await page.getByRole('button', { name: 'Konto erstellen' }).click();

  await expect(page.getByText('Übrig diesen Monat')).toBeVisible({ timeout: 20_000 });
  return user;
}
