(function () {
    "use strict";

    function normalize(value) {
        return String(value || "").trim().toLowerCase();
    }

    function showCount(panel, visible, total) {
        var target = panel.querySelector("[data-result-count]");
        if (target) {
            target.textContent = visible + " / " + total + " 部";
        }
    }

    function setupMenu() {
        var toggle = document.querySelector("[data-menu-toggle]");
        var nav = document.querySelector("[data-mobile-nav]");
        if (!toggle || !nav) {
            return;
        }
        toggle.addEventListener("click", function () {
            nav.classList.toggle("is-open");
        });
    }

    function setupFilters() {
        var panels = document.querySelectorAll("[data-filter-panel]");
        panels.forEach(function (panel) {
            var scope = panel.parentElement || document;
            var cards = Array.prototype.slice.call(scope.querySelectorAll("[data-movie-card]"));
            var input = panel.querySelector("[data-filter-input]");
            var year = panel.querySelector("[data-filter-year]");
            var type = panel.querySelector("[data-filter-type]");
            var category = panel.querySelector("[data-filter-category]");
            var reset = panel.querySelector("[data-filter-reset]");

            function apply() {
                var query = normalize(input && input.value);
                var selectedYear = normalize(year && year.value);
                var selectedType = normalize(type && type.value);
                var selectedCategory = normalize(category && category.value);
                var visible = 0;

                cards.forEach(function (card) {
                    var text = normalize(card.getAttribute("data-search"));
                    var cardYear = normalize(card.getAttribute("data-year"));
                    var cardType = normalize(card.getAttribute("data-type"));
                    var cardCategory = normalize(card.getAttribute("data-category"));
                    var matched = true;

                    if (query && text.indexOf(query) === -1) {
                        matched = false;
                    }
                    if (selectedYear && cardYear !== selectedYear) {
                        matched = false;
                    }
                    if (selectedType && cardType !== selectedType) {
                        matched = false;
                    }
                    if (selectedCategory && cardCategory !== selectedCategory) {
                        matched = false;
                    }

                    card.classList.toggle("is-hidden", !matched);
                    if (matched) {
                        visible += 1;
                    }
                });

                showCount(panel, visible, cards.length);
            }

            [input, year, type, category].forEach(function (control) {
                if (control) {
                    control.addEventListener("input", apply);
                    control.addEventListener("change", apply);
                }
            });

            if (reset) {
                reset.addEventListener("click", function () {
                    if (input) {
                        input.value = "";
                    }
                    if (year) {
                        year.value = "";
                    }
                    if (type) {
                        type.value = "";
                    }
                    if (category) {
                        category.value = "";
                    }
                    apply();
                });
            }

            var params = new URLSearchParams(window.location.search);
            var searchFromUrl = params.get("q") || params.get("search");
            if (input && searchFromUrl) {
                input.value = searchFromUrl;
            }

            apply();
        });
    }

    function setupHero() {
        var slider = document.querySelector("[data-hero-slider]");
        if (!slider) {
            return;
        }

        var slides = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-dot]"));
        var prev = slider.querySelector("[data-hero-prev]");
        var next = slider.querySelector("[data-hero-next]");
        var index = 0;
        var timer = null;

        function go(toIndex) {
            if (!slides.length) {
                return;
            }
            index = (toIndex + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle("is-active", i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle("is-active", i === index);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                go(index + 1);
            }, 5600);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        dots.forEach(function (dot, i) {
            dot.addEventListener("click", function () {
                go(i);
                start();
            });
        });

        if (prev) {
            prev.addEventListener("click", function () {
                go(index - 1);
                start();
            });
        }

        if (next) {
            next.addEventListener("click", function () {
                go(index + 1);
                start();
            });
        }

        slider.addEventListener("mouseenter", stop);
        slider.addEventListener("mouseleave", start);
        go(0);
        start();
    }

    function loadHls(callback, fail) {
        if (window.Hls) {
            callback();
            return;
        }

        var existing = document.querySelector("script[data-hls-loader]");
        if (existing) {
            existing.addEventListener("load", callback, { once: true });
            existing.addEventListener("error", fail, { once: true });
            return;
        }

        var script = document.createElement("script");
        script.src = "https://cdn.jsdelivr.net/npm/hls.js@1/dist/hls.min.js";
        script.async = true;
        script.setAttribute("data-hls-loader", "true");
        script.addEventListener("load", callback, { once: true });
        script.addEventListener("error", fail, { once: true });
        document.head.appendChild(script);
    }

    function setupPlayers() {
        var players = document.querySelectorAll("[data-player]");

        players.forEach(function (player) {
            var video = player.querySelector("[data-video]");
            var button = player.querySelector("[data-play-button]");
            var status = player.querySelector("[data-player-status]");
            var src = player.getAttribute("data-hls-src");
            var hlsInstance = null;

            if (!video || !src) {
                return;
            }

            function setStatus(text) {
                if (status) {
                    status.textContent = text;
                }
            }

            function attachSource(done) {
                if (player.getAttribute("data-ready") === "true") {
                    done();
                    return;
                }

                if (video.canPlayType("application/vnd.apple.mpegurl")) {
                    video.src = src;
                    player.setAttribute("data-ready", "true");
                    done();
                    return;
                }

                function attachWithHls() {
                    if (window.Hls && window.Hls.isSupported()) {
                        hlsInstance = new window.Hls({
                            enableWorker: true,
                            lowLatencyMode: true
                        });
                        hlsInstance.loadSource(src);
                        hlsInstance.attachMedia(video);
                        hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
                            player.setAttribute("data-ready", "true");
                            done();
                        });
                        hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
                            if (data && data.fatal) {
                                setStatus("视频加载失败，请刷新页面后重试。");
                            }
                        });
                    } else {
                        setStatus("当前浏览器不支持 HLS 播放。");
                    }
                }

                loadHls(attachWithHls, function () {
                    setStatus("播放器组件加载失败，请检查网络后重试。");
                });
            }

            function play() {
                setStatus("正在加载视频，请稍候。");
                attachSource(function () {
                    var promise = video.play();
                    if (promise && typeof promise.catch === "function") {
                        promise.catch(function () {
                            setStatus("浏览器阻止了自动播放，请再次点击播放按钮。");
                        });
                    }
                });
            }

            if (button) {
                button.addEventListener("click", play);
            }

            video.addEventListener("click", function () {
                if (video.paused) {
                    play();
                }
            });

            video.addEventListener("play", function () {
                if (button) {
                    button.classList.add("is-hidden");
                }
                setStatus("正在播放。");
            });

            video.addEventListener("pause", function () {
                if (button) {
                    button.classList.remove("is-hidden");
                }
                setStatus("已暂停，点击可继续播放。");
            });

            video.addEventListener("ended", function () {
                if (button) {
                    button.classList.remove("is-hidden");
                }
                setStatus("播放结束，可重新播放。");
            });

            window.addEventListener("beforeunload", function () {
                if (hlsInstance) {
                    hlsInstance.destroy();
                }
            });
        });
    }

    document.addEventListener("DOMContentLoaded", function () {
        setupMenu();
        setupFilters();
        setupHero();
        setupPlayers();
    });
})();
