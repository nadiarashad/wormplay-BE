const express = require("express"),
  uuid = require("node-uuid"),
  _ = require("lodash");
const app = express();
let rooms = [];
let players = [];

const http = require("http");
const socketIo = require("socket.io");
const { validateWord } = require("./utils/utils");

const port = process.env.PORT || 4002;
const index = require("./routes/index");

const app = express();
app.use(index);

const server = http.createServer(app);

const io = socketIo(server);

// Variables for storing clients in game and in lobby

// const playersInGame = {
//   p1: { username: null, id: null },
//   p2: { username: null, id: null },
// };
const labelArray = ["p1", "p2"];
server.listen(port, () => console.log(`Listening on port ${port}`));

// let roomno = 1;

// const hotel = {
//   1: {},
//   2: {},
//   3: {},
// };

io.on("connection", function (socket) {
  console.log(
    `Connection of ${socket.id} but nothing should happen yet. They just opened a browser.`
  );

  socket.on("login", function (loginData) {
    let lobbyData = {};
    // data.username = username;
    // data.id = socket.id;

    // add room info to message
    addRoomsToData(lobbyData);

    // send message to user
    socket.emit("connectionReply", lobbyData);

    const newPlayer = {};
    newPlayer.id = socket.id;
    newPlayer.username = loginData.username;

    players.push(newPlayer);

    console.log("New! " + newPlayer);
    console.log("All: " + players);
  });

  socket.on("joinRoom", function (data) {
    //{roomID: 0, username: ""}

    //HERE'S WHAT A ROOM LOOKS LIKE:
    // room = {
    //   id: uuid.v4(), //possible screw point
    //   p1: { username: null, id: null },
    //   p2: { username: null, id: null },
    // };

    //Player who wants to join room: socket.id
    //Room she wants to join:        data.roomID

    // find the room being requested
    let roomSheWantsToJoin = _.find(rooms, { id: data.roomID });

    //Now 'roomSheWantsToJoin' now IS room qE2 from the rooms array.

    // verify that player can join room:
    // room must exist and have less than 4 players
    if (
      !roomSheWantsToJoin ||
      (roomSheWantsToJoin.p1.id && roomSheWantsToJoin.p2.id)
    ) {
      // send refusal
      socket.emit("connectionRefused");
      return;
    }

    //Yes, player can enter that room she wants.
    let player = _.find(players, { id: socket.id });

    if (roomSheWantsToJoin.p1.username === null) {
      roomSheWantsToJoin.p1 = player;
    } else {
      roomSheWantsToJoin.p2 = player;
    }

    console.log(roomSheWantsToJoin, 'room she has joined')

    //************** HAVE PLAYER JOIN ROOM */

    // function enterGame(player) {
    //   playersInGame[player] = newPlayer;
    //   io.to(socket.id).emit("loginConf", {
    //     youCanEnter: true,
    //     playersDetails: playersInGame,
    //   });
    //   socket.broadcast.emit("a player entered the game", {
    //     playersDetails: playersInGame,
    //     enteringPlayerID: socket.id,
    //     enteringPlayerUsername: playersInGame[player].username,
    //   });
    // }

    // if (!playersInGame.p1.id) {
    //   enterGame("p1");
    // } else if (!playersInGame.p2.id) {
    //   enterGame("p2");
    // } else {
    //   io.to(socket.id).emit("loginConf", {
    //     youCanEnter: false,
    //   });
    // }

    //************************** */

    // register player with room
    room.playerIds.push(socket.id);
    socket.join(room.id);

    // send verification that room was joined to the player with room id
    socket.emit("roomJoined", {
      roomId: room.id,
      shouldGenerateFirstCake: shouldGenerateFirstCake,
    });
  });

  socket.on("worm word submitted", function (wormWord) {
    console.log("Worm Word Received:", wormWord);
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
          opponentPoints: wormWord.length,
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
            opponentPoints: 0,
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

    // labelArray.forEach((player) => {
    //   if (socket.id === playersInGame[player].id) {
    //     const leavingPlayerUsername = playersInGame[player].username;
    //     playersInGame[player] = { username: null, id: null };
    //     socket.broadcast.emit("a player left the game", {
    //       playersDetails: playersInGame,
    //       leavingPlayerID: socket.id,
    //       leavingPlayerUsername,
    //     });
    //   }
    // });

    // socket.on("disconnect", function () {
    //   // find the room being left
    //   var roomToLeave = _.find(rooms, function (room) {
    //     return _.any(room.playerIds, function (id) {
    //       // capture socket id in closure scope
    //       return id == socket.id;
    //     });
    //   });
    //   // handle the rest of the disconnection
    //   leaveRoom(roomToLeave, socket);
    // });
  });
});

//possible screw up should these be higher up??

function addRoomsToData(data) {
  console.log("~Inside addRoomsToData~");
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
  let room = {
    id: uuid.v4(), //possible screw up?
    p1: { username: null, id: null },
    p2: { username: null, id: null },
  };
  // room.id = uuid.v4();
  return room;
}

// if (
//   io.nsps["/"].adapter.rooms["room-" + roomno] &&
//   io.nsps["/"].adapter.rooms["room-" + roomno].length > 1
// )
//   roomno++;
// socket.join("room-" + roomno);

// //Send this event to everyone in the room.
// io.sockets
//   .in("room-" + roomno)
//   .emit("connectToRoom", "You are in room no. " + roomno);
