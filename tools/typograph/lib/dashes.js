import { addReplacements } from "./stats.js";

export function fixDashes(text, stats) {
  let replacements = 0;

  const result = text.replace(/(\s)-(\s)/g, (match, before, after) => {
    replacements += 1;
    return `${before}—${after}`;
  });

  addReplacements(stats, replacements);
  return result;
}
