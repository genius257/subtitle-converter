/**
 * pad string left with char
 *
 * Notice: the third parameter (p) is exspected to be a string with a length of 1.
 * Providing anything else, may yeild unexspected results.
 *
 * @param {number|string} n The numberto pad left
 * @param {int}           l The wanted minimum length of the output string
 * @param {string}        p The pad string to use.
 *
 * @author Anders Pedersen @genius257
 */
export default (n, l, p = "0") => {
  let s = String(n);
  return p.repeat(Math.max(0, l - s.length)) + s;
};
