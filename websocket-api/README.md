# WebSocket API

En enkel Express- og Socket.IO-server.

## Oppsett

```bash
npm install
cp .env.example .env
```

Rediger `.env` etter behov.

## Miljøvariabler

Serveren bruker følgende variabler:

| Variabel | Beskrivelse | Standard |
|---------|-------------|----------|
| `PORT` | Porten serveren lytter på. | `3000` |
| `CLIENT_URL` | URL til klienten som tillates via CORS. | `*` |
| `API_URL` | Base-URL til REST-APIet for periodiske statusoppdateringer. | – |

## Kjøring

```bash
npm start
```

Serveren starter på angitt `PORT` og eksponerer Socket.IO-endepunktet.

### Events

| Event | Payload | Respons |
|-------|---------|---------|
| `join_game` | `gameId` (string) | Ingen direkte respons, socketen joiner rommet for spillet. |
| `player_update` | Objekt med minst `gameId` og øvrige spillerdata | Broadcastes som `player_update` til alle klienter i samme rom. |
| `game_status` | Objekt, valgfritt `gameId` | Broadcastes som `game_status` til rommet eller alle klienter. Serveren sender også periodisk status fra REST-APIet. |
| `check_username` | Objekt: `{ gameInstanceId, username }` | Callback-respons `{ ok, taken }`. Sjekker mot REST-API om brukernavn er opptatt i angitt spillinstans. |
| `color_update` | Objekt: `{ gameInstanceId, colour }` | Callback-respons `{ ok }`. Oppdaterer farge for aktiv spiller, persisterer til API og broadcaster `player_update` med `event: 'color'`. |
| `answer_submit` | Objekt: `{ gameInstanceId, playerId, gameId, gameQuestionId, points, alternative, correct }` | Persisterer svar til API. Callback `{ ok }`. Broadcaster inkrementell `answer_update`. |
| `answer_update` | Objekt: `{ gameId, gameQuestionId, alternative, playerId }` | Broadcastes når et nytt (første) svar registreres for en spiller. |
| `get_answers` | Objekt: `{ gameInstanceId, gameQuestionId }` | Callback `{ ok, answers }`. Returnerer serverens minne-aggregat for aktuelle spørsmål. |
| `question_end` | Objekt: `{ gameInstanceId, gameQuestionId? }` | Host kan trigge tidlig avslutning. Broadcastes som `question_end` til rommet, som får klientene til å avslutte runden. |
| `answer_counts` | Broadcast: `{ gameId, gameQuestionId, counts: { '1', '2', '3', '4' }, totalResponded, totalPlayers }` | Sendes ved hvert nytt svar. |
| `get_answer_counts` | Objekt: `{ gameInstanceId, gameQuestionId }` | Callback `{ ok, counts, totalResponded, totalPlayers }`. |

REST-APIet brukes fortsatt for operasjoner som ikke er tidskritiske.
