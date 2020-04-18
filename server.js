const utils = require("./utils/utils.js");
const express = require("express");
const _ = require("lodash");
const app = express();
const cors = require("cors");

let shallILimitRoomParticipants = true;

let rooms = utils.egRooms; // There are deliberately no rooms with ID multiple of ten. They get added  by users creating news rooms. ~Chris
const {
  validateWord,
  findFirstGapOrReturnNext,
  adjObj,
} = require("./utils/utils");

let players = [];

const http = require("http");
const socketIo = require("socket.io");

const port = process.env.PORT || 4003;
const index = require("./routes/index");

app.use(cors());
app.use(index);

const server = http.createServer(app);

const io = socketIo(server);

const labelArray = ["p1", "p2"];
server.listen(port, () => console.log(`Listening on port ${port}`));

io.on("connection", function (socket) {
  console.log(`>>>connection ${socket.id}`);

  socket.on("login", function (loginData) {
    console.log(">>>login");

    const newPlayer = {};
    newPlayer.id = socket.id;
    newPlayer.username = loginData.username;
    players.push(newPlayer);

    socket.emit("connectionReply", { rooms });
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
    console.log("Worm Word Received: ", wormWord);

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
    console.log(">>>clientSentChat");
    socket.broadcast.to(data.roomID).emit("serverSentChat", data);
  });
});

function makePlayerLeaveRoom(socket) {
  // console.log(rooms[0]);
  console.log("FXN: makePlayerLeaveRoom");
  let roomToLeaveArray = rooms.filter(
    (room) => room.p1.id === socket.id || room.p2.id === socket.id
  );

  if (roomToLeaveArray.length !== 1) {
    console.log(
      "A strange error where a player is disconnected from a room that the rooms array in BE doesn't think they're in, or there are multiple such rooms."
    );
  } else {
    console.log("in the leaveroom else statement");
    let roomToLeave = roomToLeaveArray[0];

    let playerLabel = roomToLeave.p1.id === socket.id ? "p1" : "p2";
    roomToLeave[playerLabel] = { username: null, id: null };

    socket.broadcast.to(roomToLeave.roomID).emit("a player left the game", {
      playersDetails: { p1: roomToLeave.p1, p2: roomToLeave.p2 },
      leavingPlayerID: socket.id,
      leavingPlayerUsername: roomToLeave[playerLabel].username,
    });

    // *********** If the room is now empty, remove it from the room list
    // if (!roomToLeave.p1.id && !roomToLeave.p2.id) {
    //   rooms = _.filter(rooms, function (room) {
    //     return room.roomID != roomToLeave.roomID;
    //   });
    // }

    socket.leave(roomToLeave.roomID);
  }
  // console.log(rooms[0]);
}

function makePlayerJoinRoom(data, socket) {
  console.log(">>>joinRoom", data, socket);
  // console.log(rooms[0]);

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

  console.log("I joined a room");

  socket.broadcast.to(roomID).emit("a player entered the game", {
    room: roomSheWantsToJoin,
    playersDetails: { p1: roomSheWantsToJoin.p1, p2: roomSheWantsToJoin.p2 },
    enteringPlayerID: socket.id,
    enteringPlayerUsername: player.username,
  });
  console.log("a player enteredthe game ");

  io.to(socket.id).emit("youJoinedARoom", {
    youCanEnter: true,
    playersDetails: { p1: roomSheWantsToJoin.p1, p2: roomSheWantsToJoin.p2 },
    room: roomSheWantsToJoin,
    whichPlayerIsShe,
  });
  console.log("finally joined the room");
}

function generateRoom(roomID, roomName) {
  console.log("FXN: generateRoom", roomID, roomName);

  let room = {
    roomID,
    roomName:
      roomName ||
      `${adjObj[Math.floor(Math.random() * 10)]} room ${room.roomID}`,
    p1: { username: null, id: null },
    p2: { username: null, id: null },
  };
  return room;
}
