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

const playersInGame = {
  p1: { username: null, id: null },
  p2: { username: null, id: null },
};
const labelArray = ["p1", "p2"];
server.listen(port, () => console.log(`Listening on port ${port}`));

io.on("connection", function (socket) {
  console.log(`Connection of ${socket.id}`);

  socket.on("login", function (data) {
    console.log(`${data.username} is loggin in. Their socket is ${socket.id}`);
    const newPlayer = {};
    newPlayer.id = socket.id;
    newPlayer.username = data.username;

    function enterGame(player) {
      playersInGame[player] = newPlayer;
      io.to(socket.id).emit("loginConf", {
        youCanEnter: true,
        playersDetails: playersInGame,
      });
      socket.broadcast.emit("a player entered the game", {
        playersDetails: playersInGame,
        enteringPlayerID: socket.id,
        enteringPlayerUsername: playersInGame[player].username,
      });
    }

    if (!playersInGame.p1.id) {
      enterGame("p1");
    } else if (!playersInGame.p2.id) {
      enterGame("p2");
    } else {
      io.to(socket.id).emit("loginConf", {
        youCanEnter: false,
      });
    }
  });

  socket.on("worm word submitted", function (wormWord) {
    console.log("Worm Word Received:", wormWord);
    // Send to dictionary API - if not real word NO POINTS if real word POINTS = wormWord.length;
  });

  socket.on("disconnect", () => {
    console.log(`Disconnection of ${socket.id}`);

    labelArray.forEach((player) => {
      if (socket.id === playersInGame[player].id) {
        const leavingPlayerUsername = playersInGame[player].username;
        playersInGame[player] = { username: null, id: null };
        socket.broadcast.emit("a player left the game", {
          playersDetails: playersInGame,
          leavingPlayerID: socket.id,
          leavingPlayerUsername,
        });
      }
    });
  });
  //THIS WAS FROM MOCK GAME.
  // socket.on("p1ArrayUpdate", function (data) {
  //   console.log("updating p1array");
  //   arrayToBroadcast = data.p1Chars;
  //   socket.broadcast.emit("updatedP1Chars", { p1Chars: arrayToBroadcast });
  // });

  // socket.on("p2ArrayUpdate", function (data) {
  //   console.log("updating p2array");
  //   arrayToBroadcast = data.p2Chars;
  //   socket.broadcast.emit("updatedP2Chars", { p2Chars: arrayToBroadcast });
  // });
});
