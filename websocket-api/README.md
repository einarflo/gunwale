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

- `join_game` – klienten melder seg inn i et spill (room).
- `player_update` – videresendes til alle i rommet.
- `game_status` – sendes periodisk fra serveren.
