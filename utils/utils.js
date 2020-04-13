const axios = require("axios").default;

const validateWord = (wormWord) => {
  const app_id = "2120a036";
  const app_key = "e28e8200b4b17bfe1a3ac0bcf5a12eb9";
  return axios.get(
    `https://od-api.oxforddictionaries.com:443/api/v2/entries/en/${wormWord}`,
    { headers: { Accept: "application/json", app_id, app_key } }
  );
};

module.exports = { validateWord };
