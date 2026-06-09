(function () {
  var video = document.querySelector('[data-player-video]');
  var cover = document.querySelector('[data-player-button]');
  var status = document.querySelector('[data-player-status]');
  var hlsInstance = null;
  var started = false;

  if (!video || !cover || !window.QIQI_STREAM) {
    return;
  }

  function setStatus(text) {
    if (status) {
      status.textContent = text;
    }
  }

  function attachSource() {
    if (started) {
      return;
    }
    started = true;
    setStatus('加载中');

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = window.QIQI_STREAM;
    } else if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 60
      });
      hlsInstance.loadSource(window.QIQI_STREAM);
      hlsInstance.attachMedia(video);
      hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
        if (data && data.fatal) {
          setStatus('播放受阻');
          if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
            hlsInstance.startLoad();
          } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
            hlsInstance.recoverMediaError();
          } else {
            hlsInstance.destroy();
          }
        }
      });
    } else {
      video.src = window.QIQI_STREAM;
    }
  }

  function playVideo() {
    attachSource();
    cover.classList.add('is-hidden');
    video.controls = true;
    var playPromise = video.play();
    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.then(function () {
        setStatus('播放中');
      }).catch(function () {
        cover.classList.remove('is-hidden');
        setStatus('点击播放');
      });
    }
  }

  cover.addEventListener('click', playVideo);
  video.addEventListener('click', function () {
    if (!started) {
      playVideo();
    }
  });
  video.addEventListener('playing', function () {
    setStatus('播放中');
  });
  video.addEventListener('pause', function () {
    if (started) {
      setStatus('已暂停');
    }
  });
})();
