# Deploy – Kraftly Mina sidor

*Exempelifyllt facit (M4). Tider och URL:er är illustrativa – teamen fyller i sina egna.*

## Flödet

```mermaid
flowchart LR
  PR[PR mot main] --> CI[quality · build · e2e<br/>+ imagen byggs]
  CI -->|merge| MAIN[push till main]
  MAIN --> PUB[publish<br/>docker build EN gång<br/>push ghcr.io/…:sha]
  PUB --> DEP[deploy-staging<br/>deploy hook + imgURL=sha]
  DEP --> R[Render drar imagen<br/>startar containern]
  R --> V[pipelinen väntar tills<br/>/version.txt = sha]
  V --> S[röktest /api/login]
```

En merge till `main` är hela deployen. Ingen i teamet klickar i Render för att släppa en ny version.

## Miljöer

| Miljö | URL | Image | API | Uppdateras |
|---|---|---|---|---|
| Lokal | http://localhost:8080 | byggs lokalt (`docker compose up --build`) | mock-API i compose | när du vill |
| Staging | https://kraftly-volt-staging.onrender.com | `ghcr.io/team-volt/kraftly:<sha>` | Kraftlys test-API | varje merge till main |
| Produktion | – | – | – | M5 (vecka 6) |

Vilken version kör staging? `curl https://kraftly-volt-staging.onrender.com/version.txt` – svaret är commitens sha.

## Konfiguration – var bor vad?

| Variabel | Hemlig? | Lokalt | Staging | Används av |
|---|---|---|---|---|
| `API_KEY` | **ja** | `.env` (egen dev-nyckel) | Render → Environment | nginx lägger på den som `X-Api-Key` |
| `API_URL` | nej | `.env` / compose: `http://api:4000` | Render → Environment | nginx `proxy_pass` |
| `PORT` | nej | 80 (från Dockerfile) | sätts av Render | nginx `listen` |
| `RENDER_DEPLOY_HOOK` | **ja** | – | GitHub → Environments → staging → Secrets | deploy-jobbet |
| `STAGING_URL` | nej | – | GitHub → Environments → staging → Variables | deploy-jobbet (verifiering) |
| `GITHUB_TOKEN` | ja | – | skapas av GitHub per körning | publish (push till GHCR) |

Ingenting i tabellen finns i repot. `.env` är gitignorerad och dockerignorerad, `.env.example` visar vilka variabler som finns.

## API-nyckeln

- Den gamla nyckeln (`kraftly_live_sk_…`) låg i `src/services/api.js` och finns kvar i git-historiken. Den är **röjd för alltid** – alla som klonat eller forkat repot har den. Den är roterad: test-API:t accepterar den inte längre (`curl` nedan ger 401).
- Nyckeln finns inte längre i frontendkoden. En nyckel i JavaScript som skickas till browsern är publik, oavsett om den kommer från en fil, en `VITE_`-variabel eller en miljövariabel vid bygget.
- Den nya nyckeln ligger bara i Render och läggs på i nginx. Browsern ser den aldrig.

```
$ curl -s -o /dev/null -w "%{http_code}\n" -H "X-Api-Key: kraftly_live_sk_9f3a71bd42e88c015d6f" https://<test-api>/api/user
401
```

## Rollback

Det som körs är en image, och varje image i GHCR är taggad med sin sha. Rollback = be Render köra en äldre tagg. Två sätt:

1. **Hooken, samma som pipelinen (förstahandsvalet):** `curl -X POST "$RENDER_DEPLOY_HOOK&imgURL=ghcr.io%2Fteam-volt%2Fkraftly%3A<gammal-sha>"`
2. **Render:** tjänsten → *Events* → välj en tidigare lyckad deploy → *Rollback*. Fungerar exakt för deployer som pipelinen startat (de har en sha-tagg). **Inte** för den allra första deployen, som skapades med `:main` – Render hämtar då den *senaste* imagen med den taggen, alltså den nya versionen.

Kontrollera efteråt med `/version.txt`. Obs: ändrar man en miljövariabel i Render efter en rollback deployas tjänstens grundimage (`:main`) igen – då är rollbacken borta. Nästa merge till `main` deployar som vanligt igen. En rollback är ett tillfälligt läge, inte en lösning – buggen ska fixas i koden.

## Tider (uppmätta, exempel)

| Steg | Tid |
|---|---|
| Merge → publish klar | ~2 min 40 s (quality/build/e2e + docker build + push) |
| Hook → staging kör nya sha:n | ~1 min 10 s |
| Totalt merge → live | ~4 min |
| Kallstart efter 15 min utan trafik | ~50 s för första anropet |

## Kända begränsningar

- Gratisnivån sover efter 15 minuter utan trafik. Första anropet efter det tar runt en minut. Acceptabelt för staging, inte för produktion.
- Render-kontot tillhör tech lead. Övriga i teamet behöver ingen åtkomst för att deploya – det sker via pipelinen – men loggarna syns bara för kontoägaren.
- Imagen byggs för `linux/amd64` på GitHubs runner. En image byggd på en Mac med Apple Silicon (`arm64`) och pushad för hand startar inte på Render. Pusha aldrig för hand.
- Ingen produktion ännu (M5).
