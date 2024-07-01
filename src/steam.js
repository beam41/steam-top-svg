const fetch = require("node-fetch");

/**
 * @param {string} key
 * @param {string} id
 * @return {Promise<{id: number, name: string, time2w: number, timeTotal: number, imgIco: string}[]>} game
 */
async function getStats(key, id) {
  const res = await fetch(
    `https://api.steampowered.com/IPlayerService/GetRecentlyPlayedGames/v1/?key=${key}&steamid=${id}`,
  );
  const json = await res.json();
  return json.response.games
    .filter((game) => game.name)
    .map((game) => ({
      id: game.appid,
      name: game.name,
      time2w: game.playtime_2weeks,
      timeTotal: game.playtime_forever,
      imgIco: game.img_icon_url,
    }));
}

module.exports = { getStats };
