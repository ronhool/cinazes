const timeNodes = document.querySelectorAll("[data-moscow-time]");
const disabledNavLinks = document.querySelectorAll("[data-disabled-link]");
const mobileMenus = document.querySelectorAll("[data-mobile-menu]");

function moscowTimeLabel() {
  const time = new Intl.DateTimeFormat("ru-RU", {
    timeZone: "Europe/Moscow",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date());

  const [hours = "--", minutes = "--"] = time.split(":");
  return `москва ${hours}<span class="time-colon">:</span>${minutes}`;
}

function updateMoscowTime() {
  const label = moscowTimeLabel();
  for (const node of timeNodes) {
    node.innerHTML = label;
  }
}

function scheduleMoscowTime() {
  updateMoscowTime();

  const now = new Date();
  const delay = (60 - now.getSeconds()) * 1000 - now.getMilliseconds();

  window.setTimeout(() => {
    updateMoscowTime();
    window.setInterval(updateMoscowTime, 60000);
  }, delay);
}

function setupLabMenu(menu) {
  const trigger = menu.querySelector("[data-lab-trigger]");
  if (!trigger) return;

  function setPinned(isPinned) {
    menu.classList.toggle("is-pinned", isPinned);
    trigger.setAttribute("aria-expanded", String(isPinned));
  }

  trigger.addEventListener("click", (event) => {
    event.preventDefault();
    setPinned(!menu.classList.contains("is-pinned"));
  });

  document.addEventListener("click", (event) => {
    if (!menu.contains(event.target)) setPinned(false);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") setPinned(false);
  });
}

function setupMobileMenu(menu) {
  const toggle = menu.querySelector("[data-mobile-toggle]");
  const panel = menu.querySelector("[data-mobile-panel]");
  const close = menu.querySelector("[data-mobile-close]");
  const labTrigger = menu.querySelector("[data-mobile-lab-trigger]");
  const labSection = menu.querySelector("[data-mobile-lab]");

  if (!toggle || !panel) return;

  function setMenuOpen(isOpen) {
    menu.classList.toggle("is-mobile-open", isOpen);
    toggle.setAttribute("aria-expanded", String(isOpen));
  }

  function setLabOpen(isOpen) {
    if (!labSection || !labTrigger) return;
    labSection.classList.toggle("is-open", isOpen);
    labTrigger.setAttribute("aria-expanded", String(isOpen));
  }

  toggle.addEventListener("click", () => {
    setMenuOpen(!menu.classList.contains("is-mobile-open"));
  });

  if (close) {
    close.addEventListener("click", () => setMenuOpen(false));
  }

  if (labTrigger) {
    labTrigger.addEventListener("click", () => {
      setLabOpen(!labSection.classList.contains("is-open"));
    });
  }

  document.addEventListener("click", (event) => {
    if (!menu.contains(event.target)) setMenuOpen(false);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      setMenuOpen(false);
      setLabOpen(false);
    }
  });
}

function findNavLinkByText(selector, text) {
  for (const link of document.querySelectorAll(selector)) {
    if (link.textContent.trim() === text) return link;
  }
  return null;
}

function syncFontsNavActive() {
  const path = window.location.pathname;
  const isFontsSection =
    path === "/fonts-test" ||
    path.startsWith("/fonts-test/") ||
    path.startsWith("/fonts/");
  if (!isFontsSection) return;

  const desktopLink = findNavLinkByText(".nav-group a", "шрифты");
  if (desktopLink) desktopLink.classList.add("nav-active");
}

function syncMobileNavActive() {
  const activeLink = document.querySelector(".nav-group a.nav-active");
  if (activeLink) {
    const href = activeLink.getAttribute("href");
    if (href === "#") {
      const mobileLink = findNavLinkByText(".head-mobile-nav a", activeLink.textContent.trim());
      if (mobileLink) mobileLink.classList.add("nav-active");
    } else {
      for (const mobileLink of document.querySelectorAll(".head-mobile-nav a")) {
        if (mobileLink.getAttribute("href") === href) {
          mobileLink.classList.add("nav-active");
        }
      }
    }
  }

  const activeTrigger = document.querySelector(".nav-trigger.nav-active");
  if (activeTrigger) {
    const mobileTrigger = document.querySelector(".mobile-lab-trigger");
    if (mobileTrigger) mobileTrigger.classList.add("nav-active");
  }
}

scheduleMoscowTime();
syncFontsNavActive();
syncMobileNavActive();

for (const menu of document.querySelectorAll("[data-lab-menu]")) {
  setupLabMenu(menu);
}

for (const menu of mobileMenus) {
  setupMobileMenu(menu);
}

for (const link of disabledNavLinks) {
  link.addEventListener("click", (event) => {
    event.preventDefault();
  });
}
