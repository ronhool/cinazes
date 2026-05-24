(function () {
  const page = document.querySelector("[data-ct-specimen-page]");
  if (!page) return;

  const modules = {
    hero() {
      const hero = page.querySelector("[data-ct-hero]");
      const word = page.querySelector("[data-ct-hero-word]");
      if (!hero || !word) return;
      if (window.matchMedia("(pointer: coarse)").matches) return;

      hero.addEventListener("pointermove", (event) => {
        const rect = hero.getBoundingClientRect();
        const x = (event.clientX - rect.left) / rect.width - 0.5;
        const y = (event.clientY - rect.top) / rect.height - 0.5;
        word.style.setProperty("--ct-hero-x", `${x * 7}px`);
        word.style.setProperty("--ct-hero-y", `${y * 5}px`);
        word.style.setProperty("--ct-hero-rx", `${y * -1.5}deg`);
        word.style.setProperty("--ct-hero-ry", `${x * 2}deg`);
        word.style.setProperty("--ct-hero-space", `${-0.078 + x * 0.009}em`);
      });

      hero.addEventListener("pointerleave", () => {
        word.style.setProperty("--ct-hero-x", "0px");
        word.style.setProperty("--ct-hero-y", "0px");
        word.style.setProperty("--ct-hero-rx", "0deg");
        word.style.setProperty("--ct-hero-ry", "0deg");
        word.style.setProperty("--ct-hero-space", "-.078em");
      });
    },

    preview() {
      const input = page.querySelector("[data-ct-preview-input]");
      const output = page.querySelector("[data-ct-preview-output]");
      const controls = page.querySelectorAll("[data-ct-preview-control]");
      if (!input || !output || !controls.length) return;

      const families = ['"CT Triptih Fill"', '"CT Triptih Parth"', '"CT Triptih Stroke"'];

      function render() {
        const values = {};
        controls.forEach((control) => {
          values[control.dataset.ctPreviewControl] = Number(control.value);
        });

        output.textContent = input.value.trim() || "TRIPTIH";
        output.style.setProperty("--ct-preview-size", `${values.size}px`);
        output.style.setProperty("--ct-preview-width", values.width);
        output.style.setProperty("--ct-preview-spacing", `${values.spacing}px`);
        output.style.setProperty("--ct-preview-leading", values.leading / 100);
        output.style.fontFamily = `${families[values.weight] || families[0]}, "Arial Narrow", Arial, sans-serif`;
      }

      input.addEventListener("input", render);
      controls.forEach((control) => control.addEventListener("input", render));
      render();
    },

    glyphMuseum() {
      const root = page.querySelector("[data-ct-glyph-museum]");
      const groupsRoot = page.querySelector("[data-ct-glyph-groups]");
      const large = page.querySelector("[data-ct-glyph-large]");
      const code = page.querySelector("[data-ct-glyph-code]");
      const groupLabel = page.querySelector("[data-ct-glyph-group-label]");
      const alt = page.querySelector("[data-ct-glyph-alt]");
      const ss = page.querySelector("[data-ct-glyph-ss]");
      if (!root || !groupsRoot || !large || !code || !groupLabel || !alt || !ss) return;

      const groups = [
        ["Uppercase", "ABCDEFGHIJKLMNOPQRSTUVWXYZ"],
        ["Lowercase", "abcdefghijklmnopqrstuvwxyz"],
        ["Numerals", "0123456789"],
        ["Symbols", "№@&§%*+=→←"],
        ["Punctuation", ".,:;!?()[]{}"],
        ["Cyrillic", "АБВГДЕЖЗИЙКЛМНОПРСТУФХЦЧШЩЭЮЯ"],
        ["Languages", "ÅÇĞŁÑØŠŽ ЇЄҐЎ"],
      ];
      let glyphTimer = 0;

      function codePointLabel(char) {
        return `U+${char.codePointAt(0).toString(16).toUpperCase().padStart(4, "0")}`;
      }

      function setGlyph(button) {
        groupsRoot.querySelectorAll(".ct-glyph__cell.is-active").forEach((node) => node.classList.remove("is-active"));
        button.classList.add("is-active");
        const glyph = button.textContent;
        const group = button.dataset.ctGlyphGroup;
        const families = {
          Lowercase: '"CT Triptih Parth"',
          Numerals: '"CT Triptih Stroke"',
          Symbols: '"CT Triptih Stroke"',
          Punctuation: '"CT Triptih Parth"',
        };

        window.clearTimeout(glyphTimer);
        large.classList.add("is-changing");
        glyphTimer = window.setTimeout(() => {
          large.textContent = glyph;
          large.style.fontFamily = `${families[group] || '"CT Triptih Fill"'}, "Arial Narrow", Arial, sans-serif`;
          code.textContent = codePointLabel(glyph);
          groupLabel.textContent = group;
          alt.textContent = group === "Cyrillic" || group === "Uppercase" ? "Alternate 01" : "Alternate ready";
          ss.textContent = group === "Numerals" ? "Tabular / oldstyle" : "Stylistic Set 01";
          large.classList.remove("is-changing");
        }, 150);
      }

      groupsRoot.innerHTML = groups
        .map(([title, glyphs]) => {
          const cells = Array.from(glyphs)
            .map(
              (glyph) =>
                `<button class="ct-glyph__cell" type="button" data-ct-glyph-group="${title}" aria-label="${title} ${glyph}">${glyph}</button>`
            )
            .join("");
          return `<section class="ct-glyph__group" aria-label="${title}"><h3 class="ct-glyph__group-title">${title}</h3><div class="ct-glyph__cells">${cells}</div></section>`;
        })
        .join("");

      groupsRoot.addEventListener("mouseover", (event) => {
        const button = event.target.closest(".ct-glyph__cell");
        if (button) setGlyph(button);
      });

      groupsRoot.addEventListener("focusin", (event) => {
        const button = event.target.closest(".ct-glyph__cell");
        if (button) setGlyph(button);
      });

      const initial = groupsRoot.querySelector('[aria-label="Cyrillic Ж"]') || groupsRoot.querySelector(".ct-glyph__cell");
      if (initial) setGlyph(initial);
    },

    opentypeDemos() {
      const demos = Array.from(page.querySelectorAll("[data-ct-feature-demo]"));
      if (!demos.length) return;

      let tick = 0;
      window.setInterval(() => {
        tick += 1;
        demos.forEach((demo, index) => {
          demo.classList.toggle("is-flipped", (tick + index) % 2 === 0);
        });
      }, 3400);
    },
  };

  modules.hero();
  modules.preview();
  modules.glyphMuseum();
  modules.opentypeDemos();
})();
