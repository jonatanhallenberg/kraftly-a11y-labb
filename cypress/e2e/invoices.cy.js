// Mockat nätverk med cy.intercept: vi bestämmer vad API:et svarar.
describe('fakturor', () => {
  beforeEach(() => {
    cy.intercept('POST', '**/api/login', { token: 'test', name: 'Test Testsson' })
    cy.intercept('GET', '**/api/user', {
      name: 'Test Testsson', contract: 'Rörligt pris', email: 't@example.com', address: '', customerNo: 'K-1'
    })
    cy.intercept('GET', '**/api/consumption', { unit: 'kWh', months: ['Jan'], values: [100], pricePerKwh: 2 })
  })

  it('en obetald faktura med passerat förfallodatum visas som Förfallen', () => {
    cy.intercept('GET', '**/api/invoices', [
      { id: 'F-1', period: 'Juni 2026', amount: 412, status: 'Obetald', due: '2020-01-01' },
      { id: 'F-2', period: 'Maj 2026', amount: 486, status: 'Betald', due: '2026-06-30' }
    ]).as('invoices')

    cy.visit('/login')
    cy.contains('button', 'Logga in').click()
    cy.contains('a', 'Fakturor').click()
    cy.wait('@invoices')

    cy.contains('tr', 'F-1').find('[role=status]').should('have.text', 'Förfallen')
    cy.contains('tr', 'F-2').find('[role=status]').should('have.text', 'Betald')
  })

  it('kunden ser ett tydligt fel när API:et ligger nere', () => {
    cy.intercept('GET', '**/api/invoices', { statusCode: 500, body: { error: 'boom' } })

    cy.visit('/login')
    cy.contains('button', 'Logga in').click()
    cy.contains('a', 'Fakturor').click()

    cy.get('[role=alert]').should('be.visible')
  })
})
