// Exempel att kopiera: rendera komponenten, låt axe granska DOM:en, förvänta noll överträdelser.
// axe körs här i jsdom – utan layout och utan CSS. Kontrast ser det inte (se README).
import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/vue'
import { axe } from 'jest-axe'
import StatusChip from './StatusChip.vue'

describe('StatusChip – tillgänglighet', () => {
  it('har inga axe-överträdelser', async () => {
    const { container } = render(StatusChip, {
      props: { invoice: { status: 'Betald', due: '2026-06-30' } }
    })
    expect(await axe(container)).toHaveNoViolations()
  })
})
