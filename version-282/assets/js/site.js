(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function bindNavigation() {
    var header = document.querySelector(".site-header");
    var toggle = document.querySelector(".nav-toggle");
    if (!header || !toggle) {
      return;
    }
    toggle.addEventListener("click", function () {
      var isOpen = header.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
    });
  }

  function bindHero() {
    var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
    if (slides.length < 2) {
      return;
    }
    var index = 0;
    var timer = null;

    function activate(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, position) {
        slide.classList.toggle("is-active", position === index);
      });
      dots.forEach(function (dot, position) {
        dot.classList.toggle("is-active", position === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        activate(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot, position) {
      dot.addEventListener("click", function () {
        activate(position);
        start();
      });
    });

    var hero = document.querySelector(".hero-carousel");
    if (hero) {
      hero.addEventListener("mouseenter", stop);
      hero.addEventListener("mouseleave", start);
    }

    start();
  }

  function getQueryParam(name) {
    var params = new URLSearchParams(window.location.search);
    return params.get(name) || "";
  }

  function bindSiteSearch() {
    var forms = Array.prototype.slice.call(document.querySelectorAll(".js-site-search"));
    forms.forEach(function (form) {
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        var input = form.querySelector("input[name='q']");
        var value = input ? input.value.trim() : "";
        var url = "./search.html";
        if (value) {
          url += "?q=" + encodeURIComponent(value);
        }
        window.location.href = url;
      });
    });
  }

  function bindFilters() {
    var panels = Array.prototype.slice.call(document.querySelectorAll(".filter-panel"));
    panels.forEach(function (panel) {
      var input = panel.querySelector(".js-local-search");
      var yearSelect = panel.querySelector(".js-year-filter");
      var typeSelect = panel.querySelector(".js-type-filter");
      var grid = panel.parentElement ? panel.parentElement.querySelector(".movie-grid") : null;
      var empty = panel.parentElement ? panel.parentElement.querySelector(".empty-state") : null;
      if (!grid) {
        return;
      }
      var cards = Array.prototype.slice.call(grid.querySelectorAll(".movie-card"));

      function applyFilter() {
        var keyword = input ? input.value.trim().toLowerCase() : "";
        var year = yearSelect ? yearSelect.value : "";
        var type = typeSelect ? typeSelect.value : "";
        var shown = 0;
        cards.forEach(function (card) {
          var search = (card.getAttribute("data-search") || "").toLowerCase();
          var cardYear = card.getAttribute("data-year") || "";
          var cardType = card.getAttribute("data-type") || "";
          var matchKeyword = !keyword || search.indexOf(keyword) !== -1;
          var matchYear = !year || cardYear.indexOf(year) !== -1;
          var matchType = !type || cardType.indexOf(type) !== -1;
          var visible = matchKeyword && matchYear && matchType;
          card.hidden = !visible;
          if (visible) {
            shown += 1;
          }
        });
        if (empty) {
          empty.hidden = shown !== 0;
        }
      }

      if (input) {
        input.addEventListener("input", applyFilter);
        var initial = getQueryParam("q");
        if (initial && document.body.contains(input)) {
          input.value = initial;
        }
      }
      if (yearSelect) {
        yearSelect.addEventListener("change", applyFilter);
      }
      if (typeSelect) {
        typeSelect.addEventListener("change", applyFilter);
      }
      applyFilter();
    });
  }

  ready(function () {
    bindNavigation();
    bindHero();
    bindSiteSearch();
    bindFilters();
  });
})();
