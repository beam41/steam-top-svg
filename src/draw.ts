import {
  fitText,
  getDominantColor,
  loadImgBuffer,
  loadImgBufferBase64,
  mapTime,
  measureText,
  xmlElement as $,
} from './util';
import { TEXT_BLACK, TEXT_WHITE } from './const';
import { Game } from './types';

export async function draw(
  game: Game[],
  fullWidth: number,
  otherGameHeight: number,
  padding: number,
  rectRound: number,
): Promise<{ content: string; fullHeight: number }> {
  const firstGame = game[0];

  const firstGameHeight = Math.round(fullWidth * (215 / 460));

  const fullHeight = firstGameHeight + otherGameHeight * (game.length - 1);

  const content = $(
    'svg',
    {
      xmlns: 'http://www.w3.org/2000/svg',
      viewBox: `0 0 ${fullWidth} ${fullHeight}`,
      height: fullHeight,
    },
    $(
      'defs',
      null,
      $(
        'linearGradient',
        { id: 'gradient', gradientTransform: 'rotate(90)' },
        $('stop', { offset: 0, 'stop-color': 'rgba(0,0,0,0)' }),
        $('stop', { offset: 1, 'stop-color': 'rgba(0,0,0,1)' }),
      ),
      $(
        'clipPath',
        { id: 'fullCliping' },
        $('rect', { width: fullWidth, height: fullHeight, rx: rectRound }),
      ),
      $(
        'style',
        { type: 'text/css' },
        "@import url('https://fonts.googleapis.com/css2?family=Noto+Sans:wght@100..900&amp;display=swap');",
      ),
    ),
    $('image', {
      href: `data:image/jpeg;base64,${await loadImgBufferBase64(
        `https://cdn.cloudflare.steamstatic.com/steam/apps/${firstGame.id}/header.jpg`,
      )}`,
      x: 0,
      y: 0,
      width: fullWidth,
      height: firstGameHeight,
      preserveAspectRatio: 'xMidYMid slice',
      'clip-path': 'url(#fullCliping)',
    }),
    $('rect', {
      x: 0,
      y: 0,
      width: fullWidth,
      height: firstGameHeight,
      fill: 'url(#gradient)',
    }),
    $(
      'text',
      {
        x: padding,
        y: firstGameHeight - padding - 13, // 13 is some small padding from bottom text
        fill: TEXT_WHITE,
        'font-family': '"Noto Sans", sans-serif',
        'font-size': 16,
        'font-weight': 600,
        'dominant-baseline': 'text-top',
        'text-anchor': 'start',
      },
      fitText(firstGame.name, 16, fullWidth - padding * 2, true),
    ),
    $(
      'text',
      {
        x: padding,
        y: firstGameHeight - padding,
        fill: TEXT_WHITE,
        'font-family': '"Noto Sans", sans-serif',
        'font-size': 10,
        'font-weight': 600,
        'dominant-baseline': 'text-top',
        'text-anchor': 'start',
      },
      `${mapTime(firstGame.time2w, true)} (2 weeks) / ${mapTime(firstGame.timeTotal, true)} (total)`,
    ),
    ...(await Promise.all(
      game
        .slice(1)
        .map((v, i) =>
          drawOther(
            v,
            firstGameHeight + otherGameHeight * i,
            fullWidth,
            otherGameHeight,
            padding,
            rectRound,
          ),
        ),
    )),
  );

  return { content, fullHeight };
}

export async function drawOther(
  { id, name, time2w, timeTotal, imgIco }: Game,
  positionY: number,
  fullWidth: number,
  otherGameHeight: number,
  padding: number,
  rectRound: number,
) {
  const otherGameHeightIcoSize = otherGameHeight - padding;

  const imgBuffer = await loadImgBuffer(
    `http://media.steampowered.com/steamcommunity/public/images/apps/${id}/${imgIco}.jpg`,
  );
  const dominantColor = await getDominantColor(imgBuffer);
  const textColor = dominantColor.isDark() ? TEXT_WHITE : TEXT_BLACK;

  const playtimeText = `${mapTime(time2w)} / ${mapTime(timeTotal)}`;
  const playtimeWidth = measureText(playtimeText, 11);

  return [
    $(
      'defs',
      null,
      $(
        'clipPath',
        { id: `ico${positionY}` },
        $('rect', {
          x: padding,
          y: positionY + padding / 2,
          width: otherGameHeightIcoSize,
          height: otherGameHeightIcoSize,
          rx: rectRound,
        }),
      ),
      $(
        'filter',
        { id: `shadow${positionY}`, 'color-interpolation-filters': 'sRGB' },
        $('feDropShadow', {
          dx: 0.5,
          dy: 0.5,
          stdDeviation: '1',
          'flood-opacity': '1',
          'flood-color': '#242424',
        }),
      ),
    ),
    $('rect', {
      y: positionY,
      width: fullWidth,
      height: otherGameHeight,
      fill: dominantColor.string(),
      'clip-path': 'url(#fullCliping)',
    }),
    $('rect', {
      x: padding,
      y: positionY + padding / 2,
      width: otherGameHeightIcoSize,
      height: otherGameHeightIcoSize,
      rx: rectRound,
      fill: dominantColor.string(),
      filter: `url(#shadow${positionY})`,
    }),
    $('image', {
      href: `data:image/jpeg;base64,${imgBuffer.toString('base64')}`,
      x: padding,
      y: positionY + padding / 2,
      width: otherGameHeightIcoSize,
      height: otherGameHeightIcoSize,
      'clip-path': `url(#ico${positionY})`,
    }),
    $(
      'text',
      {
        x: padding + otherGameHeightIcoSize + padding,
        y: positionY + otherGameHeight / 2,
        fill: textColor,
        'font-family': '"Noto Sans", sans-serif',
        'dominant-baseline': 'middle',
        'text-anchor': 'start',
        'font-size': 11,
        'font-weight': 600,
      },
      fitText(
        name,
        11,
        fullWidth -
          (padding + otherGameHeightIcoSize + padding) -
          padding / 4 -
          (padding + playtimeWidth),
        true,
      ),
    ),
    $(
      'text',
      {
        x: fullWidth - padding,
        y: positionY + otherGameHeight / 2,
        fill: textColor,
        'font-family': '"Noto Sans", sans-serif',
        'dominant-baseline': 'middle',
        'text-anchor': 'end',
        'font-size': 11,
      },
      playtimeText,
    ),
  ].join('');
}
