(function () {
  const fontFamilies = window.CINAZES_FONT_FAMILIES || [];
  const defaultLimits = {
    size: [64, 120],
    tracking: [-0.08, 0.18],
    leading: [0.78, 1.36],
  };

  function clamp(value, limits) {
    const [min, max] = limits;
    return Math.min(Math.max(Number(value), min), max);
  }

  function escapeHtml(value) {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;");
  }

  function relativeUrl(url) {
    if (!url || !url.startsWith("/")) return url || "#";
    return `../..${url}`;
  }

  function defaultConfigFromFamily(family) {
    const styles = family.styles || [];
    const firstStyle = styles[0] || {};
    return {
      fontFamily: firstStyle.fontFamily || family.name,
      defaultWeight: firstStyle.name || "Regular",
      defaultText: `${family.name} specimen: Aa Bb Cc 0123456789, punctuation, accents, кириллица, № & %.`,
      size: 96,
      tracking: firstStyle.tracking || 0,
      leading: 1,
      limits: defaultLimits,
      weights: styles.map((style) => ({
        name: style.name,
        fontFamily: style.fontFamily,
        fontWeight: style.fontWeight || 400,
        trialFile: style.trialFile,
      })),
    };
  }

  function normalizeConfig(config) {
    const weights = config.weights && config.weights.length
      ? config.weights
      : [{ name: config.defaultWeight || "Regular", fontFamily: config.fontFamily, fontWeight: 400 }];
    const defaultWeight = weights.find((weight) => weight.name === config.defaultWeight) || weights[0];
    return {
      ...config,
      weights,
      defaultWeight: defaultWeight.name,
      fontFamily: defaultWeight.fontFamily || config.fontFamily,
      fontWeight: defaultWeight.fontWeight || 400,
      limits: {
        ...defaultLimits,
        ...(config.limits || {}),
      },
    };
  }

  function controlTemplate(name, label, value, limits, step, output) {
    return `
      <label class="ct-specimen-slider ${name === "size" ? "ct-specimen-slider--size" : ""}">
        <span>${label}</span>
        <input data-ct-specimen-control="${name}" type="range" min="${limits[0]}" max="${limits[1]}" value="${value}" step="${step}" />
        ${output ? `<output data-ct-specimen-output="${name}">${Math.round(value)}px</output>` : ""}
      </label>`;
  }

  function render(root, config) {
    const selected = config.weights.find((weight) => weight.name === config.defaultWeight) || config.weights[0];
    const trialFile = selected.trialFile || config.trialFile || "";
    root.classList.add("ct-specimen-module");
    root.innerHTML = `
      <div class="ct-specimen-shell">
        <div class="ct-specimen-controls" aria-label="Interactive specimen controls">
          <div class="ct-specimen-controls__left">
            <label class="ct-specimen-dropdown">
              <span class="ct-specimen-label">Style</span>
              <select data-ct-specimen-weight>
                ${config.weights.map((weight) => `<option value="${escapeHtml(weight.name)}"${weight.name === selected.name ? " selected" : ""}>${escapeHtml(weight.name)}</option>`).join("")}
              </select>
            </label>
            <a class="ct-specimen-download" data-ct-specimen-download href="${relativeUrl(trialFile)}" download>Download Trial</a>
          </div>
          <div class="ct-specimen-controls__right">
            ${controlTemplate("tracking", "Tracking", config.tracking, config.limits.tracking, "0.005", false)}
            ${controlTemplate("leading", "Leading", config.leading, config.limits.leading, "0.01", false)}
            ${controlTemplate("size", "Size", config.size, config.limits.size, "1", true)}
          </div>
        </div>
        <div class="ct-specimen-preview">
          <p
            class="ct-specimen-text"
            data-ct-specimen-text
            data-placeholder="${escapeHtml(config.defaultText)}"
            contenteditable="true"
            spellcheck="false"
            role="textbox"
            aria-multiline="true"
          >${escapeHtml(config.defaultText)}</p>
        </div>
      </div>`;
  }

  function setup(root, sourceConfig) {
    const config = normalizeConfig(sourceConfig);
    render(root, config);

    const text = root.querySelector("[data-ct-specimen-text]");
    const weightSelect = root.querySelector("[data-ct-specimen-weight]");
    const download = root.querySelector("[data-ct-specimen-download]");
    const sizeOutput = root.querySelector('[data-ct-specimen-output="size"]');
    const controls = {
      tracking: root.querySelector('[data-ct-specimen-control="tracking"]'),
      leading: root.querySelector('[data-ct-specimen-control="leading"]'),
      size: root.querySelector('[data-ct-specimen-control="size"]'),
    };

    if (!text || !weightSelect || !controls.tracking || !controls.leading || !controls.size) return null;

    function applyWeight() {
      const selected = config.weights.find((weight) => weight.name === weightSelect.value) || config.weights[0];
      text.style.setProperty("--ct-specimen-family", `"${selected.fontFamily || config.fontFamily}"`);
      text.style.setProperty("--ct-specimen-weight", selected.fontWeight || 400);
      if (download) download.href = relativeUrl(selected.trialFile || config.trialFile || "");
    }

    function applyControls() {
      const tracking = clamp(controls.tracking.value, config.limits.tracking);
      const leading = clamp(controls.leading.value, config.limits.leading);
      const size = clamp(controls.size.value, config.limits.size);

      controls.tracking.value = String(tracking);
      controls.leading.value = String(leading);
      controls.size.value = String(size);
      text.style.setProperty("--ct-specimen-tracking", tracking);
      text.style.setProperty("--ct-specimen-leading", leading);
      text.style.setProperty("--ct-specimen-size", `${size}px`);
      if (sizeOutput) sizeOutput.textContent = `${Math.round(size)}px`;
    }

    for (const control of Object.values(controls)) {
      control.addEventListener("input", applyControls);
      control.addEventListener("change", applyControls);
    }

    weightSelect.addEventListener("change", applyWeight);

    text.addEventListener("paste", (event) => {
      event.preventDefault();
      const value = event.clipboardData.getData("text/plain");
      document.execCommand("insertText", false, value);
    });

    text.addEventListener("keydown", (event) => {
      if ((event.metaKey || event.ctrlKey) && ["b", "i", "u"].includes(event.key.toLowerCase())) {
        event.preventDefault();
      }
    });

    applyWeight();
    applyControls();

    return {
      root,
      update(nextConfig) {
        setup(root, { ...config, ...nextConfig });
      },
    };
  }

  function initSpecimen(options = {}) {
    const root = options.root || document.querySelector("[data-ct-specimen]");
    if (!root) return null;

    const family = options.family || fontFamilies.find((item) => item.slug === (options.slug || root.dataset.ctSpecimen));
    const baseConfig = family ? { ...defaultConfigFromFamily(family), ...(family.interactiveSpecimen || {}) } : {};
    return setup(root, { ...baseConfig, ...options });
  }

  window.initSpecimen = initSpecimen;

  for (const root of document.querySelectorAll("[data-ct-specimen]")) {
    initSpecimen({ root, slug: root.dataset.ctSpecimen });
  }
})();
