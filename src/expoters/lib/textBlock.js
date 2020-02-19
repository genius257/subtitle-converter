export default class textBlock {
  constructor(content, styles, specifications) {
    this.styles = styles || {};

    this.specifications = specifications || {};

    this.content = Array.isArray(content) ? content : [content];
  }

  toString() {
    return this.content.join("");
  }
}
