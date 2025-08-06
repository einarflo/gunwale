require('dotenv').config();

const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const { initGameEvents } = require('./services/gameEvents');

const app = express();
app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || '*',
    methods: ['GET', 'POST']
  }
});

io.on('connection', (socket) => {
  console.log('Client connected', socket.id);

  socket.on('join_game', (gameId) => {
    socket.join(gameId);
  });

  socket.on('player_update', (data) => {
    const room = data?.gameId;
    room ? io.to(room).emit('player_update', data) : io.emit('player_update', data);
  });

  socket.on('game_status', (data) => {
    const room = data?.gameId;
    room ? io.to(room).emit('game_status', data) : io.emit('game_status', data);
  });
});

initGameEvents(io);

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});
