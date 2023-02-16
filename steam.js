const fetch = require("node-fetch");
async function getStats(key, id) {
  const res = await fetch(
    `https://api.steampowered.com/IPlayerService/GetRecentlyPlayedGames/v1/?key=${key}&steamid=${id}`
  );
  const json = await res.json();
  return json.response.games
      .filter((game) => game.name)
      .map((game, i) => ({
        name: game.name,
        time2w: game.playtime_2weeks,
        timeTotal: game.playtime_forever,
        imgUrl:
          i === 0
            ? `https://cdn.cloudflare.steamstatic.com/steam/apps/${game.appid}/header.jpg`
            : `http://media.steampowered.com/steamcommunity/public/images/apps/${game.appid}/${game.img_icon_url}.jpg`,
      }));
}

module.exports = { getStats };
