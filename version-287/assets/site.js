(function() {
  function $(selector, root) {
    return (root || document).querySelector(selector);
  }

  function $all(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function normalize(value) {
    return String(value || '').trim().toLowerCase();
  }

  function matchItem(item, query) {
    var value = normalize([
      item.title,
      item.year,
      item.region,
      item.type,
      item.genre,
      (item.tags || []).join(' '),
      item.summary
    ].join(' '));
    return value.indexOf(normalize(query)) !== -1;
  }

  function renderQuickResults(box, query) {
    var list = window.SEARCH_INDEX || [];
    if (!box || normalize(query).length < 1) {
      if (box) {
        box.innerHTML = '';
        box.classList.remove('show');
      }
      return;
    }
    var hits = list.filter(function(item) {
      return matchItem(item, query);
    }).slice(0, 8);
    box.innerHTML = hits.map(function(item) {
      return '<a class="quick-result-item" href="' + item.url + '">' +
        '<img src="' + item.cover + '" alt="' + item.title.replace(/"/g, '&quot;') + '">' +
        '<span><strong>' + item.title + '</strong><small>' + item.year + ' · ' + item.region + ' · ' + item.type + '</small></span>' +
        '</a>';
    }).join('');
    box.classList.toggle('show', hits.length > 0);
  }

  function initHeader() {
    var toggle = $('[data-menu-toggle]');
    var panel = $('[data-mobile-panel]');
    if (toggle && panel) {
      toggle.addEventListener('click', function() {
        panel.classList.toggle('open');
        toggle.classList.toggle('open');
      });
    }

    $all('[data-global-search]').forEach(function(form) {
      var input = form.querySelector('input[type="search"]');
      var results = form.querySelector('[data-search-results]');
      if (!input || !results) {
        return;
      }
      input.addEventListener('input', function() {
        renderQuickResults(results, input.value);
      });
      document.addEventListener('click', function(event) {
        if (!form.contains(event.target)) {
          results.classList.remove('show');
        }
      });
    });
  }

  function initHero() {
    var hero = $('[data-hero]');
    if (!hero) {
      return;
    }
    var slides = $all('[data-hero-slide]', hero);
    var dots = $all('[data-hero-dot]', hero);
    var index = 0;
    function go(next) {
      if (!slides.length) {
        return;
      }
      index = (next + slides.length) % slides.length;
      slides.forEach(function(slide, i) {
        slide.classList.toggle('active', i === index);
      });
      dots.forEach(function(dot, i) {
        dot.classList.toggle('active', i === index);
      });
    }
    dots.forEach(function(dot, i) {
      dot.addEventListener('click', function() {
        go(i);
      });
    });
    if (slides.length > 1) {
      window.setInterval(function() {
        go(index + 1);
      }, 5200);
    }
  }

  function initFilters() {
    $all('[data-filter-panel]').forEach(function(panel) {
      var main = panel.closest('main') || document;
      var cards = $all('.movie-card, .wide-card', main);
      var text = $('[data-filter-text]', panel);
      var type = $('[data-filter-type]', panel);
      var genre = $('[data-filter-genre]', panel);
      function apply() {
        var q = normalize(text ? text.value : '');
        var t = normalize(type ? type.value : '');
        var g = normalize(genre ? genre.value : '');
        cards.forEach(function(card) {
          var haystack = normalize([
            card.dataset.title,
            card.dataset.tags,
            card.dataset.year,
            card.dataset.type,
            card.dataset.region
          ].join(' '));
          var ok = true;
          if (q && haystack.indexOf(q) === -1) {
            ok = false;
          }
          if (t && normalize(card.dataset.type).indexOf(t) === -1) {
            ok = false;
          }
          if (g && haystack.indexOf(g) === -1) {
            ok = false;
          }
          card.hidden = !ok;
        });
      }
      [text, type, genre].forEach(function(control) {
        if (control) {
          control.addEventListener('input', apply);
          control.addEventListener('change', apply);
        }
      });
    });
  }

  function initSearchPage() {
    var form = $('[data-search-page-form]');
    var input = $('[data-search-page-input]');
    var results = $('[data-search-page-results]');
    if (!form || !input || !results) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var initial = params.get('q') || '';
    input.value = initial;
    function render(query) {
      var list = window.SEARCH_INDEX || [];
      var hits = query ? list.filter(function(item) {
        return matchItem(item, query);
      }) : list.slice(0, 60);
      results.innerHTML = hits.slice(0, 120).map(function(item) {
        return '<article class="search-card">' +
          '<a href="' + item.url + '"><img src="' + item.cover + '" alt="' + item.title.replace(/"/g, '&quot;') + '" loading="lazy"></a>' +
          '<div><h2><a href="' + item.url + '">' + item.title + '</a></h2>' +
          '<p class="movie-meta">' + item.year + ' · ' + item.region + ' · ' + item.type + ' · ' + item.genre + '</p>' +
          '<p>' + item.summary + '</p><a class="text-link" href="' + item.url + '">查看详情</a></div>' +
          '</article>';
      }).join('');
    }
    render(initial);
    form.addEventListener('submit', function(event) {
      event.preventDefault();
      var query = input.value.trim();
      var url = query ? './search.html?q=' + encodeURIComponent(query) : './search.html';
      window.history.replaceState(null, '', url);
      render(query);
    });
  }

  function attachNative(video, stream) {
    video.src = stream;
  }

  function attachHls(video, stream, root) {
    var hls = new Hls({
      enableWorker: true,
      lowLatencyMode: true
    });
    hls.loadSource(stream);
    hls.attachMedia(video);
    hls.on(Hls.Events.MANIFEST_PARSED, function() {
      if (root.classList.contains('is-playing')) {
        video.play().catch(function() {});
      }
    });
  }

  window.initMoviePlayer = function(id, stream) {
    var root = document.getElementById(id);
    if (!root) {
      return;
    }
    var video = root.querySelector('video');
    var cover = root.querySelector('.player-cover');
    var loaded = false;
    if (!video || !cover) {
      return;
    }
    function load() {
      if (loaded) {
        return;
      }
      loaded = true;
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        attachNative(video, stream);
      } else if (window.Hls && window.Hls.isSupported()) {
        attachHls(video, stream, root);
      } else {
        attachNative(video, stream);
      }
    }
    function start() {
      load();
      root.classList.add('is-playing');
      video.controls = true;
      video.play().catch(function() {});
    }
    cover.addEventListener('click', start);
    video.addEventListener('click', function() {
      if (video.paused) {
        start();
      }
    });
  };

  document.addEventListener('DOMContentLoaded', function() {
    initHeader();
    initHero();
    initFilters();
    initSearchPage();
  });
})();
