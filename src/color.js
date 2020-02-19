/**
 * Convert the <color> CSS data type string to hexcode
 *
 * @see https://stackoverflow.com/a/47355187
 *
 * @param {string} str
 */
export default function standardize_color(str) {
  var ctx = document.createElement("canvas").getContext("2d");
  ctx.fillStyle = str;
  return ctx.fillStyle;
}
