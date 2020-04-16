const express = require("express");
const uuid = require("uuid");
const _ = require("lodash");
const app = express();
let rooms = [];
let players = [];

const http = require("http");
const socketIo = require("socket.io");
const { validateWord } = require("./utils/utils");

const port = process.env.PORT || 4001;
const index = require("./routes/index");

app.use(index);

const server = http.createServer(app);

const io = socketIo(server);

const labelArray = ["p1", "p2"];
server.listen(port, () => console.log(`Listening on port ${port}`));

io.on("connection", function (socket) {
  console.log(`>>>connection ${socket.id}`);

  socket.on("login", function (loginData) {
    console.log(">>>login");
    let lobbyData = {};
    addRoomsToData(lobbyData); // add room info to message
    socket.emit("connectionReply", lobbyData); // send message to user

    const newPlayer = {};
    newPlayer.id = socket.id;
    newPlayer.username = loginData.username;
    players.push(newPlayer);
  });

  socket.on("joinRoom", function (data) {
    console.log(">>>joinRoom");
    let roomID = data.roomID;

    //HERE'S WHAT A ROOM LOOKS LIKE:
    // room = {
    //   roomID: uuid.v4(), //possible screw point
    //   p1: { username: null, id: null },
    //   p2: { username: null, id: null },
    // };

    let roomSheWantsToJoin = _.find(rooms, { roomID }); // find the room being requested

    if (
      !roomSheWantsToJoin ||
      (roomSheWantsToJoin.p1.id && roomSheWantsToJoin.p2.id)
    ) {
      socket.emit("connectionRefused");
      return;
    }

    //Otherwise, yes, player can enter that room she wants.
    let player = _.find(players, { id: socket.id });

    if (roomSheWantsToJoin.p1.id === null) {
      roomSheWantsToJoin.p1 = player;
    } else {
      roomSheWantsToJoin.p2 = player;
    }

    socket.join(roomID);

    socket.broadcast.emit("a player entered the game", {
      room: roomSheWantsToJoin,
      playersDetails: { p1: roomSheWantsToJoin.p1, p2: roomSheWantsToJoin.p2 },
      enteringPlayerID: socket.id,
      enteringPlayerUsername: player.username,
    });

    io.to(socket.id).emit("youJoinedARoom", {
      youCanEnter: true,
      playersDetails: { p1: roomSheWantsToJoin.p1, p2: roomSheWantsToJoin.p2 },
      room: roomSheWantsToJoin,
    });
  });

  socket.on("playerChangesLetter", function (data) {
    const { index, character } = data;
    socket.broadcast.emit("opponentUpdates", {
      character: character,
      index: index,
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
    // Some p1 points vs p2 points to show who wins?? (probably separate function/event - send to client - when both scores present send both back to compare ?)
  });

  socket.on("disconnect", () => {
    console.log(`>>>disconnect ${socket.id}`);
    makePlayerLeaveRoom(socket);
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

//possible screw point should all these fxn declarations these be higher up??

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
    room[playerLabel].id = { username: null, id: null };

    socket.broadcast.to(roomToLeave.roomID).emit("a player left the game", {
      playersDetails: { p1: roomToLeave.p1, p2: roomToLeave.p2 },
      leavingPlayerID: socket.id,
      leavingPlayerUsername: roomToLeave[playerLabel].username,
    });

    // if the room is now empty, remove it from the room list
    if (!roomToLeave.p1.id && !roomToLeave.p2.id) {
      rooms = _.filter(rooms, function (room) {
        return roomToLeave.roomID != roomToLeave.roomID;
      });
    }
    socket.leave(roomToLeave.roomID);
  }
}

function addRoomsToData(data) {
  console.log("FXN: addRoomsToData");
  //data means the new player's socket id.

  // filter down to only rooms that can accept a new player
  var availableRooms = _.filter(rooms, function (room) {
    return room.playerIds.length < 2;
  });

  // if no rooms are available, create a new room
  if (availableRooms.length == 0) {
    var newRoom = generateRoom();
    rooms.push(newRoom);
    availableRooms.push(newRoom);
  }

  // convert available rooms to just room id and player count and attach to data message
  data.rooms = _.map(availableRooms, function (room, index) {
    return {
      roomId: room.id,
      roomIndex: index + 1,
      playerCount: room.playerIds.length,
    };
  });

  // attach total number of rooms to data message
  data.totalRooms = rooms.length;
  // data = {totalRooms: 100}

  // map-reduce to get total number of players in game
  // and attach to message
  var roomCounts = _.map(rooms, function (room) {
    return room.playerIds.length;
  });
  data.playersInRooms = _.reduce(roomCounts, function (sum, count) {
    return sum + count;
  });
}

function generateRoom() {
  console.log("FXN: generateRoom");
  let room = {
    id: uuid.v4(), //possible screw up?
    p1: { username: null, id: null },
    p2: { username: null, id: null },
  };
  // room.id = uuid.v4();
  return room;
}
