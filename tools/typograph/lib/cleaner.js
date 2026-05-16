import { createStats } from "./stats.js";
import { detectScript } from "./detect.js";
import { cleanInvisible } from "./invisible.js";
import { removeBrokenSymbols } from "./broken-symbols.js";
import { mergeLines } from "./line-merge.js";
import { ocrCleanup } from "./ocr.js";
import { fixQuotes } from "./quotes.js";
import { fixDashes } from "./dashes.js";
import { fixEllipsis } from "./ellipsis.js";
import { fixLatinInCyrillic } from "./latin-in-cyrillic.js";
import { fixDoubleSpaces } from "./spaces.js";

export function cleanText(input, options = {}) {
  const stats = createStats();
  const { aggressive = false, lineMerge = false } = options;

  if (!input) {
    return { text: "", stats, script: "unknown" };
  }

  let text = input;

  text = cleanInvisible(text, stats);
  text = text.normalize("NFC");
  text = removeBrokenSymbols(text, stats);

  if (lineMerge) {
    text = mergeLines(text, stats);
  }

  text = ocrCleanup(text, stats, aggressive);
  text = fixQuotes(text, stats);
  text = fixDashes(text, stats);
  text = fixEllipsis(text, stats);
  text = fixLatinInCyrillic(text, stats);
  text = fixDoubleSpaces(text, stats);

  const script = detectScript(text);

  return { text, stats, script };
}
