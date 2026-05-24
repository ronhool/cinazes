const fontDetailConfig = {
  regular: {
    tracking: -0.02,
    leading: 0.88,
    size: 220,
  },
  limits: {
    tracking: [-0.08, 0.2],
    leading: [0.75, 1.4],
    size: [24, 500],
  },
};

function clamp(value, [min, max]) {
  return Math.min(Math.max(Number(value), min), max);
}

function setupFontDetail() {
  const specimen = document.querySelector("[data-specimen]");
  const sizeOutput = document.querySelector("[data-size-output]");
  const controls = {
    tracking: document.querySelector('[data-control="tracking"]'),
    leading: document.querySelector('[data-control="leading"]'),
    size: document.querySelector('[data-control="size"]'),
  };

  if (!specimen || !controls.tracking || !controls.leading || !controls.size) return;

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

  setControlValue("tracking", fontDetailConfig.regular.tracking);
  setControlValue("leading", fontDetailConfig.regular.leading);
  setControlValue("size", fontDetailConfig.regular.size);
  renderControls();
}

setupFontDetail();
