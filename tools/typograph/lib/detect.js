const CYRILLIC_RE = /\p{Script=Cyrillic}/u;
const LATIN_RE = /\p{Script=Latin}/u;

export function detectScript(text) {
  let cyrillic = 0;
  let latin = 0;

  for (const char of text) {
    if (CYRILLIC_RE.test(char)) cyrillic += 1;
    else if (LATIN_RE.test(char)) latin += 1;
  }

  if (cyrillic > 0 && latin > 0) return "mixed";
  if (cyrillic > latin) return "cyrillic";
  if (latin > cyrillic) return "latin";
  return "unknown";
}

export function isPrimarilyCyrillic(text) {
  const script = detectScript(text);
  if (script === "cyrillic") return true;
  if (script !== "mixed") return false;

  let cyrillic = 0;
  let latin = 0;

  for (const char of text) {
    if (CYRILLIC_RE.test(char)) cyrillic += 1;
    else if (LATIN_RE.test(char)) latin += 1;
  }

  return cyrillic >= latin;
}

export function scriptLabel(script) {
  switch (script) {
    case "cyrillic":
      return "кириллица";
    case "latin":
      return "латиница";
    case "mixed":
      return "смешанный текст";
    default:
      return "язык не определён";
  }
}
