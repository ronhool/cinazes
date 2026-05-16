import { addReplacements } from "./stats.js";

const BROKEN_SYMBOLS = /[\uFFFD\uFFFC¬§]/g;

export function removeBrokenSymbols(text, stats) {
  let count = 0;

  const result = text.replace(BROKEN_SYMBOLS, () => {
    count += 1;
    return "";
  });

  if (count > 0) {
    stats.artifactsRemoved += count;
    addReplacements(stats, count);
  }

  return result;
}
