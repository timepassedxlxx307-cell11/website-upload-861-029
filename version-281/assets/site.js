const normalizeText = (value) => (value || "").toString().toLowerCase().trim();

function setupMobileMenu() {
  const button = document.querySelector("[data-menu-button]");
  const menu = document.querySelector("[data-mobile-menu]");
  if (!button || !menu) {
    return;
  }

  button.addEventListener("click", () => {
    const isOpen = button.getAttribute("aria-expanded") === "true";
    button.setAttribute("aria-expanded", String(!isOpen));
    menu.hidden = isOpen;
  });
}

function setupHero() {
  const hero = document.querySelector("[data-hero]");
  if (!hero) {
    return;
  }

  const slides = Array.from(hero.querySelectorAll("[data-hero-slide]"));
  const dots = Array.from(hero.querySelectorAll("[data-hero-dot]"));
  const prev = hero.querySelector("[data-hero-prev]");
  const next = hero.querySelector("[data-hero-next]");
  let current = 0;
  let timer = null;

  const show = (index) => {
    current = (index + slides.length) % slides.length;
    slides.forEach((slide, slideIndex) => {
      slide.classList.toggle("is-active", slideIndex === current);
    });
    dots.forEach((dot, dotIndex) => {
      dot.classList.toggle("is-active", dotIndex === current);
    });
  };

  const start = () => {
    stop();
    timer = window.setInterval(() => show(current + 1), 5200);
  };

  const stop = () => {
    if (timer) {
      window.clearInterval(timer);
      timer = null;
    }
  };

  prev?.addEventListener("click", () => {
    show(current - 1);
    start();
  });

  next?.addEventListener("click", () => {
    show(current + 1);
    start();
  });

  dots.forEach((dot) => {
    dot.addEventListener("click", () => {
      show(Number(dot.dataset.heroDot || 0));
      start();
    });
  });

  hero.addEventListener("mouseenter", stop);
  hero.addEventListener("mouseleave", start);
  show(0);
  start();
}

function setupFilters() {
  const inputs = Array.from(document.querySelectorAll("[data-filter-input]"));
  const selects = Array.from(document.querySelectorAll("[data-filter-select]"));
  const cards = Array.from(document.querySelectorAll(".movie-card"));

  if (!cards.length || (!inputs.length && !selects.length)) {
    return;
  }

  const apply = () => {
    const query = normalizeText(inputs.map((input) => input.value).join(" "));
    const selected = selects.map((select) => ({
      field: select.dataset.filterSelect,
      value: normalizeText(select.value)
    })).filter((item) => item.value);

    cards.forEach((card) => {
      const searchText = normalizeText([
        card.dataset.title,
        card.dataset.genre,
        card.dataset.tags,
        card.dataset.region,
        card.dataset.type,
        card.textContent
      ].join(" "));
      const queryMatch = !query || searchText.includes(query);
      const selectMatch = selected.every((item) => normalizeText(card.dataset[item.field]).includes(item.value));
      card.classList.toggle("is-hidden", !(queryMatch && selectMatch));
    });
  };

  inputs.forEach((input) => input.addEventListener("input", apply));
  selects.forEach((select) => select.addEventListener("change", apply));

  const params = new URLSearchParams(window.location.search);
  const query = params.get("q");
  if (query && inputs[0]) {
    inputs[0].value = query;
  }

  const focusTarget = document.querySelector("[data-search-autofocus]");
  if (focusTarget && !query) {
    window.setTimeout(() => focusTarget.focus(), 120);
  }

  apply();
}

setupMobileMenu();
setupHero();
setupFilters();
