(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function setupMenu() {
        var toggle = document.querySelector("[data-nav-toggle]");
        var menu = document.querySelector("[data-mobile-menu]");
        if (!toggle || !menu) {
            return;
        }
        toggle.addEventListener("click", function () {
            menu.classList.toggle("is-open");
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
        if (slides.length <= 1) {
            return;
        }
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === index);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(index + 1);
            }, 6200);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener("click", function () {
                show(dotIndex);
                start();
            });
        });
        if (prev) {
            prev.addEventListener("click", function () {
                show(index - 1);
                start();
            });
        }
        if (next) {
            next.addEventListener("click", function () {
                show(index + 1);
                start();
            });
        }
        slider.addEventListener("mouseenter", stop);
        slider.addEventListener("mouseleave", start);
        start();
    }

    function setupFilters() {
        var scopes = Array.prototype.slice.call(document.querySelectorAll("[data-filter-scope]"));
        scopes.forEach(function (scope) {
            var input = scope.querySelector("[data-filter-input]");
            var select = scope.querySelector("[data-sort-select]");
            var container = scope.querySelector("[data-card-container]");
            if (!container) {
                return;
            }
            var cards = Array.prototype.slice.call(container.querySelectorAll("[data-movie-card]"));
            var params = new URLSearchParams(window.location.search);
            var initialQuery = params.get("q") || "";
            if (input && initialQuery) {
                input.value = initialQuery;
            }

            function apply() {
                var keyword = input ? input.value.trim().toLowerCase() : "";
                cards.forEach(function (card) {
                    var haystack = (card.getAttribute("data-title") || "").toLowerCase();
                    card.classList.toggle("is-hidden", keyword && haystack.indexOf(keyword) === -1);
                });
            }

            function sortCards() {
                var value = select ? select.value : "year";
                var sorted = cards.slice().sort(function (a, b) {
                    if (value === "title") {
                        return (a.getAttribute("data-title") || "").localeCompare(b.getAttribute("data-title") || "", "zh-Hans-CN");
                    }
                    var av = parseFloat(a.getAttribute("data-" + value) || "0");
                    var bv = parseFloat(b.getAttribute("data-" + value) || "0");
                    return bv - av;
                });
                sorted.forEach(function (card) {
                    container.appendChild(card);
                });
                cards = sorted;
                apply();
            }

            if (input) {
                input.addEventListener("input", apply);
            }
            if (select) {
                select.addEventListener("change", sortCards);
            }
            sortCards();
        });
    }

    window.initMoviePlayer = function (videoId, buttonId, source) {
        var video = document.getElementById(videoId);
        var button = document.getElementById(buttonId);
        if (!video || !source) {
            return;
        }
        var prepared = false;
        var hlsInstance = null;

        function prepare() {
            if (prepared) {
                return;
            }
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = source;
            } else if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true,
                    backBufferLength: 90
                });
                hlsInstance.loadSource(source);
                hlsInstance.attachMedia(video);
            } else {
                video.src = source;
            }
            prepared = true;
        }

        function play() {
            prepare();
            var shell = video.closest(".player-shell");
            if (shell) {
                shell.classList.add("is-playing");
            }
            var promise = video.play();
            if (promise && typeof promise.catch === "function") {
                promise.catch(function () {});
            }
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
            var shell = video.closest(".player-shell");
            if (shell) {
                shell.classList.add("is-playing");
            }
        });
        window.addEventListener("beforeunload", function () {
            if (hlsInstance && typeof hlsInstance.destroy === "function") {
                hlsInstance.destroy();
            }
        });
    };

    ready(function () {
        setupMenu();
        setupHero();
        setupFilters();
    });
})();
