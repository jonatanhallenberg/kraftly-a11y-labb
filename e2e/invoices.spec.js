import { test, expect } from '@playwright/test'

// Mockat nätverk: vi bestämmer vad API:et svarar – ingen server behövs för det vi testar.
test.beforeEach(async ({ page }) => {
  await page.route('**/api/login', (route) => route.fulfill({ json: { token: 'test', name: 'Test Testsson' } }))
  await page.route('**/api/user', (route) =>
    route.fulfill({ json: { name: 'Test Testsson', contract: 'Rörligt pris', email: 't@example.com', address: '', customerNo: 'K-1' } })
  )
  await page.route('**/api/consumption', (route) =>
    route.fulfill({ json: { unit: 'kWh', months: ['Jan'], values: [100], pricePerKwh: 2 } })
  )
})

test('en obetald faktura med passerat förfallodatum visas som Förfallen', async ({ page }) => {
  await page.route('**/api/invoices', (route) =>
    route.fulfill({
      json: [
        { id: 'F-1', period: 'Juni 2026', amount: 412, status: 'Obetald', due: '2020-01-01' },
        { id: 'F-2', period: 'Maj 2026', amount: 486, status: 'Betald', due: '2026-06-30' }
      ]
    })
  )

  await page.goto('/login')
  await page.getByRole('button', { name: 'Logga in' }).click()
  await page.getByRole('link', { name: 'Fakturor' }).click()

  const row = page.getByRole('row').filter({ hasText: 'F-1' })
  await expect(row.getByRole('status')).toHaveText('Förfallen')
  await expect(page.getByRole('row').filter({ hasText: 'F-2' }).getByRole('status')).toHaveText('Betald')
})

test('kunden ser ett tydligt fel när API:et ligger nere', async ({ page }) => {
  await page.route('**/api/invoices', (route) => route.fulfill({ status: 500, json: { error: 'boom' } }))

  await page.goto('/login')
  await page.getByRole('button', { name: 'Logga in' }).click()
  await page.getByRole('link', { name: 'Fakturor' }).click()

  // Rött på startkoden – fakturasidan sväljer felet. Grönt först när sidan visar ett felmeddelande.
  await expect(page.getByRole('alert')).toBeVisible()
})
