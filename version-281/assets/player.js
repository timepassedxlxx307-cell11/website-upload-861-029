import { H as Hls } from "./hls-dru42stk.js";

export function initMoviePlayer(options) {
  const video = document.querySelector(options.videoSelector);
  const overlay = document.querySelector(options.overlaySelector);
  const button = document.querySelector(options.buttonSelector);
  const source = options.source;
  let attached = false;
  let hls = null;

  if (!video || !source) {
    return;
  }

  const attach = () => {
    if (attached) {
      return;
    }

    attached = true;

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = source;
      return;
    }

    if (Hls.isSupported()) {
      hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(source);
      hls.attachMedia(video);
      return;
    }

    video.src = source;
  };

  const play = () => {
    attach();
    overlay?.classList.add("is-hidden");
    const promise = video.play();
    if (promise && typeof promise.catch === "function") {
      promise.catch(() => {
        overlay?.classList.remove("is-hidden");
      });
    }
  };

  button?.addEventListener("click", play);
  overlay?.addEventListener("click", play);

  video.addEventListener("play", () => {
    overlay?.classList.add("is-hidden");
  });

  video.addEventListener("ended", () => {
    overlay?.classList.remove("is-hidden");
  });

  window.addEventListener("pagehide", () => {
    if (hls) {
      hls.destroy();
      hls = null;
    }
  });
}
