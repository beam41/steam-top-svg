import colorthief from "colorthief/src/color-thief-node";

import path from "node:path";

import { fileURLToPath } from "node:url";
import { loadSync } from "opentype.js";
import { v4 as uuidv4 } from "uuid";
import { unlink, writeFile } from "fs";
import Color from "color";
import fetch from "node-fetch";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log(__dirname);

const notoFont = loadSync(
  path.resolve(__dirname, "../static/NotoSans-Regular.ttf"),
);
const notoBoldFont = loadSync(
  path.resolve(__dirname, "../static/NotoSans-Bold.ttf"),
);

/**
 * @param {string} url
 * @return {Promise<Buffer>}
 */
async function loadImgBuffer(url) {
  const res = await fetch(url, {});
  return res.buffer();
}

/**
 * @param {string} url
 * @return {Promise<string>}
 */
async function loadImgBufferBase64(url) {
  const buffer = await loadImgBuffer(url);
  return buffer.toString("base64");
}

/**
 * @param {Buffer} buffer
 * @return {Color}
 */
async function getDominantColor(buffer) {
  const imgPath = `tempImg_${uuidv4()}.jpg`;
  try {
    await writeFile(imgPath, buffer);
    const result = await colorthief.getColor(imgPath, 1);
    return Color.rgb(result);
  } catch {
  } finally {
    await unlink(imgPath);
  }
}

/**
 * @param {string} text
 * @param {number} fontSize
 * @param {boolean} [isBold=false]
 * @return {number} Text width
 */
function measureText(text, fontSize, isBold = false) {
  if (isBold) {
    return notoBoldFont.getAdvanceWidth(text, fontSize);
  } else {
    return notoFont.getAdvanceWidth(text, fontSize);
  }
}

/**
 * @param {string} text
 * @param {number} fontSize
 * @param {number} maxWidth
 * @param {boolean} [isBold=false]
 * @return {string} Text with ellipsis to fit `maxWidth`
 */
function fitText(text, fontSize, maxWidth, isBold = false) {
  let ellipsis = false;
  while (true) {
    const currWidth = measureText(
      text + (ellipsis ? "..." : ""),
      fontSize,
      isBold,
    );
    if (currWidth <= maxWidth) {
      return text.replace(/&/g, "&amp;") + (ellipsis ? "..." : "");
    }
    text = text.substring(0, text.length - 1);
    ellipsis = true;
  }
}

/**
 * @param {string} tag
 * @param {Object.<string, *>?} attrs
 * @param {...string} children
 * @return {string} result html element
 */
function xmlElement(tag, attrs, ...children) {
  let element = `<${tag}`;

  if (attrs) {
    for (const [name, value] of Object.entries(attrs)) {
      element += ` ${name}="${value}"`;
    }
  }

  if (children.length === 0) {
    element += "/>";
  } else {
    element += `>${children.join("")}</${tag}>`;
  }

  return element;
}

/**
 * @param {number} minute
 * @param {boolean} [forceFraction=false]
 * @return {string} result
 */
function mapTime(minute, forceFraction = false) {
  if (minute < 60) {
    return minute + "m";
  }

  const hour = minute / 60;

  const str = hour.toLocaleString("en-US", {
    maximumFractionDigits: forceFraction ? 1 : hour < 10 ? 1 : 0,
    minimumFractionDigits: 0,
  });

  return str + "h";
}

module.exports = {
  loadImgBuffer,
  loadImgBufferBase64,
  getDominantColor,
  fitText,
  measureText,
  xmlElement,
  mapTime,
};
