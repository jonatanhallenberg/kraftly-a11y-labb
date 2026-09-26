# Beslut: rendering – SPA, SSR eller statiskt?

**Datum:** 2026-10-08 · **Beslut:** vi behåller portalen som SPA (client-side rendering). Ingen Nuxt.

## Bakgrund

Efter M7 har dashboarden LCP 0,5 s på Fast 4G. Frågan från torsdagens föreläsning: skulle server-side rendering med Nuxt göra portalen snabbare eller bättre?

## Alternativ vi jämförde

| | SPA (i dag) | SSR (Nuxt) | Statiskt (SSG, `nuxt generate`) |
|---|---|---|---|
| Första HTML:en | tom `<div id="app">`, allt ritas av JS | färdig sida från servern | färdig sida, byggd i förväg |
| Passar för | inloggade appar | publika sidor med data som ändras | publika sidor som sällan ändras |
| SEO | ingen (sidorna är bakom inloggning) | bra | bra |
| Drift | statiska filer i nginx | en Node-server per instans | statiska filer |

## Motivering

Allt i portalen ligger bakom inloggning: det finns ingen SEO att vinna, och det första meningsfulla innehållet kräver ändå ett API-anrop med kundens token. SSR skulle ge oss en Node-server att drifta, skala och säkra i utbyte mot en marginell vinst i upplevd hastighet – en vinst vi redan tagit ut med bilden och lazy routes.

## Konsekvenser

- Vi fortsätter serva statiska filer från nginx (billigt, enkelt att skala, se `docs/scaling.md`).
- **Omprövas om** Kraftly vill ha publika sidor i samma kodbas (t.ex. prislistor och spartips som ska hittas via Google). Då är Nuxt med SSR eller SSG för de sidorna rätt val.
