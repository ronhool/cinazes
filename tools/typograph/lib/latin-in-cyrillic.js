import { addReplacements } from "./stats.js";
import { isPrimarilyCyrillic } from "./detect.js";

const LATIN_TO_CYRILLIC = {
  a: "а",
  c: "с",
  e: "е",
  k: "к",
  m: "м",
  o: "о",
  p: "р",
  t: "т",
  x: "х",
  y: "у",
  A: "А",
  C: "С",
  E: "Е",
  K: "К",
  M: "М",
  O: "О",
  P: "Р",
  T: "Т",
  X: "Х",
  Y: "У",
};

const CYRILLIC_RE = /[\u0400-\u04FF\u0500-\u052F]/;

export function fixLatinInCyrillic(text, stats) {
  if (!isPrimarilyCyrillic(text)) return text;

  const chars = [...text];
  let replacements = 0;

  for (let i = 0; i < chars.length; i += 1) {
    const mapped = LATIN_TO_CYRILLIC[chars[i]];
    if (!mapped) continue;

    const prev = chars[i - 1];
    const next = chars[i + 1];
    const nearCyrillic =
      (prev && CYRILLIC_RE.test(prev)) || (next && CYRILLIC_RE.test(next));

    if (nearCyrillic) {
      chars[i] = mapped;
      replacements += 1;
    }
  }

  addReplacements(stats, replacements);
  return chars.join("");
}
