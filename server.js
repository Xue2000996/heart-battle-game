const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);


app.use(express.static('public'));


const gameState = {
  currentShooter: 'Cassendra',
  score: { 薛: 0, Cassendra: 0 },
  bullets: [],

  ammo: {
  薛: { heart: 5, poop: 3 },
  Cassendra: { heart: 5, poop: 3 }
},
state: {
  薛: "normal",
  Cassendra: "normal",
  王: "normal",
  車銀優: "normal",
  賴: "normal",
  鍾: "normal",
  IU: "normal"
}

};

const playerMap = {};            // socket.id -> 角色
const takenNames = new Set();   // 避免同一角色重複登入
let readyCount = 0;  // ✅ 加在 const gameState... 後面


function resetGameState() {
  gameState.currentShooter = 'Cassendra';
  gameState.score = { 薛: 0, Cassendra: 0 };
  gameState.bullets = [];
  gameState.ammo = {
    薛: { heart: 5, poop: 3 },
    Cassendra: { heart: 5, poop: 3 }
  };
  gameState.state = {
    薛: "normal",
    Cassendra: "normal",
    王: "normal",
    車銀優: "normal",
    賴: "normal",
    鍾: "normal",
    IU: "normal"
  };
}


io.on('connection', (socket) => {

  console.log('✅ 玩家連線:', socket.id);
  socket.emit('init', gameState);

  socket.on('join', ({ name }) => {
  if (!['薛', 'Cassendra'].includes(name)) return;
  if (takenNames.has(name)) {
    socket.emit('error', '這個角色已被使用');
    return;
  }

  playerMap[socket.id] = name;
  takenNames.add(name);
  readyCount++;  // ✅ 加這行

  // ✅ 當兩人都進入時，廣播可以開始
  if (readyCount === 2) {
    io.emit('ready');
  }
  console.log(`🎮 ${name} 加入遊戲 (socket: ${socket.id})`);
});


socket.on('shoot', (data) => {
  const shooter = playerMap[socket.id];
  if (!shooter || shooter !== gameState.currentShooter) return;

  const { type } = data;
  if (gameState.ammo[shooter][type] <= 0) return;

  gameState.ammo[shooter][type]--;
  const projectile = { ...data, shooter };
  gameState.bullets.push(projectile);

  io.emit('newProjectile', projectile);
  gameState.currentShooter = shooter === '薛' ? 'Cassendra' : '薛';

  io.emit('updateGame', gameState);

  const totalAmmo =
    gameState.ammo["薛"].heart + gameState.ammo["薛"].poop +
    gameState.ammo["Cassendra"].heart + gameState.ammo["Cassendra"].poop;

  if (totalAmmo <= 0) {
    const winner =
      gameState.score["薛"] > gameState.score["Cassendra"] ? "薛" :
      gameState.score["Cassendra"] > gameState.score["薛"] ? "Cassendra" : "平手";

    io.emit("endGame", { winner });  // ✅ 廣播給所有前端
  }
});




  socket.on('disconnect', () => {
    console.log('⛔ 玩家離線:', socket.id);
    const name = playerMap[socket.id];
    if (name) {
  takenNames.delete(name);
  readyCount--;  // ✅ 玩家離開就減少人數
}
    delete playerMap[socket.id];
  });

});  // ✅ 補上這行，關閉 io.on('connection', ...)

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🚀 伺服器運行中： http://localhost:${PORT}`);
});
