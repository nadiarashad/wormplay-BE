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
    p1: { username: "Marianne", id: 1587113809608 },
    p2: { username: "Jarred", id: 1587113809608 },
  },
  {
    roomName: "Monja Libre",
    roomID: 3,
    p1: { username: "Georgia", id: 1587113809608 },
    p2: { username: null, id: null },
  },
  {
    roomName: "Rush Creek",
    roomID: 4,
    p1: { username: null, id: null },
    p2: { username: "Koden", id: 1587113809608 },
  },
  {
    roomName: "Lake Lola",
    roomID: 5,
    p1: { username: "Gerard", id: 1587113809608 },
    p2: { username: "Alicia", id: 1587113809608 },
  },
  {
    roomName: "Fulton",
    roomID: 6,
    p1: { username: null, id: null },
    p2: { username: "Chaitanya", id: 1587113809608 },
  },
  {
    roomName: "Vimtown",
    roomID: 7,
    p1: { username: "Bobbie", id: 1587113809608 },
    p2: { username: "Caoimhe", id: 1587113809608 },
  },
  {
    roomName: "San Felipe",
    roomID: 8,
    p1: { username: null, id: null },
    p2: { username: "Henry", id: 1587113809608 },
  },
  {
    roomName: "Ronpasas",
    roomID: 9,
    p1: { username: "Ciar", id: 1587113809608 },
    p2: { username: "Blaire", id: 1587113809608 },
  },
  {
    roomName: "Reno!",
    roomID: 11,
    p1: { username: "Uri", id: 1587113809608 },
    p2: { username: "Felicity", id: 1587113809608 },
  },
  {
    roomName: "Lake Aslam",
    roomID: 12,
    p1: { username: "Peiyan", id: 1587113809608 },
    p2: { username: "Moore", id: 1587113809608 },
  },
  {
    roomName: "La Paloma",
    roomID: 13,
    p1: { username: "Rooke", id: 1587113809608 },
    p2: { username: "Cathal", id: 1587113809608 },
  },
  {
    roomName: "Falfurrias",
    roomID: 14,
    p1: { username: "Tiarnan", id: 1587113809608 },
    p2: { username: null, id: null },
  },
  {
    roomName: "Toco",
    roomID: 15,
    p1: { username: null, id: null },
    p2: { username: "Casper", id: 1587113809608 },
  },
  {
    roomName: "Bandera",
    roomID: 16,
    p1: { username: null, id: null },
    p2: { username: "Brynmor", id: 1587113809608 },
  },
  {
    roomName: "Pilot Point",
    roomID: 17,
    p1: { username: "Emmanuel", id: 1587113809608 },
    p2: { username: "Max", id: 1587113809608 },
  },
  {
    roomName: "Westdale",
    roomID: 18,
    p1: { username: null, id: null },
    p2: { username: "Muhammad", id: 1587113809608 },
  },
  {
    roomName: "Hilltop",
    roomID: 19,
    p1: { username: "Bjorn", id: 1587113809608 },
    p2: { username: "Judit", id: 1587113809608 },
  },
  {
    roomName: "Smithville",
    roomID: 21,
    p1: { username: "Jincheng", id: 1587113809608 },
    p2: { username: "Lorenzo", id: 1587113809608 },
  },
  {
    roomName: "Old River",
    roomID: 22,
    p1: { username: "Hcen", id: 1587113809608 },
    p2: { username: "Evgenia", id: 1587113809608 },
  },
  {
    roomName: "Roaring Spring",
    roomID: 23,
    p1: { username: null, id: null },
    p2: { username: "Callan", id: 1587113809608 },
  },
  {
    roomName: "Kermit",
    roomID: 24,
    p1: { username: "Cal", id: 1587113809608 },
    p2: { username: "Jarno", id: 1587113809608 },
  },
  {
    roomName: "Green Hill",
    roomID: 25,
    p1: { username: "Forbes", id: 1587113809608 },
    p2: { username: "Conlin", id: 1587113809608 },
  },
  {
    roomName: "Mclean",
    roomID: 26,
    p1: { username: "Jorryn", id: 1587113809608 },
    p2: { username: "Rossi", id: 1587113809608 },
  },
  {
    roomName: "Fowlerton",
    roomID: 27,
    p1: { username: null, id: null },
    p2: { username: "Adegbola", id: 1587113809608 },
  },
  {
    roomName: "Zuehl",
    roomID: 28,
    p1: { username: "Macaully", id: 1587113809608 },
    p2: { username: "Gian", id: 1587113809608 },
  },
  {
    roomName: "Van Vleck",
    roomID: 29,
    p1: { username: "Grayson", id: 1587113809608 },
    p2: { username: "McCaulley", id: 1587113809608 },
  },
  {
    roomName: "Panorama",
    roomID: 31,
    p1: { username: "Aayan", id: 1587113809608 },
    p2: { username: "Lucca", id: 1587113809608 },
  },
  {
    roomName: "College",
    roomID: 32,
    p1: { username: "Laird", id: 1587113809608 },
    p2: { username: "Mason", id: 1587113809608 },
  },
  {
    roomName: "Hebron",
    roomID: 33,
    p1: { username: "Cody", id: 1587113809608 },
    p2: { username: "Kashif", id: 1587113809608 },
  },
  {
    roomName: "Hawley",
    roomID: 34,
    p1: { username: "Reggie", id: 1587113809608 },
    p2: { username: null, id: null },
  },
  {
    roomName: "Del Sol",
    roomID: 35,
    p1: { username: "Jae", id: 1587113809608 },
    p2: { username: "Tibet", id: 1587113809608 },
  },
  {
    roomName: "Scotland",
    roomID: 36,
    p1: { username: "Robby", id: 1587113809608 },
    p2: { username: "Darroch", id: 1587113809608 },
  },
  {
    roomName: "Appleby",
    roomID: 37,
    p1: { username: "Cohen", id: 1587113809608 },
    p2: { username: null, id: null },
  },
  {
    roomName: "Arroyo Garden",
    roomID: 38,
    p1: { username: "Dyllan", id: 1587113809608 },
    p2: { username: "Shayne", id: 1587113809608 },
  },
  {
    roomName: "Northlake",
    roomID: 39,
    p1: { username: "Valentin", id: 1587113809608 },
    p2: { username: "Ayan", id: 1587113809608 },
  },
  {
    roomName: "Fair Oaks",
    roomID: 41,
    p1: { username: "Nicolas", id: 1587113809608 },
    p2: { username: "Anay", id: 1587113809608 },
  },
  {
    roomName: "Wellington",
    roomID: 42,
    p1: { username: "Darcy", id: 1587113809608 },
    p2: { username: null, id: null },
  },
  {
    roomName: "Dumas",
    roomID: 43,
    p1: { username: "Fezaan", id: 1587113809608 },
    p2: { username: "Lincoln", id: 1587113809608 },
  },
  {
    roomName: "Cross Roads",
    roomID: 44,
    p1: { username: "Sayad", id: 1587113809608 },
    p2: { username: "Isaiah", id: 1587113809608 },
  },
  {
    roomName: "Penelope",
    roomID: 45,
    p1: { username: "Jayson", id: 1587113809608 },
    p2: { username: "Kedrick", id: 1587113809608 },
  },
  {
    roomName: "Palisades",
    roomID: 46,
    p1: { username: "Tisloh", id: 1587113809608 },
    p2: { username: "Mathias", id: 1587113809608 },
  },
  {
    roomName: "Woodsboro",
    roomID: 47,
    p1: { username: "Jakob", id: 1587113809608 },
    p2: { username: "Seamas", id: 1587113809608 },
  },
  {
    roomName: "Agua Dulce",
    roomID: 48,
    p1: { username: "Brody", id: 1587113809608 },
    p2: { username: "Dermot", id: 1587113809608 },
  },
  {
    roomName: "Pearsall",
    roomID: 49,
    p1: { username: null, id: null },
    p2: { username: "Temba", id: 1587113809608 },
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
};
