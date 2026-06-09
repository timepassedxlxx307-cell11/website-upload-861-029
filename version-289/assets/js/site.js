(function() {
  var menuButton = document.querySelector("[data-menu-toggle]");
  var mobileNav = document.querySelector("[data-mobile-nav]");

  if (menuButton && mobileNav) {
    menuButton.addEventListener("click", function() {
      mobileNav.classList.toggle("is-open");
    });
  }

  var slider = document.querySelector("[data-hero-slider]");
  if (slider) {
    var slides = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-dot]"));
    var current = 0;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function(slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === current);
      });
      dots.forEach(function(dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === current);
      });
    }

    dots.forEach(function(dot, index) {
      dot.addEventListener("click", function() {
        show(index);
      });
    });

    if (slides.length > 1) {
      window.setInterval(function() {
        show(current + 1);
      }, 5200);
    }
  }

  var filterInput = document.querySelector("[data-filter-input]");
  var filterList = document.querySelector("[data-filter-list]");
  var emptyState = document.querySelector("[data-empty-state]");
  var categoryButtons = Array.prototype.slice.call(document.querySelectorAll("[data-category-filter]"));
  var activeCategory = "all";

  function normalize(value) {
    return String(value || "").toLowerCase().replace(/\s+/g, " ").trim();
  }

  function applyFilter() {
    if (!filterList) {
      return;
    }

    var query = normalize(filterInput ? filterInput.value : "");
    var cards = Array.prototype.slice.call(filterList.querySelectorAll(".filter-card"));
    var visible = 0;

    cards.forEach(function(card) {
      var text = normalize(card.getAttribute("data-filter-text"));
      var category = card.getAttribute("data-category") || "";
      var matchText = !query || text.indexOf(query) !== -1;
      var matchCategory = activeCategory === "all" || category === activeCategory;
      var matched = matchText && matchCategory;
      card.setAttribute("data-filter-hidden", matched ? "false" : "true");
      if (matched) {
        visible += 1;
      }
    });

    if (emptyState) {
      emptyState.classList.toggle("is-visible", visible === 0);
    }
  }

  if (filterInput) {
    var params = new URLSearchParams(window.location.search);
    var q = params.get("q");
    if (q) {
      filterInput.value = q;
    }
    filterInput.addEventListener("input", applyFilter);
  }

  categoryButtons.forEach(function(button) {
    button.addEventListener("click", function() {
      activeCategory = button.getAttribute("data-category-filter") || "all";
      categoryButtons.forEach(function(item) {
        item.classList.toggle("is-active", item === button);
      });
      applyFilter();
    });
  });

  applyFilter();
})();
