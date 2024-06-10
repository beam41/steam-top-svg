const fetch = require("node-fetch");
const Color = require("color");
const colorthief = require("colorthief");
const { writeFile, unlink } = require("fs").promises;
const { createCanvas } = require("canvas");
const { v4: uuidv4 } = require("uuid");

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
    return Color.rgb(62, 78, 105);
  } finally {
    await unlink(imgPath);
  }
}

/**
 * @param {string} text
 * @param {string} font
 * @param {number} fontSize
 * @param {number} maxWidth
 * @param {boolean} [isBold=false]
 * @return {string} Text with ellipsis to fit `maxWidth`
 */
function fitText(text, font, fontSize, maxWidth, isBold = false) {
  const canvas = createCanvas(maxWidth, fontSize);
  const ctx = canvas.getContext("2d");
  ctx.font = `${isBold ? "bold" : ""} ${fontSize}px ${font}`;
  let ellipsis = false;
  while (true) {
    const currWidth = ctx.measureText(text + (ellipsis ? "..." : "")).width;
    if (currWidth <= maxWidth) {
      return text.replace(/&/g, "&amp;") + (ellipsis ? "..." : "");
    }
    text = text.substring(0, text.length - 1);
    ellipsis = true;
  }
}

/**
 * @param {string} text
 * @param {string} font
 * @param {number} fontSize
 * @param {boolean} [isBold=false]
 * @return {number} Text width
 */
function measureText(text, font, fontSize, isBold = false) {
  const canvas = createCanvas(2000, fontSize);
  const ctx = canvas.getContext("2d");
  ctx.font = `${isBold ? "bold" : ""} ${fontSize}px ${font}`;
  return ctx.measureText(text).width;
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
