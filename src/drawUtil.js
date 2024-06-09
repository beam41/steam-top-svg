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
 * @return {string} result
 */
function mapHour(minute) {
  const str = (minute / 60).toLocaleString("en-US", {
    maximumFractionDigits: 1,
    minimumFractionDigits: 0,
  });
  return str === "0" ? "0.1" : str;
}

module.exports = { xmlElement, mapHour };
