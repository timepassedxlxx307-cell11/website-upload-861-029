(function () {
  var mobileButton = document.querySelector('[data-menu-toggle]');
  var mobileNav = document.querySelector('[data-mobile-nav]');

  if (mobileButton && mobileNav) {
    mobileButton.addEventListener('click', function () {
      mobileNav.classList.toggle('open');
    });
  }

  document.querySelectorAll('[data-top-search]').forEach(function (form) {
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      var input = form.querySelector('input[name="q"]');
      var query = input ? input.value.trim() : '';
      var target = './search.html';
      if (query) {
        target += '?q=' + encodeURIComponent(query);
      }
      window.location.href = target;
    });
  });

  var hero = document.querySelector('[data-hero]');
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var current = 0;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === current);
      });
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        showSlide(index);
      });
    });

    showSlide(0);
    window.setInterval(function () {
      showSlide(current + 1);
    }, 5200);
  }

  function filterCards(input, scope) {
    var cards = Array.prototype.slice.call(scope.querySelectorAll('[data-card]'));
    var empty = scope.querySelector('[data-empty]');
    var value = input.value.trim().toLowerCase();
    var visible = 0;

    cards.forEach(function (card) {
      var text = [
        card.getAttribute('data-title'),
        card.getAttribute('data-region'),
        card.getAttribute('data-year'),
        card.getAttribute('data-genre'),
        card.getAttribute('data-tags')
      ].join(' ').toLowerCase();
      var matched = !value || text.indexOf(value) !== -1;
      card.style.display = matched ? '' : 'none';
      if (matched) {
        visible += 1;
      }
    });

    if (empty) {
      empty.classList.toggle('visible', visible === 0);
    }
  }

  document.querySelectorAll('[data-card-filter]').forEach(function (input) {
    var selector = input.getAttribute('data-card-filter');
    var scope = selector ? document.querySelector(selector) : document;
    if (!scope) {
      return;
    }
    input.addEventListener('input', function () {
      filterCards(input, scope);
    });
  });

  var searchRoot = document.querySelector('[data-search-page]');
  if (searchRoot && Array.isArray(window.MOVIE_SEARCH_INDEX)) {
    var searchInput = searchRoot.querySelector('[data-search-input]');
    var results = searchRoot.querySelector('[data-search-results]');
    var emptySearch = searchRoot.querySelector('[data-empty]');
    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get('q') || '';

    function cardTemplate(movie) {
      var tagHtml = movie.tags.slice(0, 3).map(function (tag) {
        return '<span>' + escapeHtml(tag) + '</span>';
      }).join('');
      return [
        '<article class="movie-card" data-card>',
        '<a class="poster-link" href="' + escapeHtml(movie.url) + '" aria-label="' + escapeHtml(movie.title) + '">',
        '<img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
        '<span class="poster-shade"></span>',
        '<span class="play-chip">▶</span>',
        '</a>',
        '<div class="card-body">',
        '<a class="card-title" href="' + escapeHtml(movie.url) + '">' + escapeHtml(movie.title) + '</a>',
        '<p class="card-meta">' + escapeHtml(movie.year) + ' · ' + escapeHtml(movie.region) + ' · ' + escapeHtml(movie.type) + '</p>',
        '<p class="card-desc">' + escapeHtml(movie.oneLine) + '</p>',
        '<div class="tag-row">' + tagHtml + '</div>',
        '</div>',
        '</article>'
      ].join('');
    }

    function escapeHtml(value) {
      return String(value || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
    }

    function renderSearch() {
      var query = searchInput.value.trim().toLowerCase();
      var source = window.MOVIE_SEARCH_INDEX;
      var filtered = source.filter(function (movie) {
        if (!query) {
          return true;
        }
        return [movie.title, movie.region, movie.type, movie.year, movie.genre, movie.tags.join(' '), movie.oneLine]
          .join(' ')
          .toLowerCase()
          .indexOf(query) !== -1;
      }).slice(0, 120);

      results.innerHTML = filtered.map(cardTemplate).join('');
      if (emptySearch) {
        emptySearch.classList.toggle('visible', filtered.length === 0);
      }
    }

    if (searchInput) {
      searchInput.value = initialQuery;
      searchInput.addEventListener('input', renderSearch);
      renderSearch();
    }
  }
})();
