const express = require("express");

const http = require("http");
const socketIo = require("socket.io");

const port = process.env.PORT || 4001;
const index = require("./routes/index");

const app = express();
app.use(index);

const server = http.createServer(app);

const io = socketIo(server);

// Variables for storing clients in game and in lobby
let stringToBroadcast = "this";
const playersInGame = {
  p1: { username: null, id: null },
  p2: { username: null, id: null },
};

server.listen(port, () => console.log(`Listening on port ${port}`));

io.on("connection", function (socket) {
  console.log("New client connected");

  io.emit("news", { hello: stringToBroadcast });

  socket.on("login", function (data) {
    const newPlayer = {};
    newPlayer.id = socket.id;
    newPlayer.username = data.username;

    if (!playersInGame.p1.id) {
      playersInGame.p1 = newPlayer;
      io.to(socket.id).emit("loginConf", {
        youCanEnter: true,
        playersDetails: playersInGame,
      });
    } else if (!playersInGame.p2.id) {
      playersInGame.p2 = newPlayer;
      io.to(socket.id).emit("loginConf", {
        youCanEnter: true,
        playersDetails: playersInGame,
      });
    } else {
      io.to(socket.id).emit("loginConf", {
        youCanEnter: false,
      });
    }
  });

  socket.on("p1ArrayUpdate", function (data) {
    console.log("updating p1array");
    arrayToBroadcast = data.p1Chars;
    socket.broadcast.emit("updatedP1Chars", { p1Chars: arrayToBroadcast });
  });

  socket.on("p2ArrayUpdate", function (data) {
    console.log("updating p2array");
    arrayToBroadcast = data.p2Chars;
    socket.broadcast.emit("updatedP2Chars", { p2Chars: arrayToBroadcast });
  });

  socket.on("disconnect", () => {
    if (socket.id === playersInGame.p1.id) {
      io.emit("player left", {
        leavingPlayerID: playersInGame.p1.id,
        leavingPlayerUsername: playersInGame.p1.username,
      });
      playersInGame.p1 = { username: null, id: null };
    } else if (socket.id === playersInGame.p2.id) {
      io.emit("player left", {
        leavingPlayerID: playersInGame.p2.id,
        leavingPlayerUsername: playersInGame.p2.username,
      });
      playersInGame.p2 = { username: null, id: null };
    }
  });
});
