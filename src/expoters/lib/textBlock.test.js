import textBlock from "./textBlock";

it("constructor", () => {
  let tb = new textBlock("test");
});

it("toString", () => {
  let tb = new textBlock("test");
  expect(tb + "").toEqual("test");

  tb = new textBlock(["abc", "def"]);
  expect(tb + "").toEqual("abcdef");

  tb = new textBlock([tb, "ghi"]);
  expect(tb + "").toEqual("abcdefghi");
});
