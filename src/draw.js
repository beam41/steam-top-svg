const {
  fitText,
  getDominantColor,
  loadImgBuffer,
  loadImgBufferBase64,
  mapTime,
  measureText,
  xmlElement: $,
} = require("./util");
const { TEXT_BLACK, TEXT_WHITE } = require("./const");

/**
 * @param {{id: number, name: string, time2w: number, timeTotal: number, imgIco: string}[]} game
 * @return {Promise<{content: string, fullHeight: number}>}
 */
async function draw(game) {
  const game0 = game[0];

  const fullHeight = 105 + 32 * (game.length - 1);

  const content = $(
    "svg",
    {
      xmlns: "http://www.w3.org/2000/svg",
      viewBox: `0 0 225 ${fullHeight}`,
      height: fullHeight,
    },
    $(
      "defs",
      null,
      $(
        "linearGradient",
        { id: "gradient", gradientTransform: "rotate(90)" },
        $("stop", { offset: 0, "stop-color": "rgba(0,0,0,0)" }),
        $("stop", { offset: 1, "stop-color": "rgba(0,0,0,1)" }),
      ),
      $(
        "clipPath",
        { id: "fullCliping" },
        $("rect", { x: 0, y: 0, width: 225, height: fullHeight, rx: 4 }),
      ),
      $(
        "style",
        { type: "text/css" },
        "@import url('https://fonts.googleapis.com/css2?family=Noto+Sans:wght@100..900&amp;display=swap');",
      ),
    ),
    $("image", {
      href: `data:image/jpeg;base64,${await loadImgBufferBase64(
        `https://cdn.cloudflare.steamstatic.com/steam/apps/${game0.id}/header.jpg`,
      )}`,
      x: 0,
      y: 0,
      width: 225,
      height: 105,
      preserveAspectRatio: "xMinYMin",
      "clip-path": "url(#fullCliping)",
    }),
    $("rect", {
      x: 0,
      y: 0,
      width: 225,
      height: 105,
      fill: "url(#gradient)",
    }),
    $(
      "text",
      {
        x: 8,
        y: 84,
        fill: TEXT_WHITE,
        style:
          'font-family: "Noto Sans", sans-serif; font-size: 16; font-weight: 600',
        "dominant-baseline": "text-top",
        "text-anchor": "start",
      },
      fitText(game0.name, 16, 209, true),
    ),
    $(
      "text",
      {
        x: 8,
        y: 97,
        fill: TEXT_WHITE,
        style:
          'font-family: "Noto Sans", sans-serif; font-size: 10; font-weight: 600',
        "dominant-baseline": "text-top",
        "text-anchor": "start",
      },
      `${mapTime(game0.time2w, true)} (2 weeks) / ${mapTime(game0.timeTotal, true)} (total)`,
    ),
    ...(await Promise.all(
      game.slice(1).map((v, i) => drawOther(v, 105 + 32 * i)),
    )),
  );

  return { content, fullHeight };
}

/**
 * @param {{id: number, name: string, time2w: number, timeTotal: number, imgIco: string}} game
 * @param {number} positionY
 * @return {Promise<string>}
 */
async function drawOther({ id, name, time2w, timeTotal, imgIco }, positionY) {
  const imgBuffer = await loadImgBuffer(
    `http://media.steampowered.com/steamcommunity/public/images/apps/${id}/${imgIco}.jpg`,
  );
  const dominantColor = await getDominantColor(imgBuffer);
  const textColor = dominantColor.isDark() ? TEXT_WHITE : TEXT_BLACK;

  const playtimeText = `${mapTime(time2w)} / ${mapTime(timeTotal)}`;
  const playtimeWidth = measureText(playtimeText, 11);

  return [
    $(
      "defs",
      null,
      $(
        "clipPath",
        { id: `ico${positionY}` },
        $("rect", { x: 8, y: positionY + 4, width: 24, height: 24, rx: 4 }),
      ),
      $(
        "filter",
        { id: `shadow${positionY}`, "color-interpolation-filters": "sRGB" },
        $("feDropShadow", {
          dx: 0.5,
          dy: 0.5,
          stdDeviation: "1",
          "flood-opacity": "1",
          "flood-color": "#242424",
        }),
      ),
    ),
    $("rect", {
      y: positionY,
      width: 225,
      height: 32,
      fill: dominantColor.string(),
      "clip-path": "url(#fullCliping)",
    }),
    $("rect", {
      x: 8,
      y: positionY + 4,
      width: 24,
      height: 24,
      rx: 4,
      fill: dominantColor.string(),
      filter: `url(#shadow${positionY})`,
    }),
    $("image", {
      href: `data:image/jpeg;base64,${imgBuffer.toString("base64")}`,
      x: 8,
      y: positionY + 4,
      width: 24,
      height: 24,
      "clip-path": `url(#ico${positionY})`,
    }),
    $(
      "text",
      {
        x: 40,
        y: positionY + 16,
        fill: textColor,
        "font-family": '"Noto Sans", sans-serif',
        "dominant-baseline": "middle",
        "text-anchor": "start",
        "font-size": 11,
        "font-weight": 600,
      },
      fitText(name, 11, 175 - playtimeWidth, true),
    ),
    $(
      "text",
      {
        x: 217,
        y: positionY + 16,
        fill: textColor,
        "font-family": '"Noto Sans", sans-serif',
        "dominant-baseline": "middle",
        "text-anchor": "end",
        "font-size": 11,
      },
      playtimeText,
    ),
  ].join("");
}

module.exports = { draw };
