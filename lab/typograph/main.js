import { cleanText } from "./lib/cleaner.js";
import { scriptLabel } from "./lib/detect.js";

const input = document.getElementById("typograph-input");
const output = document.getElementById("typograph-output");
const lineMergeBtn = document.getElementById("typograph-line-merge");
const aggressiveBtn = document.getElementById("typograph-aggressive");
const autoCleanBtn = document.getElementById("typograph-auto-clean");
const copyBtn = document.getElementById("typograph-copy");
const clearInputBtn = document.getElementById("typograph-clear-input");

const tabTool = document.getElementById("tab-tool");
const tabAbout = document.getElementById("tab-about");
const panelTool = document.getElementById("panel-tool");
const panelAbout = document.getElementById("panel-about");
const backLink = document.querySelector(".tp-back");

const statReplacements = document.getElementById("stat-replacements");
const statInvisible = document.getElementById("stat-invisible");
const statCharacters = document.getElementById("stat-characters");
const statArtifacts = document.getElementById("stat-artifacts");
const statScript = document.getElementById("stat-script");

const state = {
  lineMerge: false,
  aggressive: false,
};

function getOptions() {
  return {
    aggressive: state.aggressive,
    lineMerge: state.lineMerge,
  };
}

function updateStats({ stats, script }) {
  statReplacements.textContent = String(stats.replacements);
  statInvisible.textContent = String(stats.invisibleRemoved);
  statCharacters.textContent = String(stats.charactersFixed);
  statArtifacts.textContent = String(stats.artifactsRemoved);
  statScript.textContent = scriptLabel(script);
}

function runClean() {
  const result = cleanText(input.value, getOptions());
  output.value = result.text;
  updateStats(result);
}

async function copyOutput() {
  if (!output.value) return;
  await navigator.clipboard.writeText(output.value);
  copyBtn.classList.add("tp-box-action--done");
  window.setTimeout(() => copyBtn.classList.remove("tp-box-action--done"), 1400);
}

function clearInput() {
  input.value = "";
  runClean();
  input.focus();
}

function toggleOption(button, key) {
  state[key] = !state[key];
  button.classList.toggle("tp-action--active", state[key]);
  button.setAttribute("aria-pressed", String(state[key]));
  runClean();
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

input.addEventListener("input", runClean);
autoCleanBtn.addEventListener("click", runClean);
copyBtn.addEventListener("click", copyOutput);
clearInputBtn.addEventListener("click", clearInput);

lineMergeBtn.addEventListener("click", () => toggleOption(lineMergeBtn, "lineMerge"));
aggressiveBtn.addEventListener("click", () => toggleOption(aggressiveBtn, "aggressive"));

tabTool.addEventListener("click", () => switchTab("tool"));
tabAbout.addEventListener("click", () => switchTab("about"));

runClean();
