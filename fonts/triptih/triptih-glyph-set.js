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

  const unicodeGroups = [
    { title: "Control Characters", ranges: [[0x0000, 0x001f], [0x007f, 0x009f]], hidden: true },
    { title: "Whitespace", ranges: [[0x0009, 0x000d], [0x0020, 0x0020], [0x00a0, 0x00a0], [0x1680, 0x1680], [0x2000, 0x200a], [0x2028, 0x2029], [0x202f, 0x202f], [0x205f, 0x205f], [0x3000, 0x3000]] },
    { title: "Zero Width", ranges: [[0x200b, 0x200f], [0x2060, 0x2064], [0xfeff, 0xfeff]] },
    { title: "Uppercase Latin", ranges: [[0x0041, 0x005a]] },
    { title: "Lowercase Latin", ranges: [[0x0061, 0x007a]] },
    { title: "Latin Supplement", ranges: [[0x00c0, 0x00d6], [0x00d8, 0x00f6], [0x00f8, 0x00ff]] },
    { title: "Latin Extended-A", ranges: [[0x0100, 0x017f]] },
    { title: "Latin Extended-B", ranges: [[0x0180, 0x024f]] },
    { title: "Latin Extended Additional", ranges: [[0x1e00, 0x1eff]] },
    { title: "IPA Extensions", ranges: [[0x0250, 0x02af]] },
    { title: "Phonetic Extensions", ranges: [[0x1d00, 0x1d7f], [0x1d80, 0x1dbf]] },
    { title: "Modifier Letters", ranges: [[0x02b0, 0x02ff], [0xa700, 0xa71f]] },
    { title: "Combining Diacritics", ranges: [[0x0300, 0x036f], [0x1ab0, 0x1aff], [0x1dc0, 0x1dff], [0x20d0, 0x20ff], [0xfe20, 0xfe2f]] },
    { title: "Greek", ranges: [[0x0370, 0x03ff]] },
    { title: "Greek Extended", ranges: [[0x1f00, 0x1fff]] },
    { title: "Cyrillic", ranges: [[0x0400, 0x04ff]] },
    { title: "Cyrillic Extended-A", ranges: [[0x2de0, 0x2dff]] },
    { title: "Cyrillic Extended-B", ranges: [[0xa640, 0xa69f]] },
    { title: "Cyrillic Extended-C", ranges: [[0x1c80, 0x1c8f]] },
    { title: "Historic Cyrillic", ranges: [[0x0500, 0x052f]] },
    { title: "Armenian", ranges: [[0x0530, 0x058f]] },
    { title: "Georgian", ranges: [[0x10a0, 0x10ff]] },
    { title: "Georgian Supplement", ranges: [[0x2d00, 0x2d2f]] },
    { title: "Georgian Extended", ranges: [[0x1c90, 0x1cbf]] },
    { title: "Hebrew", ranges: [[0x0590, 0x05ff]] },
    { title: "Hebrew Presentation Forms", ranges: [[0xfb1d, 0xfb4f]] },
    { title: "Arabic", ranges: [[0x0600, 0x06ff]] },
    { title: "Arabic Supplement", ranges: [[0x0750, 0x077f]] },
    { title: "Arabic Extended", ranges: [[0x08a0, 0x08ff], [0x0870, 0x089f]] },
    { title: "Arabic Presentation Forms-A", ranges: [[0xfb50, 0xfdff]] },
    { title: "Arabic Presentation Forms-B", ranges: [[0xfe70, 0xfeff]] },
    { title: "Devanagari", ranges: [[0x0900, 0x097f], [0xa8e0, 0xa8ff]] },
    { title: "Bengali", ranges: [[0x0980, 0x09ff]] },
    { title: "Gurmukhi", ranges: [[0x0a00, 0x0a7f]] },
    { title: "Gujarati", ranges: [[0x0a80, 0x0aff]] },
    { title: "Oriya", ranges: [[0x0b00, 0x0b7f]] },
    { title: "Tamil", ranges: [[0x0b80, 0x0bff]] },
    { title: "Telugu", ranges: [[0x0c00, 0x0c7f]] },
    { title: "Kannada", ranges: [[0x0c80, 0x0cff]] },
    { title: "Malayalam", ranges: [[0x0d00, 0x0d7f]] },
    { title: "Sinhala", ranges: [[0x0d80, 0x0dff]] },
    { title: "Thai", ranges: [[0x0e00, 0x0e7f]] },
    { title: "Lao", ranges: [[0x0e80, 0x0eff]] },
    { title: "Tibetan", ranges: [[0x0f00, 0x0fff]] },
    { title: "Myanmar", ranges: [[0x1000, 0x109f], [0xaa60, 0xaa7f], [0xa9e0, 0xa9ff]] },
    { title: "Khmer", ranges: [[0x1780, 0x17ff], [0x19e0, 0x19ff]] },
    { title: "Ethiopic", ranges: [[0x1200, 0x137f], [0x1380, 0x139f], [0x2d80, 0x2ddf], [0xab00, 0xab2f]] },
    { title: "Ethiopic Supplement", ranges: [[0x1380, 0x139f]] },
    { title: "Tifinagh", ranges: [[0x2d30, 0x2d7f]] },
    { title: "NKo", ranges: [[0x07c0, 0x07ff]] },
    { title: "Vai", ranges: [[0xa500, 0xa63f]] },
    { title: "Cherokee", ranges: [[0x13a0, 0x13ff], [0xab70, 0xabbf]] },
    { title: "Canadian Aboriginal", ranges: [[0x1400, 0x167f], [0x18b0, 0x18ff]] },
    { title: "Ogham", ranges: [[0x1680, 0x169f]] },
    { title: "Runic", ranges: [[0x16a0, 0x16ff]] },
    { title: "Glagolitic", ranges: [[0x2c00, 0x2c5f], [0x1e000, 0x1e02f]] },
    { title: "Coptic", ranges: [[0x2c80, 0x2cff]] },
    { title: "Hiragana", ranges: [[0x3040, 0x309f]] },
    { title: "Katakana", ranges: [[0x30a0, 0x30ff]] },
    { title: "Katakana Phonetic Extensions", ranges: [[0x31f0, 0x31ff]] },
    { title: "Bopomofo", ranges: [[0x3100, 0x312f], [0x31a0, 0x31bf]] },
    { title: "Hangul Jamo", ranges: [[0x1100, 0x11ff], [0xa960, 0xa97f], [0xd7b0, 0xd7ff]] },
    { title: "Hangul Compatibility Jamo", ranges: [[0x3130, 0x318f]] },
    { title: "Kanbun", ranges: [[0x3190, 0x319f]] },
    { title: "CJK Symbols", ranges: [[0x3000, 0x303f], [0x3200, 0x32ff], [0x3300, 0x33ff], [0xfe30, 0xfe4f], [0xff00, 0xffef]] },
    { title: "Kanji / CJK Unified Ideographs", ranges: [[0x3400, 0x4dbf], [0x4e00, 0x9fff], [0xf900, 0xfaff], [0x20000, 0x2fa1f]] },
    { title: "Hangul", ranges: [[0xac00, 0xd7af]] },
    { title: "Old Italic", ranges: [[0x10300, 0x1032f]] },
    { title: "Gothic", ranges: [[0x10330, 0x1034f]] },
    { title: "Ugaritic", ranges: [[0x10380, 0x1039f]] },
    { title: "Old Persian", ranges: [[0x103a0, 0x103df]] },
    { title: "Deseret", ranges: [[0x10400, 0x1044f]] },
    { title: "Shavian", ranges: [[0x10450, 0x1047f]] },
    { title: "Phoenician", ranges: [[0x10900, 0x1091f]] },
    { title: "Numerals", ranges: [[0x0030, 0x0039]] },
    { title: "Superscripts", ranges: [[0x2070, 0x207f], [0x00b2, 0x00b3], [0x00b9, 0x00b9]] },
    { title: "Subscripts", ranges: [[0x2080, 0x209f]] },
    { title: "Fractions", ranges: [[0x00bc, 0x00be], [0x2150, 0x215f]] },
    { title: "Roman Numerals", ranges: [[0x2160, 0x218f]] },
    { title: "Currency", ranges: [[0x0024, 0x0024], [0x00a2, 0x00a5], [0x20a0, 0x20cf]] },
    { title: "Quotes", ranges: [[0x0022, 0x0022], [0x0027, 0x0027], [0x00ab, 0x00ab], [0x00bb, 0x00bb], [0x2018, 0x201f], [0x2039, 0x203a]] },
    { title: "Dashes", ranges: [[0x002d, 0x002d], [0x058a, 0x058a], [0x05be, 0x05be], [0x2010, 0x2015], [0x2212, 0x2212]] },
    { title: "Brackets", ranges: [[0x0028, 0x0029], [0x005b, 0x005d], [0x007b, 0x007d], [0x2045, 0x2046], [0x207d, 0x207e], [0x208d, 0x208e], [0x2308, 0x230b], [0x2329, 0x232a], [0x2768, 0x2775], [0x27c5, 0x27c6], [0x27e6, 0x27ef], [0x2983, 0x2998], [0x29d8, 0x29db], [0x29fc, 0x29fd], [0x2e22, 0x2e29], [0x3008, 0x301b], [0xfe59, 0xfe5e], [0xff08, 0xff09], [0xff3b, 0xff3d], [0xff5b, 0xff5d], [0xff5f, 0xff60], [0xff62, 0xff63]] },
    { title: "Punctuation", ranges: [[0x0021, 0x002f], [0x003a, 0x0040], [0x005b, 0x0060], [0x007b, 0x007e], [0x2000, 0x206f], [0x2e00, 0x2e7f]] },
    { title: "Math Operators", ranges: [[0x2200, 0x22ff], [0x2a00, 0x2aff], [0x27c0, 0x27ef], [0x2980, 0x29ff]] },
    { title: "Arrows", ranges: [[0x2190, 0x21ff], [0x27f0, 0x27ff], [0x2900, 0x297f], [0x1f800, 0x1f8ff]] },
    { title: "Geometric Shapes", ranges: [[0x25a0, 0x25ff], [0x1f780, 0x1f7ff]] },
    { title: "Box Drawing", ranges: [[0x2500, 0x257f]] },
    { title: "Technical Symbols", ranges: [[0x2300, 0x23ff], [0x2400, 0x243f], [0x2440, 0x245f]] },
    { title: "Control Pictures", ranges: [[0x2400, 0x243f]] },
    { title: "Dingbats", ranges: [[0x2700, 0x27bf]] },
    { title: "Ornaments", ranges: [[0x2766, 0x2767], [0x1f650, 0x1f67f]] },
    { title: "Stars", ranges: [[0x2605, 0x2606], [0x2726, 0x2734], [0x1f7d8, 0x1f7eb]] },
    { title: "Checkmarks", ranges: [[0x2611, 0x2611], [0x2705, 0x2705], [0x2713, 0x2718], [0x274c, 0x274e]] },
    { title: "UI Symbols", ranges: [[0x2318, 0x2318], [0x2325, 0x2325], [0x23ce, 0x23ce], [0x23cf, 0x23cf], [0x2423, 0x2423], [0x25a0, 0x25ff], [0x2b00, 0x2bff]] },
    { title: "Transport Symbols", ranges: [[0x1f680, 0x1f6ff]] },
    { title: "Weather Symbols", ranges: [[0x2600, 0x26ff], [0x1f300, 0x1f32f]] },
    { title: "Emoji", ranges: [[0x1f000, 0x1f02f], [0x1f0a0, 0x1f0ff], [0x1f100, 0x1f1ff], [0x1f300, 0x1faff]] },
    { title: "Icons", ranges: [[0x2600, 0x27bf], [0x1f000, 0x1faff]] },
    { title: "Symbols", ranges: [[0x00a6, 0x00a9], [0x00ac, 0x00ae], [0x00b0, 0x00b1], [0x00b6, 0x00b7], [0x00d7, 0x00d7], [0x00f7, 0x00f7], [0x2100, 0x214f], [0x2460, 0x24ff], [0x2600, 0x26ff], [0x2b00, 0x2bff]] },
  ];

  const casedScriptDefinitions = [
    { title: "Latin", ranges: [[0x0041, 0x005a], [0x0061, 0x007a]] },
    { title: "Cyrillic", ranges: [[0x0400, 0x04ff]] },
    { title: "Greek", ranges: [[0x0370, 0x03ff], [0x1f00, 0x1fff]] },
    { title: "Armenian", ranges: [[0x0530, 0x058f]] },
    { title: "Georgian", ranges: [[0x10a0, 0x10ff], [0x1c90, 0x1cbf]] },
  ];

  const featureDefinitions = [
    { tags: ["liga"], title: "Ligatures" },
    { tags: ["dlig"], title: "Discretionary Ligatures" },
    { tags: ["hlig"], title: "Historical Ligatures" },
    { tags: ["clig"], title: "Contextual Ligatures" },
    { tags: ["salt"], title: "Stylistic Alternates" },
    { tags: ["calt"], title: "Contextual Alternates" },
    { tags: ["swsh"], title: "Swash Alternates" },
    { tags: ["titl"], title: "Titling Alternates" },
    { tags: ["onum"], title: "Oldstyle Figures" },
    { tags: ["lnum"], title: "Lining Figures" },
    { tags: ["tnum"], title: "Tabular Figures" },
    { tags: ["pnum"], title: "Proportional Figures" },
    { tags: ["zero"], title: "Slashed Zero" },
    { tags: ["smcp"], title: "Small Caps" },
    { tags: ["pcap"], title: "Petite Caps" },
    { tags: ["c2sc"], title: "Caps to Small Caps" },
    { tags: ["case"], title: "Case-Sensitive Forms" },
    { tags: ["init"], title: "Initial Forms" },
    { tags: ["medi"], title: "Medial Forms" },
    { tags: ["fina"], title: "Terminal Forms" },
    { tags: ["isol"], title: "Isolated Forms" },
    { tags: ["frac"], title: "Fractions" },
    { tags: ["afrc"], title: "Alternative Fractions" },
    { tags: ["numr"], title: "Numerators" },
    { tags: ["dnom"], title: "Denominators" },
    { tags: ["vert"], title: "Vertical Alternates" },
    { tags: ["ruby"], title: "Ruby Forms" },
    { tags: ["hkna"], title: "Kana Alternates" },
    { tags: ["ornm"], title: "Ornaments" },
  ];

  for (let index = 1; index <= 20; index += 1) featureDefinitions.push({ tags: [`ss${String(index).padStart(2, "0")}`], title: `Stylistic Set ${String(index).padStart(2, "0")}` });
  for (let index = 1; index <= 99; index += 1) featureDefinitions.push({ tags: [`cv${String(index).padStart(2, "0")}`], title: `Character Variant ${String(index).padStart(2, "0")}` });

  const featureTags = new Set(featureDefinitions.flatMap((definition) => definition.tags));
  const featureTitleByTag = new Map(featureDefinitions.flatMap((definition) => definition.tags.map((tag) => [tag, definition.title])));
  const casedGroupTitles = casedScriptDefinitions.flatMap((script) => [`Uppercase ${script.title}`, `Lowercase ${script.title}`, script.title]);
  const groupOrder = casedGroupTitles.concat(unicodeGroups.map((group) => group.title), featureDefinitions.map((definition) => definition.title));
  const characterGroups = new Set(unicodeGroups.filter((group) => !group.hidden).map((group) => group.title).concat(casedGroupTitles));
  const featureGroups = new Set(featureDefinitions.map((definition) => definition.title));

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

  function parseTechnical(view, tables, metrics) {
    const hhea = tables.hhea;
    return {
      metrics: {
        unitsPerEm: metrics.unitsPerEm,
        ascender: metrics.ascender,
        descender: metrics.descender,
        capHeight: metrics.capHeight,
        xHeight: metrics.xHeight,
        baseline: 0,
        lineGap: hhea ? view.getInt16(hhea.offset + 8) : 0,
      },
      glyphs: {
        count: parseGlyphCount(view, tables),
        hasGlyphNames: Boolean(tables["CFF "] || tables.post),
      },
      construction: {
        hasGsub: Boolean(tables.GSUB),
        hasGpos: Boolean(tables.GPOS),
        hasKerning: Boolean(tables.kern || tables.GPOS),
        hasMarkPositioning: Boolean(tables.GPOS),
      },
      variable: {
        hasVariableData: Boolean(tables.fvar || tables.avar || tables.STAT),
        hasFvar: Boolean(tables.fvar),
        hasAvar: Boolean(tables.avar),
        hasStat: Boolean(tables.STAT),
      },
      color: {
        hasColorData: Boolean(tables.COLR || tables.CPAL || tables.SVG),
        hasColr: Boolean(tables.COLR),
        hasCpal: Boolean(tables.CPAL),
        hasSvg: Boolean(tables.SVG),
      },
    };
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

  function parseGlyphCount(view, tables) {
    return tables.maxp ? view.getUint16(tables.maxp.offset + 4) : 0;
  }

  function parseCffIndex(view, offset) {
    const count = view.getUint16(offset);
    offset += 2;
    if (!count) return { items: [], next: offset };
    const offSize = view.getUint8(offset);
    offset += 1;
    const offsets = [];
    for (let index = 0; index <= count; index += 1) {
      let value = 0;
      for (let byte = 0; byte < offSize; byte += 1) value = (value << 8) + view.getUint8(offset + byte);
      offsets.push(value);
      offset += offSize;
    }
    const dataOffset = offset;
    const items = offsets.slice(0, -1).map((start, index) => [dataOffset + start - 1, dataOffset + offsets[index + 1] - 1]);
    return { items, next: dataOffset + offsets[count] - 1 };
  }

  function parseCffDict(view, start, end) {
    const output = {};
    let operands = [];
    function readNumber(byte, offset) {
      if (byte >= 32 && byte <= 246) return { value: byte - 139, offset };
      if (byte >= 247 && byte <= 250) return { value: (byte - 247) * 256 + view.getUint8(offset) + 108, offset: offset + 1 };
      if (byte >= 251 && byte <= 254) return { value: -(byte - 251) * 256 - view.getUint8(offset) - 108, offset: offset + 1 };
      if (byte === 28) return { value: view.getInt16(offset), offset: offset + 2 };
      if (byte === 29) return { value: view.getInt32(offset), offset: offset + 4 };
      return { value: 0, offset };
    }
    for (let offset = start; offset < end; ) {
      const byte = view.getUint8(offset);
      offset += 1;
      if (byte <= 21) {
        const operator = byte === 12 ? `12 ${view.getUint8(offset)}` : String(byte);
        if (byte === 12) offset += 1;
        output[operator] = operands;
        operands = [];
      } else {
        const number = readNumber(byte, offset);
        operands.push(number.value);
        offset = number.offset;
      }
    }
    return output;
  }

  function parseCffGlyphNames(view, tables, glyphCount) {
    const cff = tables["CFF "];
    if (!cff || !glyphCount) return [];
    const cffOffset = cff.offset;
    let offset = cffOffset + view.getUint8(cffOffset + 2);
    const nameIndex = parseCffIndex(view, offset);
    offset = nameIndex.next;
    const topDictIndex = parseCffIndex(view, offset);
    offset = topDictIndex.next;
    const stringIndex = parseCffIndex(view, offset);
    const strings = stringIndex.items.map(([start, end]) => {
      let value = "";
      for (let index = start; index < end; index += 1) value += String.fromCharCode(view.getUint8(index));
      return value;
    });
    if (!topDictIndex.items.length) return [];
    const topDict = parseCffDict(view, topDictIndex.items[0][0], topDictIndex.items[0][1]);
    const charsetOffset = topDict["15"] ? cffOffset + topDict["15"][0] : 0;
    if (!charsetOffset) return [];

    function stringForSid(sid) {
      return sid >= 391 ? strings[sid - 391] || "" : "";
    }

    const names = [".notdef"];
    const format = view.getUint8(charsetOffset);
    let cursor = charsetOffset + 1;
    if (format === 0) {
      while (names.length < glyphCount) {
        names.push(stringForSid(view.getUint16(cursor)));
        cursor += 2;
      }
    } else if (format === 1 || format === 2) {
      while (names.length < glyphCount) {
        const first = view.getUint16(cursor);
        const left = format === 1 ? view.getUint8(cursor + 2) : view.getUint16(cursor + 2);
        cursor += format === 1 ? 3 : 4;
        for (let sid = first; sid <= first + left && names.length < glyphCount; sid += 1) names.push(stringForSid(sid));
      }
    }
    return names;
  }

  function valueFromGlyphName(name) {
    if (!name || name === ".notdef") return "";
    const base = name.split(".")[0];
    if (/^uni(?:[0-9A-Fa-f]{4})+$/.test(base)) {
      const hex = base.slice(3);
      return hex.match(/[0-9A-Fa-f]{4}/g).map((code) => String.fromCodePoint(parseInt(code, 16))).join("");
    }
    if (/^u[0-9A-Fa-f]{4,6}$/.test(base)) return String.fromCodePoint(parseInt(base.slice(1), 16));
    if (base.includes("_")) {
      return base
        .split("_")
        .map((part) => valueFromGlyphName(part) || (part.length === 1 ? part : ""))
        .join("");
    }
    return base.length === 1 ? base : "";
  }

  function glyphsFromCffNames(view, tables, glyphByCode) {
    const glyphCount = parseGlyphCount(view, tables);
    const glyphNames = parseCffGlyphNames(view, tables, glyphCount);
    if (!glyphNames.length) return [];
    const encodedGlyphs = new Set(glyphByCode.values());
    return glyphNames
      .map((name, glyphId) => {
        const value = valueFromGlyphName(name);
        if (!value) return null;
        const suffix = name.includes(".") ? name.split(".").slice(1).join(".") : "";
        const group = suffix.includes("liga")
          ? "Ligatures"
          : /^ss\d\d/.test(suffix)
            ? "Stylistic Sets"
            : suffix
              ? "Alternates"
              : groupForCode(value.codePointAt(0));
        if (!group) return null;
        if (!suffix && encodedGlyphs.has(glyphId)) return null;
        return {
          value,
          group,
          feature: suffix || "",
          label: name,
        };
      })
      .filter(Boolean);
  }

  function displayForCode(code, value) {
    const labels = new Map([
      [0x0009, "TAB"],
      [0x000a, "LF"],
      [0x000d, "CR"],
      [0x0020, "SP"],
      [0x00a0, "NBSP"],
      [0x200b, "ZWSP"],
      [0x200c, "ZWNJ"],
      [0x200d, "ZWJ"],
      [0x2060, "WJ"],
      [0xfeff, "BOM"],
    ]);
    return labels.get(code) || value;
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

  function isPrivateUseCode(code) {
    return (code >= 0xe000 && code <= 0xf8ff) || (code >= 0xf0000 && code <= 0xffffd) || (code >= 0x100000 && code <= 0x10fffd);
  }

  function glyphToChar(glyphId, reverseCmap) {
    const code = reverseCmap.get(glyphId);
    if (code && isPrivateUseCode(code)) return "";
    return code ? String.fromCodePoint(code) : "";
  }

  function collectAlternates(view, lookup, tag, reverseCmap, output) {
    const group = featureTitleByTag.get(tag) || "Alternates";
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
            group,
            feature: tag,
            label: `${value} ${tag}`,
          });
        });
      }
    });
  }

  function collectLigatures(view, lookup, tag, reverseCmap, output) {
    const group = featureTitleByTag.get(tag) || "Ligatures";
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
          if (value.length > 1) output.push({ value, group, feature: tag, label: `${value} ${tag}` });
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
      if (!featureTags.has(tag)) continue;
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

  function inRanges(code, ranges) {
    return ranges.some(([start, end]) => code >= start && code <= end);
  }

  function codePointFromChar(value) {
    return Array.from(value)[0]?.codePointAt(0) || 0;
  }

  function caseInfoForCode(code, script) {
    if (script.title === "Georgian") {
      if (code >= 0x1c90 && code <= 0x1cbf) return { role: "uppercase", pairCode: 0x10d0 + code - 0x1c90 };
      if (code >= 0x10d0 && code <= 0x10ff) return { role: "lowercase", pairCode: 0x1c90 + code - 0x10d0 };
    }
    const value = String.fromCodePoint(code);
    const upper = value.toLocaleUpperCase();
    const lower = value.toLocaleLowerCase();
    if (upper === lower) return "";
    if (value === upper && value !== lower) return { role: "uppercase", pairCode: Array.from(lower).length === 1 ? codePointFromChar(lower) : 0 };
    if (value === lower && value !== upper) return { role: "lowercase", pairCode: Array.from(upper).length === 1 ? codePointFromChar(upper) : 0 };
    return { role: "", pairCode: 0 };
  }

  function buildCaseProfiles(glyphByCode) {
    const availableCodes = new Set(glyphByCode.keys());
    return casedScriptDefinitions.map((script) => {
      let hasUppercase = false;
      let hasLowercase = false;
      let hasDistinctPair = false;
      availableCodes.forEach((code) => {
        if (!inRanges(code, script.ranges)) return;
        const { role, pairCode } = caseInfoForCode(code, script);
        if (role === "uppercase") hasUppercase = true;
        if (role === "lowercase") hasLowercase = true;
        if (!pairCode || !availableCodes.has(pairCode) || !inRanges(pairCode, script.ranges)) return;
        if (glyphByCode.get(code) !== glyphByCode.get(pairCode)) hasDistinctPair = true;
      });
      return {
        ...script,
        split: hasUppercase && hasLowercase && hasDistinctPair,
      };
    });
  }

  function caseGroupForCode(code, caseProfiles) {
    const profile = caseProfiles.find((script) => inRanges(code, script.ranges));
    if (!profile) return "";
    if (!profile.split) return profile.title;
    const { role } = caseInfoForCode(code, profile);
    if (role === "uppercase") return `Uppercase ${profile.title}`;
    if (role === "lowercase") return `Lowercase ${profile.title}`;
    return "";
  }

  function groupForCode(code, caseProfiles = []) {
    const caseGroup = caseGroupForCode(code, caseProfiles);
    if (caseGroup) return caseGroup;
    const group = unicodeGroups.find((definition) => definition.ranges.some(([start, end]) => code >= start && code <= end));
    if (group && !group.hidden) return group.title;
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
    const technical = parseTechnical(view, tables, metrics);
    const glyphByCode = parseCmap(view, tables);
    const caseProfiles = buildCaseProfiles(glyphByCode);
    const unicodeGlyphs = Array.from(glyphByCode.keys())
      .sort((a, b) => a - b)
      .map((code) => {
        const value = String.fromCodePoint(code);
        return { value, display: displayForCode(code, value), group: groupForCode(code, caseProfiles), code };
      })
      .filter((glyph) => glyph.group);
    let featureGlyphs = [];
    try {
      featureGlyphs = parseGsub(view, tables, glyphByCode);
    } catch (error) {
      featureGlyphs = [];
    }
    const groups = groupsFromGlyphs(unicodeGlyphs.concat(featureGlyphs));
    return { metrics, technical, groups: groups.length ? groups : fallbackGroups() };
  }

  async function loadFont(style) {
    if (fontCache.has(style.label)) return fontCache.get(style.label);
    const promise = fetch(style.url)
      .then((response) => {
        if (!response.ok) throw new Error(`Font request failed: ${response.status}`);
        return response.arrayBuffer();
      })
      .then(parseFont)
      .catch(() => ({ metrics: fallbackMetrics, technical: {}, groups: fallbackGroups() }));
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
    if (feature && /Ligatures?$/.test(groupTitle)) return "Ligature";
    if (feature && /Alternates?$/.test(groupTitle)) return "Alternate";
    if (feature && /^Stylistic Set/.test(groupTitle)) return groupTitle;
    if (feature && /^Character Variant/.test(groupTitle)) return groupTitle;
    if (feature) return `${groupTitle} ${feature}`;
    if (Array.from(value).length > 1) return `${groupTitle || "Glyph"} sequence`;
    if (/^[A-Z]$/.test(value)) return `Latin Capital Letter ${value}`;
    if (/^[a-z]$/.test(value)) return `Latin Small Letter ${value.toUpperCase()}`;
    if (/^[А-ЯЁЇЄҐЎ]$/.test(value)) return `Cyrillic Capital Letter ${value}`;
    if (/^[а-яёїєґў]$/.test(value)) return `Cyrillic Small Letter ${value.toUpperCase()}`;
    if (/^[0-9]$/.test(value)) return `Digit ${value}`;
    return `${groupTitle || "Glyph"} ${value}`;
  }

  function featureMeta(item) {
    if (!item.feature) return codePointLabel(item.value);
    return `${item.feature.slice(0, 4)} · ${Array.from(item.value).join(" + ")}`;
  }

  function featureSettings(item) {
    if (!item.feature) return "normal";
    const tags = new Set([item.feature.slice(0, 4)]);
    if (/Ligatures?$/.test(item.group)) {
      tags.add("liga");
      tags.add("dlig");
    }
    return Array.from(tags, (tag) => `"${tag}" 1`).join(", ");
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
                  style="font-family: &quot;${escapeHtml(family)}&quot;, &quot;DK Form&quot;, ui-sans-serif, system-ui, sans-serif; ${glyph.feature ? `font-feature-settings: ${escapeHtml(featureSettings(glyph))};` : ""}"
                >${escapeHtml(glyph.display || glyph.value)}</button>`
            )
            .join("")}
        </div>
      </section>`;
  }

  function sectionTemplate(title, groups, family) {
    if (!groups.length) return "";
    return `
      <section class="ct-glyph-browser__section" aria-label="${escapeHtml(title)}">
        <h2 class="ct-glyph-browser__section-title">${escapeHtml(title)}</h2>
        <div class="ct-glyph-browser__section-groups">
          ${groups.map((group) => groupTemplate(group, family)).join("")}
        </div>
      </section>`;
  }

  function groupsTemplate(groups, family) {
    const characters = groups.filter((group) => characterGroups.has(group.title));
    const features = groups.filter((group) => featureGroups.has(group.title));
    return sectionTemplate("Characters", characters, family) + sectionTemplate("Features", features, family);
  }

  function filteredGroups(groups, query) {
    const inputChars = Array.from(query.trim());
    if (!inputChars.length) return groups;
    const inputSet = new Set(inputChars);
    const inputText = inputChars.join("");
    return groups
      .map((group) => ({
        ...group,
        glyphs: group.glyphs.filter((glyph) => {
          const glyphChars = Array.from(glyph.value);
          if (glyphChars.length === 1) return inputSet.has(glyph.value);
          return inputText.includes(glyph.value) || glyphChars.every((char) => inputSet.has(char));
        }),
      }))
      .filter((group) => group.glyphs.length);
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
    glyph.style.fontFeatureSettings = featureSettings(item);
    name.textContent = item.custom ? "Custom input sequence" : glyphName(item.value, item.group, item.feature);
    code.textContent = item.custom ? codePointLabel(item.value) : featureMeta(item);
    group.textContent = item.custom ? "Custom input" : item.group || "Custom input";
    styleLabel.textContent = style.label;
  }

  function setup(root) {
    const styleDropdown = root.querySelector("[data-ct-glyph-style-dropdown]");
    const styleTrigger = root.querySelector("[data-ct-glyph-style-trigger]");
    const styleLabel = root.querySelector("[data-ct-glyph-style-label]");
    const styleMenu = root.querySelector("[data-ct-glyph-style-menu]");
    const input = root.querySelector("[data-ct-glyph-set-input]");
    const groupsRoot = root.querySelector("[data-ct-glyph-set-groups]");
    if (!styleDropdown || !styleTrigger || !styleLabel || !styleMenu || !input || !groupsRoot) return;

    let activeStyle = styles[0];
    let fontData = { metrics: fallbackMetrics, technical: {}, groups: fallbackGroups() };
    let activeItem = { value: "P", group: "Uppercase Latin" };
    let selectedItem = activeItem;

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
      if (!options.previewOnly) {
        selectedItem = item;
        setActiveCell(item);
      }
      renderPreview(root, activeItem, activeStyle, fontData.metrics);
    }

    function renderVisibleGroups() {
      const groups = filteredGroups(fontData.groups, input.value);
      groupsRoot.innerHTML = groupsTemplate(groups, activeStyle.family);
      const preferred = cellFor(selectedItem) ? selectedItem : { value: "P", group: "Uppercase Latin" };
      const first = cellFor(preferred) || groupsRoot.querySelector("[data-ct-glyph-set-cell]");
      if (first) {
        selectedItem = {
          value: first.dataset.ctGlyph,
          group: first.dataset.ctGlyphGroup,
          feature: first.dataset.ctGlyphFeature || "",
        };
        setActiveCell(selectedItem);
        renderPreview(root, selectedItem, activeStyle, fontData.metrics);
      } else {
        renderPreview(root, selectedItem, activeStyle, fontData.metrics);
      }
    }

    async function renderForStyle() {
      fontData = await loadFont(activeStyle);
      renderVisibleGroups();
    }

    function setDropdownOpen(isOpen) {
      styleDropdown.classList.toggle("is-open", isOpen);
      styleTrigger.setAttribute("aria-expanded", String(isOpen));
    }

    function renderStyleDropdown() {
      styleLabel.textContent = activeStyle.label;
      styleMenu.innerHTML = styles
        .map(
          (style) => `
            <button
              class="ct-glyph-dropdown__option${style.label === activeStyle.label ? " is-active" : ""}"
              type="button"
              role="option"
              aria-selected="${style.label === activeStyle.label ? "true" : "false"}"
              data-ct-glyph-style-option="${escapeHtml(style.label)}"
            >${escapeHtml(style.label)}</button>`
        )
        .join("");
    }

    renderStyleDropdown();
    renderPreview(root, activeItem, activeStyle, fontData.metrics);

    styleTrigger.addEventListener("click", () => {
      setDropdownOpen(!styleDropdown.classList.contains("is-open"));
    });

    styleMenu.addEventListener("click", (event) => {
      const option = event.target.closest("[data-ct-glyph-style-option]");
      if (!option) return;
      activeStyle = styles.find((style) => style.label === option.dataset.ctGlyphStyleOption) || styles[0];
      renderStyleDropdown();
      setDropdownOpen(false);
      styleTrigger.focus();
      renderForStyle();
    });

    styleDropdown.addEventListener("focusout", (event) => {
      if (!styleDropdown.contains(event.relatedTarget)) setDropdownOpen(false);
    });

    styleDropdown.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        setDropdownOpen(false);
        styleTrigger.focus();
      }
    });

    function syncGlyphFilter() {
      renderVisibleGroups();
    }

    input.addEventListener("input", syncGlyphFilter);
    input.addEventListener("change", syncGlyphFilter);

    function handleGlyph(event) {
      const cell = event.target.closest("[data-ct-glyph-set-cell]");
      if (!cell || !groupsRoot.contains(cell)) return;
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
