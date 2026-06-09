import { H as Hls } from "../vendor/hls-dru42stk.js";

export function initMoviePlayer(source) {
  var video = document.getElementById('movie-player');
  var overlay = document.querySelector('[data-play-overlay]');
  var hlsInstance = null;
  var isBound = false;

  if (!video || !source) {
    return;
  }

  function bindSource() {
    if (isBound) {
      return;
    }

    isBound = true;

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
      return;
    }

    if (Hls.isSupported()) {
      hlsInstance = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90
      });

      hlsInstance.loadSource(source);
      hlsInstance.attachMedia(video);
      hlsInstance.on(Hls.Events.ERROR, function (eventName, data) {
        if (data && data.fatal && hlsInstance) {
          if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
            hlsInstance.startLoad();
          } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
            hlsInstance.recoverMediaError();
          }
        }
      });
      return;
    }

    video.src = source;
  }

  function startPlayback() {
    bindSource();

    if (overlay) {
      overlay.classList.add('is-hidden');
    }

    var playAttempt = video.play();

    if (playAttempt && typeof playAttempt.catch === 'function') {
      playAttempt.catch(function () {
        if (overlay) {
          overlay.classList.remove('is-hidden');
        }
      });
    }
  }

  if (overlay) {
    overlay.addEventListener('click', startPlayback);
  }

  video.addEventListener('play', function () {
    bindSource();

    if (overlay) {
      overlay.classList.add('is-hidden');
    }
  });

  window.addEventListener('pagehide', function () {
    if (hlsInstance) {
      hlsInstance.destroy();
      hlsInstance = null;
    }
  });
}
