const detailFamilies = window.CINAZES_FONT_FAMILIES || [];

const detailConfig = {
  limits: {
    tracking: [-0.08, 0.2],
    leading: [0.75, 1.4],
    size: [24, 420],
  },
};

function clamp(value, [min, max]) {
  return Math.min(Math.max(Number(value), min), max);
}

function relativeUrl(url) {
  if (!url.startsWith("/")) return url;
  return `../..${url}`;
}

function detailBlockTemplate(family, style, index) {
  const specimenId = `${family.slug}-${style.slug}-specimen`;

  return `
    <article class="font-detail-hero font-detail-block" data-detail-block data-style-slug="${style.slug}" aria-label="${family.name} ${style.name} specimen">
      <div class="font-detail-shell">
        <div class="font-detail-toolbar" data-font-detail-controls aria-label="Настройки ${family.name} ${style.name}">
          <div class="font-detail-toolbar__left">
            <span class="font-detail-name">${family.name}</span>
            <span class="font-detail-style">${style.name}</span>
            <a href="${relativeUrl(style.trialFile)}" download>Скачать trial</a>
          </div>
          <div class="font-detail-toolbar__right">
            <label class="font-detail-range">
              <span>Трекинг</span>
              <input data-control="tracking" type="range" min="-0.08" max="0.2" value="${style.tracking}" step="0.005" />
            </label>
            <label class="font-detail-range">
              <span>Интерлиньяж</span>
              <input data-control="leading" type="range" min="0.75" max="1.4" value="${style.leading}" step="0.01" />
            </label>
            <label class="font-detail-range font-detail-range--size">
              <span>Размер</span>
              <input data-control="size" type="range" min="24" max="420" value="${style.size}" step="1" />
              <output data-size-output>${style.size}px</output>
            </label>
          </div>
        </div>

        <div
          class="font-detail-specimen ${style.detailClassName || ""}"
          id="${specimenId}"
          data-specimen
          data-placeholder="${style.previewText || family.name}"
          contenteditable="true"
          spellcheck="false"
          role="textbox"
          aria-multiline="true"
          aria-label="Редактируемый specimen ${family.name} ${style.name}"
        >${style.previewText || family.name}</div>
      </div>
    </article>`;
}

function renderDetailPage() {
  const wall = document.querySelector("[data-font-detail-wall]");
  if (!wall) return null;

  const family = detailFamilies.find((item) => item.slug === wall.dataset.fontDetailSlug);
  if (!family) return null;

  wall.innerHTML = family.styles.map((style, index) => detailBlockTemplate(family, style, index)).join("");
  return family;
}

function setupDetailBlock(block, family) {
  const style = family.styles.find((item) => item.slug === block.dataset.styleSlug);
  const specimen = block.querySelector("[data-specimen]");
  const sizeOutput = block.querySelector("[data-size-output]");
  const controls = {
    tracking: block.querySelector('[data-control="tracking"]'),
    leading: block.querySelector('[data-control="leading"]'),
    size: block.querySelector('[data-control="size"]'),
  };

  if (!style || !specimen || !controls.tracking || !controls.leading || !controls.size) return;

  specimen.style.fontFamily = `"${style.fontFamily}", "DK Form", ui-sans-serif, system-ui, sans-serif`;

  function renderControls() {
    const tracking = clamp(controls.tracking.value, detailConfig.limits.tracking);
    const leading = clamp(controls.leading.value, detailConfig.limits.leading);
    const size = clamp(controls.size.value, detailConfig.limits.size);

    controls.tracking.value = String(tracking);
    controls.leading.value = String(leading);
    controls.size.value = String(size);

    specimen.style.setProperty("--specimen-tracking", `${tracking}em`);
    specimen.style.setProperty("--specimen-leading", leading);
    specimen.style.setProperty("--specimen-size", `${size}px`);

    if (sizeOutput) sizeOutput.textContent = `${Math.round(size)}px`;
  }

  for (const control of Object.values(controls)) {
    control.addEventListener("input", renderControls);
    control.addEventListener("change", renderControls);
  }

  specimen.addEventListener("paste", (event) => {
    event.preventDefault();
    const text = event.clipboardData.getData("text/plain");
    document.execCommand("insertText", false, text);
  });

  specimen.addEventListener("keydown", (event) => {
    if ((event.metaKey || event.ctrlKey) && ["b", "i", "u"].includes(event.key.toLowerCase())) {
      event.preventDefault();
    }
  });

  renderControls();
}

function initDetailPage() {
  const family = renderDetailPage();
  if (!family) return;

  for (const block of document.querySelectorAll("[data-detail-block]")) {
    setupDetailBlock(block, family);
  }
}

initDetailPage();
