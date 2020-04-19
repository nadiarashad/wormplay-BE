const utils = require("./utils/utils.js");
const express = require("express");
const _ = require("lodash");
const app = express();
const cors = require("cors");
const fs = require("fs");

let shallILimitRoomParticipants = true;

let rooms = utils.egRooms; // There are deliberately no rooms with ID multiple of ten. They get added  by users creating news rooms. ~Chris
const {
  validateWord,
  findFirstGapOrReturnNext,
  adjObj,
  scrabblePoints,
} = require("./utils/utils");

let players = [];

const http = require("http");
const socketIo = require("socket.io");

const port = process.env.PORT || 4002;
const index = require("./routes/index");

app.use(cors());
app.use(index);

const server = http.createServer(app);

const io = socketIo(server);

const labelArray = ["p1", "p2"];
server.listen(port, () => console.log(`Listening on port ${port}`));

io.on("connection", function (socket) {
  console.log(`>>>connection ${socket.id}`);

  // socket.on("send me image", function () {
  //   fs.readFile(__dirname + "/blue.jpg", function (err, buf) {
  //     // socket.emit('image', { image: true, buffer: buf });
  //     console.log("gonna send", buf.toString("base64"));
  //     socket.emit("image", { image: true, buffer: buf.toString("base64") });
  //   });
  // });

  socket.on("my emotion set", function (data) {
    socket.in(data.roomID).emit("opponent's emotion set", data);
    // socket.emit("image", { image: true, buffer: data.buf });
  });

  socket.on("login", function (loginData) {
    console.log(">>>login");
    if (loginData.developmentCheat) {
      console.log("DEVELOPER CHEAT DETECTED");
      const newPlayer = {};
      newPlayer.id = socket.id;
      newPlayer.username = `DEV-TEST-${Math.floor(
        Math.random().toFixed(4) * 10000
      )}`;
      players.push(newPlayer);
      socket.emit("connectionReply", { rooms, myUsername: newPlayer.username });
    }

    const newPlayer = {};
    newPlayer.id = socket.id;
    newPlayer.username = loginData.username;
    players.push(newPlayer);

    socket.emit("connectionReply", { rooms, myUsername: newPlayer.username });
  });

  socket.on("joinRoom", (data) => {
    makePlayerJoinRoom(data, socket);
  });

  socket.on("playerChangesLetter", function (data) {
    const { array } = data;
    socket.broadcast.emit("opponentUpdates", {
      array: array,
    });
  });

  socket.on("worm word submitted", function (wormWord) {
    validateWord(wormWord)
      .then((res) => {
        let scrabblePointsArray = wormWord
          .split("")
          .map((letter) => scrabblePoints[letter]);
        let scrabblePointsTotal = scrabblePointsArray.reduce((a, b) => a + b);

        io.to(socket.id).emit("word checked", {
          word: wormWord,
          isValid: true,
          points: scrabblePointsTotal,
          pointsArray: scrabblePointsArray,
        });
        socket.broadcast.emit("opponent score", {
          word: wormWord,
          isValid: true,
          points: scrabblePointsTotal,
          pointsArray: scrabblePointsArray,
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
  });

  socket.on("update rounds", function (roundsWon) {
    socket.emit("set new rounds", roundsWon);
    socket.broadcast.emit("set new rounds", roundsWon);
  });

  socket.on("make new game request", function (opponentInfo) {
    socket.broadcast.emit("new game request", opponentInfo);
  });

  socket.on("new game", function () {
    console.log("new game");
    socket.emit("start new game");
    socket.broadcast.emit("start new game");
  });

  socket.on("disconnect", () => {
    console.log(`>>>disconnect ${socket.id}`);
    makePlayerLeaveRoom(socket);
  });

  socket.on("create room", (data) => {
    console.log(`>>>create room`, data);
    let newRoomID = findFirstGapOrReturnNext(rooms);
    let newRoom = generateRoom(newRoomID, data.roomName);
    rooms.push(newRoom);
    makePlayerJoinRoom({ roomID: newRoom.roomID }, socket);
  });

  socket.on("quitRoom", () => {
    console.log(`>>>quitRoom ${socket.id}`);
    makePlayerLeaveRoom(socket);
  });

  socket.on("clientSentChat", function (data) {
    data.chatTimestamp = Date.now();
    data.sendingPlayerID = socket.id;
    console.log(">>>clientSentChat");
    socket.emit("serverSentChat", data);
    socket.in(data.roomID).emit("serverSentChat", data);
  });
});

function makePlayerLeaveRoom(socket) {
  console.log("FXN: makePlayerLeaveRoom");
  let roomToLeaveArray = rooms.filter(
    (room) => room.p1.id === socket.id || room.p2.id === socket.id
  );

  if (roomToLeaveArray.length !== 1) {
    console.log(
      "A strange error where a player is disconnected from a room that the rooms array in BE doesn't think they're in, or there are multiple such rooms."
    );
  } else {
    let roomToLeave = roomToLeaveArray[0];

    let playerLabel = roomToLeave.p1.id === socket.id ? "p1" : "p2";

    let leavingPlayerUsername = roomToLeave[playerLabel].username;

    roomToLeave[playerLabel] = { username: null, id: null };

    socket.broadcast.to(roomToLeave.roomID).emit("a player left your game", {
      currentRoom: roomToLeave,
      leavingPlayerID: socket.id,
      leavingPlayerUsername,
    });

    // *********** If the room is now empty, remove it from the room list.
    //For development purposes I've disabled the removal of room 1 even if empty.
    if (roomToLeave.roomID != 1 && !roomToLeave.p1.id && !roomToLeave.p2.id) {
      rooms = _.filter(rooms, function (room) {
        return room.roomID != roomToLeave.roomID;
      });
    }

    socket.broadcast.emit("lobbyUpdate", {
      rooms,
    });

    socket.leave(roomToLeave.roomID);
  }
}

function makePlayerJoinRoom(data, socket) {
  console.log(">>>joinRoom", data, socket);

  let roomID = Number(data.roomID);

  let roomSheWantsToJoin = _.find(rooms, { roomID }); // find the room being requested
  console.log("roomSheWantsToJoin", roomSheWantsToJoin);
  if (
    shallILimitRoomParticipants &&
    (!roomSheWantsToJoin ||
      (roomSheWantsToJoin.p1.id && roomSheWantsToJoin.p2.id))
  ) {
    console.log("gonna refuse connection");
    socket.emit("connectionRefused");
    return;
  }

  if (data.developmentCheat) {
    console.log("DEVELOPER CHEAT DETECTED");
    const newPlayer = {};
    newPlayer.id = socket.id;
    newPlayer.username = `DEV-TEST-${Math.floor(
      Math.random().toFixed(4) * 10000
    )}`;
    players.push(newPlayer);
  }

  //Otherwise, yes, player can enter that room she wants.
  let player = _.find(players, { id: socket.id });
  let whichPlayerIsShe;

  if (roomSheWantsToJoin.p1.id === null) {
    roomSheWantsToJoin.p1 = player;
    whichPlayerIsShe = "p1";
  } else {
    roomSheWantsToJoin.p2 = player;
    whichPlayerIsShe = "p2";
  }
  console.log(
    `${player.username} is gonna join room ${roomSheWantsToJoin.roomID}`
  );

  socket.join(roomID);

  socket.broadcast.to(roomID).emit("a player entered your game", {
    currentRoom: roomSheWantsToJoin,
    enteringPlayerID: socket.id,
    enteringPlayerUsername: player.username,
  });
  console.log("a player entered the game ");

  socket.broadcast.emit("lobbyUpdate", {
    rooms,
  });

  io.to(socket.id).emit("youJoinedARoom", {
    youCanEnter: true,
    playersDetails: { p1: roomSheWantsToJoin.p1, p2: roomSheWantsToJoin.p2 },
    room: roomSheWantsToJoin,
    whichPlayerIsShe,
  });
}

function generateRoom(roomID, roomName) {
  console.log("FXN: generateRoom", roomID, roomName);

  let room = {
    roomID,
    roomName:
      roomName || `${adjObj[Math.floor(Math.random() * 10)]} room ${roomID}`,
    p1: { username: null, id: null },
    p2: { username: null, id: null },
  };
  return room;
}
