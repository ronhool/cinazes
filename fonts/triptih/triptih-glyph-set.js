(function () {
  const roots = document.querySelectorAll("[data-ct-glyph-set]");
  if (!roots.length) return;

  const styles = [
    { label: "Fill", family: "Triptih Fill" },
    { label: "Parth", family: "Triptih Parth" },
    { label: "Stroke", family: "Triptih Stroke" },
  ];

  const glyphGroups = [
    { title: "Uppercase", glyphs: Array.from("ABCDEFGHIJKLMNOPQRSTUVWXYZ") },
    { title: "Lowercase", glyphs: Array.from("abcdefghijklmnopqrstuvwxyz") },
    { title: "Numerals", glyphs: Array.from("0123456789") },
    { title: "Punctuation", glyphs: Array.from(".,:;!?()[]{}«»„“”'\"-–—") },
    { title: "Symbols", glyphs: Array.from("№@&§%*#©®™†‡") },
    { title: "Currency", glyphs: Array.from("$€£¥₽₴₸¢") },
    { title: "Latin Extended", glyphs: Array.from("ÅÇĞŁÑØŠŽÀÁÂÃÄÈÉÊËÌÍÎÏÒÓÔÕÖÙÚÛÜÝŸ") },
    { title: "Cyrillic", glyphs: Array.from("АБВГДЕЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯабвгдежзийклмнопрстуфхцчшщъыьэюяЇЄҐЎїєґў") },
    {
      title: "Languages",
      glyphs: Array.from("ÅÇĞŁÑØŠŽЇЄҐЎ"),
      languages: ["Latin Extended", "Cyrillic", "Russian", "Ukrainian", "Belarusian", "Polish", "Turkish", "Czech", "Serbian"],
    },
  ];

  function escapeHtml(value) {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;");
  }

  function codePointLabel(value) {
    return Array.from(value)
      .map((char) => `U+${char.codePointAt(0).toString(16).toUpperCase().padStart(4, "0")}`)
      .join(" ");
  }

  function glyphName(value, groupTitle) {
    if (!value) return "No glyph selected";
    if (value.length > 1) return `${groupTitle || "Custom"} sequence`;
    if (/^[A-Z]$/.test(value)) return `Latin Capital Letter ${value}`;
    if (/^[a-z]$/.test(value)) return `Latin Small Letter ${value.toUpperCase()}`;
    if (/^[А-ЯЁЇЄҐЎ]$/.test(value)) return `Cyrillic Capital Letter ${value}`;
    if (/^[а-яёїєґў]$/.test(value)) return `Cyrillic Small Letter ${value.toUpperCase()}`;
    if (/^[0-9]$/.test(value)) return `Digit ${value}`;
    return `${groupTitle || "Glyph"} ${value}`;
  }

  function renderGrid(grid, group, family) {
    grid.innerHTML = group.glyphs
      .map(
        (glyph) => `
          <button
            class="ct-glyph-set__cell"
            type="button"
            data-ct-glyph-set-cell
            data-ct-glyph="${escapeHtml(glyph)}"
            data-ct-glyph-group="${escapeHtml(group.title)}"
            aria-label="${escapeHtml(`${group.title} ${glyph}`)}"
            style="font-family: &quot;${escapeHtml(family)}&quot;, &quot;DK Form&quot;, ui-sans-serif, system-ui, sans-serif"
          >${escapeHtml(glyph)}</button>`
      )
      .join("");
  }

  function setup(root) {
    const styleSelect = root.querySelector("[data-ct-glyph-set-style]");
    const input = root.querySelector("[data-ct-glyph-set-input]");
    const nav = root.querySelector("[data-ct-glyph-set-nav]");
    const grid = root.querySelector("[data-ct-glyph-set-grid]");
    const currentGroup = root.querySelector("[data-ct-glyph-set-current-group]");
    const count = root.querySelector("[data-ct-glyph-set-count]");
    const languages = root.querySelector("[data-ct-glyph-set-languages]");
    const preview = root.querySelector("[data-ct-glyph-set-preview]");
    const code = root.querySelector("[data-ct-glyph-set-code]");
    const name = root.querySelector("[data-ct-glyph-set-name]");
    const groupLabel = root.querySelector("[data-ct-glyph-set-group]");
    const styleLabel = root.querySelector("[data-ct-glyph-set-style-label]");
    if (!styleSelect || !input || !nav || !grid || !currentGroup || !count || !languages || !preview || !code || !name || !groupLabel || !styleLabel) return;

    let activeGroup = glyphGroups[0];
    let activeStyle = styles[0];

    function setPreview(value, groupTitle, sourceButton) {
      if (!value) return;
      root.querySelectorAll(".ct-glyph-set__cell.is-active").forEach((cell) => {
        cell.classList.remove("is-active");
        cell.setAttribute("aria-pressed", "false");
      });
      if (sourceButton) {
        sourceButton.classList.add("is-active");
        sourceButton.setAttribute("aria-pressed", "true");
      }

      preview.textContent = value;
      preview.style.fontFamily = `"${activeStyle.family}", "DK Form", ui-sans-serif, system-ui, sans-serif`;
      code.textContent = codePointLabel(value);
      name.textContent = glyphName(value, groupTitle);
      groupLabel.textContent = groupTitle || "Custom input";
      styleLabel.textContent = activeStyle.label;
    }

    function setGroup(group) {
      activeGroup = group;
      currentGroup.textContent = group.title;
      count.textContent = `${group.glyphs.length} glyphs`;
      languages.innerHTML = group.languages ? group.languages.map((item) => `<span>${escapeHtml(item)}</span>`).join("") : "";
      languages.hidden = !group.languages;
      renderGrid(grid, group, activeStyle.family);
      nav.querySelectorAll(".ct-glyph-set__nav-link").forEach((button) => {
        const isActive = button.dataset.ctGlyphSetNavGroup === group.title;
        button.classList.toggle("is-active", isActive);
        button.setAttribute("aria-current", isActive ? "true" : "false");
      });
      const initial = grid.querySelector('[data-ct-glyph="B"]') || grid.querySelector("[data-ct-glyph-set-cell]");
      if (initial) setPreview(initial.dataset.ctGlyph, group.title, initial);
    }

    styleSelect.innerHTML = styles.map((style) => `<option value="${escapeHtml(style.label)}">${escapeHtml(style.label)}</option>`).join("");
    nav.innerHTML = glyphGroups
      .map((group) => `<button class="ct-glyph-set__nav-link" type="button" data-ct-glyph-set-nav-group="${escapeHtml(group.title)}">${escapeHtml(group.title)}</button>`)
      .join("");

    styleSelect.addEventListener("change", () => {
      activeStyle = styles.find((style) => style.label === styleSelect.value) || styles[0];
      setGroup(activeGroup);
    });

    input.addEventListener("input", () => {
      const value = input.value.trim();
      if (value) setPreview(Array.from(value).slice(0, 8).join(""), "Custom input", null);
    });

    nav.addEventListener("click", (event) => {
      const button = event.target.closest("[data-ct-glyph-set-nav-group]");
      if (!button) return;
      const group = glyphGroups.find((item) => item.title === button.dataset.ctGlyphSetNavGroup);
      if (group) setGroup(group);
    });

    function handleGlyphHover(event) {
      const button = event.target.closest("[data-ct-glyph-set-cell]");
      if (button && grid.contains(button)) setPreview(button.dataset.ctGlyph, button.dataset.ctGlyphGroup, button);
    }

    grid.addEventListener("pointerover", handleGlyphHover);
    grid.addEventListener("mouseover", handleGlyphHover);

    grid.addEventListener("focusin", (event) => {
      const button = event.target.closest("[data-ct-glyph-set-cell]");
      if (button && grid.contains(button)) setPreview(button.dataset.ctGlyph, button.dataset.ctGlyphGroup, button);
    });

    grid.addEventListener("click", (event) => {
      const button = event.target.closest("[data-ct-glyph-set-cell]");
      if (button && grid.contains(button)) setPreview(button.dataset.ctGlyph, button.dataset.ctGlyphGroup, button);
    });

    setGroup(activeGroup);
  }

  roots.forEach(setup);
})();
