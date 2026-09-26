# Prestanda

*M7 – Snabb. Budgeten bevakas i CI (`lighthouserc.json`, jobbet "Prestandabudget (Lighthouse)"). Varje optimering nedan är mätt före och efter, på samma dator, med samma inställningar.*

## Så mäter vi

| Vad | Verktyg | Inställning |
|---|---|---|
| Dashboarden (inloggad) | Chrome DevTools → Performance → *Local metrics* (LCP, CLS) | Produktionsbygget (`npm run build && npm run preview`), *Disable network cache* på, nätverk **Fast 4G**, tre omladdningar, medianen |
| Inloggningssidan | Lighthouse (DevTools, mobil) lokalt · Lighthouse CI i pipelinen | Tre körningar, medianen |
| JavaScript per sida | `npm run build` (kolumnen gzip) · `npx vite-bundle-visualizer` för att se vad som ligger i en chunk | – |

Vi mäter aldrig `npm run dev` – dev-servern skickar okomprimerade moduler en och en och säger ingenting om vad en kund får.

## Budgeten

| Mått | Budget | Var | Varför just den |
|---|---|---|---|
| LCP | ≤ 2,5 s | `/login` i CI | Googles gräns för "bra". Dashboarden mäts manuellt (den kräver inloggning) |
| CLS | ≤ 0,1 | `/login` i CI | Googles gräns för "bra" |
| JavaScript som laddas | ≤ 60 kB (överfört) | `/login` i CI | Vi ligger på 44 kB. Budgeten ligger strax över där vi är, så att en ny tung import syns direkt |
| TBT | ≤ 200 ms (varning) | `/login` i CI | Labbets närmaste mått på INP – varnar, blockerar inte |

Budgeten är satt **strax över där vi ligger efter optimeringarna**, inte där vi hoppas hamna. En budget man redan bryter mot slutar folk titta på.

## Optimeringarna

### 1. Hero-bilden: 6 485 kB PNG → 5 kB WebP

Dashboardens LCP-element var `hero.png`, 2400 × 1200 px och 6,5 MB. Den visas som mest 992 px bred.

```bash
npx --yes sharp-cli -i src/assets/hero.png -o src/assets/hero.webp -f webp -q 75 resize 1200
```

Samtidigt: `width="1200" height="600"` på `<img>` (browsern reserverar platsen innan bilden kommit) och `fetchpriority="high"` (LCP-bilden hämtas före annat).

| Dashboarden, Fast 4G | Före | Efter |
|---|---|---|
| Bildens storlek | 6 485 kB | 5 kB |
| LCP | 7,1 s | 0,5 s |

### 2. Lazy routes: all kod i en fil → en chunk per vy

Alla fem vyer importerades direkt i routern. Nu `() => import('../views/…vue')` – en vy laddas när man går dit.

| JavaScript (gzip) | Före | Efter |
|---|---|---|
| Inloggningssidan hämtar | 143 kB | 42 kB (41 + 1) |

### 3. Lodash bort

`DashboardView` importerade hela lodash för en `debounce`. Ersatt med `src/utils/debounce.js` (åtta rader).

| DashboardView-chunken (gzip) | Före | Efter |
|---|---|---|
| | 100 kB | 73 kB |

### 4. Chart.js: bara det vi ritar

`chart.js/auto` registrerar alla diagramtyper. Vi ritar ett stapeldiagram, så vi registrerar `BarController, BarElement, CategoryScale, LinearScale, Tooltip`. Testets mock ändrades samtidigt från `chart.js/auto` till `chart.js` – annars mockar den ingenting.

| DashboardView-chunken (gzip) | Före | Efter |
|---|---|---|
| | 73 kB | 52 kB |

### 5. Layoutskift: reserverad plats för bild och diagram

Två saker flyttade innehållet när sidan laddade: bilden (ingen höjd förrän den kommit) och diagrammet (dyker upp när API:t svarat och trycker ner korten under). Bilden fick `width`/`height` (se 1), diagrammet en behållare med `aspect-ratio: 2 / 1`.

| Dashboarden | Före | Efter |
|---|---|---|
| CLS | 0,24 | 0,00 |

### 6. Komprimering i nginx

nginx skickar okomprimerat om man inte slår på det. `gzip on` + `gzip_types` för JS, CSS, JSON och SVG i `nginx.conf.template`.

```bash
curl -s -o /dev/null -w "%{size_download}\n" -H 'Accept-Encoding: gzip' http://localhost:8080/assets/index-<hash>.js
```

| index-*.js över nätet | Före | Efter |
|---|---|---|
| | 104 kB | 46 kB |

Kolla först om plattformen redan komprimerar (`curl -sI -H 'Accept-Encoding: gzip' <staging>/assets/… | grep -i content-encoding`). Gör den det är vinsten noll i staging, men containern blir korrekt även utan en proxy framför.

## Sammanlagt

| Dashboarden, Fast 4G, cache av | Före | Efter |
|---|---|---|
| LCP | 7,1 s | 0,5 s |
| CLS | 0,24 | 0,00 |
| JavaScript (gzip) | 143 kB | 93 kB |
| Bilder | 6 485 kB | 5 kB |

## Flaskhalsen vi inte äger

`GET /api/v2/consumption` svarar efter drygt 600 ms – en `setTimeout` i API:t ("dashboard felt too fast in the demo"). Den syns i nätverksfliken som en lång grön stapel. Det är Kraftlys API, inte vår kod. Vi rapporterade den till Kraftlys IT och gjorde vår del: resten av sidan väntar inte på den, och diagrammets plats är reserverad så att ingenting hoppar när svaret kommer.

## Vad vi inte gjorde

Vi bytte inte till SSR. Se `docs/decisions/rendering.md`.
