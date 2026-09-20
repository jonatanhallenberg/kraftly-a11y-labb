# kraftly-auth-labb

Övningsrepo för labben *Riktig autentisering* (vecka 7). Instruktionerna finns i Canvas.

Kraftlys portal som den ser ut efter vecka 6, med en skillnad: **mock-API:t är version 2** och har riktig inloggning. Frontenden har inte hunnit med – den loggar fortfarande in "på låtsas" mot det gamla `/api` (som avvecklas 13/10). Labben är att byta.

- `mock-api/server.js`: `/api/v2/auth/login` (e-post + lösenord → access token i svaret, refresh token i en httpOnly-cookie), `/api/v2/auth/refresh`, `/api/v2/auth/logout`, och skyddade `/api/v2/user`, `/api/v2/invoices`, `/api/v2/consumption`, `/api/v2/move` som kräver `Authorization: Bearer <token>`.
- `/api/…` (v1) fungerar tills vidare men svarar med `Deprecation` och `Sunset`.
- Testkonton: `anna.andersson@example.com` / `kraftly-anna` · `bo.bergstrom@example.com` / `kraftly-bo`
- `npm run test:api` kör API-testerna (node:test). `npm run test:run` kör frontendtesterna (Vitest).

## Kör lokalt

    cp .env.example .env
    npm install
    npm run api      # API:t på :4000 – läser API_KEY och JWT_SECRET från .env
    npm run dev      # appen på :5173 – Vite-proxyn skickar /api vidare med nyckeln

Prova API:t utan browser:

    curl -s -X POST localhost:4000/api/v2/auth/login -H 'Content-Type: application/json' -H 'X-Api-Key: lokal-utvecklingsnyckel' \
      -d '{"email":"anna.andersson@example.com","password":"kraftly-anna"}' -i

## Kör imagen lokalt

    docker build -t kraftly .
    docker run --rm -p 8080:80 \
      -e API_URL=http://host.docker.internal:4000 \
      -e API_KEY=lokal-utvecklingsnyckel \
      -e APP_ENV=lokal-container \
      kraftly

`http://localhost:8080` – `version.txt` visar vilken commit imagen byggdes från (lokalt: `lokal`), `config.js` visar konfigurationen containern fick.
