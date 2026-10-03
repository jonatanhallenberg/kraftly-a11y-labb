// Exempel att kopiera: en story = komponenten i ett visst läge, med args (props) som går att
// ändra under Controls. tags: ['autodocs'] ger en Docs-sida med alla lägen på samma ställe.
import StatusChip from './StatusChip.vue'

export default {
  title: 'Komponenter/StatusChip',
  component: StatusChip,
  tags: ['autodocs']
}

export const Betald = {
  args: { invoice: { id: 'F-2026-06', status: 'Betald', due: '2026-06-30' } }
}

export const Obetald = {
  args: { invoice: { id: 'F-2026-09', status: 'Obetald', due: '2999-12-31' } }
}

export const Forfallen = {
  name: 'Förfallen',
  args: { invoice: { id: 'F-2026-01', status: 'Obetald', due: '2020-01-01' } }
}
