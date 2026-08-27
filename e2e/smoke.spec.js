import { test, expect } from '@playwright/test'

// Smoke-test mot riktiga mock-API:et: kan en kund logga in och se sin dashboard?
test('kunden kan logga in och ser sin dashboard', async ({ page }) => {
  await page.goto('/login')
  await page.getByPlaceholder('E-postadress').fill('anna@example.com')
  await page.getByPlaceholder('Lösenord').fill('hemligt')
  await page.getByRole('button', { name: 'Logga in' }).click()

  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Hej Anna!')
  await expect(page.getByText('1,42 kr/kWh')).toBeVisible()
})
