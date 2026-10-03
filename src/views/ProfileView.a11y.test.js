import { describe, it, expect, vi } from 'vitest'
import { render } from '@testing-library/vue'
import { createTestingPinia } from '@pinia/testing'
import { axe } from 'jest-axe'
import ProfileView from './ProfileView.vue'

const user = {
  customerNo: 'K-100234',
  name: 'Anna Andersson',
  email: 'anna.andersson@example.com',
  address: 'Solvägen 12, 802 67 Gävle'
}

describe('ProfileView – tillgänglighet', () => {
  it('har inga axe-överträdelser', async () => {
    const { container } = render(ProfileView, {
      global: { plugins: [createTestingPinia({ initialState: { user: { user } }, createSpy: vi.fn })] }
    })
    expect(await axe(container)).toHaveNoViolations()
  })
})
