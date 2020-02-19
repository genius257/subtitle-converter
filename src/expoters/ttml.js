import textBlock from "./lib/textBlock";
import breakBlock from "./lib/breakBlock";
import strPad from "../strPad";

// https://stackoverflow.com/questions/10226064/javascript-equivalent-of-php-call

let fAttFind = (e, name, def = {}) =>
  Array.prototype.find.call(e.attributes, a => a.localName === name) || def;
let attr = (object, name) => fAttFind(object, name, {}).value;

//NOTE: attributes not checked/supprted on body

export default class Ttml {
  constructor(data) {
    if (typeof data !== "string") {
      throw new Error("variable must be string");
    }

    this.parser = new DOMParser();
    this.document = this.parser.parseFromString(data, "text/xml");

    /**
     * @type {ChildNode}
     */
    this.tt = Array.prototype.find.call(
      this.document.childNodes,
      n => n.localName === "tt"
    );
    if (this.tt === undefined) {
      throw new Error(`TTML Document not found`);
    }

    /**
     * @type {string}
     */
    this.tickRate = attr(this.tt, "tickRate");

    if (this.tickRate === undefined) {
      throw new Error(`TTML Document tickRate not found`);
      // no tickrate it provided. To calculate the tickRate access to the related media is needed.
    }

    /**
     * @type {ChildNode}
     */
    this.head = Array.prototype.find.call(
      this.tt.childNodes,
      n => n.localName === "head"
    );

    /**
     * @type {ChildNode[]}
     */
    this.styling = Array.prototype.find.call(
      (this.head && this.head.childNodes) || [],
      n => n.localName === "styling"
    );

    this.styles = Array.prototype.reduce.call(
      (this.styling && this.styling.childNodes) || [],
      (previous, current) => {
        if (current.localName === "style") {
          previous[attr(current, "id")] = current;
        }
        return previous;
      },
      {}
    );

    this.layout = Array.prototype.reduce.call(
      Array.prototype.find.call(
        (this.head && this.head.childNodes) || [],
        n => n.localname === "layout"
      ) || [],
      (previous, current) => {
        previous[attr(current, "id")] = current;
        return previous;
      },
      {}
    );

    if (this.head !== undefined) {
      Array.prototype.reduce.call(
        Array.prototype.filter.call(
          this.head.childNodes,
          n => n.localName === "styling"
        ),
        (previous, current) => (previous[current.id] = current),
        {}
      );
      Array.prototype.reduce.call(
        Array.prototype.filter.call(
          this.head.childNodes,
          n => n.localName === "layout"
        ),
        (previous, current) => (previous[current.id] = current),
        {}
      );
    }

    /**
     * @type {ChildNode}
     */
    this.body = Array.prototype.find.call(
      this.tt.childNodes,
      n => n.localName === "body"
    );
  }

  tokenize(token) {
    let tokens = [];
    Array.prototype.forEach.call(
      (token && token.childNodes) || (this.body && this.body.childNodes) || [],
      node => {
        switch (node.localName || node.nodeName) {
          case "#text":
            tokens.push(new textBlock(node.textContent));
            break;
          case "div":
            tokens.push(...this.tokenizeDiv(node));
            //tokens.push(...this.tokenize(node));
            break;
          case "p":
            tokens.push(...this.tokenizeParagraph(node));
            //tokens.push(...this.tokenize(node));
            break;
          case "span":
            tokens.push(...this.tokenizeSpan(node));
            break;
          case "br":
            tokens.push(this.tokenizeBreak(node));
            break;
          default:
          //console.log(node);
        }
        //tokens.push(node);
      }
    );
    return tokens;
  }

  tokenizeText() {
    //
  }

  tokenizeDiv(node) {
    return this.tokenizeExtended(node);
  }

  tokenizeParagraph(node) {
    return this.tokenizeExtended(node);
  }

  tokenizeSpan(node) {
    return this.tokenizeExtended(node);
  }

  tokenizeBreak() {
    return new breakBlock();
  }

  tokenizeExtended(node) {
    let specifications = {};
    let styles = {};

    for (let i = 0; i < node.attributes.length; i++) {
      switch (node.attributes[i].localName) {
        case "animate":
          /*console.info(
            node.attributes[i].localName + " attribute not supported"
          );*/
          break;
        case "begin":
        case "dur":
        case "end":
          specifications[
            node.attributes[i].localName
          ] = this.parseTimeExpression(node.attributes[i].value);
          break;
        case "condition":
          /*console.info(
            node.attributes[i].localName + " attribute not supported"
          );*/
          break;
        case "region":
          /*console.info(
            node.attributes[i].localName + " attribute not supported"
          );*/
          break;
        case "style":
          styles = this.parseStyleFromId(node.attributes[i].value);
          break;
        case "timeContainer":
          /*console.info(
            node.attributes[i].localName + " attribute not supported"
          );*/
          break;
        case "space":
          /*console.info(
            node.attributes[i].localName + " attribute not supported"
          );*/
          //FIXME: implement.
          //TODO: maybe add support for this with body, head and tt also
          break;
        default:
        //console.warn("unsuported attribute: " + node.attributes[i].localName);
      }
    }

    if (Object.keys(styles).length + Object.keys(specifications).length > 0) {
      return [new textBlock(this.tokenize(node), styles, specifications)];
    }

    return this.tokenize(node);
  }

  parseTimeExpression(timeExpression) {
    let clockTime = /^[0-9]{2,}:[0-9]{2}:[0-9]{2}(\.[0-9]+|:[0-9]{2,}(\.[0-9]+)?)?$/;
    let offsetTime = /^[0-9]+(\.[0-9]+)?(h|m|s|ms|f|t)$/;
    let wallclockTime = /^wallclock\(([ \t\n\r])?([0-9]{4}-[0-9]{2}-[0-9]{4}T([0-9]{2}:[0-9]{2}|[0-9]{2}:[0-9]{2}:[0-9]{2}(\.[0-9]+)?)|([0-9]{2}:[0-9]{2}|[0-9]{2}:[0-9]{2}:[0-9]{2}(\.[0-9]+)?)|[0-9]{4}-[0-9]{2}-[0-9]{4})([ \t\n\r])?\)$/;
    if (clockTime.test(timeExpression)) {
      //FIXME: implement
      throw new Error("clockTime not supported");
    } else if (offsetTime.test(timeExpression)) {
      //FIXME: check last char in switch case.
      let n =
        parseFloat(timeExpression.substr(0, timeExpression.length - 1)) /
        this.tickRate;
      let metric = timeExpression.substr(-1);
      let s = n % 60;
      let m = ((n - s) % (60 * 60)) / 60;
      let h = (n - s - m * 60) / 60 / 60;
      return `${strPad(h, 2)}:${strPad(m, 2)}:${s
        .toFixed(3)
        .replace(".", ",")
        .split(",")
        .map((str, index) => strPad(str, 2 + index))
        .join(",")}`;
    } else if (wallclockTime.test(timeExpression)) {
      //FIXME: implement
      throw new Error("wallclockTime not supported");
    }
  }

  parseStyleFromId(styleId) {
    //console.log(styleId, this.styles.hasOwnProperty(styleId), this.styles);
    return this.styles.hasOwnProperty(styleId)
      ? this.parseStyle(this.styles[styleId])
      : {};
  }

  parseStyle(styles) {
    let style = {};
    for (let i = 0; i < styles.attributes.length; i++) {
      switch (styles.attributes[i].localName) {
        case "backgroundClip":
        case "backgroundColor":
        case "backgroundExtent":
        case "backgroundImage":
        case "backgroundOrigin":
        case "backgroundPosition":
        case "backgroundRepeat":
        case "border":
        case "bpd":
        case "color":
        case "direction":
        case "disparity":
        case "display":
        case "displayAlign":
        case "extent":
        case "fontFamily":
        case "fontKerning":
        case "fontSelectionStrategy":
        case "fontShear":
        case "fontSize":
        case "fontStyle":
        case "fontVariant":
        case "fontWeight":
        case "ipd":
        case "letterSpacing":
        case "lineHeight":
        case "lineShear":
        case "luminanceGain":
        case "opacity":
        case "origin":
        case "overflow":
        case "padding":
        case "position":
        case "ruby":
        case "rubyAlign":
        case "rubyPosition":
        case "rubyReserve":
        case "shear":
        case "showBackground":
        case "textAlign":
        case "textCombine":
        case "textDecoration":
        case "textEmphasis":
        case "textOrientation":
        case "textOutline":
        case "textShadow":
        case "unicodeBidi":
        case "visibility":
        case "wrapOption":
        case "writingMode":
        case "zIndex":
          style[styles.attributes[i].localName] = styles.attributes[i].value;
          break;
        case "gain":
        case "pan":
        case "pitch":
        case "speak":
          break;
        default:
        //
      }
    }
    return style;
  }
}
/*
var tt = new Ttml(`<tt
xmlns="http://www.w3.org/ns/ttml"
xmlns:tts="http://www.w3.org/ns/ttml#styling"
xml:lang="en">
<head>

</head>
<body>
  <foo>Foo</foo>
  <div>
    <p
      tts:foo="bar">
        Bar
    </p>
  </div>
</body>
</tt>`);
*/
//console.log(tt.tokenize().join(""));
