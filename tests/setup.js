import '@testing-library/jest-dom/vitest'
import { expect } from 'vitest'
import { toHaveNoViolations } from 'jest-axe'

// axe i komponenttesterna. Paketet heter jest-axe men fungerar likadant i Vitest.
// expect(await axe(container)).toHaveNoViolations() skriver ut regeln och elementet när något är fel.
// Kontrastreglerna är avstängda i jest-axe: jsdom har ingen CSS och ingen layout att mäta i.
expect.extend(toHaveNoViolations)
