(function () {
  var menuButton = document.querySelector('[data-menu-toggle]');
  var mobileNav = document.querySelector('[data-mobile-nav]');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      mobileNav.classList.toggle('is-open');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
  var activeIndex = 0;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }

    activeIndex = (index + slides.length) % slides.length;

    slides.forEach(function (slide, currentIndex) {
      slide.classList.toggle('is-active', currentIndex === activeIndex);
    });

    dots.forEach(function (dot, currentIndex) {
      dot.classList.toggle('is-active', currentIndex === activeIndex);
    });
  }

  dots.forEach(function (dot, index) {
    dot.addEventListener('click', function () {
      showSlide(index);
    });
  });

  if (slides.length > 1) {
    window.setInterval(function () {
      showSlide(activeIndex + 1);
    }, 5200);
  }

  function applyLocalFilter(input) {
    var targetSelector = input.getAttribute('data-target');
    var target = targetSelector ? document.querySelector(targetSelector) : document;

    if (!target) {
      return;
    }

    var cards = Array.prototype.slice.call(target.querySelectorAll('[data-movie-card]'));
    var value = input.value.trim().toLowerCase();

    cards.forEach(function (card) {
      var filterText = (card.getAttribute('data-filter') || '').toLowerCase();
      card.classList.toggle('is-hidden-card', value && filterText.indexOf(value) === -1);
    });
  }

  Array.prototype.slice.call(document.querySelectorAll('[data-local-filter]')).forEach(function (input) {
    input.addEventListener('input', function () {
      applyLocalFilter(input);
    });
  });

  Array.prototype.slice.call(document.querySelectorAll('[data-filter-chip]')).forEach(function (button) {
    button.addEventListener('click', function () {
      var panel = button.closest('.local-filter-panel');
      var input = panel ? panel.querySelector('[data-local-filter]') : document.querySelector('[data-local-filter]');
      var value = button.getAttribute('data-filter-chip') || '';

      if (input) {
        input.value = value;
        applyLocalFilter(input);
      }

      if (panel) {
        Array.prototype.slice.call(panel.querySelectorAll('[data-filter-chip]')).forEach(function (item) {
          item.classList.toggle('is-active', item === button);
        });
      }
    });
  });
})();
