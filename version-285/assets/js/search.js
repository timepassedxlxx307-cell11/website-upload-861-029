(function () {
  var data = window.QIQI_SEARCH_DATA || [];
  var input = document.getElementById('site-search-input');
  var genreFilter = document.getElementById('genre-filter');
  var yearFilter = document.getElementById('year-filter');
  var results = document.getElementById('search-results');

  if (!input || !genreFilter || !yearFilter || !results) {
    return;
  }

  var years = Array.prototype.slice.call(new Set(data.map(function (movie) {
    return movie.year;
  }).filter(Boolean))).sort(function (a, b) {
    return String(b).localeCompare(String(a));
  });

  years.forEach(function (year) {
    var option = document.createElement('option');
    option.value = year;
    option.textContent = year;
    yearFilter.appendChild(option);
  });

  function movieHtml(movie) {
    var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
      return '<span>' + escapeHtml(tag) + '</span>';
    }).join('');

    return '<a class="movie-card" href="' + escapeHtml(movie.url) + '" data-movie-card>' +
      '<span class="poster-frame">' +
      '<img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + ' 在线观看" loading="lazy">' +
      '<span class="poster-badge">HD</span>' +
      '<span class="poster-score">' + escapeHtml(movie.rating) + '</span>' +
      '</span>' +
      '<span class="movie-card-body">' +
      '<strong>' + escapeHtml(movie.title) + '</strong>' +
      '<em>' + escapeHtml(movie.summary) + '</em>' +
      '<span class="movie-meta-line">' + escapeHtml(movie.year) + ' · ' + escapeHtml(movie.region) + ' · ' + escapeHtml(movie.type) + '</span>' +
      '<span class="movie-tags">' + tags + '</span>' +
      '</span>' +
      '</a>';
  }

  function escapeHtml(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function render() {
    var keyword = input.value.trim().toLowerCase();
    var genre = genreFilter.value;
    var year = yearFilter.value;

    var matched = data.filter(function (movie) {
      var text = [movie.title, movie.region, movie.type, movie.year, movie.genre, (movie.tags || []).join(' '), movie.summary].join(' ').toLowerCase();
      var keywordMatched = !keyword || text.indexOf(keyword) !== -1;
      var genreMatched = !genre || movie.genre.indexOf(genre) !== -1;
      var yearMatched = !year || movie.year === year;
      return keywordMatched && genreMatched && yearMatched;
    }).slice(0, 120);

    results.innerHTML = matched.map(movieHtml).join('');
  }

  var params = new URLSearchParams(window.location.search);
  var initialKeyword = params.get('q');

  if (initialKeyword) {
    input.value = initialKeyword;
  }

  input.addEventListener('input', render);
  genreFilter.addEventListener('change', render);
  yearFilter.addEventListener('change', render);
  render();
})();
