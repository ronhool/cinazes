const EN_TO_RU = {
  "`": "ё",
  q: "й",
  w: "ц",
  e: "у",
  r: "к",
  t: "е",
  y: "н",
  u: "г",
  i: "ш",
  o: "щ",
  p: "з",
  "[": "х",
  "]": "ъ",
  a: "ф",
  s: "ы",
  d: "в",
  f: "а",
  g: "п",
  h: "р",
  j: "о",
  k: "л",
  l: "д",
  ";": "ж",
  "'": "э",
  z: "я",
  x: "ч",
  c: "с",
  v: "м",
  b: "и",
  n: "т",
  m: "ь",
  ",": "б",
  ".": "ю",
};

const RU_TO_EN = Object.fromEntries(
  Object.entries(EN_TO_RU).map(([latin, cyrillic]) => [cyrillic, latin]),
);

const input = document.getElementById("layout-fix-input");
const output = document.getElementById("layout-fix-output");
const copyBtn = document.getElementById("layout-fix-copy");
const clearInputBtn = document.getElementById("layout-fix-clear-input");

const autoBtn = document.getElementById("layout-fix-mode-auto");
const enRuBtn = document.getElementById("layout-fix-mode-en-ru");
const ruEnBtn = document.getElementById("layout-fix-mode-ru-en");

const tabTool = document.getElementById("tab-tool");
const tabAbout = document.getElementById("tab-about");
const panelTool = document.getElementById("panel-tool");
const panelAbout = document.getElementById("panel-about");
const backLink = document.querySelector(".tp-back");

const statConverted = document.getElementById("stat-converted");
const statMode = document.getElementById("stat-mode");
const statDirection = document.getElementById("stat-direction");

const state = {
  mode: "auto",
};

function isUppercase(char) {
  return char.toLowerCase() !== char.toUpperCase() && char === char.toUpperCase();
}

function remapChar(char, table) {
  const lower = char.toLowerCase();
  const mapped = table[lower];

  if (!mapped) return null;
  return isUppercase(char) ? mapped.toUpperCase() : mapped;
}

function convertText(text, direction) {
  const table = direction === "en-ru" ? EN_TO_RU : RU_TO_EN;
  let converted = 0;
  let result = "";

  for (const char of text) {
    const mapped = remapChar(char, table);
    if (mapped === null) {
      result += char;
      continue;
    }

    result += mapped;
    if (mapped !== char) converted += 1;
  }

  return { text: result, converted };
}

function convertAuto(text) {
  const lines = text.split("\n");
  const usedDirections = new Set();
  let converted = 0;

  const result = lines
    .map((line) => {
      const direction = detectDirection(line);
      usedDirections.add(direction);
      const mapped = convertText(line, direction);
      converted += mapped.converted;
      return mapped.text;
    })
    .join("\n");

  return {
    text: result,
    converted,
    direction: usedDirections.size === 1 ? [...usedDirections][0] : "mixed",
  };
}

function detectDirection(text) {
  let latinCount = 0;
  let cyrillicCount = 0;

  for (const char of text) {
    if (/[a-z]/i.test(char)) latinCount += 1;
    else if (/[а-яё]/i.test(char)) cyrillicCount += 1;
  }

  if (latinCount === 0 && cyrillicCount === 0) return "en-ru";
  if (latinCount >= cyrillicCount) return "en-ru";
  return "ru-en";
}

function currentDirection(text) {
  if (state.mode === "en-ru") return "en-ru";
  if (state.mode === "ru-en") return "ru-en";
  return detectDirection(text);
}

function directionLabel(direction) {
  if (direction === "mixed") return "mixed";
  return direction === "ru-en" ? "ru → en" : "en → ru";
}

function updateStats(converted, direction) {
  statConverted.textContent = String(converted);
  statMode.textContent = state.mode === "auto" ? "auto" : directionLabel(state.mode);
  statDirection.textContent = directionLabel(direction);
}

function runFix() {
  const direction = currentDirection(input.value);
  const result = state.mode === "auto" ? convertAuto(input.value) : convertText(input.value, direction);
  output.value = result.text;
  updateStats(result.converted, state.mode === "auto" ? result.direction : direction);
}

async function copyOutput() {
  if (!output.value) return;
  await navigator.clipboard.writeText(output.value);
  copyBtn.classList.add("tp-box-action--done");
  window.setTimeout(() => copyBtn.classList.remove("tp-box-action--done"), 1400);
}

function clearInput() {
  input.value = "";
  runFix();
  input.focus();
}

function setMode(mode) {
  state.mode = mode;

  autoBtn.classList.toggle("tp-action--active", mode === "auto");
  enRuBtn.classList.toggle("tp-action--active", mode === "en-ru");
  ruEnBtn.classList.toggle("tp-action--active", mode === "ru-en");

  runFix();
}

function switchTab(target) {
  const isTool = target === "tool";

  tabTool.classList.toggle("tp-tab--active", isTool);
  tabAbout.classList.toggle("tp-tab--active", !isTool);
  tabTool.setAttribute("aria-selected", String(isTool));
  tabAbout.setAttribute("aria-selected", String(!isTool));
  tabTool.tabIndex = isTool ? 0 : -1;
  tabAbout.tabIndex = isTool ? -1 : 0;

  panelTool.hidden = !isTool;
  panelAbout.hidden = isTool;
  panelTool.classList.toggle("tp-panel--hidden", !isTool);
  panelAbout.classList.toggle("tp-panel--hidden", isTool);

  if (backLink) backLink.hidden = !isTool;
}

input.addEventListener("input", runFix);
copyBtn.addEventListener("click", copyOutput);
clearInputBtn.addEventListener("click", clearInput);

autoBtn.addEventListener("click", () => setMode("auto"));
enRuBtn.addEventListener("click", () => setMode("en-ru"));
ruEnBtn.addEventListener("click", () => setMode("ru-en"));

tabTool.addEventListener("click", () => switchTab("tool"));
tabAbout.addEventListener("click", () => switchTab("about"));

runFix();
