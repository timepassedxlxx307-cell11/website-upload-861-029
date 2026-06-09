(function () {
  function setupMoviePlayer(sourceUrl) {
    var video = document.querySelector(".js-player");
    var triggers = Array.prototype.slice.call(document.querySelectorAll(".js-play-trigger"));
    var overlay = document.querySelector(".player-overlay");
    var started = false;
    var hls = null;

    if (!video || !sourceUrl) {
      return;
    }

    function startPlayback() {
      if (started) {
        video.play().catch(function () {});
        return;
      }

      started = true;
      if (overlay) {
        overlay.classList.add("is-hidden");
      }
      video.controls = true;

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = sourceUrl;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(sourceUrl);
        hls.attachMedia(video);
      } else {
        video.src = sourceUrl;
      }

      video.play().catch(function () {});
    }

    triggers.forEach(function (trigger) {
      trigger.addEventListener("click", startPlayback);
    });

    video.addEventListener("click", function () {
      if (!started) {
        startPlayback();
      }
    });

    window.addEventListener("pagehide", function () {
      if (hls && hls.destroy) {
        hls.destroy();
      }
    });
  }

  window.setupMoviePlayer = setupMoviePlayer;
})();
