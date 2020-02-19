/**
 * Push Blob object as a file, and makes the browser handle it as a file download.
 *
 * I cannot remember where i got this code. It is not written by me.
 *
 * @param {Blob} blob
 * @param {string} fileName
 */
export default function saveAs(blob, fileName) {
  if (typeof navigator.msSaveOrOpenBlob !== "undefined") {
    return navigator.msSaveOrOpenBlob(blob, fileName);
  } else if (typeof navigator.msSaveBlob !== "undefined") {
    return navigator.msSaveBlob(blob, fileName);
  } else {
    var elem = window.document.createElement("a");
    elem.href = window.URL.createObjectURL(blob);
    elem.download = fileName;
    elem.style = "display:none;opacity:0;color:transparent;";
    (document.body || document.documentElement).appendChild(elem);
    if (typeof elem.click === "function") {
      elem.click();
    } else {
      elem.target = "_blank";
      elem.dispatchEvent(
        new MouseEvent("click", {
          view: window,
          bubbles: true,
          cancelable: true
        })
      );
    }
    URL.revokeObjectURL(elem.href);
  }
}
