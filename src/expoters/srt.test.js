import srt from "./srt";
import ttml from "./ttml";

it("ttml to srt", () => {
  let _ttml = new ttml(`<?xml version="1.0" encoding="UTF-8" standalone="no"?>
  <tt xmlns:tt="http://www.w3.org/ns/ttml" xmlns:ttm="http://www.w3.org/ns/ttml#metadata" xmlns:ttp="http://www.w3.org/ns/ttml#parameter" xmlns:tts="http://www.w3.org/ns/ttml#styling" ttp:tickRate="10000000" ttp:timeBase="media" xmlns="http://www.w3.org/ns/ttml">
  <head>
  <ttp:profile use="http://netflix.com/ttml/profile/dfxp-ls-sdh"/>
  <styling>
  <style tts:color="white" tts:fontSize="100%" tts:fontStyle="italic" tts:fontWeight="normal" xml:id="italic"/>
  <style tts:color="white" tts:fontSize="100%" tts:fontWeight="normal" xml:id="span"/>
  </styling>
  <layout>
  <region tts:backgroundColor="transparent" tts:displayAlign="after" tts:extent="80.00% 80.00%" tts:origin="10.00% 10.00%" tts:textAlign="center" xml:id="bottom"/>
  </layout>
  </head>
  <body>
  <div xml:space="preserve">
  <p begin="90090000t" end="118451667t" region="bottom" xml:id="subtitle0"><span style="span">[hissing]</span></p>
  <p begin="270687084t" end="282365417t" region="bottom" xml:id="subtitle1"><span style="italic">I...</span></p>
  </div>
  </body>
  </tt>`);

  let tokens = _ttml.tokenize();

  //console.log(srt.parse(tokens));
});

it("nested styles", () => {
  let _ttml = new ttml(`<?xml version="1.0" encoding="UTF-8" standalone="no"?>
  <tt xmlns:tt="http://www.w3.org/ns/ttml" xmlns:ttm="http://www.w3.org/ns/ttml#metadata" xmlns:ttp="http://www.w3.org/ns/ttml#parameter" xmlns:tts="http://www.w3.org/ns/ttml#styling" ttp:tickRate="10000000" ttp:timeBase="media" xmlns="http://www.w3.org/ns/ttml">
  <head>
  <styling>
  <style tts:fontStyle="italic" xml:id="italic"/>
  <style tts:fontStyle="normal" xml:id="normal"/>
  </styling>
  </head>
  <body>
  <div>
  <p begin="90090000t" end="118451667t" style="italic">one <span style="normal">two</span> three</p>
  </div>
  </body>
  </tt>`);

  let tokens = _ttml.tokenize();
  let result = srt.parse(tokens);

  expect(result).toEqual(`1
00:00:09,009 --> 00:00:11,845
<i>one </i>two<i> three</i>`);
});
