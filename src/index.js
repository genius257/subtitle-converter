import "./styles.css";
import saveAs from "./saveAs";
import strPad from "./strPad";
import color from "./color";

import Srt from "./expoters/srt";
import Ttml from "./expoters/ttml";

// https://www.html5rocks.com/en/tutorials/file/dndfiles/
// https://codepen.io/TheLukasWeb/pen/qlGDa

// https://gotranscript.com/subtitle-converter

/*document.getElementById("app").innerHTML = `
<h1>Hello Vanilla!</h1>
<div>
  We use Parcel to bundle this sandbox, you can find more info about Parcel
  <a href="https://parceljs.org" target="_blank" rel="noopener noreferrer">here</a>.
</div>
`;*/

// TODO: add toastr for showing error message?
// TODO: update file list information when dropping file(s). Maybe nested error informarion can be added there?

function handleFileSelect(evt) {
  evt.stopPropagation();
  evt.preventDefault();
  evt.srcElement.classList.remove("dragover");

  var files = evt.dataTransfer.files; // FileList object.

  var ul = document.createElement("ul");

  //FIXME: support font-size
  Array.prototype.forEach.call(files, function(file) {
    file.text().then(text => {
      let ttml = new Ttml(text);
      saveAs(
        new Blob([Srt.parse(ttml.tokenize())], {
          type: "text/plain"
        }),
        `${file.name.replace(/\.ttml$/, "")}.srt`
      );
      return;
      let fAttFind = (e, name, def = {}) =>
        Array.prototype.find.call(e.attributes, a => a.localName === name) ||
        def;
      let attr = (object, name) => fAttFind(object, name, {}).value;

      let parser = new DOMParser();
      let dom = parser.parseFromString(text, "text/xml");

      let tt = dom.firstChild;

      let head = tt.getElementsByTagName("head")[0];
      //NOTE: profile currently not supported
      //let profile = Array.prototype.find.call(head.childNodes, e => e.localName === "profile");
      //NOTE: resources currently not supported
      //let resources = Array.prototype.find.call(head.childNodes, e => e.localName === "resources");
      let styling = Array.prototype.find.call(
        head.childNodes,
        e => e.localName === "styling"
      );
      if (styling !== undefined) {
        //what?!
        let styling_lang = fAttFind(styling, "lang", {}).value;
        let styling_space = fAttFind(styling, "space", {}).value;
        let inital = styling.getElementsByTagName("initial");
        let style = styling.getElementsByTagName("style");
        var styling_styles = Array.prototype.reduce.call(
          style,
          (previous, current) => {
            previous[attr(current, "id")] = current;
            return previous;
          },
          {}
        );
        //console.log(style);
        //console.log(styling_styles);
      }

      let body = tt.getElementsByTagName("body")[0];

      let tickRate = Array.prototype.find.call(
        tt.attributes,
        e => e.localName === "tickRate"
      ).value;

      if (tickRate === undefined) {
        // no tickrate it provided. To calculate the tickRate access to the related media is needed.
        return;
      }

      let parseTimeExpression = str => {
        let clockTime = /^[0-9]{2,}:[0-9]{2}:[0-9]{2}(\.[0-9]+|:[0-9]{2,}(\.[0-9]+)?)?$/;
        let offsetTime = /^[0-9]+(\.[0-9]+)?(h|m|s|ms|f|t)$/;
        let wallclockTime = /^wallclock\(([ \t\n\r])?([0-9]{4}-[0-9]{2}-[0-9]{4}T([0-9]{2}:[0-9]{2}|[0-9]{2}:[0-9]{2}:[0-9]{2}(\.[0-9]+)?)|([0-9]{2}:[0-9]{2}|[0-9]{2}:[0-9]{2}:[0-9]{2}(\.[0-9]+)?)|[0-9]{4}-[0-9]{2}-[0-9]{4})([ \t\n\r])?\)$/;
        if (clockTime.test(str)) {
          //
        } else if (offsetTime.test(str)) {
          //FIXME: check last char in switch case.
          let n = parseFloat(str.substr(0, str.length - 1)) / tickRate;
          let metric = str.substr(-1);
          let s = n % 60;
          let m = ((n - s) % (60 * 60)) / 60;
          let h = (n - s - m * 60) / 60 / 60;
          return `${strPad(h, 2)}:${strPad(m, 2)}:${s
            .toFixed(3)
            .replace(".", ",")
            .split(",")
            .map((str, index) => strPad(str, 2 + index))
            .join(",")}`;
        } else if (wallclockTime.test(str)) {
          //
        }
      };
      let index = 1;
      let fSrt = (e, state) => {
        let srt = "";
        Array.prototype.forEach.call(e.childNodes, c => {
          let begin;
          let end;
          let duration;
          switch (c.localName || c.nodeName) {
            case "div":
              srt += fSrt(c, state);
              break;
            case "p":
              begin = fAttFind(c, "begin").value;
              end = fAttFind(c, "end").value;
              duration = fAttFind(c, "dur").value;
              if (begin !== undefined) {
                srt += `${index}\n${parseTimeExpression(
                  begin
                )} --> ${parseTimeExpression(end || duration)}\n`;
                index += 1;
              }
              srt += fSrt(c, state);
              if (begin !== undefined) {
                srt += "\n";
              }
              break;
            case "span":
              begin = fAttFind(c, "begin").value;
              end = fAttFind(c, "end").value;
              duration = fAttFind(c, "dur").value;
              if (begin !== undefined) {
                srt += `${index}\n${parseTimeExpression(
                  begin
                )} --> ${parseTimeExpression(end || duration)}\n`;
                index += 1;
              }
              if (attr(c, "style") !== undefined) {
                var _srt = fSrt(c, state);
                let _style = styling_styles[attr(c, "style")];
                //console.log(_style.attributes);
                for (let i = 0; i < _style.attributes.length; i++) {
                  //console.log(_style.attributes[i]);
                  //console.log(_style.attributes, i);
                  switch (_style.attributes[i].localName) {
                    case "color":
                      _srt = `<font color="${color(
                        _style.attributes[i].value
                      )}">${_srt}</font>`;
                      break;
                    case "fontSize":
                      //FIXME:
                      break;
                    case "fontStyle":
                      switch (_style.attributes[i].value) {
                        case "bold":
                          //NOTE: style shgould never be bold, that would be fontWeight?
                          _srt = `<b>${_srt}</b>`;
                          break;
                        case "italic":
                          _srt = `<i>${_srt}</i>`;
                          break;
                        case "underline":
                          _srt = `<u>${_srt}</u>`;
                          break;
                        default:
                        //NOTE: assuming unsupported fontSytle
                      }
                      break;
                    case "fontWeight":
                      if (_style.attributes[i].value === "bold") {
                        _srt = `<b>${_srt}</b>`;
                      }
                      break;
                    default:
                    //TODO: check ttml spec for more cases
                  }
                }
                srt += _srt;
              } else {
                srt += fSrt(c, state);
              }
              if (begin !== undefined) {
                srt += "\n";
              }
              break;
            case "br":
              srt += "\n";
              break;
            case "#text":
              srt += c.textContent;
              break;
            case "tt":
            case "head":
            case "body":
              srt += fSrt(c, state);
              break;
            default:
              srt += `${c.localName || c.nodeName}\n`; //FIXME: this should be omitted in prod
            //console.error("oh nooo!", c.localName);
          }
        });

        return srt;
      };
      let srt = fSrt(body, { index: 0 });
      saveAs(
        new Blob([srt], {
          type: "text/plain"
        }),
        `${file.name.replace(/\.ttml$/, "")}.srt`
      );
    });

    let li = document.createElement("li");
    let strong = document.createElement("strong");
    strong.innerText = file.name;
    let text = document.createTextNode("");
    text.textContent = ` (${file.type || "n/a"}) - ${
      file.size
    } bytes, last modified: ${
      file.lastModifiedDate ? file.lastModifiedDate.toLocaleDateString() : "n/a"
    }`;
    li.append(strong, text);
    ul.appendChild(li);
  });

  document.getElementById("list").appendChild(ul);
}

function handleDragOver(evt) {
  evt.stopPropagation();
  evt.preventDefault();
  evt.dataTransfer.dropEffect = "copy"; // Explicitly show this is a copy.
}

// Setup the dnd listeners.
var dropZone = document.getElementById("drop_zone");
dropZone.addEventListener("dragover", handleDragOver, false);
dropZone.addEventListener(
  "dragover",
  function(e) {
    try {
      e.srcElement.classList.add("dragover");
    } catch (e) {
      console.error(e);
    }
  },
  false
);
dropZone.addEventListener(
  "dragleave",
  function(e) {
    try {
      e.srcElement.classList.remove("dragover");
    } catch (e) {
      console.error(e);
    }
  },
  false
);
dropZone.addEventListener("drop", handleFileSelect, false);
