(function () {
  window.CINAZES_FONT_FAMILIES = [
    {
      name: "AA_Noon",
      slug: "aa-noon",
      description: "AA_Noon Regular specimen",
      detailUrl: "/fonts/aa-noon/",
      licenseSubject: "Лицензия AA_Noon",
      interactiveSpecimen: {
        defaultWeight: "Regular",
        defaultText:
          "Quiet letters gather rhythm: AA_Noon, Проба шрифта 0123456789 — punctuation, accents, façade, naïve, ёлка, щука, & symbols.",
        size: 92,
        tracking: -0.01,
        leading: 1.08,
        limits: {
          size: [42, 128],
          tracking: [-0.08, 0.16],
          leading: [0.82, 1.42],
        },
        weights: [
          {
            name: "Regular",
            fontFamily: "Etude",
            fontWeight: 400,
            trialFile: "/public/fonts/etude/Etude-Regular.woff2",
          },
        ],
      },
      styles: [
        {
          slug: "regular",
          name: "Regular",
          fontFamily: "Etude",
          className: "font-specimen--regular",
          detailClassName: "font-detail-specimen--regular",
          fontFile: "/public/fonts/etude/Etude-Regular.woff2",
          trialFile: "/public/fonts/etude/Etude-Regular.woff2",
          previewText: "AA_Noon",
          tracking: -0.02,
          leading: 0.88,
          size: 220,
          specimen: {
            size: 32,
            left: {
              text: "Letters find their rhythm in patient measure. A quiet paragraph reveals how counters, stems, spacing, and punctuation hold together through a long editorial line. The typeface should feel steady, open, and precise while the sentence keeps moving.",
              features: {},
            },
            right: {
              text: "Буквы держат строку спокойно и точно. В длинном наборе становятся видны ритм, просветы, форма знаков и работа пунктуации. Шрифт должен оставаться собранным, живым и внимательным к чтению даже в плотном абзаце.",
              features: {
                liga: true,
                calt: true,
                ss01: true,
              },
            },
          },
        },
      ],
    },
    {
      name: "Triptih",
      slug: "triptih",
      description: "Triptih specimen",
      detailUrl: "/fonts/triptih/",
      licenseSubject: "Лицензия Triptih",
      interactiveSpecimen: {
        defaultWeight: "Fill",
        defaultText:
          "TRIPTIH builds a dense visual rhythm through compressed proportions, sharp vertical tension and architectural spacing. Designed for editorial systems, posters and cultural identities, the typeface balances brutal structure with expressive movement across Latin and Cyrillic compositions.",
        size: 104,
        tracking: -0.015,
        leading: 0.96,
        limits: {
          size: [48, 132],
          tracking: [-0.08, 0.18],
          leading: [0.78, 1.28],
        },
        weights: [
          {
            name: "Fill",
            fontFamily: "Triptih Fill",
            fontWeight: 400,
            trialFile: "/public/fonts/triptih/Triptih-Fill.otf",
          },
          {
            name: "Parth",
            fontFamily: "Triptih Parth",
            fontWeight: 400,
            trialFile: "/public/fonts/triptih/Triptih-Parth.otf",
          },
          {
            name: "Stroke",
            fontFamily: "Triptih Stroke",
            fontWeight: 400,
            trialFile: "/public/fonts/triptih/Triptih-Stroke.otf",
          },
        ],
      },
      styles: [
        {
          slug: "fill",
          name: "Fill",
          fontFamily: "Triptih Fill",
          className: "font-specimen--triptih-fill",
          detailClassName: "font-detail-specimen--fill",
          fontFile: "/public/fonts/triptih/Triptih-Fill.otf",
          trialFile: "/public/fonts/triptih/Triptih-Fill.otf",
          previewText: "Triptih",
          tracking: -0.01,
          leading: 0.9,
          size: 220,
          specimen: {
            size: 48,
            left: {
              text: "A display face can still carry a paragraph with discipline. Fill shows the density of the form, the pressure of curves, and the way repeated letters create a deliberate texture across a generous editorial column.",
              features: {},
            },
            right: {
              text: "Плотная форма раскрывается в длинной строке: контраст, внутренние просветы и повтор букв складываются в выразительную фактуру. Кириллица показывает, как декоративное начертание удерживает читательский ритм.",
              features: {
                liga: true,
                calt: true,
                ss01: true,
              },
            },
          },
        },
        {
          slug: "parth",
          name: "Parth",
          fontFamily: "Triptih Parth",
          className: "font-specimen--triptih-parth",
          detailClassName: "font-detail-specimen--parth",
          fontFile: "/public/fonts/triptih/Triptih-Parth.otf",
          trialFile: "/public/fonts/triptih/Triptih-Parth.otf",
          previewText: "Triptih",
          tracking: -0.01,
          leading: 0.9,
          size: 220,
          specimen: {
            size: 48,
            left: {
              text: "Parth opens the construction and lets the page breathe. In continuous text the broken contour becomes a rhythm rather than an effect, balancing sharp detail with the calm pace of editorial reading.",
              features: {},
            },
            right: {
              text: "Открытый контур меняет темп чтения: буквы становятся легче, паузы заметнее, а строка не теряет характера. В кириллице особенно важны баланс штрихов, устойчивость формы и чёткая дистанция между знаками.",
              features: {
                liga: true,
                calt: true,
                ss01: true,
              },
            },
          },
        },
        {
          slug: "stroke",
          name: "Stroke",
          fontFamily: "Triptih Stroke",
          className: "font-specimen--triptih-stroke",
          detailClassName: "font-detail-specimen--stroke",
          fontFile: "/public/fonts/triptih/Triptih-Stroke.otf",
          trialFile: "/public/fonts/triptih/Triptih-Stroke.otf",
          previewText: "Triptih",
          tracking: -0.01,
          leading: 0.9,
          size: 220,
          specimen: {
            size: 48,
            left: {
              text: "Stroke keeps the skeleton visible and turns spacing into the main texture. The paragraph becomes a field of lines, intervals, and joins, showing how a fragile outline can remain readable at text scale.",
              features: {},
            },
            right: {
              text: "Контурное начертание строит страницу из линий и интервалов. В длинном русском тексте проявляются соединения, альтернативные глифы, плотность пробелов и способность шрифта сохранять характер без лишнего шума.",
              features: {
                liga: true,
                calt: true,
                ss01: true,
              },
            },
          },
        },
      ],
    },
  ];
})();
