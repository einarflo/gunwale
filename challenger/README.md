# Challenger

En liten Node/Express-tjeneste foran Ollama (AI) med MySQL-cache.

## Starte lokalt

1. Gå til `challenger/`
2. Kjør `docker compose up -d --build`
3. Trekk inn ønsket modell første gang (i et separat skall):
   - `docker exec -it (ollama container id) ollama pull llama3.2:3b-instruct-q4_K_M`
4. Test health:
   - `curl http://localhost:8082/health`
5. Test generering (JSON):
   - `curl -s http://localhost:8082/v1/generate -H 'content-type: application/json' -d '{"prompt":"{\"task\":\"say hi\"}","model":"llama3.2:3b-instruct-q4_K_M","format":"json","kind":"test"}' | jq`

## Produksjon (Traefik + HTTPS)
- A‑record for domenet (f.eks. `ai.tavl.no`) må peke til serverens IP.
- Sett miljøvariabelen `TRAEFIK_ACME_EMAIL` før `docker compose up` (brukes for Let's Encrypt).
- Traefik ruter automatisk til Challenger på `https://ai.tavl.no` (se `docker-compose.yml`).
 - MinIO (media) er tilgjengelig på `https://media.tavl.no`.

## Ollama: hente og håndtere modeller

Kjør kommandoene mot Ollama‑containeren:

- Liste modeller:
  - `docker exec -it (ollama container id) ollama list`
- Hente anbefalte modeller (CPU/Q4):
  - 3B (rask, fin til alternativer):
    - `docker exec -it (ollama container id) ollama pull llama3.2:3b-instruct-q4_K_M`
  - 8B (bedre spørsmålskvalitet):
    - `docker exec -it (ollama container id) ollama pull llama3.1:8b-instruct-q4_K_M`
  - (Valgfritt) 14B for høyere kvalitet:
    - `docker exec -it (ollama container id) ollama pull llama3.1:14b-instruct-q4_K_M`
- Fjerne en modell:
  - `docker exec -it (ollama container id) ollama rm llama3.1:8b-instruct-q4_K_M`
- Diskbruk for modeller:
  - `docker exec -it (ollama container id) bash -lc 'du -sh /root/.ollama'`

Omtrentlige størrelser (modellfiler)
- 3B Q4_K_M: ~2–3 GB
- 7–8B Q4_K_M: ~5–6 GB
- 14B Q4_K_M: ~10–12 GB

Tips for ytelse og «varm» modell
- Første kall etter at modellen er «kald» kan ta ekstra tid (1–6+ sek avhengig av størrelse).
- Øk keep‑alive slik at modellen blir liggende i minnet lenger (compose):
  - `OLLAMA_KEEP_ALIVE=12h` (eller `24h`)
- Alternativ: be om keep‑alive per kall (Challenger → Ollama):
  - legg `keep_alive: "12h"` i body til `/api/generate` (se Ollama‑docs).
- Enkel «warmup» hver time for å holde 3B varm:
  - `docker exec -it (ollama container id) bash -lc 'curl -s http://localhost:11434/api/generate -d '{"model":"llama3.2:3b-instruct-q4_K_M","prompt":"ok","stream":false,"options":{"num_predict":1},"keep_alive":"12h"}' >/dev/null'`

## API‑eksempler (via Challenger)
- Health (lokalt): `curl http://localhost:8082/health`
- Health (prod): `curl https://ai.tavl.no/health`
- Foreslå alternativer:
  - `curl -s https://ai.tavl.no/v1/options -H 'content-type: application/json' -d '{"question":"Hvem malte Skrik?","correct_answer":"Edvard Munch","option_count":4,"model":"llama3.2:3b-instruct-q4_K_M"}' | jq`
- Foreslå spørsmål:
  - `curl -s https://ai.tavl.no/v1/questions -H 'content-type: application/json' -d '{"title":"Norsk historie","description":"Viktige hendelser 1800–2000","count":5,"model":"llama3.2:3b-instruct-q4_K_M"}' | jq`

## Miljøvariabler
- `OLLAMA_BASE_URL` (default `http://ollama:11434`)
- `PORT` (default `3000`)
- `DATABASE_URL` (MySQL, settes i compose)
- MySQL (brukes av Prisma‐clienten via `DATABASE_URL`): `MYSQL_HOST`, `MYSQL_PORT`, `MYSQL_DATABASE`, `MYSQL_USER`, `MYSQL_PASSWORD`

## Media (MinIO / S3)
- MinIO kjører som egen service eksponert via Traefik på `https://media.tavl.no`.
- Init‑jobben oppretter bøtta `tavl-media`, åpner public GET, og CORS (GET/PUT) for `https://tavl.no` og `https://ai.tavl.no`.
- Backend (mothership) trenger disse env‑variablene (se toppnivå `docker-compose.yml`):
  - `S3_ENDPOINT=https://media.tavl.no`
  - `S3_REGION=us-east-1`
  - `S3_BUCKET=tavl-media`
  - `S3_ACCESS_KEY` og `S3_SECRET_KEY` (samme som MinIO root user/pass)
  - `S3_FORCE_PATH_STYLE=true`
 - Frontend laster opp via presign: POST `/media/presign` → PUT direkte til MinIO → lagrer `publicUrl` i DB.

## Databasen
- MySQL 8.0 startes med database `challenger` og bruker `challenger/challenger`.
- Prisma‐schema ligger i `prisma/schema.prisma`. Kjør `npx prisma generate` etter endringer.

## Notater
- Første modellkall kan være tregt siden Ollama må laste modellen.
- Juster `num_predict`/`temperature` i `src/**/*.ts` for hastighet/format.
- Bytt modell ved å sette `model` i POST‐body, f.eks. `llama3.1:8b-instruct-q4_K_M` (tregere men høyere kvalitet enn 3B).
