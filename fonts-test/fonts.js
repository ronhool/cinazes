const fontFamilies = window.CINAZES_FONT_FAMILIES || [];

const fontCatalogConfig = {
  limits: {
    tracking: [-0.08, 0.2],
    leading: [0.75, 1.4],
    size: [10, 500],
  },
};

function clamp(value, [min, max]) {
  return Math.min(Math.max(Number(value), min), max);
}

function relativeUrl(url) {
  if (!url.startsWith("/")) return url;
  return `..${url}`;
}

function licenseHref(family) {
  return `mailto:hello@cinazes.ru?subject=${encodeURIComponent(family.licenseSubject || `Лицензия ${family.name}`)}`;
}

function textLanguage(value) {
  return /[А-Яа-яЁё]/.test(value) ? "ru" : "en";
}

function catalogBlockTemplate(family) {
  const firstStyle = family.styles[0];
  const dropdownId = `font-style-menu-${family.slug}`;
  const styleControl = family.styles.length > 1
    ? `<div class="font-select" data-style-dropdown>
        <span class="fonts-visually-hidden">Начертание ${family.name}</span>
        <button class="font-select__button" type="button" data-style-dropdown-trigger aria-haspopup="listbox" aria-expanded="false" aria-controls="${dropdownId}">
          <span data-style-dropdown-label>${firstStyle.name}</span>
          <span class="font-select__arrow" aria-hidden="true"></span>
        </button>
        <div class="font-select__menu" id="${dropdownId}" role="listbox" data-style-select-menu>
          ${family.styles.map((style) => `<button class="font-select__option${style.slug === firstStyle.slug ? " is-active" : ""}" type="button" role="option" aria-selected="${style.slug === firstStyle.slug ? "true" : "false"}" data-style-option="${style.slug}">${style.name}</button>`).join("")}
        </div>
      </div>`
    : `<span class="font-style-name" data-font-style-name data-style-value="${firstStyle.slug}"></span>`;

  const familyLabel = family.styles.length > 1
    ? `<span class="font-label" data-font-family-name></span>${styleControl}`
    : `<span class="font-label" data-font-family-name></span>${styleControl}`;

  return `
    <article class="font-block" data-font-block data-font-family-slug="${family.slug}" data-font-theme="white" data-font-accent="white" aria-label="${family.name} specimen">
      <div class="font-toolbar" aria-label="Настройки ${family.name}">
        <div class="font-toolbar__left">
          <div class="font-static-style font-static-style--family">
            ${familyLabel}
          </div>
          <nav class="font-actions" aria-label="Информация о шрифте">
            <a href="..${family.detailUrl}">О шрифте</a>
            <a href="${licenseHref(family)}">Лицензия</a>
            <a href="${relativeUrl(firstStyle.trialFile)}" data-trial-link download>Скачать trial</a>
          </nav>
        </div>
        <div class="font-toolbar__right">
          <label class="font-range">
            <span>Tracking</span>
            <input data-control="tracking" type="range" min="-0.08" max="0.2" value="${firstStyle.tracking}" step="0.005" />
          </label>
          <label class="font-range">
            <span>Leading</span>
            <input data-control="leading" type="range" min="0.75" max="1.4" value="${firstStyle.leading}" step="0.01" />
          </label>
          <label class="font-range font-range--size">
            <span>Size</span>
            <input data-control="size" type="range" min="10" max="500" value="${firstStyle.size}" step="1" />
            <output data-size-output>${firstStyle.size}px</output>
          </label>
          <div class="font-accents" aria-label="Цветовая тема">
            <button type="button" class="font-swatch font-swatch--white" data-theme-control="white" aria-label="Белая тема" aria-pressed="true"></button>
            <button type="button" class="font-swatch font-swatch--black" data-theme-control="black" aria-label="Чёрная тема" aria-pressed="false"></button>
            <button type="button" class="font-swatch font-swatch--pink" data-theme-control="pink" aria-label="Розовая тема" aria-pressed="false"></button>
          </div>
        </div>
      </div>
      <div
        class="font-specimen"
        data-specimen
        data-default-specimen="family"
        data-placeholder="${firstStyle.previewText}"
        lang="${textLanguage(firstStyle.previewText || family.name)}"
        contenteditable="true"
        spellcheck="false"
        role="textbox"
        aria-multiline="true"
        aria-label="Редактируемый specimen ${family.name}"
      ></div>
    </article>`;
}

function renderCatalog() {
  const wall = document.querySelector("[data-font-catalog]");
  if (!wall) return;
  wall.innerHTML = fontFamilies.map(catalogBlockTemplate).join("");
}

function setupFontBlock(block) {
  const family = fontFamilies.find((item) => item.slug === block.dataset.fontFamilySlug);
  if (!family || !family.styles.length) return;

  const specimen = block.querySelector("[data-specimen]");
  const styleDropdown = block.querySelector("[data-style-dropdown]");
  const styleDropdownTrigger = block.querySelector("[data-style-dropdown-trigger]");
  const styleDropdownLabel = block.querySelector("[data-style-dropdown-label]");
  const styleOptions = [...block.querySelectorAll("[data-style-option]")];
  const familyName = block.querySelector("[data-font-family-name]");
  const styleName = block.querySelector("[data-font-style-name]");
  const trialLink = block.querySelector("[data-trial-link]");
  const sizeOutput = block.querySelector("[data-size-output]");
  const controls = {
    tracking: block.querySelector('[data-control="tracking"]'),
    leading: block.querySelector('[data-control="leading"]'),
    size: block.querySelector('[data-control="size"]'),
  };

  if (!specimen || !controls.tracking || !controls.leading || !controls.size) return;

  function setControlValue(name, value) {
    const nextValue = clamp(value, fontCatalogConfig.limits[name]);
    controls[name].value = String(nextValue);
    return nextValue;
  }

  function renderControls() {
    const tracking = clamp(controls.tracking.value, fontCatalogConfig.limits.tracking);
    const leading = clamp(controls.leading.value, fontCatalogConfig.limits.leading);
    const size = clamp(controls.size.value, fontCatalogConfig.limits.size);

    controls.tracking.value = String(tracking);
    controls.leading.value = String(leading);
    controls.size.value = String(size);

    specimen.style.setProperty("--specimen-tracking", `${tracking}em`);
    specimen.style.setProperty("--specimen-leading", leading);
    specimen.style.setProperty("--specimen-size", `${size}px`);
    sizeOutput.textContent = `${Math.round(size)}px`;
  }

  function applyStyle(styleSlug, shouldResetControls = true) {
    const style = family.styles.find((item) => item.slug === styleSlug) || family.styles[0];
    const styleClasses = fontFamilies.flatMap((item) => item.styles.map((fontStyle) => fontStyle.className).filter(Boolean));

    specimen.classList.remove(...styleClasses);
    if (style.className) specimen.classList.add(style.className);
    specimen.style.fontFamily = `"${style.fontFamily}", "DK Form", ui-sans-serif, system-ui, sans-serif`;
    specimen.dataset.placeholder = style.previewText || family.name;

    if (familyName) familyName.textContent = family.name;
    if (styleName) styleName.textContent = style.name;
    if (styleDropdownLabel) styleDropdownLabel.textContent = style.name;
    for (const option of styleOptions) {
      const isActive = option.dataset.styleOption === style.slug;
      option.classList.toggle("is-active", isActive);
      option.setAttribute("aria-selected", String(isActive));
    }
    if (trialLink) trialLink.href = relativeUrl(style.trialFile);

    if (specimen.dataset.defaultSpecimen === "family" && !specimen.textContent.trim()) {
      specimen.textContent = style.previewText || family.name;
    }
    specimen.lang = textLanguage(specimen.textContent || style.previewText || family.name);

    if (shouldResetControls) {
      setControlValue("tracking", style.tracking);
      setControlValue("leading", style.leading);
      setControlValue("size", style.size);
    }

    renderControls();
  }

  function setStyleDropdownOpen(isOpen) {
    if (!styleDropdown || !styleDropdownTrigger) return;
    styleDropdown.classList.toggle("is-open", isOpen);
    styleDropdownTrigger.setAttribute("aria-expanded", String(isOpen));
  }

  function applyTheme(themeName) {
    block.dataset.fontTheme = themeName;
    block.dataset.fontAccent = themeName;

    for (const button of block.querySelectorAll("[data-theme-control]")) {
      button.setAttribute("aria-pressed", String(button.dataset.themeControl === themeName));
    }
  }

  for (const control of Object.values(controls)) {
    control.addEventListener("input", renderControls);
    control.addEventListener("change", renderControls);
  }

  if (styleDropdown && styleDropdownTrigger) {
    styleDropdownTrigger.addEventListener("click", () => {
      setStyleDropdownOpen(!styleDropdown.classList.contains("is-open"));
    });

    for (const option of styleOptions) {
      option.addEventListener("click", () => {
        applyStyle(option.dataset.styleOption);
        setStyleDropdownOpen(false);
        styleDropdownTrigger.focus();
      });
    }

    styleDropdown.addEventListener("focusout", (event) => {
      if (!styleDropdown.contains(event.relatedTarget)) setStyleDropdownOpen(false);
    });

    styleDropdown.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        setStyleDropdownOpen(false);
        styleDropdownTrigger.focus();
      }
    });
  }

  for (const button of block.querySelectorAll("[data-theme-control]")) {
    button.addEventListener("click", () => applyTheme(button.dataset.themeControl));
  }

  specimen.addEventListener("paste", (event) => {
    event.preventDefault();
    const text = event.clipboardData.getData("text/plain");
    document.execCommand("insertText", false, text);
  });

  specimen.addEventListener("input", () => {
    specimen.lang = textLanguage(specimen.textContent);
  });

  specimen.addEventListener("keydown", (event) => {
    if ((event.metaKey || event.ctrlKey) && ["b", "i", "u"].includes(event.key.toLowerCase())) {
      event.preventDefault();
    }
  });

  applyStyle(family.styles[0].slug, false);
  applyTheme(block.dataset.fontTheme || "white");
}

function initFontCatalog() {
  renderCatalog();
  for (const block of document.querySelectorAll("[data-font-block]")) {
    setupFontBlock(block);
  }
}

initFontCatalog();
