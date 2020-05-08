import "./styles.css";
import saveAs from "./saveAs";
import strPad from "./strPad";
import color from "./color";

import Srt from "./expoters/srt";
import Ttml from "./expoters/ttml";

import Zip from "jszip";

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

  const promises = [];
  const zip = new Zip();

  //FIXME: support font-size
  Array.prototype.forEach.call(files, function(file) {
    promises.push(
      file.text().then(text => {
        let ttml = new Ttml(text);
        zip.file(
          `${file.name.replace(/\.ttml$/, "")}.srt`,
          Srt.parse(ttml.tokenize())
        );
      })
    );

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

  Promise.all(promises)
    .then(() => {
      zip.generateAsync({ type: "blob" }).then(function(content) {
        // see FileSaver.js
        saveAs(content, window.location.host + ".zip");
      });
    })
    .catch(e => {
      // Handle errors here
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
