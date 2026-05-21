const fontConfig = {
  family: "Etude",
  files: {
    regular: "../public/fonts/etude/Etude-Regular.woff2",
  },
  defaultStyle: "regular",
  styles: {
    regular: {
      label: "Regular",
      className: "font-specimen--regular",
      tracking: -0.02,
      leading: 0.88,
      size: 220,
    },
    line: {
      label: "Line",
      className: "font-specimen--line",
      tracking: 0.01,
      leading: 0.92,
      size: 210,
    },
    path: {
      label: "Path",
      className: "font-specimen--path",
      tracking: 0.03,
      leading: 0.95,
      size: 205,
    },
  },
  limits: {
    tracking: [-0.08, 0.2],
    leading: [0.75, 1.4],
    size: [10, 420],
  },
};

function clamp(value, [min, max]) {
  return Math.min(Math.max(Number(value), min), max);
}

function setupFontBlock(block) {
  const specimen = block.querySelector("[data-specimen]");
  const styleSelect = block.querySelector("[data-style-select]");
  const staticStyle = block.querySelector("[data-style-value]");
  const sizeOutput = block.querySelector("[data-size-output]");
  const controls = {
    tracking: block.querySelector('[data-control="tracking"]'),
    leading: block.querySelector('[data-control="leading"]'),
    size: block.querySelector('[data-control="size"]'),
  };

  function setControlValue(name, value) {
    const nextValue = clamp(value, fontConfig.limits[name]);
    controls[name].value = String(nextValue);
    return nextValue;
  }

  function renderControls() {
    const tracking = clamp(controls.tracking.value, fontConfig.limits.tracking);
    const leading = clamp(controls.leading.value, fontConfig.limits.leading);
    const size = clamp(controls.size.value, fontConfig.limits.size);

    controls.tracking.value = String(tracking);
    controls.leading.value = String(leading);
    controls.size.value = String(size);

    specimen.style.setProperty("--specimen-tracking", `${tracking}em`);
    specimen.style.setProperty("--specimen-leading", leading);
    specimen.style.setProperty("--specimen-size", `${size}px`);
    sizeOutput.textContent = `${Math.round(size)}px`;
  }

  function applyStyle(styleName, shouldResetControls = true) {
    const style = fontConfig.styles[styleName] || fontConfig.styles[fontConfig.defaultStyle];
    const styleClasses = Object.values(fontConfig.styles).map((item) => item.className);

    specimen.classList.remove(...styleClasses);
    specimen.classList.add(style.className);

    if (shouldResetControls) {
      setControlValue("tracking", style.tracking);
      setControlValue("leading", style.leading);
      setControlValue("size", style.size);
    }

    renderControls();
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
  }

  if (styleSelect) {
    const options = Array.from(styleSelect.options).filter((option) => fontConfig.styles[option.value]);
    if (options.length <= 1) {
      styleSelect.replaceWith(Object.assign(document.createElement("span"), {
        textContent: options[0]?.textContent || fontConfig.styles[fontConfig.defaultStyle].label,
      }));
    } else {
      styleSelect.addEventListener("change", () => applyStyle(styleSelect.value));
    }
  }

  for (const button of block.querySelectorAll("[data-theme-control]")) {
    button.addEventListener("click", () => applyTheme(button.dataset.themeControl));
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

  applyStyle(styleSelect?.value || staticStyle?.dataset.styleValue || fontConfig.defaultStyle, false);
  applyTheme(block.dataset.fontTheme || "white");
}

for (const block of document.querySelectorAll("[data-font-block]")) {
  setupFontBlock(block);
}
