const { loadImgBuffer, getDominantColor } = require("./util");

/** @param {{name: string, time2w: number, timeTotal: number, imgUrl: string}[]} game */
async function draw(game) {
  const game0 = game.shift();

  const fullHeight = 105 + 32 * game.length;

  let content = `<svg
    xmlns="http://www.w3.org/2000/svg"
    xmlns:xlink="http://www.w3.org/1999/xlink"
    viewBox="0 0 225 ${fullHeight}"
  >
    <defs>
      <linearGradient id="gradient" gradientTransform="rotate(90)">
        <stop offset="0" stop-color="rgba(0,0,0,0)" />
        <stop offset="1" stop-color="rgba(0,0,0,1)" />
      </linearGradient>
      <clipPath id="fullCliping">
        <rect x="0" y="0" width="225" height="${fullHeight}" rx="4" />
      </clipPath>
    </defs>
    <image
      href="data:image/jpeg;base64,${(
        await loadImgBuffer(game0.imgUrl)
      ).toString("base64")}"
      x="0"
      y="0"
      width="225"
      height="105"
      preserveAspectRatio="xMinYMin"
      clip-path="url(#fullCliping)"
    />
    <rect x="0" y="0" width="225" height="105" fill="url(#gradient)" />
    <text
      x="8"
      y="84"
      fill="#c9d1d9"
      font-family="Arial"
      dominant-baseline="text-top"
      text-anchor="start"
      font-size="16"
      font-weight="600"
    >
      ${game0.name}
    </text>
    <text
      x="8"
      y="97"
      fill="#c9d1d9"
      font-family="Arial"
      dominant-baseline="text-top"
      text-anchor="start"
      font-size="10"
      font-weight="600"
    >
      ${mapHour(game0.time2w)}h (${mapHour(game0.timeTotal)}h total)
    </text>`;

  for (const [i, v] of game.entries()) {
    content += await drawOther(v, 105 + 32 * i);
  }

  content += `</svg>`;
  return { content, fullHeight };
}

/**
 * @param {{name: string, time2w: number, timeTotal: number, imgUrl: string}} game
 * @param {number} positionY
 */
async function drawOther({ name, time2w, timeTotal, imgUrl }, positionY) {
  const imgBuffer = await loadImgBuffer(imgUrl);
  const dominantColor = await getDominantColor(imgBuffer);
  const textColor = dominantColor.isDark() ? "#c9d1d9" : "#24292f";
  const shadowColor = dominantColor.isDark() ? "#24292f" : "#c9d1d9";
  return `<defs>
    <clipPath id="ico${positionY}">
      <rect x="8" y="${positionY + 4}" width="24" height="24" rx="4" />
    </clipPath>
    <filter id='shadow${positionY}' color-interpolation-filters="sRGB">
      <feDropShadow dx="0.5" dy="0.5" stdDeviation="1" flood-opacity="1" flood-color="${shadowColor}"/>
    </filter>
  </defs>
  <rect
    y="${positionY}"
    width="225"
    height="32"
    fill="${dominantColor.string()}"
    clip-path="url(#fullCliping)"
  />
  <rect
    x="8"
    y="${positionY + 4}"
    width="24"
    height="24"
    rx="4"
    fill="${dominantColor.string()}"
    filter="url(#shadow${positionY})"
  />
  <image
    href="data:image/jpeg;base64,${imgBuffer.toString("base64")}"
    x="8"
    y="${positionY + 4}"
    width="24"
    height="24"
    clip-path="url(#ico${positionY})"
  />
  <text
    x="36"
    y="${positionY + 16}"
    fill="${textColor}"
    font-family="Arial"
    dominant-baseline="middle"
    text-anchor="start"
    font-size="11"
    font-weight="600"
  >
    ${name}
  </text>
  <text
    x="217"
    y="${positionY + 16}"
    fill="${textColor}"
    font-family="Arial"
    dominant-baseline="middle"
    text-anchor="end"
    font-size="11"
    font-weight="600"
  >
    ${mapHour(time2w)}h (${mapHour(timeTotal)}h total)
  </text>`;
}

function mapHour(min) {
  return (min / 60).toLocaleString("en-US", {
    maximumFractionDigits: 1,
    minimumFractionDigits: 0,
  });
}

module.exports = { draw };
