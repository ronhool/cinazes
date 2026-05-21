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
    size: [48, 420],
  },
};

function clamp(value, [min, max]) {
  return Math.min(Math.max(Number(value), min), max);
}

function setPressed(buttons, activeButton) {
  for (const button of buttons) {
    button.setAttribute("aria-pressed", String(button === activeButton));
  }
}

function setupFontBlock(block) {
  const specimen = block.querySelector("[data-specimen]");
  const styleSelect = block.querySelector("[data-style-select]");
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

  for (const control of Object.values(controls)) {
    control.addEventListener("input", renderControls);
  }

  styleSelect.addEventListener("change", () => applyStyle(styleSelect.value));

  for (const button of block.querySelectorAll("[data-theme]")) {
    button.addEventListener("click", () => {
      block.dataset.fontTheme = button.dataset.theme;
      setPressed(block.querySelectorAll("[data-theme]"), button);
    });
  }

  for (const button of block.querySelectorAll("[data-accent]")) {
    button.addEventListener("click", () => {
      block.dataset.fontAccent = button.dataset.accent;
      setPressed(block.querySelectorAll("[data-accent]"), button);
    });
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

  applyStyle(styleSelect.value || fontConfig.defaultStyle, false);
}

for (const block of document.querySelectorAll("[data-font-block]")) {
  setupFontBlock(block);
}
