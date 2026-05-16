import { addReplacements } from "./stats.js";

const INVISIBLE_CHARS =
  /[\u200B-\u200D\uFEFF\u00AD\u2060\u180E\uFFFC\uFFF9-\uFFFB\u2061-\u2064\u2066-\u2069]/g;

const WEIRD_SPACES = /[\u2000-\u200A\u202F\u205F\u3000]/g;

export function cleanInvisible(text, stats) {
  let invisibleCount = 0;

  let result = text.replace(INVISIBLE_CHARS, () => {
    invisibleCount += 1;
    return "";
  });

  result = result.replace(WEIRD_SPACES, () => {
    invisibleCount += 1;
    return " ";
  });

  result = result.replace(/\u00A0/g, () => {
    invisibleCount += 1;
    return " ";
  });

  if (invisibleCount > 0) {
    stats.invisibleRemoved += invisibleCount;
    stats.artifactsRemoved += invisibleCount;
    addReplacements(stats, invisibleCount);
  }

  return result;
}
