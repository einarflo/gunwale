# Gunwale

## Components
- React front-end in `/frontend`.
- PHP REST API in `/rest-api` (used for non-time-critical operations).
- Socket.io and Node WebSocket server in `/websocket-api`.

## Running the WebSocket server
1. `cd websocket-api`
2. `npm install`
3. Copy `.env.example` to `.env` and adjust `PORT`, `CLIENT_URL`, and `API_URL`.
4. `npm start`

## Running the front-end
1. Ensure the WebSocket server is running.
2. In `/frontend`, set `REACT_APP_WS_URL` to the server URL, e.g. in a `.env` file:
   ```
   REACT_APP_WS_URL=http://localhost:3000
   ```
3. `npm start`

The REST API continues to handle operations that are not time-critical.
