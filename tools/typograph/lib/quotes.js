import { addReplacements } from "./stats.js";

function countMatches(text, regex) {
  return [...text.matchAll(regex)].length;
}

export function fixQuotes(text, stats) {
  let result = text;
  let replacements = 0;

  const paired = [
    [/„([^„"]*)"/g, "«$1»"],
    [/"([^"]*)"/g, "«$1»"],
    [/"([^"]*)"/g, "«$1»"],
  ];

  for (const [pattern, replacement] of paired) {
    const before = result;
    result = result.replace(pattern, replacement);
    replacements += countMatches(before, pattern);
  }

  let open = true;
  const straight = /"/g;
  if (straight.test(result)) {
    result = result.replace(straight, () => {
      replacements += 1;
      if (open) {
        open = false;
        return "«";
      }
      open = true;
      return "»";
    });
  }

  addReplacements(stats, replacements);
  return result;
}
