(function () {
  const fontFamilies = window.CINAZES_FONT_FAMILIES || [];

  const fallbackSpecimen = {
    size: 32,
    left: {
      text: "Type becomes clear through rhythm, proportion, and repeated decisions across a paragraph. The Latin text shows spacing, punctuation, counters, and the quiet texture of reading at an editorial scale.",
      features: {},
    },
    right: {
      text: "Шрифт раскрывается через ритм, пропорции и повторяющиеся решения в длинной строке. Кириллица показывает наборную плотность, пунктуацию, просветы и спокойную фактуру чтения.",
      features: {},
    },
  };

  function featureSettings(features = {}) {
    const settings = Object.entries(features)
      .filter(([, value]) => value !== false && value !== 0 && value !== null)
      .map(([tag, value]) => `"${tag}" ${value === true ? 1 : value}`);

    return settings.length ? settings.join(", ") : "normal";
  }

  function escapeHtml(value) {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;");
  }

  function renderText(style, column, language) {
    const features = featureSettings(column.features);
    return `<p class="font-editorial__text" lang="${language}" style="font-family:&quot;${escapeHtml(style.fontFamily)}&quot;, &quot;DK Form&quot;, ui-sans-serif, system-ui, sans-serif; --editorial-features:${escapeHtml(features)};">${escapeHtml(column.text)}</p>`;
  }

  function renderSection(style) {
    const specimen = style.specimen || fallbackSpecimen;
    const size = specimen.size || fallbackSpecimen.size;
    const left = specimen.left || fallbackSpecimen.left;
    const right = specimen.right || fallbackSpecimen.right;

    return `
      <article class="font-editorial__section" style="--editorial-size:${size}px;">
        <div class="font-editorial__meta">
          <span>${escapeHtml(style.name)}</span>
          <span class="font-editorial__size">${size}px</span>
        </div>
        <div class="font-editorial__flow">
          ${renderText(style, left, "en")}
          ${renderText(style, right, "ru")}
        </div>
      </article>`;
  }

  function initEditorialSpecimens() {
    for (const root of document.querySelectorAll("[data-font-editorial]")) {
      const family = fontFamilies.find((item) => item.slug === root.dataset.fontEditorial);
      if (!family) continue;

      root.innerHTML = `
        <div class="font-editorial__shell">
          ${family.styles.map(renderSection).join("")}
        </div>`;
    }
  }

  initEditorialSpecimens();
})();
