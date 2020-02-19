import textBlock from "./lib/textBlock";
import color from "../color";

export default class Srt {
  static parse(tokens) {
    return tokens
      .filter(t => (t.specifications && t.specifications.begin) !== undefined)
      .map((t, index) => {
        //console.log(t.specifications.begin);
        return new textBlock([
          index + 1,
          "\n",
          `${t.specifications.begin} --> ${t.specifications.end}`,
          "\n",
          this._parseStyles(t)
        ]);
      })
      .join("\n\n");
  }

  static _parseStyles(token) {
    if (
      Object.keys(token.styles || {}).length === 0 ||
      typeof token === "string"
    ) {
      if ((token.content && token.content.length) > 0) {
        return new textBlock(token.content.map(n => this._parseStyles(n)));
      }
      return token;
    }

    for (let [key, value] of Object.entries(token.styles)) {
      switch (key) {
        case "color":
          let _color = color(value);
          if (_color === "#ffffff") {
            break;
          }
          token = new textBlock([`<font color="${_color}">`, token, "</font>"]);
          break;
        case "fontStyle":
          if (value === "italic") {
            token = new textBlock([`<i>`, token, "</i>"]);
          }
          break;
        case "fontWeight":
          if (value === "bold") {
            token = new textBlock([`<b>`, token, "</b>"]);
          }
          break;
        case "textDecoration":
          if (value === "underline") {
            token = new textBlock([`<u>`, token, "</u>"]);
          }
        default:
        //FIXME: support fontSize
        //console.info(key);
      }
    }

    return token;
  }
}
