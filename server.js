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

  io.emit("news", { hello: stringToBroadcast });

  socket.on("my other event", function (data) {
    stringToBroadcast = data.my;
    socket.broadcast.emit("server update", { hello: stringToBroadcast });
  });

  socket.on("login", function (data) {
    const newPlayer = {};
    newPlayer.id = socket.id; // also data.id the same
    newPlayer.handle = "";

    if (playersInGame[0] === "") {
      playersInGame[0] = newPlayer;
      console.log(playersInGame, "added player1");
      io.to(socket.id).emit("socket.id", {
        p1: true,
      });
    } else if (playersInGame[1] === "") {
      playersInGame[1] = newPlayer;
      console.log(playersInGame, "added player2");
      io.to(playersInGame[0]).emit("gameEntry", {
        playersArr: playersInGame,
      });
    } else {
      io.to(socket.id).emit("sendMsg", {});
    }
  });

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
