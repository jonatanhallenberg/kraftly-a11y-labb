import { test, expect } from '@playwright/test'

// Smoke-test mot riktiga mock-API:et: startar appen och fungerar det viktigaste flödet?
test('kunden kan logga in och ser sin översikt', async ({ page }) => {
  await page.goto('/login')
  await page.getByPlaceholder('E-postadress').fill('anna@example.com')
  await page.getByPlaceholder('Lösenord').fill('hemligt')
  await page.getByRole('button', { name: 'Logga in' }).click()

  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Hej Anna!')
})
