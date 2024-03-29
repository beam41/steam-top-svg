const fetch = require("node-fetch");
const Color = require("color");
const colorthief = require("colorthief");
const { writeFile, unlink } = require("fs").promises;
const { createCanvas } = require("canvas");

function loadImgBuffer(url) {
  return new Promise((resolve, reject) => {
    fetch(url, {}).then((response) => resolve(response.buffer()));
  });
}

async function getDominantColor(buffer) {
  try {
    await writeFile("tempImg.jpg", buffer);
    const result = await colorthief.getColor("tempImg.jpg", 1);
    return Color.rgb(result);
  } catch {
    return Color.rgb(62, 78, 105);
  } finally {
    await unlink("tempImg.jpg");
  }
}

function fitText(text, font, fontSize, maxWidth, isBold = false) {
  const canvas = createCanvas(maxWidth, fontSize);
  const ctx = canvas.getContext("2d");
  ctx.font = `${isBold ? "bold" : ""} ${fontSize}px ${font}`;
  let ellipsis = false;
  while (true) {
    const currWidth = ctx.measureText(text + (ellipsis ? "..." : "")).width;
    if (currWidth <= maxWidth) {
      return text.replace(/&/g, '&amp;') + (ellipsis ? "..." : "");
    }
    text = text.substring(0, text.length - 1);
    ellipsis = true;
  }
}

function measureText(text, font, fontSize, isBold = false) {
  const canvas = createCanvas(2000, fontSize);
  const ctx = canvas.getContext("2d");
  ctx.font = `${isBold ? "bold" : ""} ${fontSize}px ${font}`;
  return ctx.measureText(text).width;
}

module.exports = { loadImgBuffer, getDominantColor, fitText, measureText };
