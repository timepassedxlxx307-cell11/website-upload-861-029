(function () {
    const frame = document.querySelector('[data-stream]');
    if (!frame) {
        return;
    }

    const video = frame.querySelector('video');
    const button = frame.querySelector('.play-layer');
    const stream = frame.getAttribute('data-stream');
    let hlsInstance = null;
    let prepared = false;

    function prepare() {
        if (!video || !stream || prepared) {
            return;
        }

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = stream;
        } else if (window.Hls && window.Hls.isSupported()) {
            hlsInstance = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hlsInstance.loadSource(stream);
            hlsInstance.attachMedia(video);
        } else {
            video.src = stream;
        }

        prepared = true;
    }

    function start() {
        prepare();
        frame.classList.add('is-playing');
        if (video) {
            const playAction = video.play();
            if (playAction && typeof playAction.catch === 'function') {
                playAction.catch(function () {});
            }
        }
    }

    if (button) {
        button.addEventListener('click', start);
    }

    if (video) {
        video.addEventListener('click', function () {
            if (video.paused) {
                start();
            }
        });
        video.addEventListener('play', function () {
            frame.classList.add('is-playing');
        });
    }

    window.addEventListener('pagehide', function () {
        if (hlsInstance) {
            hlsInstance.destroy();
        }
    });
}());
