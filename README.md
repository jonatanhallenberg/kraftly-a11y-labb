# Kraftly – Mina sidor

[![CI](https://github.com/<org>/<repo>/actions/workflows/ci.yml/badge.svg)](https://github.com/<org>/<repo>/actions/workflows/ci.yml)

Kundportal för Kraftly (elbolag). Ursprungligen levererad av Webbmakarna AB 2026-06-30, förvaltas av teamet sedan augusti 2026.

## Kom igång

### Med Docker (rekommenderat)

    docker compose up --build

Frontend på http://localhost:8080, mock-API på http://localhost:4000. Stoppa med `docker compose down`.

### Utan Docker

    npm install
    npm run api      # mock-API på port 4000 (egen terminal)
    npm run dev      # Vite dev-server på http://localhost:5173

## Kvalitet

    npm run test:run   # enhets- och komponenttester (Vitest)
    npm run e2e:pw     # E2E-smoke (Playwright) – kräver npx playwright install chromium
    npm run build      # produktionsbygge till dist/

Pipeline och beslut: se `docs/pipeline.md`, `docs/containers.md`, `docs/testing.md`.
