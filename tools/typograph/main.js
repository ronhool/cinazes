import { cleanText } from "./lib/cleaner.js";
import { scriptLabel } from "./lib/detect.js";

const input = document.getElementById("typograph-input");
const output = document.getElementById("typograph-output");
const aggressiveToggle = document.getElementById("typograph-aggressive");
const lineMergeToggle = document.getElementById("typograph-line-merge");
const autoCleanBtn = document.getElementById("typograph-auto-clean");
const copyBtn = document.getElementById("typograph-copy");
const clearBtn = document.getElementById("typograph-clear");

const statReplacements = document.getElementById("stat-replacements");
const statInvisible = document.getElementById("stat-invisible");
const statCharacters = document.getElementById("stat-characters");
const statArtifacts = document.getElementById("stat-artifacts");
const statScript = document.getElementById("stat-script");

function getOptions() {
  return {
    aggressive: aggressiveToggle.checked,
    lineMerge: lineMergeToggle.checked,
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
  copyBtn.textContent = "скопировано";
  window.setTimeout(() => {
    copyBtn.textContent = "copy";
  }, 1400);
}

function clearAll() {
  input.value = "";
  output.value = "";
  updateStats(cleanText("", getOptions()));
  input.focus();
}

input.addEventListener("input", runClean);
aggressiveToggle.addEventListener("change", runClean);
lineMergeToggle.addEventListener("change", runClean);
autoCleanBtn.addEventListener("click", runClean);
copyBtn.addEventListener("click", copyOutput);
clearBtn.addEventListener("click", clearAll);

runClean();
