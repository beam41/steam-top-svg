import fetch from 'node-fetch';
import { Game, SteamPlaytimeResponse } from './types';

export async function getStats(key: string, id: string): Promise<Game[]> {
  const res = await fetch(
    `https://api.steampowered.com/IPlayerService/GetRecentlyPlayedGames/v1/?key=${key}&steamid=${id}`,
  );
  const json = (await res.json()) as SteamPlaytimeResponse;
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
