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

test('fakturasidan visar det API:et svarar – även en faktura servern aldrig haft', async ({ page }) => {
  await page.route('**/api/invoices', (route) =>
    route.fulfill({
      json: [{ id: 'F-999', period: 'December 2019', amount: 999, status: 'Obetald', due: '2020-01-01' }]
    })
  )

  await page.goto('/login')
  await page.getByRole('button', { name: 'Logga in' }).click()
  await page.getByRole('link', { name: 'Fakturor' }).click()

  // Servern har inga fakturor från 2019 – ändå står den där. Svaret kom från mocken.
  await expect(page.getByText('F-999')).toBeVisible()
  await expect(page.getByText('December 2019')).toBeVisible()
})

test('kunden ser ett tydligt fel när API:et ligger nere', async ({ page }) => {
  await page.route('**/api/invoices', (route) => route.fulfill({ status: 500, json: { error: 'boom' } }))

  await page.goto('/login')
  await page.getByRole('button', { name: 'Logga in' }).click()
  await page.getByRole('link', { name: 'Fakturor' }).click()

  // Rött på startkoden – fakturasidan sväljer felet. Grönt först när sidan visar ett felmeddelande.
  await expect(page.getByRole('alert')).toBeVisible()
})
