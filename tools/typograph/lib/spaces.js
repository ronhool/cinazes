import { addReplacements } from "./stats.js";

export function fixDoubleSpaces(text, stats) {
  let replacements = 0;

  const result = text.replace(/[^\S\n]{2,}/g, (match) => {
    replacements += 1;
    return " ";
  });

  addReplacements(stats, replacements);
  return result;
}
