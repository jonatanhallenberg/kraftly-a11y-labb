import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/vue'
import { createTestingPinia } from '@pinia/testing'
import { axe } from 'jest-axe'
import LoginView from './LoginView.vue'

// Vyn använder routern – i ett komponenttest räcker en låtsasrouter.
vi.mock('vue-router', () => ({
  useRouter: () => ({ push: vi.fn() }),
  useRoute: () => ({ query: {} })
}))

const renderLogin = () =>
  render(LoginView, {
    global: { plugins: [createTestingPinia({ createSpy: vi.fn })] }
  })

describe('LoginView – tillgänglighet', () => {
  it('har inga axe-överträdelser', async () => {
    const { container } = renderLogin()
    expect(await axe(container)).toHaveNoViolations()
  })

  // axe godkänner en placeholder som namn på fältet. Testing Library gör det inte:
  // getByLabelText hittar bara fält som har en riktig label (eller aria-label/aria-labelledby).
  it('fälten har labels som en skärmläsare hittar', () => {
    renderLogin()
    expect(screen.getByLabelText('E-postadress')).toBeInTheDocument()
    expect(screen.getByLabelText('Lösenord')).toBeInTheDocument()
  })
})
