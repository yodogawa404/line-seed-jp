import unicode_ranges from "@yodogawa404/get-unicode-chunk-range_jp/jp.json" with { type: "json" };

import { writeFileSync } from "node:fs";
import { execFileSync } from "node:child_process";

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
        execFileSync("hb-subset", [
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
    console.log(execFileSync("woff2_compress", [distFileNames[key]]));
    console.log(execFileSync("rm", [distFileNames[key]]));
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

{
  const hiraganaUnicodeRange = "U+3041-309E";
  const katakanaUnicodeRange = "U+30A1-30FA";

  let hiraganaOTFFileList = [];
  let katakanaOTFFileList = [];

  let hiraganaWoff2FileList = [];
  let katakanaWoff2FileList = [];

  Object.keys(source_fonts).map((key) => {
    const distDirName = "../line-seed-jp/fonts/";
    const distFileName = `LINESeedJP_${key}-hiragana`;
    const distFileExt = ".otf";

    console.log(
      execFileSync("hb-subset", [
        source_fonts[key],
        `--unicodes=${hiraganaUnicodeRange}`,
        "--layout-features=*",
        `--output-file=${distDirName + distFileName + distFileExt}`,
      ]),
    );

    hiraganaOTFFileList.push(distDirName + distFileName + distFileExt);
    hiraganaWoff2FileList.push({
      filename: distFileName + ".woff2",
      weight: key,
      unicodeRange: hiraganaUnicodeRange,
    });
  });

  Object.keys(source_fonts).map((key) => {
    const distDirName = "../line-seed-jp/fonts/";
    const distFileName = `LINESeedJP_${key}-katakana`;
    const distFileExt = ".otf";

    console.log(
      execFileSync("hb-subset", [
        source_fonts[key],
        `--unicodes=${katakanaUnicodeRange}`,
        "--layout-features=*",
        `--output-file=${distDirName + distFileName + distFileExt}`,
      ]),
    );

    katakanaOTFFileList.push(distDirName + distFileName + distFileExt);
    katakanaWoff2FileList.push({
      filename: distFileName + ".woff2",
      weight: key,
      unicodeRange: katakanaUnicodeRange,
    });
  });

  for (let i = 0; i < hiraganaOTFFileList.length; i++) {
    console.log(execFileSync("woff2_compress", [hiraganaOTFFileList[i]]));
    console.log(execFileSync("rm", [hiraganaOTFFileList[i]]));
  }

  for (let i = 0; i < katakanaOTFFileList.length; i++) {
    console.log(execFileSync("woff2_compress", [katakanaOTFFileList[i]]));
    console.log(execFileSync("rm", [katakanaOTFFileList[i]]));
  }

  let hiraganaFullCss = "";
  for (let i = 0; i < hiraganaWoff2FileList.length; i++) {
    hiraganaFullCss =
      hiraganaFullCss +
      `@font-face {font-family: 'LINE Seed JP';font-display: swap;font-weight: ${hiraganaWoff2FileList[i]["weight"]};src: url(./fonts/${hiraganaWoff2FileList[i]["filename"]}) format('woff2');unicode-range: ${hiraganaWoff2FileList[i]["unicodeRange"]};}\n`;
  }
  writeFileSync("../line-seed-jp/hiragana.css", hiraganaFullCss);

  let katakanaFullCss = "";
  for (let i = 0; i < katakanaWoff2FileList.length; i++) {
    katakanaFullCss =
      katakanaFullCss +
      `@font-face {font-family: 'LINE Seed JP';font-display: swap;font-weight: ${katakanaWoff2FileList[i]["weight"]};src: url(./fonts/${katakanaWoff2FileList[i]["filename"]}) format('woff2');unicode-range: ${katakanaWoff2FileList[i]["unicodeRange"]};}\n`;
  }
  writeFileSync("../line-seed-jp/katakana.css", katakanaFullCss);
}
