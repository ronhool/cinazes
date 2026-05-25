(function () {
  const roots = document.querySelectorAll("[data-ct-glyph-set]");
  if (!roots.length) return;

  const styles = [
    { label: "Fill", family: "Triptih Fill", url: "../../public/fonts/triptih/Triptih-Fill.otf" },
    { label: "Parth", family: "Triptih Parth", url: "../../public/fonts/triptih/Triptih-Parth.otf" },
    { label: "Stroke", family: "Triptih Stroke", url: "../../public/fonts/triptih/Triptih-Stroke.otf" },
  ];

  const fallbackMetrics = { unitsPerEm: 1000, ascender: 800, descender: -200, capHeight: 700, xHeight: 500 };
  const fallbackGlyphs = [
    "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
    "abcdefghijklmnopqrstuvwxyz",
    "0123456789",
    ".,:;!?()[]{}«»„“”'\"-–—",
    "$€£¥₽₴₸¢",
    "№@&§%*#©®™†‡",
    "АБВГДЕЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯабвгдежзийклмнопрстуфхцчшщъыьэюяЇЄҐЎїєґў",
  ].flatMap((set) => Array.from(set));
  const fontCache = new Map();

  const groupOrder = [
    "Uppercase Latin",
    "Lowercase Latin",
    "Latin Extended",
    "Greek",
    "Cyrillic",
    "Cyrillic Extended",
    "Armenian",
    "Georgian",
    "Numerals",
    "Punctuation",
    "Currency",
    "Math",
    "Arrows",
    "Symbols",
    "Ligatures",
    "Alternates",
    "Stylistic Sets",
  ];

  function escapeHtml(value) {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;");
  }

  function readTag(view, offset) {
    return String.fromCharCode(view.getUint8(offset), view.getUint8(offset + 1), view.getUint8(offset + 2), view.getUint8(offset + 3));
  }

  function tableMap(view) {
    const tables = {};
    const count = view.getUint16(4);
    for (let index = 0; index < count; index += 1) {
      const offset = 12 + index * 16;
      tables[readTag(view, offset)] = { offset: view.getUint32(offset + 8), length: view.getUint32(offset + 12) };
    }
    return tables;
  }

  function parseMetrics(view, tables) {
    const metrics = { ...fallbackMetrics };
    const head = tables.head;
    const hhea = tables.hhea;
    const os2 = tables["OS/2"];
    if (head) metrics.unitsPerEm = view.getUint16(head.offset + 18);
    if (hhea) {
      metrics.ascender = view.getInt16(hhea.offset + 4);
      metrics.descender = view.getInt16(hhea.offset + 6);
    }
    if (os2) {
      const version = view.getUint16(os2.offset);
      metrics.ascender = view.getInt16(os2.offset + 68) || metrics.ascender;
      metrics.descender = view.getInt16(os2.offset + 70) || metrics.descender;
      if (version >= 2 && os2.length >= 90) {
        metrics.xHeight = view.getInt16(os2.offset + 86) || metrics.xHeight;
        metrics.capHeight = view.getInt16(os2.offset + 88) || metrics.capHeight;
      }
    }
    return metrics;
  }

  function parseCmapFormat4(view, offset, output) {
    const segCount = view.getUint16(offset + 6) / 2;
    const endCodes = offset + 14;
    const startCodes = endCodes + segCount * 2 + 2;
    const deltas = startCodes + segCount * 2;
    const rangeOffsets = deltas + segCount * 2;
    for (let segment = 0; segment < segCount; segment += 1) {
      const start = view.getUint16(startCodes + segment * 2);
      const end = view.getUint16(endCodes + segment * 2);
      const delta = view.getInt16(deltas + segment * 2);
      const rangeOffset = view.getUint16(rangeOffsets + segment * 2);
      if (start === 0xffff && end === 0xffff) continue;
      for (let code = start; code <= end; code += 1) {
        let glyphId = 0;
        if (rangeOffset === 0) {
          glyphId = (code + delta) & 0xffff;
        } else {
          const glyphOffset = rangeOffsets + segment * 2 + rangeOffset + (code - start) * 2;
          if (glyphOffset < view.byteLength) glyphId = view.getUint16(glyphOffset);
          if (glyphId) glyphId = (glyphId + delta) & 0xffff;
        }
        if (glyphId) output.set(code, glyphId);
      }
    }
  }

  function parseCmapFormat12(view, offset, output) {
    const groups = view.getUint32(offset + 12);
    for (let index = 0; index < groups; index += 1) {
      const record = offset + 16 + index * 12;
      const start = view.getUint32(record);
      const end = view.getUint32(record + 4);
      const startGlyph = view.getUint32(record + 8);
      for (let code = start; code <= end && code <= 0x10ffff; code += 1) {
        output.set(code, startGlyph + code - start);
      }
    }
  }

  function parseCmap(view, tables) {
    const output = new Map();
    const cmap = tables.cmap;
    if (!cmap) return output;
    const count = view.getUint16(cmap.offset + 2);
    const subtables = [];
    for (let index = 0; index < count; index += 1) {
      const record = cmap.offset + 4 + index * 8;
      const platform = view.getUint16(record);
      const encoding = view.getUint16(record + 2);
      const offset = cmap.offset + view.getUint32(record + 4);
      subtables.push({ platform, encoding, offset, format: view.getUint16(offset) });
    }
    const format12 = subtables.find((item) => item.format === 12 && item.platform === 3) || subtables.find((item) => item.format === 12);
    const format4 = subtables.find((item) => item.format === 4 && item.platform === 3) || subtables.find((item) => item.format === 4);
    if (format12) parseCmapFormat12(view, format12.offset, output);
    if (format4) parseCmapFormat4(view, format4.offset, output);
    return output;
  }

  function parseCoverage(view, offset) {
    const format = view.getUint16(offset);
    if (format === 1) {
      const count = view.getUint16(offset + 2);
      return Array.from({ length: count }, (_, index) => view.getUint16(offset + 4 + index * 2));
    }
    if (format === 2) {
      const ranges = view.getUint16(offset + 2);
      const glyphs = [];
      for (let index = 0; index < ranges; index += 1) {
        const record = offset + 4 + index * 6;
        const start = view.getUint16(record);
        const end = view.getUint16(record + 2);
        for (let glyphId = start; glyphId <= end; glyphId += 1) glyphs.push(glyphId);
      }
      return glyphs;
    }
    return [];
  }

  function parseLookups(view, lookupListOffset) {
    const count = view.getUint16(lookupListOffset);
    return Array.from({ length: count }, (_, lookupIndex) => {
      const lookupOffset = lookupListOffset + view.getUint16(lookupListOffset + 2 + lookupIndex * 2);
      const type = view.getUint16(lookupOffset);
      const subtableCount = view.getUint16(lookupOffset + 4);
      const subtables = Array.from({ length: subtableCount }, (_, subtableIndex) => lookupOffset + view.getUint16(lookupOffset + 6 + subtableIndex * 2));
      return { type, subtables };
    });
  }

  function glyphToChar(glyphId, reverseCmap) {
    const code = reverseCmap.get(glyphId);
    return code ? String.fromCodePoint(code) : "";
  }

  function collectAlternates(view, lookup, tag, reverseCmap, output) {
    lookup.subtables.forEach((offset) => {
      const format = view.getUint16(offset);
      const coverageOffset = view.getUint16(offset + 2);
      const coverage = parseCoverage(view, offset + coverageOffset);
      if ((lookup.type === 1 && (format === 1 || format === 2)) || lookup.type === 3) {
        coverage.forEach((glyphId) => {
          const value = glyphToChar(glyphId, reverseCmap);
          if (!value) return;
          output.push({
            value,
            group: tag.startsWith("ss") ? "Stylistic Sets" : "Alternates",
            feature: tag,
            label: `${value} ${tag}`,
          });
        });
      }
    });
  }

  function collectLigatures(view, lookup, tag, reverseCmap, output) {
    lookup.subtables.forEach((offset) => {
      if (view.getUint16(offset) !== 1) return;
      const coverage = parseCoverage(view, offset + view.getUint16(offset + 2));
      const setCount = view.getUint16(offset + 4);
      for (let setIndex = 0; setIndex < setCount; setIndex += 1) {
        const first = glyphToChar(coverage[setIndex], reverseCmap);
        const setOffset = offset + view.getUint16(offset + 6 + setIndex * 2);
        const ligatureCount = view.getUint16(setOffset);
        for (let ligatureIndex = 0; ligatureIndex < ligatureCount; ligatureIndex += 1) {
          const ligatureOffset = setOffset + view.getUint16(setOffset + 2 + ligatureIndex * 2);
          const componentCount = view.getUint16(ligatureOffset + 2);
          const components = [first];
          for (let componentIndex = 0; componentIndex < componentCount - 1; componentIndex += 1) {
            components.push(glyphToChar(view.getUint16(ligatureOffset + 4 + componentIndex * 2), reverseCmap));
          }
          const value = components.join("");
          if (value.length > 1) output.push({ value, group: "Ligatures", feature: tag, label: `${value} ${tag}` });
        }
      }
    });
  }

  function parseGsub(view, tables, glyphByCode) {
    const gsub = tables.GSUB;
    if (!gsub) return [];
    const offset = gsub.offset;
    const scriptListOffset = offset + view.getUint16(offset + 4);
    const featureListOffset = offset + view.getUint16(offset + 6);
    const lookupListOffset = offset + view.getUint16(offset + 8);
    if (!scriptListOffset || !featureListOffset || !lookupListOffset) return [];

    const featureCount = view.getUint16(featureListOffset);
    const features = [];
    for (let index = 0; index < featureCount; index += 1) {
      const record = featureListOffset + 2 + index * 6;
      const tag = readTag(view, record);
      if (!/^(liga|dlig|calt|salt|ss\d\d)$/.test(tag)) continue;
      const featureOffset = featureListOffset + view.getUint16(record + 4);
      const lookupCount = view.getUint16(featureOffset + 2);
      const lookups = Array.from({ length: lookupCount }, (_, lookupIndex) => view.getUint16(featureOffset + 4 + lookupIndex * 2));
      features.push({ tag, lookups });
    }
    if (!features.length || !view.getUint16(scriptListOffset)) return [];

    const reverseCmap = new Map(Array.from(glyphByCode, ([code, glyphId]) => [glyphId, code]));
    const lookups = parseLookups(view, lookupListOffset);
    const output = [];
    features.forEach((feature) => {
      feature.lookups.forEach((lookupIndex) => {
        const lookup = lookups[lookupIndex];
        if (!lookup) return;
        if (lookup.type === 4) collectLigatures(view, lookup, feature.tag, reverseCmap, output);
        if (lookup.type === 1 || lookup.type === 3) collectAlternates(view, lookup, feature.tag, reverseCmap, output);
      });
    });
    return uniqueGlyphs(output);
  }

  function groupForCode(code) {
    if (code >= 0x41 && code <= 0x5a) return "Uppercase Latin";
    if (code >= 0x61 && code <= 0x7a) return "Lowercase Latin";
    if ((code >= 0x00c0 && code <= 0x024f) || (code >= 0x1e00 && code <= 0x1eff)) return "Latin Extended";
    if (code >= 0x0370 && code <= 0x03ff) return "Greek";
    if (code >= 0x0400 && code <= 0x04ff) return "Cyrillic";
    if (code >= 0x0500 && code <= 0x052f) return "Cyrillic Extended";
    if (code >= 0x0530 && code <= 0x058f) return "Armenian";
    if (code >= 0x10a0 && code <= 0x10ff) return "Georgian";
    if (code >= 0x30 && code <= 0x39) return "Numerals";
    if ((code >= 0x2000 && code <= 0x206f) || (code >= 0x20 && code <= 0x2f) || (code >= 0x3a && code <= 0x40) || (code >= 0x5b && code <= 0x60) || (code >= 0x7b && code <= 0x7e)) return "Punctuation";
    if (code >= 0x20a0 && code <= 0x20cf) return "Currency";
    if (code >= 0x2190 && code <= 0x21ff) return "Arrows";
    if ((code >= 0x2200 && code <= 0x22ff) || (code >= 0x2a00 && code <= 0x2aff)) return "Math";
    if (code >= 0xa0) return "Symbols";
    return "";
  }

  function uniqueGlyphs(glyphs) {
    const seen = new Set();
    return glyphs.filter((glyph) => {
      const key = `${glyph.group}|${glyph.value}|${glyph.feature || ""}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  function groupsFromGlyphs(glyphs) {
    const groups = new Map();
    uniqueGlyphs(glyphs).forEach((glyph) => {
      if (!groups.has(glyph.group)) groups.set(glyph.group, []);
      groups.get(glyph.group).push(glyph);
    });
    return Array.from(groups, ([title, items]) => ({ title, glyphs: items })).sort((a, b) => {
      const aIndex = groupOrder.indexOf(a.title);
      const bIndex = groupOrder.indexOf(b.title);
      return (aIndex === -1 ? 999 : aIndex) - (bIndex === -1 ? 999 : bIndex);
    });
  }

  function fallbackGroups() {
    const glyphs = fallbackGlyphs
      .map((value) => ({ value, group: groupForCode(value.codePointAt(0)) }))
      .filter((glyph) => glyph.group);
    return groupsFromGlyphs(glyphs);
  }

  function parseFont(buffer) {
    const view = new DataView(buffer);
    const tables = tableMap(view);
    const metrics = parseMetrics(view, tables);
    const glyphByCode = parseCmap(view, tables);
    const unicodeGlyphs = Array.from(glyphByCode.keys())
      .sort((a, b) => a - b)
      .map((code) => ({ value: String.fromCodePoint(code), group: groupForCode(code), code }))
      .filter((glyph) => glyph.group);
    let featureGlyphs = [];
    try {
      featureGlyphs = parseGsub(view, tables, glyphByCode);
    } catch (error) {
      featureGlyphs = [];
    }
    const groups = groupsFromGlyphs(unicodeGlyphs.concat(featureGlyphs));
    return { metrics, groups: groups.length ? groups : fallbackGroups() };
  }

  async function loadFont(style) {
    if (fontCache.has(style.label)) return fontCache.get(style.label);
    const promise = fetch(style.url)
      .then((response) => {
        if (!response.ok) throw new Error(`Font request failed: ${response.status}`);
        return response.arrayBuffer();
      })
      .then(parseFont)
      .catch(() => ({ metrics: fallbackMetrics, groups: fallbackGroups() }));
    fontCache.set(style.label, promise);
    return promise;
  }

  function codePointLabel(value) {
    return Array.from(value)
      .map((char) => `U+${char.codePointAt(0).toString(16).toUpperCase().padStart(4, "0")}`)
      .join(" ");
  }

  function glyphName(value, groupTitle, feature) {
    if (!value) return "No glyph selected";
    if (feature) return `${groupTitle} ${feature}`;
    if (Array.from(value).length > 1) return `${groupTitle || "Glyph"} sequence`;
    if (/^[A-Z]$/.test(value)) return `Latin Capital Letter ${value}`;
    if (/^[a-z]$/.test(value)) return `Latin Small Letter ${value.toUpperCase()}`;
    if (/^[А-ЯЁЇЄҐЎ]$/.test(value)) return `Cyrillic Capital Letter ${value}`;
    if (/^[а-яёїєґў]$/.test(value)) return `Cyrillic Small Letter ${value.toUpperCase()}`;
    if (/^[0-9]$/.test(value)) return `Digit ${value}`;
    return `${groupTitle || "Glyph"} ${value}`;
  }

  function groupTemplate(group, family) {
    return `
      <section class="ct-glyph-grid__group" aria-label="${escapeHtml(group.title)}">
        <div class="ct-glyph-grid__head">
          <h3>${escapeHtml(group.title)}</h3>
          <span>${group.glyphs.length} glyphs</span>
        </div>
        <div class="ct-glyph-grid">
          ${group.glyphs
            .map(
              (glyph) => `
                <button
                  class="ct-glyph-cell"
                  type="button"
                  data-ct-glyph-set-cell
                  data-ct-glyph="${escapeHtml(glyph.value)}"
                  data-ct-glyph-group="${escapeHtml(glyph.group)}"
                  data-ct-glyph-feature="${escapeHtml(glyph.feature || "")}"
                  aria-label="${escapeHtml(glyph.label || `${glyph.group} ${glyph.value}`)}"
                  style="font-family: &quot;${escapeHtml(family)}&quot;, &quot;DK Form&quot;, ui-sans-serif, system-ui, sans-serif"
                >${escapeHtml(glyph.value)}</button>`
            )
            .join("")}
        </div>
      </section>`;
  }

  function renderPreview(root, item, style, metrics) {
    const svg = root.querySelector("[data-ct-glyph-preview-svg]");
    const glyph = root.querySelector("[data-ct-glyph-set-preview]");
    const metricsRoot = root.querySelector("[data-ct-glyph-metrics]");
    const name = root.querySelector("[data-ct-glyph-set-name]");
    const code = root.querySelector("[data-ct-glyph-set-code]");
    const group = root.querySelector("[data-ct-glyph-set-group]");
    const styleLabel = root.querySelector("[data-ct-glyph-set-style-label]");
    if (!svg || !glyph || !metricsRoot || !name || !code || !group || !styleLabel) return;

    const top = 22;
    const bottom = 38;
    const viewHeight = 700;
    const ascender = Math.max(metrics.ascender || fallbackMetrics.ascender, metrics.capHeight || 0, metrics.xHeight || 0);
    const descender = Math.min(metrics.descender || fallbackMetrics.descender, 0);
    const scale = (viewHeight - top - bottom) / Math.max(ascender - descender, 1);
    const baselineY = top + ascender * scale;
    const length = Array.from(item.value).length;
    const sequenceScale = length <= 1 ? 1 : Math.max(0.38, Math.min(0.86, 1.7 / Math.pow(length, 0.72)));
    const fontSize = (metrics.unitsPerEm || fallbackMetrics.unitsPerEm) * scale * sequenceScale;

    const metricLines = [
      { key: "ascender", label: "ASCENDER", value: ascender },
      { key: "cap", label: "CAP HEIGHT", value: metrics.capHeight || ascender },
      { key: "x", label: "X HEIGHT", value: metrics.xHeight || Math.round(ascender * 0.58) },
      { key: "baseline", label: "BASELINE", value: 0 },
      { key: "descender", label: "DESCENDER", value: descender },
    ];
    metricsRoot.innerHTML = metricLines
      .map((line) => {
        const y = baselineY - line.value * scale;
        return `
          <g class="ct-glyph-preview__metric ct-glyph-preview__metric--${line.key}">
            <line x1="0" x2="1000" y1="${y.toFixed(2)}" y2="${y.toFixed(2)}"></line>
            <text class="ct-glyph-preview__metric-label" x="0" y="${(y - 9).toFixed(2)}">${line.label}</text>
            <text class="ct-glyph-preview__metric-value" x="1000" y="${(y - 9).toFixed(2)}">${line.value}</text>
          </g>`;
      })
      .join("");
    glyph.textContent = item.value;
    glyph.setAttribute("y", baselineY.toFixed(2));
    glyph.setAttribute("font-size", fontSize.toFixed(2));
    glyph.style.fontFamily = `"${style.family}", "DK Form", ui-sans-serif, system-ui, sans-serif`;
    name.textContent = item.custom ? "Custom input sequence" : glyphName(item.value, item.group, item.feature);
    code.textContent = codePointLabel(item.value);
    group.textContent = item.custom ? "Custom input" : item.group || "Custom input";
    styleLabel.textContent = style.label;
  }

  function setup(root) {
    const styleSelect = root.querySelector("[data-ct-glyph-set-style]");
    const input = root.querySelector("[data-ct-glyph-set-input]");
    const groupsRoot = root.querySelector("[data-ct-glyph-set-groups]");
    if (!styleSelect || !input || !groupsRoot) return;

    let activeStyle = styles[0];
    let fontData = { metrics: fallbackMetrics, groups: fallbackGroups() };
    let activeItem = { value: "P", group: "Uppercase Latin" };
    let selectedItem = activeItem;
    let customItem = null;

    function cellFor(item) {
      return Array.from(root.querySelectorAll("[data-ct-glyph-set-cell]")).find(
        (cell) => cell.dataset.ctGlyph === item.value && (cell.dataset.ctGlyphFeature || "") === (item.feature || "")
      );
    }

    function setActiveCell(item) {
      root.querySelectorAll(".ct-glyph-cell.is-active").forEach((cell) => {
        cell.classList.remove("is-active");
        cell.setAttribute("aria-pressed", "false");
      });
      const cell = cellFor(item);
      if (cell) {
        cell.classList.add("is-active");
        cell.setAttribute("aria-pressed", "true");
      }
    }

    function activate(item, options = {}) {
      activeItem = item;
      if (!options.custom) {
        selectedItem = item;
        customItem = null;
        setActiveCell(item);
      }
      renderPreview(root, activeItem, activeStyle, fontData.metrics);
    }

    async function renderForStyle() {
      fontData = await loadFont(activeStyle);
      groupsRoot.innerHTML = fontData.groups.map((group) => groupTemplate(group, activeStyle.family)).join("");
      const preferred = cellFor(selectedItem) ? selectedItem : { value: "P", group: "Uppercase Latin" };
      const first = cellFor(preferred) || groupsRoot.querySelector("[data-ct-glyph-set-cell]");
      if (first) {
        selectedItem = {
          value: first.dataset.ctGlyph,
          group: first.dataset.ctGlyphGroup,
          feature: first.dataset.ctGlyphFeature || "",
        };
        setActiveCell(selectedItem);
        renderPreview(root, customItem || selectedItem, activeStyle, fontData.metrics);
      } else {
        renderPreview(root, customItem || selectedItem, activeStyle, fontData.metrics);
      }
    }

    styleSelect.innerHTML = styles.map((style) => `<option value="${escapeHtml(style.label)}">${escapeHtml(style.label)}</option>`).join("");
    renderPreview(root, activeItem, activeStyle, fontData.metrics);

    styleSelect.addEventListener("change", () => {
      activeStyle = styles.find((style) => style.label === styleSelect.value) || styles[0];
      renderForStyle();
    });

    function syncCustomInput() {
      const value = Array.from(input.value.trim()).slice(0, 8).join("");
      if (!value) {
        customItem = null;
        activate(selectedItem);
        return;
      }
      customItem = { value, group: "Custom input", custom: true };
      activeItem = customItem;
      renderPreview(root, customItem, activeStyle, fontData.metrics);
    }

    input.addEventListener("input", syncCustomInput);
    input.addEventListener("change", syncCustomInput);

    function handleGlyph(event) {
      const cell = event.target.closest("[data-ct-glyph-set-cell]");
      if (!cell || !groupsRoot.contains(cell)) return;
      if (input.value.trim()) return;
      activate({
        value: cell.dataset.ctGlyph,
        group: cell.dataset.ctGlyphGroup,
        feature: cell.dataset.ctGlyphFeature || "",
      });
    }

    groupsRoot.addEventListener("pointerover", handleGlyph);
    groupsRoot.addEventListener("mouseover", handleGlyph);
    groupsRoot.addEventListener("focusin", handleGlyph);
    groupsRoot.addEventListener("click", handleGlyph);
    renderForStyle();
  }

  roots.forEach(setup);
})();
