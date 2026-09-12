# kraftly-prod-labb

Övningsrepo för labben *Produktion, feature flag och cache* (vecka 6). Instruktionerna finns i Canvas.

Kraftlys portal med det ni byggde i vecka 5, plus övning 2:s stretch-delar som nu är utgångspunkt:

- Appen anropar `/api` relativt. Ingen API-nyckel i frontendkoden – nginx lägger på den.
- `nginx.conf.template` fyller i `PORT`, `API_URL` och `API_KEY` från miljön när containern startar.
- **Körtidskonfiguration:** `docker/40-runtime-config.sh` skriver `config.js` från miljön när containern startar. Appen läser `window.__KRAFTLY__`. Miljöbannern visar vilken miljö du tittar på.
- Pipelinen (`.github/workflows/ci.yml`) testar, bygger imagen en gång, pushar den till GHCR och deployar till staging. `rollback.yml` deployar en äldre sha utan build.

## Kör lokalt

    cp .env.example .env
    npm install
    npm run api      # mock-API:t på :4000 – läser API_KEY från .env
    npm run dev      # appen på :5173 – Vite-proxyn skickar /api vidare med nyckeln

## Kör imagen lokalt

    docker build -t kraftly .
    docker run --rm -p 8080:80 \
      -e API_URL=http://host.docker.internal:4000 \
      -e API_KEY=lokal-utvecklingsnyckel \
      -e APP_ENV=lokal-container \
      kraftly

`http://localhost:8080` – `version.txt` visar vilken commit imagen byggdes från (lokalt: `lokal`), `config.js` visar konfigurationen containern fick.
