import unicode_ranges from "@yodogawa404/get-unicode-chunk-range_jp/jp.json" with { type: "json" };

import { writeFileSync } from "node:fs";
import { execFile } from "node:child_process";

const source_fonts = {
  100: "../../resources/OTF/LINESeedJP_A_OTF_Th.otf",
  400: "../../resources/OTF/LINESeedJP_A_OTF_Rg.otf",
  700: "../../resources/OTF/LINESeedJP_A_OTF_Bd.otf",
  800: "../../resources/OTF/LINESeedJP_A_OTF_Eb.otf",
};

let distFileNames = {};
let woff2FileUnicodeList = {};
{
  function getUnicodesString(arr) {
    let str = "";
    for (let i = 0; i < arr.length; i++) {
      if (i == arr.length - 1) {
        str = str + arr[i];
      } else str = str + arr[i] + ",";
    }

    return str;
  }

  Object.keys(source_fonts).map((key) => {
    console.log(source_fonts[key]);

    for (let i_unicode = 0; i_unicode < unicode_ranges.length; i_unicode++) {
      console.log(i_unicode);
      let unicodes = "" + getUnicodesString(unicode_ranges[[i_unicode]]);

      const distDirName = "../line-seed-jp/fonts/";
      const distFileName = `LINESeedJP_${key}-${String(i_unicode).padStart(3, "0")}`;
      const distFileExt = ".otf";
      console.log(
        execFile("hb-subset", [
          source_fonts[key],
          `--unicodes=${unicodes}`,
          "--layout-features=*",
          `--output-file=${distDirName + distFileName + distFileExt}`,
        ]),
      );

      distFileNames[distFileName] = distDirName + distFileName + distFileExt;
      woff2FileUnicodeList[distDirName + distFileName + ".woff2"] = {
        unicodes: unicodes,
        weight: key,
        filename: distFileName + ".woff2",
      };
    }
  });
}

{
  Object.keys(distFileNames).map((key) => {
    console.log(execFile("woff2_compress", [distFileNames[key]]));
    console.log(execFile("rm", [distFileNames[key]]));
  });
}
{
  let full_css = "";
  Object.keys(woff2FileUnicodeList).map((key) => {
    full_css =
      full_css +
      `@font-face {font-family: 'LINE Seed JP';font-display: swap;font-weight: ${woff2FileUnicodeList[key]["weight"]};src: url(./fonts/${woff2FileUnicodeList[key]["filename"]}) format('woff2');unicode-range: ${woff2FileUnicodeList[key]["unicodes"]};}\n`;
  });

  writeFileSync("../line-seed-jp/index.css", full_css);
}
