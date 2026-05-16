import { addReplacements } from "./stats.js";

function shouldMergeLine(line, nextLine) {
  const trimmed = line.trimEnd();
  const nextTrimmed = nextLine.trimStart();

  if (!trimmed || !nextTrimmed) return false;

  if (trimmed.endsWith(",") || trimmed.endsWith("-")) return true;

  const endsSentence = /[.!?…:;»"»]$/.test(trimmed);
  const nextStartsLower = /^[а-яёa-z]/.test(nextTrimmed);

  return !endsSentence && nextStartsLower;
}

export function mergeLines(text, stats) {
  const lines = text.split("\n");
  const merged = [];
  let index = 0;

  while (index < lines.length) {
    let line = lines[index];

    while (index < lines.length - 1 && shouldMergeLine(line, lines[index + 1])) {
      const trimmed = line.trimEnd();
      const next = lines[index + 1].trimStart();
      line = `${trimmed} ${next}`;
      addReplacements(stats, 1);
      index += 1;
    }

    merged.push(line);
    index += 1;
  }

  return merged.join("\n");
}
