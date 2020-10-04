const axios = require("axios").default;

const validateWord = (wormWord) => {
  const app_id = "7a048765";
  const app_key = "bd44c2c5c9da0802e26bb819cc7e597c";
  return axios.get(
    `https://od-api.oxforddictionaries.com:443/api/v2/entries/en/${wormWord}`,
    { headers: { Accept: "application/json", app_id, app_key } }
  );
};

const findFirstGapOrReturnNext = (arr) => {
  let arrayOfIDS = arr.map((room) => room.roomID);
  for (let i = 1; i <= arrayOfIDS.length + 1; i++) {
    if (!arrayOfIDS.includes(i)) {
      return i;
    }
  }
};

const validOneOrTwoLetterWords = [
  "a",
  "i",
  "o",
  "ad",
  "ah",
  "am",
  "an",
  "as",
  "at",
  "aw",
  "ax",
  "be",
  "da",
  "do",
  "eh",
  "er",
  "et",
  "ew",
  "ex",
  "fa",
  "fe",
  "go",
  "ha",
  "he",
  "hi",
  "ho",
  "id",
  "if",
  "in",
  "is",
  "it",
  "la",
  "lo",
  "ma",
  "me",
  "mu",
  "my",
  "no",
  "of",
  "oh",
  "oi",
  "ok",
  "on",
  "or",
  "ow",
  "ox",
  "oy",
  "pa",
  "pi",
  "qi",
  "re",
  "so",
  "ta",
  "to",
  "uh",
  "um",
  "un",
  "up",
  "us",
  "ut",
  "we",
  "xi",
  "yo",
];

const scrabblePoints = {
  A: 1,
  B: 3,
  C: 3,
  D: 2,
  E: 1,
  F: 4,
  G: 2,
  H: 4,
  I: 1,
  J: 8,
  K: 5,
  L: 1,
  M: 3,
  N: 1,
  O: 1,
  P: 3,
  Q: 10,
  R: 1,
  S: 1,
  T: 1,
  U: 1,
  V: 4,
  W: 4,
  X: 8,
  Y: 4,
  Z: 10,
};

const egRooms = [
  {
    roomName: "Newtonville",
    roomID: 1,
    p1: { username: null, id: null },
    p2: { username: null, id: null },
  },
  {
    roomName: "Wyldwood",
    roomID: 2,
    p1: { username: null, id: null },
    p2: { username: null, id: null },
  },
  {
    roomName: "Monja Libre",
    roomID: 3,
    p1: { username: null, id: null },
    p2: { username: null, id: null },
  },
  {
    roomName: "Rush Creek",
    roomID: 4,
    p1: { username: null, id: null },
    p2: { username: null, id: null },
  },
  {
    roomName: "Lake Lola",
    roomID: 5,
    p1: { username: null, id: null },
    p2: { username: null, id: null },
  },
  {
    roomName: "Fulton",
    roomID: 6,
    p1: { username: null, id: null },
    p2: { username: null, id: null },
  },
  {
    roomName: "Vimtown",
    roomID: 7,
    p1: { username: null, id: null },
    p2: { username: null, id: null },
  },
  {
    roomName: "San Felipe",
    roomID: 8,
    p1: { username: null, id: null },
    p2: { username: null, id: null },
  },
  {
    roomName: "Ronpasas",
    roomID: 9,
    p1: { username: null, id: null },
    p2: { username: null, id: null },
  },
  {
    roomName: "Reno!",
    roomID: 11,
    p1: { username: null, id: null },
    p2: { username: null, id: null },
  },
  {
    roomName: "Lake Aslam",
    roomID: 12,
    p1: { username: null, id: null },
    p2: { username: null, id: null },
  },
  {
    roomName: "La Paloma",
    roomID: 13,
    p1: { username: null, id: null },
    p2: { username: null, id: null },
  },
  {
    roomName: "Falfurrias",
    roomID: 14,
    p1: { username: null, id: null },
    p2: { username: null, id: null },
  },
  {
    roomName: "Toco",
    roomID: 15,
    p1: { username: null, id: null },
    p2: { username: null, id: null },
  },
  {
    roomName: "Patrick",
    roomID: 16,
    p1: { username: null, id: null },
    p2: { username: null, id: null },
  },
  {
    roomName: "Nadia",
    roomID: 17,
    p1: { username: null, id: null },
    p2: { username: null, id: null },
  },
  {
    roomName: "James",
    roomID: 18,
    p1: { username: null, id: null },
    p2: { username: null, id: null },
  },
  {
    roomName: "Chris",
    roomID: 19,
    p1: { username: null, id: null },
    p2: { username: null, id: null },
  },
];

const adjObj = [
  "Wormy",
  "Larval",
  "Long",
  "Pink",
  "Earthy",
  "Flatworm's",
  "Wiggly",
  "Whippy",
  "Slithery",
  "Coiled",
];

module.exports = {
  validateWord,
  egRooms,
  findFirstGapOrReturnNext,
  adjObj,
  scrabblePoints,
  validOneOrTwoLetterWords,
};
