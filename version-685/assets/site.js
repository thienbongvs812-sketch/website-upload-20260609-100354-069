(function () {
  "use strict";

  function all(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function first(selector, root) {
    return (root || document).querySelector(selector);
  }

  function initMenu() {
    var button = first("[data-menu-toggle]");
    var nav = first("[data-mobile-nav]");
    if (!button || !nav) {
      return;
    }
    button.addEventListener("click", function () {
      nav.classList.toggle("is-open");
    });
  }

  function initHero() {
    var carousel = first("[data-hero-carousel]");
    if (!carousel) {
      return;
    }
    var slides = all("[data-hero-slide]", carousel);
    var dots = all("[data-hero-dot]", carousel);
    if (slides.length < 2) {
      return;
    }
    var current = 0;
    var timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === current);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        var index = Number(dot.getAttribute("data-hero-dot"));
        show(index);
        start();
      });
    });

    carousel.addEventListener("mouseenter", stop);
    carousel.addEventListener("mouseleave", start);
    start();
  }

  function initFilters() {
    var panels = all("[data-filter-panel]");
    panels.forEach(function (panel) {
      var section = panel.parentElement;
      var input = first("[data-filter-input]", panel);
      var typeSelect = first("[data-filter-type]", panel);
      var yearSelect = first("[data-filter-year]", panel);
      var cards = all("[data-card-search]", section);
      var empty = first("[data-empty-state]", section);
      var params = new URLSearchParams(window.location.search);
      var query = params.get("q") || "";

      if (input && query) {
        input.value = query;
      }

      function apply() {
        var keyword = input ? input.value.trim().toLowerCase() : "";
        var type = typeSelect ? typeSelect.value : "";
        var year = yearSelect ? yearSelect.value : "";
        var visible = 0;

        cards.forEach(function (card) {
          var text = (card.getAttribute("data-card-search") || "").toLowerCase();
          var cardType = card.getAttribute("data-type") || "";
          var cardYear = card.getAttribute("data-year") || "";
          var matchKeyword = !keyword || text.indexOf(keyword) !== -1;
          var matchType = !type || cardType.indexOf(type) !== -1;
          var matchYear = !year || cardYear.indexOf(year) !== -1;
          var isVisible = matchKeyword && matchType && matchYear;
          card.hidden = !isVisible;
          if (isVisible) {
            visible += 1;
          }
        });

        if (empty) {
          empty.hidden = visible !== 0;
        }
      }

      if (input) {
        input.addEventListener("input", apply);
      }
      if (typeSelect) {
        typeSelect.addEventListener("change", apply);
      }
      if (yearSelect) {
        yearSelect.addEventListener("change", apply);
      }
      apply();
    });
  }

  function initPlayers() {
    all("[data-player]").forEach(function (player) {
      var video = first("video", player);
      var button = first("[data-play-button]", player);
      var overlay = first("[data-player-overlay]", player);
      var status = first("[data-player-status]", player);
      var streamUrl = player.getAttribute("data-stream-url");
      var ready = false;
      var hls = null;

      if (!video || !streamUrl) {
        return;
      }

      function setStatus(message) {
        if (status) {
          status.textContent = message || "";
        }
      }

      function hideOverlay() {
        if (overlay) {
          overlay.classList.add("is-hidden");
        }
      }

      function showOverlay() {
        if (overlay) {
          overlay.classList.remove("is-hidden");
        }
      }

      function prepare() {
        if (ready) {
          return;
        }
        ready = true;
        setStatus("");
        if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true,
            backBufferLength: 90
          });
          hls.loadSource(streamUrl);
          hls.attachMedia(video);
          hls.on(window.Hls.Events.ERROR, function (event, data) {
            if (data && data.fatal) {
              setStatus("播放暂时不可用，请稍后再试。");
              try {
                hls.destroy();
              } catch (error) {
                hls = null;
              }
            }
          });
        } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = streamUrl;
        } else {
          video.src = streamUrl;
        }
      }

      function play() {
        prepare();
        var result = video.play();
        if (result && typeof result.catch === "function") {
          result.catch(function () {
            setStatus("播放暂时不可用，请稍后再试。");
            showOverlay();
          });
        }
      }

      if (button) {
        button.addEventListener("click", function (event) {
          event.preventDefault();
          play();
        });
      }

      video.addEventListener("click", function () {
        if (video.paused) {
          play();
        }
      });
      video.addEventListener("play", hideOverlay);
      video.addEventListener("pause", function () {
        if (!video.ended) {
          showOverlay();
        }
      });
      video.addEventListener("ended", showOverlay);
      video.addEventListener("error", function () {
        setStatus("播放暂时不可用，请稍后再试。");
        showOverlay();
      });
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    initMenu();
    initHero();
    initFilters();
    initPlayers();
  });
})();
