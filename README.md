# Kraftly – Mina sidor

[![CI](https://github.com/<org>/<repo>/actions/workflows/ci.yml/badge.svg)](https://github.com/<org>/<repo>/actions/workflows/ci.yml)

Kundportal för Kraftly (elbolag). Ursprungligen levererad av Webbmakarna AB 2026-06-30, förvaltas av teamet sedan augusti 2026.

## Kom igång

Alla sätt kräver en `.env` med lokala värden. Den committas aldrig:

    cp .env.example .env

### Med Docker (rekommenderat)

    docker compose up --build

Frontend på http://localhost:8080. API:t nås bara via frontendens `/api` – det har ingen egen port. Stoppa med `docker compose down`.

### Utan Docker

    npm install
    npm run api      # mock-API på port 4000 – läser API_KEY från .env (egen terminal)
    npm run dev      # Vite dev-server på http://localhost:5173

## Tillgänglighetslabben (labbrepo, vecka 9)

Det här repot är Kraftly efter M7: inloggningen är säker och sidorna är snabba. Men alla kan inte använda dem. Det finns tre olika sorters knappar, "knappar" som är `<div>`-taggar, fält utan label och ingen fokusring. Verktygen är redan installerade: **Storybook** med tillägget för tillgänglighet, och **axe i Vitest**. Instruktionerna står i övningen i Canvas. Kortversionen:

    cp .env.example .env
    npm install
    npm run test:a11y      # bara tillgänglighetstesterna – tre av dem är röda från start
    npm run storybook      # Storybook på http://localhost:6006 – öppna fliken Accessibility under storyn

Appen kör ni som vanligt: `npm run api` i en terminal, `npm run dev` i en annan, och logga in med `anna.andersson@example.com` / `kraftly-anna`.

**Exemplen att kopiera:** `src/components/StatusChip.stories.js` (en story) och `src/components/StatusChip.a11y.test.js` (ett axe-test). **De röda testerna:** `src/views/LoginView.a11y.test.js` och `src/views/ProfileView.a11y.test.js`. Ni är klara när `npm run test:run` är grönt.

**axe i Vitest ser inte allt.** Testerna körs i jsdom, en låtsasbrowser utan CSS och utan layout, så kontrast kan axe inte mäta där. Kontrast syns i Storybooks Accessibility-flik, som kör axe i en riktig browser. Att fokusringen är borttagen, eller att en `<div>` används som knapp, hittar inget av verktygen. Det märker ni bara när ni går igenom sidan med tangentbordet (Tab, Enter, mellanslag).

Storybook skriver ut en varning om `vue-docgen-api` när den startar. Den är ofarlig.

## Staging

Varje merge till `main` deployas automatiskt till staging: https://kraftly-volt-staging.onrender.com (sover efter 15 min – första anropet tar en minut). Vilken commit som körs: `/version.txt`. Hur det fungerar, var hemligheterna bor och hur man gör rollback: `docs/deploy.md`.

## Inloggning

Riktig autentisering sedan M6: e-post + lösenord mot Kraftlys API v2, access token i minnet, refresh token i en httpOnly-cookie. Testkonton lokalt: `anna.andersson@example.com` / `kraftly-anna` och `bo.bergstrom@example.com` / `kraftly-bo`. Hur det hänger ihop och OWASP-genomgången: `docs/security.md`. Varför token inte ligger i localStorage: `docs/decisions/tokenlagring.md`.

## Kvalitet

    npm run test:run   # enhets- och komponenttester (Vitest)
    npm run test:api   # API-tester mot mock-API:t (node:test)
    npm run test:a11y  # bara tillgänglighetstesterna (axe i Vitest)
    npm run storybook  # komponenterna en och en på http://localhost:6006
    npm run e2e:pw     # E2E-smoke (Playwright) – kräver npx playwright install chromium
    npm run build      # produktionsbygge till dist/

Prestanda och budgeten i CI: `docs/performance.md`. Pipeline och beslut: se `docs/pipeline.md`, `docs/containers.md`, `docs/deploy.md`, `docs/decisions/`.
