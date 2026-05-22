const fontDetailConfig = {
  defaultStyle: "regular",
  styles: {
    regular: {
      className: "font-detail-specimen--regular",
      tracking: -0.02,
      leading: 0.88,
      size: 220,
    },
    line: {
      className: "font-detail-specimen--line",
      tracking: 0.01,
      leading: 0.92,
      size: 210,
    },
    path: {
      className: "font-detail-specimen--path",
      tracking: 0.03,
      leading: 0.95,
      size: 205,
    },
  },
  limits: {
    tracking: [-0.08, 0.2],
    leading: [0.75, 1.4],
    size: [24, 420],
  },
};

function clamp(value, [min, max]) {
  return Math.min(Math.max(Number(value), min), max);
}

function setupFontDetail() {
  const specimen = document.querySelector("[data-specimen]");
  const styleSelect = document.querySelector("[data-style-select]");
  const sizeOutput = document.querySelector("[data-size-output]");
  const controls = {
    tracking: document.querySelector('[data-control="tracking"]'),
    leading: document.querySelector('[data-control="leading"]'),
    size: document.querySelector('[data-control="size"]'),
  };

  if (!specimen || !styleSelect || !controls.tracking || !controls.leading || !controls.size) return;

  function setControlValue(name, value) {
    const nextValue = clamp(value, fontDetailConfig.limits[name]);
    controls[name].value = String(nextValue);
    return nextValue;
  }

  function renderControls() {
    const tracking = clamp(controls.tracking.value, fontDetailConfig.limits.tracking);
    const leading = clamp(controls.leading.value, fontDetailConfig.limits.leading);
    const size = clamp(controls.size.value, fontDetailConfig.limits.size);

    controls.tracking.value = String(tracking);
    controls.leading.value = String(leading);
    controls.size.value = String(size);

    specimen.style.setProperty("--specimen-tracking", `${tracking}em`);
    specimen.style.setProperty("--specimen-leading", leading);
    specimen.style.setProperty("--specimen-size", `${size}px`);

    if (sizeOutput) sizeOutput.textContent = `${Math.round(size)}px`;
  }

  function applyStyle(styleName, shouldResetControls = true) {
    const style = fontDetailConfig.styles[styleName] || fontDetailConfig.styles[fontDetailConfig.defaultStyle];
    const styleClasses = Object.values(fontDetailConfig.styles).map((item) => item.className);

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
    control.addEventListener("change", renderControls);
  }

  styleSelect.addEventListener("change", () => applyStyle(styleSelect.value));

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

  applyStyle(styleSelect.value || fontDetailConfig.defaultStyle, false);
}

setupFontDetail();
