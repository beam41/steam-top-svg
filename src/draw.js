const {
  loadImgBuffer,
  loadImgBufferBase64,
  getDominantColor,
  fitText,
  measureText,
} = require("./util");
const { xmlElement: $, mapHour } = require("./drawUtil");

/** @param {{id: number, name: string, time2w: number, timeTotal: number, imgIco: string}[]} game */
async function draw(game) {
  const game0 = game[0];

  const fullHeight = 105 + 32 * game.length;

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
    ),
    $("image", {
      href: `data:image/jpeg;base64,${
        await loadImgBufferBase64(
          `https://cdn.cloudflare.steamstatic.com/steam/apps/${game0.id}/header.jpg`,
        )
      }`,
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
        fill: "#c9d1d9",
        "font-family": "Arial",
        "dominant-baseline": "text-top",
        "text-anchor": "start",
        "font-size": 16,
        "font-weight": 600,
      },
      fitText(game0.name, "sans-serif", 16, 209, true),
    ),
    $(
      "text",
      {
        x: 8,
        y: 97,
        fill: "#c9d1d9",
        "font-family": "Arial",
        "dominant-baseline": "text-top",
        "text-anchor": "start",
        "font-size": 10,
        "font-weight": 600,
      },
      `${mapHour(game0.time2w)}h (2 weeks)/${mapHour(game0.timeTotal)}h (total)`,
    ),
    ...(await Promise.all(
      game.slice(1).map(async (v, i) => await drawOther(v, 105 + 32 * i)),
    )),
  );

  return { content, fullHeight };
}

/**
 * @param {{id: number, name: string, time2w: number, timeTotal: number, imgIco: string}} game
 * @param {number} positionY
 */
async function drawOther({ id, name, time2w, timeTotal, imgIco }, positionY) {
  const imgBuffer = await loadImgBuffer(
    `http://media.steampowered.com/steamcommunity/public/images/apps/${id}/${imgIco}.jpg`,
  );
  const dominantColor = await getDominantColor(imgBuffer);
  const textColor = dominantColor.isDark() ? "#c9d1d9" : "#24292f";

  const playtimeText = `${mapHour(time2w)}h/${mapHour(timeTotal)}h`;
  const playtimeWidth = measureText(playtimeText, "sans-serif", 11);

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
        "font-family": "Arial",
        "dominant-baseline": "middle",
        "text-anchor": "start",
        "font-size": 11,
        "font-weight": 600,
      },
      fitText(name, "sans-serif", 11, 173 - playtimeWidth, true),
    ),
    $(
      "text",
      {
        x: 217,
        y: positionY + 16,
        fill: textColor,
        "font-family": "Arial",
        "dominant-baseline": "middle",
        "text-anchor": "end",
        "font-size": 11,
      },
      playtimeText,
    ),
  ].join("");
}

module.exports = { draw };
