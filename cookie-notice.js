const SCRIPT_EL = document.currentScript;

const CONSENT_KEY = "cinazes_analytics_consent";
const CONSENT_GRANTED = "granted";
const CONSENT_DENIED = "denied";
const COOKIE_HIDE_DELAY = 180;

let analyticsLoaded = false;

function isPrivacyPage() {
  const { pathname } = window.location;
  return pathname.endsWith("/privacy") || pathname.endsWith("/privacy/");
}

function getAvailableStorages() {
  const storages = [];

  for (const storageName of ["localStorage", "sessionStorage"]) {
    try {
      const storage = window[storageName];
      storage.setItem("__cinazes_test__", "1");
      storage.removeItem("__cinazes_test__");
      storages.push(storage);
    } catch {
      // Try the next storage option.
    }
  }

  return storages;
}

function getConsent() {
  for (const storage of getAvailableStorages()) {
    const value = storage.getItem(CONSENT_KEY);
    if (value === CONSENT_GRANTED || value === CONSENT_DENIED) return value;
  }
  return null;
}

function setConsent(value) {
  for (const storage of getAvailableStorages()) {
    storage.setItem(CONSENT_KEY, value);
  }
}

function resolvePolicyHref() {
  const siteRoot = SCRIPT_EL?.dataset.siteRoot || "/";
  return new URL(`${siteRoot}privacy/`, window.location.href).href;
}

function loadYandexMetrika(counterId) {
  (function (m, e, t, r, i, k, a) {
    m[i] =
      m[i] ||
      function () {
        (m[i].a = m[i].a || []).push(arguments);
      };
    m[i].l = 1 * new Date();
    for (var j = 0; j < document.scripts.length; j++) {
      if (document.scripts[j].src === r) {
        return;
      }
    }
    k = e.createElement(t);
    a = e.getElementsByTagName(t)[0];
    k.async = 1;
    k.src = r;
    a.parentNode.insertBefore(k, a);
  })(window, document, "script", "https://mc.yandex.ru/metrika/tag.js?id=" + counterId, "ym");

  window.ym(Number(counterId), "init", {
    ssr: true,
    clickmap: true,
    ecommerce: "dataLayer",
    referrer: document.referrer,
    url: location.href,
    accurateTrackBounce: true,
    trackLinks: true,
  });
}

function maybeLoadAnalytics() {
  if (analyticsLoaded) return;
  const analyticsId = SCRIPT_EL?.dataset.analyticsId;
  if (!analyticsId) return;
  analyticsLoaded = true;
  loadYandexMetrika(analyticsId);
}

function setDisableFlag(disabled) {
  const analyticsId = SCRIPT_EL?.dataset.analyticsId;
  if (!analyticsId) return;
  window["disableYaCounter" + analyticsId] = disabled;
}

function buildCookieNotice() {
  const notice = document.createElement("aside");
  notice.className = "cookie-notice";
  notice.hidden = true;
  notice.setAttribute("aria-live", "polite");
  notice.setAttribute("aria-label", "Настройки аналитики");

  notice.innerHTML = `
    <div class="cookie-notice__inner">
      <div class="cookie-notice__copy">
        <p class="cookie-notice__title">Сайт использует cookie.</p>
        <p class="cookie-notice__text">Необходимые cookie работают всегда. Аналитика Яндекс.Метрики запускается только с вашего согласия и её можно в любой момент отключить.</p>
      </div>
      <div class="cookie-notice__actions">
        <button type="button" class="cookie-notice__button" data-cookie-accept>разрешить аналитику</button>
        <button type="button" class="cookie-notice__button" data-cookie-decline>без аналитики</button>
        <a class="cookie-notice__link" href="${resolvePolicyHref()}">политика</a>
      </div>
    </div>
  `;

  return notice;
}

function hideCookieNotice(notice) {
  if (!notice || notice.dataset.hiding === "true") return;
  notice.dataset.hiding = "true";
  notice.classList.remove("is-visible");
  notice.classList.add("is-hiding");

  window.setTimeout(() => {
    notice.remove();
  }, COOKIE_HIDE_DELAY);
}

function openConsentUI({ force = false, returnFocusTo = null } = {}) {
  if (!force && (getConsent() !== null || isPrivacyPage())) return;

  document.querySelector(".cookie-notice")?.remove();

  const notice = buildCookieNotice();
  document.body.append(notice);

  const acceptButton = notice.querySelector("[data-cookie-accept]");
  const declineButton = notice.querySelector("[data-cookie-decline]");

  function closeNotice() {
    hideCookieNotice(notice);
    returnFocusTo?.focus();
  }

  acceptButton.addEventListener("click", () => {
    setConsent(CONSENT_GRANTED);
    setDisableFlag(false);
    closeNotice();
    maybeLoadAnalytics();
  });

  declineButton.addEventListener("click", () => {
    setConsent(CONSENT_DENIED);
    setDisableFlag(true);
    closeNotice();
    if (analyticsLoaded) {
      location.reload();
    }
  });

  notice.hidden = false;
  window.requestAnimationFrame(() => {
    notice.classList.add("is-visible");
    if (returnFocusTo) {
      acceptButton.focus();
    }
  });
}

function initConsent() {
  const consent = getConsent();

  if (consent === CONSENT_GRANTED) {
    setDisableFlag(false);
    maybeLoadAnalytics();
  } else if (consent === CONSENT_DENIED) {
    setDisableFlag(true);
  } else {
    openConsentUI();
  }
}

document.addEventListener("click", (event) => {
  const trigger = event.target.closest("[data-consent-settings]");
  if (!trigger) return;
  event.preventDefault();
  openConsentUI({ force: true, returnFocusTo: trigger });
});

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initConsent, { once: true });
} else {
  initConsent();
}
