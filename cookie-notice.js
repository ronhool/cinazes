const COOKIE_NOTICE_KEY = "cinazes_cookie_notice_seen";
const COOKIE_NOTICE_VALUE = "seen";
const COOKIE_HIDE_DELAY = 180;
const COOKIE_AUTO_HIDE_DELAY = 5000;

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

function hasCookieConsent() {
  return getAvailableStorages().some((storage) => storage.getItem(COOKIE_NOTICE_KEY) === COOKIE_NOTICE_VALUE);
}

function setCookieConsent() {
  for (const storage of getAvailableStorages()) {
    storage.setItem(COOKIE_NOTICE_KEY, COOKIE_NOTICE_VALUE);
  }
}

function resolvePolicyHref() {
  const script = document.currentScript;
  const siteRoot = script?.dataset.siteRoot || "/";
  return new URL(`${siteRoot}privacy/`, window.location.href).href;
}

function buildCookieNotice() {
  const notice = document.createElement("aside");
  notice.className = "cookie-notice";
  notice.hidden = true;
  notice.setAttribute("aria-live", "polite");
  notice.setAttribute("aria-label", "Уведомление о cookie");

  notice.innerHTML = `
    <div class="cookie-notice__inner">
      <div class="cookie-notice__copy">
        <p class="cookie-notice__title">Сайт использует cookie.</p>
        <p class="cookie-notice__text">Спокойно: ничего подозрительнее типографики здесь не происходит.</p>
      </div>
      <div class="cookie-notice__actions">
        <button type="button" class="cookie-notice__button" data-cookie-accept>ок</button>
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

function showCookieNotice() {
  if (hasCookieConsent() || isPrivacyPage()) return;

  const notice = buildCookieNotice();
  document.body.append(notice);

  const acceptButton = notice.querySelector("[data-cookie-accept]");
  const policyLink = notice.querySelector(".cookie-notice__link");
  let autoHideTimer;

  function dismissCookieNotice() {
    window.clearTimeout(autoHideTimer);
    window.removeEventListener("scroll", dismissCookieNotice);
    setCookieConsent();
    hideCookieNotice(notice);
  }

  acceptButton?.addEventListener("click", () => {
    dismissCookieNotice();
  });

  policyLink?.addEventListener("click", (event) => {
    event.preventDefault();
    dismissCookieNotice();
    window.setTimeout(() => {
      window.location.href = policyLink.href;
    }, COOKIE_HIDE_DELAY);
  });

  notice.hidden = false;
  window.requestAnimationFrame(() => {
    notice.classList.add("is-visible");
  });

  autoHideTimer = window.setTimeout(dismissCookieNotice, COOKIE_AUTO_HIDE_DELAY);
  window.addEventListener("scroll", dismissCookieNotice, { passive: true, once: true });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", showCookieNotice, { once: true });
} else {
  showCookieNotice();
}
