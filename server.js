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
const playersInGame = ["", ""];

server.listen(port, () => console.log(`Listening on port ${port}`));

io.on("connection", function (socket) {
  console.log("New client connected");
  // console.log(socket, "socket");

  io.emit("news", { hello: stringToBroadcast });

  socket.on("my other event", function (data) {
    stringToBroadcast = data.my;
    socket.broadcast.emit("server update", { hello: stringToBroadcast });
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

  const newPlayer = {};
  newPlayer.id = socket.id; // also data.id the same
  newPlayer.handle = "";

  if (playersInGame[0] === "") {
    playersInGame[0] = newPlayer;
    console.log(playersInGame, "added player1");
    io.to(socket.id).emit("player1", {
      p1: true,
    });
  } else if (playersInGame[1] === "") {
    playersInGame[1] = newPlayer;
    console.log(playersInGame, "added player2");
    io.to(socket.id).emit("player2", {
      p2: true,
    });
  } else {
    io.to(socket.id).emit("sendMsg", {});
  }

  socket.on("disconnect", () => {
    if (socket.id === playersInGame[0].id) {
      playersInGame[0] = "";
    } else if (socket.id === playersInGame[1].id) {
      playersInGame[1] = "";
    }
    console.log("Client disconnected");
    console.log(playersInGame);
  });
});
