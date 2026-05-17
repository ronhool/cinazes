const COOKIE_NOTICE_KEY = "cinazes-cookie-consent";
const COOKIE_NOTICE_VALUE = "accepted";
const COOKIE_HIDE_DELAY = 180;

function isPrivacyPage() {
  const { pathname } = window.location;
  return pathname.endsWith("/privacy") || pathname.endsWith("/privacy/");
}

function storageAvailable() {
  try {
    window.localStorage.setItem("__cinazes_test__", "1");
    window.localStorage.removeItem("__cinazes_test__");
    return true;
  } catch {
    return false;
  }
}

function hasCookieConsent() {
  if (!storageAvailable()) return false;
  return window.localStorage.getItem(COOKIE_NOTICE_KEY) === COOKIE_NOTICE_VALUE;
}

function setCookieConsent() {
  if (!storageAvailable()) return;
  window.localStorage.setItem(COOKIE_NOTICE_KEY, COOKIE_NOTICE_VALUE);
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

  acceptButton?.addEventListener("click", () => {
    setCookieConsent();
    hideCookieNotice(notice);
  });

  policyLink?.addEventListener("click", (event) => {
    event.preventDefault();
    setCookieConsent();
    hideCookieNotice(notice);
    window.setTimeout(() => {
      window.location.href = policyLink.href;
    }, COOKIE_HIDE_DELAY);
  });

  notice.hidden = false;
  window.requestAnimationFrame(() => {
    notice.classList.add("is-visible");
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", showCookieNotice, { once: true });
} else {
  showCookieNotice();
}
