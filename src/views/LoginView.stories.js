// Hela inloggningsvyn i Storybook. Öppna fliken Accessibility: här körs axe i en riktig
// browser, med CSS och layout – så här syns även det som axe i Vitest (jsdom) inte ser.
import LoginView from './LoginView.vue'

export default {
  title: 'Vyer/Inloggning',
  component: LoginView,
  parameters: { layout: 'fullscreen' }
}

export const Standard = {}
