require('dotenv').config();

const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const { initGameEvents } = require('./services/gameEvents');
const fetch = global.fetch;

const app = express();
app.use(cors());

// Simple health + metrics endpoint
app.get('/_ws/metrics', (_req, res) => {
  const rooms = Array.from(io.sockets.adapter.rooms.keys());
  const sids = Array.from(io.sockets.sockets.keys());
  res.json({
    uptimeSec: Math.round(process.uptime()),
    env: { NODE_ENV: process.env.NODE_ENV, CLIENT_URL: process.env.CLIENT_URL },
    sockets: sids.length,
    rooms,
  });
});

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || '*',
    methods: ['GET', 'POST'],
  }
});

const now = () => new Date().toISOString();
const roomSize = (room) => (io.sockets.adapter.rooms.get(room)?.size || 0);

// In-memory game state (authoritative for live session)
// rooms: Map<gameInstanceId, {
//   players: Map<playerId, { playerId, username, score, colour }>;
//   sockets: Map<socketId, playerId>;
//   answers: Map<questionId, Array<{ playerId: string, alternative: string }>>;
//   status: string;
// }>
const rooms = new Map();
const socketIndex = new Map(); // socketId -> { room, playerId }

function getRoomState(roomId) {
  let state = rooms.get(roomId);
  if (!state) {
    state = {
      players: new Map(),
      sockets: new Map(),
      answers: new Map(),
      status: 'created',
      powerups: {
        shields: new Set(), // playerIds with active shield
        slows: new Map(),   // targetId -> expiresAt ms
      }
    };
    rooms.set(roomId, state);
  }
  return state;
}

function playersArray(state) {
  return Array.from(state.players.values()).map(p => ({
    id: p.playerId,
    username: p.username,
    score: String(p.score ?? '0'),
    colour: p.colour != null ? String(p.colour) : '0'
  }));
}

function summarizeAnswers(state, questionId) {
  const arr = state.answers.get(questionId) || [];
  const counts = { '1': 0, '2': 0, '3': 0, '4': 0 };
  for (const a of arr) {
    const k = String(a.alternative);
    if (counts[k] != null) counts[k] += 1;
  }
  return { counts, totalResponded: arr.length, totalPlayers: state.players.size };
}

// Log all incoming packets (event name + brief payload)
io.use((socket, next) => {
  socket.use((packet, nextInner) => {
    try {
      const [event, payload] = packet || [];
      const size = payload ? JSON.stringify(payload).length : 0;
      console.log(`[${now()}] <- packet id=${socket.id} event=${event} size=${size}`);
    } catch (_) {}
    nextInner();
  });
  next();
});

io.on('connection', (socket) => {
  const ip = socket.handshake.address;
  const origin = socket.handshake.headers?.origin;
  const authKeys = Object.keys(socket.handshake.auth || {});
  const tokenLen = (socket.handshake.auth && socket.handshake.auth.token) ? String(socket.handshake.auth.token).length : 0;
  console.log(`[${now()}] + connect id=${socket.id} ip=${ip} origin=${origin} transport=${socket.conn?.transport?.name} authKeys=${authKeys.join(',')} tokenLen=${tokenLen}`);

  socket.on('join_game', (gameId) => {
    const gid = String(gameId || '');
    if (!gid) {
      console.warn(`[${now()}] join_game missing gameId id=${socket.id}`);
      return;
    }
    socket.join(gid);
    console.log(`[${now()}] room join id=${socket.id} room=${gid} size=${roomSize(gid)} roomsKnown=${Array.from(rooms.keys()).length}`);
  });

  socket.on('player_update', (data) => {
    const room = data?.gameId ? String(data.gameId) : undefined;
    if (room) {
      // Update internal state for known fields (e.g., color changes) if this socket belongs to a player in the room
      const idx = socketIndex.get(socket.id);
      if (idx && idx.room === room && data?.event) {
        const state = rooms.get(room);
        const player = state?.players.get(idx.playerId);
        if (player) {
          if (data.event === 'color' && data?.player?.colour != null) {
            player.colour = String(data.player.colour);
          }
          if (data.event === 'score' && data?.player?.score != null) {
            player.score = String(data.player.score);
          }
        }
      }
      console.log(`[${now()}] -> player_update room=${room} size=${roomSize(room)} keys=${Object.keys(data||{}).join(',')}`);
      io.to(room).emit('player_update', data);
    } else {
      console.log(`[${now()}] -> player_update broadcast keys=${Object.keys(data||{}).join(',')}`);
      io.emit('player_update', data);
    }
  });

  // Player joins the game with a username; server is source of truth.
  // payload: { gameInstanceId, gameId, username }
  socket.on('join_player', async (payload = {}, cb) => {
    try {
      const gameInstanceId = String(payload?.gameInstanceId || '');
      const gameId = String(payload?.gameId || '');
      const username = String(payload?.username || '').trim();
      console.log(`[${now()}] <- join_player id=${socket.id} room=${gameInstanceId} gameId=${gameId} username='${username}'`);
      if (!gameInstanceId || !gameId || !username) {
        cb && cb({ ok: false, error: 'invalid_payload' });
        return;
      }
      const state = getRoomState(gameInstanceId);
      // Unique username check (case-insensitive)
      const taken = Array.from(state.players.values()).some(p => (p.username || '').toLowerCase() === username.toLowerCase());
      if (taken) {
        console.warn(`[${now()}] join_player rejected (taken) room=${gameInstanceId} username='${username}'`);
        cb && cb({ ok: false, error: 'username_taken' });
        return;
      }
      // Persist to API (create GameInstancePlayer)
      const API_URL = process.env.API_URL || 'http://localhost:1337';
      console.log(`[${now()}] join_player persist API_URL=${API_URL ? 'set' : 'unset'}`);
      if (!API_URL) {
        cb && cb({ ok: false, error: 'api_unavailable' });
        return;
      }
      const body = JSON.stringify({
        game_id: gameId,
        game_instance_id: gameInstanceId,
        username,
        score: '0'
      });
      const endpoint = `${API_URL}/game_instance_players/`;
      console.log(`[${now()}] -> POST ${endpoint} bodyLen=${body.length}`);
      const resp = await fetch(endpoint, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body
      });
      console.log(`[${now()}] <- POST status=${resp.status}`);
      if (!resp.ok) {
        cb && cb({ ok: false, error: `persist_status_${resp.status}` });
        return;
      }
      const createdId = await resp.json();
      const playerId = String(createdId);
      console.log(`[${now()}] join_player created playerId=${playerId}`);

      // Track membership
      state.players.set(playerId, { playerId, username, score: '0', colour: '0' });
      state.sockets.set(socket.id, playerId);
      socketIndex.set(socket.id, { room: gameInstanceId, playerId });
      socket.join(gameInstanceId);

      console.log(`[${now()}] player joined room=${gameInstanceId} id=${socket.id} playerId=${playerId} uname=${username} playersNow=${state.players.size}`);
      io.to(gameInstanceId).emit('player_update', { gameId: gameInstanceId, event: 'join', player: { id: playerId, username, score: '0' } });

      cb && cb({ ok: true, playerId });
    } catch (err) {
      console.error(`[${now()}] ! join_player error:`, err?.message || err);
      cb && cb({ ok: false, error: 'exception' });
    }
  });

  // Return current players in a room
  socket.on('get_players', (payload = {}, cb) => {
    const gameInstanceId = String(payload?.gameInstanceId || '');
    if (!gameInstanceId) return cb && cb({ ok: false, error: 'invalid_payload' });
    const state = getRoomState(gameInstanceId);
    const list = playersArray(state);
    console.log(`[${now()}] -> get_players room=${gameInstanceId} count=${list.length}`);
    cb && cb({ ok: true, players: list });
  });

  // Update score (server updates memory and persists)
  // payload: { gameInstanceId, score?: string|number, delta?: string|number }
  socket.on('score_update', async (payload = {}, cb) => {
    try {
      const idx = socketIndex.get(socket.id);
      if (!idx) {
        console.warn(`[${now()}] score_update rejected: not_joined id=${socket.id}`);
        return cb && cb({ ok: false, error: 'not_joined' });
      }
      const { room, playerId } = idx;
      const payloadRoom = String(payload?.gameInstanceId || '');
      if (payloadRoom !== room) {
        console.warn(`[${now()}] score_update rejected: wrong_room id=${socket.id} payloadRoom=${payloadRoom} expected=${room}`);
        return cb && cb({ ok: false, error: 'wrong_room' });
      }
      const state = getRoomState(room);
      const p = state.players.get(playerId);
      if (!p) {
        console.warn(`[${now()}] score_update rejected: player_not_found room=${room} playerId=${playerId}`);
        return cb && cb({ ok: false, error: 'player_not_found' });
      }

      const current = Number(p.score || 0);
      let next = current;
      if (payload?.delta != null) next = current + Number(payload.delta);
      else if (payload?.score != null) next = Number(payload.score);
      console.log(`[${now()}] score_update room=${room} playerId=${playerId} current=${current} -> next=${next}`);
      p.score = String(next);

      // Persist
      const API_URL = process.env.API_URL;
      if (API_URL) {
        const endpoint = `${API_URL}/game_instance_players/${playerId}/`;
        console.log(`[${now()}] -> PUT ${endpoint} score=${String(next)}`);
        const resp = await fetch(endpoint, {
          method: 'PUT',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ score: String(next) })
        });
        console.log(`[${now()}] <- PUT status=${resp.status}`);
      }
      io.to(room).emit('player_update', { gameId: room, event: 'score', player: { id: playerId, score: String(next) } });
      cb && cb({ ok: true, score: String(next) });
    } catch (err) {
      console.error(`[${now()}] ! score_update error:`, err?.message || err);
      cb && cb({ ok: false, error: 'exception' });
    }
  });

  // Update colour (server updates memory and persists)
  // payload: { gameInstanceId, colour: string|number }
  socket.on('color_update', async (payload = {}, cb) => {
    try {
      const idx = socketIndex.get(socket.id);
      if (!idx) {
        console.warn(`[${now()}] color_update rejected: not_joined id=${socket.id}`);
        return cb && cb({ ok: false, error: 'not_joined' });
      }
      const { room, playerId } = idx;
      const payloadRoom = String(payload?.gameInstanceId || '');
      if (payloadRoom !== room) {
        console.warn(`[${now()}] color_update rejected: wrong_room id=${socket.id} payloadRoom=${payloadRoom} expected=${room}`);
        return cb && cb({ ok: false, error: 'wrong_room' });
      }
      const colour = payload?.colour;
      if (colour == null) {
        console.warn(`[${now()}] color_update rejected: invalid_colour id=${socket.id}`);
        return cb && cb({ ok: false, error: 'invalid_colour' });
      }
      const state = getRoomState(room);
      const p = state.players.get(playerId);
      if (!p) {
        console.warn(`[${now()}] color_update rejected: player_not_found room=${room} playerId=${playerId}`);
        return cb && cb({ ok: false, error: 'player_not_found' });
      }

      p.colour = String(colour);
      console.log(`[${now()}] color_update room=${room} playerId=${playerId} colour=${p.colour}`);

      // Persist
      const API_URL = process.env.API_URL;
      if (API_URL) {
        const endpoint = `${API_URL}/game_instance_players/${playerId}/`;
        console.log(`[${now()}] -> PUT ${endpoint} colour=${String(colour)}`);
        const resp = await fetch(endpoint, {
          method: 'PUT',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ colour: String(colour) })
        });
        console.log(`[${now()}] <- PUT status=${resp.status}`);
      }
      io.to(room).emit('player_update', { gameId: room, event: 'color', player: { id: playerId, colour: String(colour) } });
      cb && cb({ ok: true, colour: String(colour) });
    } catch (err) {
      console.error(`[${now()}] ! color_update error:`, err?.message || err);
      cb && cb({ ok: false, error: 'exception' });
    }
  });

  // Player-triggered powerups broadcast to room
  // payload: { gameInstanceId, type: 'eye'|'shield'|'slow'|'end_one'|'nuke'|'custom', targetId?, meta? }
  socket.on('powerup', (payload = {}, cb) => {
    try {
      const idx = socketIndex.get(socket.id);
      if (!idx) return cb && cb({ ok: false, error: 'not_joined' });
      const { room, playerId } = idx;
      const payloadRoom = String(payload?.gameInstanceId || '');
      if (payloadRoom !== room) return cb && cb({ ok: false, error: 'wrong_room' });
      const type = String(payload?.type || '').trim();
      if (!type) return cb && cb({ ok: false, error: 'invalid_type' });
      const state = getRoomState(room);
      const actor = state.players.get(playerId) || { username: undefined, score: '0' };

      // Helper to choose a default target (highest scoring opponent)
      const chooseTarget = () => {
        const arr = Array.from(state.players.entries()).filter(([id]) => id !== playerId);
        if (arr.length === 0) return undefined;
        arr.sort((a,b) => Number(b[1].score||0) - Number(a[1].score||0));
        return arr[0][0];
      };

      let targetId = payload?.targetId ? String(payload.targetId) : undefined;
      if (!targetId && (type === 'end_one' || type === 'slow')) targetId = chooseTarget();

      const evt = {
        gameId: room,
        type,
        actor: { id: playerId, username: actor.username },
        targetId,
        meta: payload?.meta || {}
      };

      const shields = state.powerups.shields;
      const slows = state.powerups.slows;

      const API_URL = process.env.API_URL;

      const persistScore = async (pid, next) => {
        const p = state.players.get(pid);
        if (!p) return;
        p.score = String(next);
        if (API_URL) {
          const endpoint = `${API_URL}/game_instance_players/${pid}/`;
          const resp = await fetch(endpoint, { method: 'PUT', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ score: String(next) }) });
          console.log(`[${now()}] <- PUT score status=${resp.status}`);
        }
        io.to(room).emit('player_update', { gameId: room, event: 'score', player: { id: pid, score: String(next) } });
      };

      if (type === 'shield') {
        shields.add(playerId);
      } else if (type === 'slow') {
        if (targetId) {
          const ttl = Date.now() + 15000; // 15s slow window
          slows.set(targetId, ttl);
          evt.meta.expiresAt = ttl;
        }
      } else if (type === 'end_one') {
        if (targetId) {
          if (shields.has(targetId)) {
            // consume shield and block effect
            shields.delete(targetId);
            evt.meta.blocked = true;
          } else {
            const target = state.players.get(targetId);
            if (target) {
              persistScore(targetId, 0);
            }
          }
        }
      } else if (type === 'nuke') {
        // Zero everyone except shielded
        const promises = [];
        for (const [pid, p] of state.players.entries()) {
          if (shields.has(pid)) {
            evt.meta.skipped = (evt.meta.skipped || []).concat(pid);
            continue;
          }
          promises.push(persistScore(pid, 0));
        }
        Promise.allSettled(promises).then(() => {}).catch(()=>{});
      }

      console.log(`[${now()}] -> powerup room=${room} type=${type} actor=${actor.username || playerId} target=${evt.targetId || ''}`);
      io.to(room).emit('powerup', evt);
      cb && cb({ ok: true });
    } catch (err) {
      console.error(`[${now()}] ! powerup error:`, err?.message || err);
      cb && cb({ ok: false, error: 'exception' });
    }
  });

  // Submit answer (server persists to API)
  // payload: { gameInstanceId, playerId, gameId, gameQuestionId, points, alternative, correct }
  socket.on('answer_submit', async (payload = {}, cb) => {
    try {
      const idx = socketIndex.get(socket.id);
      if (!idx) return cb && cb({ ok: false, error: 'not_joined' });
      const { room, playerId } = idx;
      if (String(payload?.gameInstanceId || '') !== room) return cb && cb({ ok: false, error: 'wrong_room' });
      const API_URL = process.env.API_URL || 'http://localhost:1337';
      if (!API_URL) return cb && cb({ ok: false, error: 'api_unavailable' });

      const body = JSON.stringify({
        game_instance_id: String(payload.gameInstanceId || ''),
        game_instance_player_id: String(payload.playerId || playerId),
        game_question_id: String(payload.gameQuestionId || ''),
        game_id: String(payload.gameId || ''),
        points: String(payload.points || ''),
        alternative: String(payload.alternative || ''),
        correct: String(payload.correct || '0'),
      });
      const endpoint = `${API_URL}/game_instance_answers/`;
      console.log(`[${now()}] -> POST ${endpoint} bodyLen=${body.length}`);
      const resp = await fetch(endpoint, { method: 'POST', headers: { 'content-type': 'application/json' }, body });
      console.log(`[${now()}] <- POST status=${resp.status}`);
      if (!resp.ok) return cb && cb({ ok: false, error: `persist_status_${resp.status}` });
      // Update in-memory aggregation and broadcast incremental update
      const questionId = String(payload.gameQuestionId || '');
      const alternative = String(payload.alternative || '');
      const state = getRoomState(room);
      const arr = state.answers.get(questionId) || [];
      // avoid counting multiple answers from same player
      const already = arr.find(a => a.playerId === playerId);
      if (!already) {
        arr.push({ playerId, alternative });
        state.answers.set(questionId, arr);
        io.to(room).emit('answer_update', { gameId: room, gameQuestionId: questionId, alternative, playerId });
        const summary = summarizeAnswers(state, questionId);
        io.to(room).emit('answer_counts', { gameId: room, gameQuestionId: questionId, ...summary });
        // Auto-end if everyone has answered
        const total = state.players.size;
        if (total > 0 && arr.length >= total) {
          console.log(`[${now()}] auto question_end room=${room} q=${questionId} count=${arr.length}/${total}`);
          io.to(room).emit('question_end', { gameId: room, gameQuestionId: questionId });
        }
      }
      cb && cb({ ok: true });
    } catch (err) {
      console.error(`[${now()}] ! answer_submit error:`, err?.message || err);
      cb && cb({ ok: false, error: 'exception' });
    }
  });

  // Fetch aggregated answers for a question from memory
  // payload: { gameInstanceId, gameQuestionId }
  socket.on('get_answers', (payload = {}, cb) => {
    try {
      const room = String(payload?.gameInstanceId || '');
      const questionId = String(payload?.gameQuestionId || '');
      if (!room || !questionId) return cb && cb({ ok: false, error: 'invalid_payload' });
      const state = getRoomState(room);
      const arr = state.answers.get(questionId) || [];
      console.log(`[${now()}] -> get_answers room=${room} q=${questionId} count=${arr.length}`);
      cb && cb({ ok: true, answers: arr });
    } catch (err) {
      console.error(`[${now()}] ! get_answers error:`, err?.message || err);
      cb && cb({ ok: false, error: 'exception' });
    }
  });

  // Fetch aggregated counts for a question from memory
  // payload: { gameInstanceId, gameQuestionId }
  socket.on('get_answer_counts', (payload = {}, cb) => {
    try {
      const room = String(payload?.gameInstanceId || '');
      const questionId = String(payload?.gameQuestionId || '');
      if (!room || !questionId) return cb && cb({ ok: false, error: 'invalid_payload' });
      const state = getRoomState(room);
      const summary = summarizeAnswers(state, questionId);
      console.log(`[${now()}] -> get_answer_counts room=${room} q=${questionId} total=${summary.totalResponded}/${summary.totalPlayers}`);
      cb && cb({ ok: true, ...summary });
    } catch (err) {
      console.error(`[${now()}] ! get_answer_counts error:`, err?.message || err);
      cb && cb({ ok: false, error: 'exception' });
    }
  });

  // Host-triggered early question end broadcast
  // payload: { gameInstanceId, gameQuestionId? }
  socket.on('question_end', (payload = {}) => {
    try {
      const room = String(payload?.gameInstanceId || '');
      if (!room) return;
      console.log(`[${now()}] -> question_end room=${room} q=${String(payload?.gameQuestionId || '')}`);
      io.to(room).emit('question_end', { gameId: room, gameQuestionId: String(payload?.gameQuestionId || '') });
    } catch (err) {
      console.error(`[${now()}] ! question_end error:`, err?.message || err);
    }
  });

  // Check if a username is taken for a given game instance (room)
  socket.on('check_username', async (payload = {}, cb) => {
    try {
      const gameInstanceId = String(payload?.gameInstanceId || '');
      const username = String(payload?.username || '');
      console.log(`[${now()}] <- check_username room=${gameInstanceId} username='${username}'`);
      if (!gameInstanceId || !username) {
        cb && cb({ ok: false, error: 'invalid_payload' });
        return;
      }
      const API_URL = process.env.API_URL;
      if (!API_URL) {
        cb && cb({ ok: false, error: 'api_unavailable' });
        return;
      }
      const endpoint = `${API_URL}/game_instance_players/${gameInstanceId}/?checkUser=true`;
      console.log(`[${now()}] -> GET ${endpoint}`);
      const res = await fetch(endpoint);
      console.log(`[${now()}] <- GET status=${res.status}`);
      if (!res.ok) {
        cb && cb({ ok: false, error: `status_${res.status}` });
        return;
      }
      const data = await res.json();
      const count = Array.isArray(data) ? data.length : -1;
      const taken = Array.isArray(data) && data.some((p) => String(p?.username || '').toLowerCase() === username.toLowerCase());
      console.log(`[${now()}] check_username room=${gameInstanceId} candidates=${count} taken=${taken}`);
      cb && cb({ ok: true, taken });
    } catch (err) {
      console.error(`[${now()}] ! check_username error:`, err?.message || err);
      cb && cb({ ok: false, error: 'exception' });
    }
  });

  socket.on('game_status', (data) => {
    const room = data?.gameId ? String(data.gameId) : undefined;
    if (room) {
      try {
        if (data?.status === 'started') {
          const state = getRoomState(room);
          state.answers.clear();
          console.log(`[${now()}] state reset answers for room=${room}`);
        }
      } catch (e) {
        console.warn(`[${now()}] failed to reset answers for room=${room}`);
      }
      console.log(`[${now()}] -> game_status room=${room} size=${roomSize(room)} status=${data?.status} index=${data?.index}`);
      io.to(room).emit('game_status', data);
    } else {
      console.log(`[${now()}] -> game_status broadcast status=${data?.status} index=${data?.index}`);
      io.emit('game_status', data);
    }
  });

  socket.on('disconnecting', (reason) => {
    const rooms = Array.from(socket.rooms.values()).filter(r => r !== socket.id);
    rooms.forEach(r => console.log(`[${now()}] - leaving id=${socket.id} room=${r} size=${roomSize(r)}`));
    console.log(`[${now()}] x disconnecting id=${socket.id} reason=${reason}`);
  });
  socket.on('disconnect', (reason) => {
    const idx = socketIndex.get(socket.id);
    if (idx) {
      const { room, playerId } = idx;
      const state = rooms.get(room);
      if (state) {
        state.sockets.delete(socket.id);
        const removed = state.players.get(playerId);
        state.players.delete(playerId);
        console.log(`[${now()}] player left room=${room} id=${socket.id} playerId=${playerId} uname=${removed?.username} playersNow=${state.players.size}`);
        io.to(room).emit('player_update', { gameId: room, event: 'leave', player: { id: playerId, username: removed?.username } });
      }
      socketIndex.delete(socket.id);
    }
    console.log(`[${now()}] x disconnect id=${socket.id} reason=${reason}`);
  });
  socket.on('error', (err) => {
    console.error(`[${now()}] ! socket error id=${socket.id} err=${err?.message || err}`);
  });
});

// Background emitters (poll API and emit over WS)
initGameEvents(io);

// Process-level error logs
process.on('unhandledRejection', (err) => console.error(`[${now()}] ! unhandledRejection`, err));
process.on('uncaughtException', (err) => console.error(`[${now()}] ! uncaughtException`, err));

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`[${now()}] WebSocket API listening on ${PORT} (CLIENT_URL=${process.env.CLIENT_URL || '*'})`);
});
