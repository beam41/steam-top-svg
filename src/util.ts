import { getColor } from 'colorthief';
import { resolve } from 'node:path';
import { loadSync } from 'opentype.js';
import { v4 as uuidv4 } from 'uuid';
import { unlink, writeFile } from 'node:fs/promises';
import { rgb } from 'color';
import fetch from 'node-fetch';

const notoFont = loadSync(resolve(__dirname, '../static/NotoSans-Regular.ttf'));
const notoBoldFont = loadSync(
  resolve(__dirname, '../static/NotoSans-Bold.ttf'),
);

export async function loadImgBuffer(url: string) {
  const res = await fetch(url, {});
  return Buffer.from(await res.arrayBuffer());
}

export async function loadImgBufferBase64(url: string) {
  const buffer = await loadImgBuffer(url);
  return buffer.toString('base64');
}

export async function getDominantColor(buffer: Buffer) {
  const imgPath = `tempImg_${uuidv4()}.jpg`;
  try {
    await writeFile(imgPath, buffer);
    const result: ArrayLike<number> = await getColor(imgPath, 1);
    return rgb(result);
  } finally {
    await unlink(imgPath);
  }
}

export function measureText(
  text: string,
  fontSize: number,
  isBold = false,
) {
  if (isBold) {
    return notoBoldFont.getAdvanceWidth(text, fontSize);
  } else {
    return notoFont.getAdvanceWidth(text, fontSize);
  }
}

/**
 * @return {string} Text with ellipsis to fit `maxWidth`
 */
export function fitText(
  text: string,
  fontSize: number,
  maxWidth: number,
  isBold = false,
): string {
  text = text.trim();
  let ellipsis = false;
  while (true) {
    const currWidth = measureText(
      text + (ellipsis ? '...' : ''),
      fontSize,
      isBold,
    );
    if (currWidth <= maxWidth) {
      return text.replace(/&/g, '&amp;') + (ellipsis ? '...' : '');
    }
    text = text.substring(0, text.length - 1).trim();
    ellipsis = true;
  }
}

/**
 * @return {string} result html element
 */
export function xmlElement(
  tag: string,
  attrs?: Record<string, unknown>,
  ...children: string[]
): string {
  let element = `<${tag}`;

  if (attrs) {
    for (const [name, value] of Object.entries(attrs)) {
      element += ` ${name}="${typeof value === 'string' ? value.replace(/"/g, '&quot;') : value}"`;
    }
  }

  if (children.length === 0) {
    element += '/>';
  } else {
    element += `>${children.join('')}</${tag}>`;
  }

  return element;
}

export function mapTime(minute: number, forceFraction = false) {
  if (minute < 60) {
    return minute + 'm';
  }

  const hour = minute / 60;

  const str = hour.toLocaleString('en-US', {
    maximumFractionDigits:
      forceFraction ? 1
      : hour < 10 ? 1
      : 0,
    minimumFractionDigits: 0,
  });

  return str + 'h';
}
