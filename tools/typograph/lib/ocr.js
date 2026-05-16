import { addReplacements } from "./stats.js";

export function ocrCleanup(text, stats, aggressive = false) {
  let result = text;
  let replacements = 0;

  result = result.replace(/([a-zа-яё])rn([a-zа-яё])/gi, (match, before, after) => {
    replacements += 1;
    return `${before}m${after}`;
  });

  if (aggressive) {
    result = result.replace(/\b([A-ZА-ЯЁ]{2,})0([A-ZА-ЯЁ]{2,})\b/g, (match, before, after) => {
      replacements += 1;
      return `${before}O${after}`;
    });

    result = result.replace(/\b([A-ZА-ЯЁ])l([A-ZА-ЯЁ]{2,})\b/g, (match, first, rest) => {
      replacements += 1;
      return `${first}I${rest}`;
    });

    result = result.replace(/([а-яёa-z])0([а-яёa-z])/g, (match, before, after) => {
      replacements += 1;
      return `${before}о${after}`;
    });
  }

  addReplacements(stats, replacements);
  return result;
}
