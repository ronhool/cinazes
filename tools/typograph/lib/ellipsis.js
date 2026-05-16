import { addReplacements } from "./stats.js";

export function fixEllipsis(text, stats) {
  let replacements = 0;

  const result = text.replace(/\.{3}/g, () => {
    replacements += 1;
    return "…";
  });

  addReplacements(stats, replacements);
  return result;
}
