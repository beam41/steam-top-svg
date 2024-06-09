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
    return element;
  }

  element += `>${children.join("")}</${tag}>`;
  return element;
}

/**
 * @param {number} minute
 * @param {boolean} [fraction=false]
 * @return {string} result
 */
function mapTime(minute, fraction = false) {
  if (minute < 60) {
    return minute + "m";
  }

  const str = (minute / 60).toLocaleString("en-US", {
    maximumFractionDigits: fraction ? 1 : 0,
    minimumFractionDigits: 0,
  });

  return str + "h";
}

module.exports = { xmlElement, mapTime };
