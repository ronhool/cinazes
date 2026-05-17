const preview = document.querySelector("[data-sbs-preview]");
const input = document.querySelector("[data-sbs-input]");
const size = document.querySelector("[data-sbs-size]");
const presets = document.querySelectorAll("[data-sbs-preset]");

const presetCopy = {
  manifesto: "Слишком много серьёзных шрифтов и слишком мало ясности.",
  interface: "Кириллица должна звучать в интерфейсе без надрыва и декоративного шума.",
  caps: "НИКАКОГО БУЛШИТА. ТОЛЬКО БУКВЫ, РИТМ И ХАРАКТЕР.",
};

function renderPreview() {
  if (!preview || !input || !size) return;
  preview.textContent = input.value || "Sans Bullshit Sans Cyrillic";
  preview.style.fontSize = `${size.value}px`;
}

for (const button of presets) {
  button.addEventListener("click", () => {
    const key = button.dataset.sbsPreset;
    if (!key || !presetCopy[key] || !input) return;

    input.value = presetCopy[key];
    for (const item of presets) item.classList.remove("is-active");
    button.classList.add("is-active");
    renderPreview();
  });
}

input?.addEventListener("input", renderPreview);
size?.addEventListener("input", renderPreview);

renderPreview();
