const express = require("express");

const http = require("http");
const socketIo = require("socket.io");
const { validateWord } = require("./utils/utils");

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
    validateWord(wormWord)
      .then((res) => {
        io.to(socket.id).emit("word checked", {
          word: wormWord,
          isValid: true,
          points: wormWord.length,
        });
        socket.broadcast.emit("opponent score", {
          word: wormWord,
          isValid: true,
          points: wormWord.length,
        });
      })
      .catch((error) => {
        if (error.response.status === 404) {
          io.to(socket.id).emit("word checked", {
            word: wormWord,
            isValid: false,
            points: 0,
          });
          socket.broadcast.emit("opponent score", {
            word: wormWord,
            isValid: false,
            points: 0,
          });
        } else {
          io.to(socket.id).emit("api error", {
            status: error.response.status,
            message: error.response.statusText,
          });
        }
      });
    // Some p1 points vs p2 points to show who wins?? (probably separate function/event)
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
});
