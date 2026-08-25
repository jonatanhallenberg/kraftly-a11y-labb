# Demo-repo · onsdag 26/8 – kursens första Vitest-test

Färdig miljö för live-demon på onsdagspasset. Allt är verifierat: testerna kör, bygget går igenom och dashboarden visar "1,42 kr/kWh" efter demon.

## Innan passet (en gång)

```bash
npm install      # vitest ligger redan i devDependencies – inget nätverk behövs live
npm run api      # terminal 1: mock-API på :4000
npm run dev      # terminal 2: appen på :5173
```

Logga in med vad som helst i formuläret (fejk-login, precis som teamens kod).

## Brancher

| Branch | Läge |
|---|---|
| `demo-start` | **Börja här.** Före demon: ingen `src/utils/`, inget testskript, orörd DashboardView |
| `demo-facit` | Efter demon: allt klart – jämför med `git diff demo-start demo-facit` |

```bash
git checkout demo-start    # återställ inför passet
git checkout .             # nollställ mitt i demon om något spårar ur
```

## Stegen (kod att skriva live)

### 1 · Visa problemet

`src/views/DashboardView.vue` rad 56:

```js
const currentPrice = computed(() =>
  consumptionStore.data ? consumptionStore.data.pricePerKwh : '–'
)
```

Logiken bor i komponenten → måste rendera hela vyn för att testa den. Dessutom visas värdet rått: `1.42` med punkt.

### 2 · Installera Vitest

```bash
npm install -D vitest
```

Lägg till i `package.json`:

```json
"test": "vitest"
```

### 3 · Bryt ut funktionen

Ny fil `src/utils/price.js` — **lämna punkten kvar med flit**:

```js
/** 1.42 -> "1,42 kr/kWh" */
export const formatPrice = (price) => {
  return `${price.toFixed(2)} kr/kWh`
}
```

### 4 · Testet – rött, sen grönt

Ny fil `src/utils/price.test.js`:

```js
import { it, expect } from 'vitest'
import { formatPrice } from './price'

it('använder svenskt decimalkomma', () => {
  const result = formatPrice(1.42) // act
  expect(result).toBe('1,42 kr/kWh') // assert
})
```

```bash
npm test
```

**Verifierad output (rött):**

```
FAIL  src/utils/price.test.js > använder svenskt decimalkomma
AssertionError: expected '1.42 kr/kWh' to be '1,42 kr/kWh'

Expected: "1,42 kr/kWh"
Received: "1.42 kr/kWh"

 ❯ src/utils/price.test.js:6:18
```

Läs felet högt: exakt fil, exakt rad, förväntat vs faktiskt. Fixa sedan:

```js
return `${price.toFixed(2).replace('.', ',')} kr/kWh`
```

→ watch-läget slår om till grönt av sig självt.

### 5 · Bryt koden – se larmet

Ändra `toFixed(2)` → `toFixed(1)`, spara. **Verifierat rött:**

```
AssertionError: expected '1,4 kr/kWh' to be '1,42 kr/kWh'
```

Återställ till `toFixed(2)` → grönt.

### 6 · Koppla in i vyn

I `DashboardView.vue`:

```js
import { formatPrice } from '../utils/price'

const currentPrice = computed(() => formatPrice(consumptionStore.data?.pricePerKwh))
```

Ta bort ` kr/kWh` ur templaten (rad 14) – enheten ligger nu i funktionen:

```html
<div class="stat-value">{{ currentPrice }}</div>
```

Ladda om webbläsaren: **1,42 kr/kWh**.

### Om tiden räcker · TDD-smakprov

Testet först:

```js
it('visar platshållare när priset saknas', () => {
  expect(formatPrice(undefined)).toBe('–')
})
```

**Verifierat rött:** `TypeError: Cannot read properties of undefined (reading 'toFixed')`

Sedan koden:

```js
if (typeof price !== 'number' || Number.isNaN(price)) return '–'
```

→ 2 passed. Koppla till `user.name.split()`-kraschen ur deras skuldinventering: samma sorts bugg, nu fångad av ett test.

## Verifierat i den här miljön

- Node 22 · vitest 4.1.11
- Steg 4 rött → grönt ✓
- Steg 5 larm vid bruten kod ✓
- TDD-steget rött → grönt (2 passed) ✓
- `npm run build` går igenom ✓
- Dashboarden renderar "1,42 kr/kWh" mot mock-API:et ✓
