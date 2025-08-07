# WebSocket API

En enkel Express- og Socket.IO-server.

## Oppsett

```bash
npm install
cp .env.example .env
```

Rediger `.env` etter behov. Typiske variabler:

```
PORT=3000
CLIENT_URL=http://localhost:5173
API_URL=http://localhost:8000
```

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

REST-APIet brukes fortsatt for operasjoner som ikke er tidskritiske.
