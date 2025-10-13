# Challenger

En liten Node/Express-tjeneste foran Ollama (AI) med MySQL-cache.

## Starte lokalt

1. Gå til `challenger/`
2. Kjør `docker compose up -d --build`
3. Trekk inn ønsket modell første gang (i et separat skall):
   - `docker exec -it challenger_ollama ollama pull llama3.2:3b-instruct`
4. Test health:
   - `curl http://localhost:8082/health`
5. Test generering (JSON):
   - `curl -s http://localhost:8082/v1/generate -H 'content-type: application/json' -d '{"prompt":"{\"task\":\"say hi\"}","model":"llama3.2:3b-instruct","format":"json","kind":"test"}' | jq`

## Miljøvariabler (compose setter default)
- `OLLAMA_BASE_URL` (default `http://ollama:11434`)
- `PORT` (default `3000`, eksponert som `8082`)
- MySQL: `MYSQL_HOST`, `MYSQL_PORT`, `MYSQL_DATABASE`, `MYSQL_USER`, `MYSQL_PASSWORD`

## Databasen
- MySQL 8.0 startes med database `challenger` og bruker `challenger/challenger`.
- Ved oppstart opprettes tabellen `ai_cache` hvis den ikke finnes.

## Notater
- Første modellkall kan være tregt siden Ollama må laste modellen.
- Juster `num_predict`/`temperature` i `src/index.js` for hastighet/format.
- Bytt modell ved å sette `model` i POST-body, f.eks. `llama3.1:8b-instruct` (kan kreve mer CPU/RAM).

