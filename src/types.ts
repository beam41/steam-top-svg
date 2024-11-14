export type Game = {
  id: number;
  name: string;
  time2w: number;
  timeTotal: number;
  imgIco: string;
};

export type SteamPlaytimeResponse = {
  response: {
    total_count: number;
    games: {
      appid: number;
      name: string;
      playtime_2weeks: number;
      playtime_forever: number;
      img_icon_url: string;
      playtime_windows_forever: number;
      playtime_mac_forever: number;
      playtime_linux_forever: number;
      playtime_deck_forever: number;
    }[];
  };
};
