const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static('public'));

io.on('connection', (socket) => {
  console.log('✅ 玩家連線:', socket.id);

  socket.on('shoot', (data) => {
    socket.broadcast.emit('opponentShot', data);
  });

  socket.on('disconnect', () => {
    console.log('⛔ 玩家離線:', socket.id);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🚀 伺服器運行中： http://localhost:${PORT}`);
});
