# kraftly-cd-labb

Övningsrepo för labben *Första deployen* (vecka 5). Instruktionerna finns i Canvas.

Kraftlys portal, containeriserad sedan förra veckan – nu förberedd för molnet:

- Appen anropar `/api` relativt. Ingen API-nyckel i frontendkoden.
- `nginx.conf.template` fyller i `PORT`, `API_URL` och `API_KEY` från miljön när containern startar.
- Pipelinen (`.github/workflows/ci.yml`) testar, bygger imagen en gång, pushar den till GHCR och deployar till staging.

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
      kraftly

`http://localhost:8080` – och `http://localhost:8080/version.txt` visar vilken commit imagen byggdes från (lokalt: `lokal`).
