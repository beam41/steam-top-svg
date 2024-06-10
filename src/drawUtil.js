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
 * @param {number} [fraction=0]
 * @return {string} result
 */
function mapTime(minute, fraction = 0) {
  if (minute < 60) {
    return minute + "m";
  }

  const str = (minute / 60).toPrecision({
    maximumFractionDigits: fraction,
    minimumFractionDigits: 0,
  });

  return str + "h";
}

module.exports = { xmlElement, mapTime };
