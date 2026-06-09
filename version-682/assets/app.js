(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
      return;
    }
    document.addEventListener("DOMContentLoaded", fn);
  }

  function setupImages() {
    document.addEventListener("error", function (event) {
      var target = event.target;
      if (target && target.tagName === "IMG") {
        target.remove();
      }
    }, true);
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

  function setupHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dot"));
    var index = 0;

    function show(next) {
      if (!slides.length) {
        return;
      }
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === index);
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-hero-dot") || 0));
      });
    });

    window.setInterval(function () {
      show(index + 1);
    }, 5000);
  }

  function setupPlayer() {
    var section = document.querySelector("[data-player]");
    if (!section) {
      return;
    }
    var shell = section.querySelector(".player-shell");
    var video = section.querySelector("video");
    var button = section.querySelector("[data-player-start]");
    var status = section.querySelector("[data-player-status]");
    var hlsInstance = null;

    if (!shell || !video || !button) {
      return;
    }

    function setStatus(text) {
      if (status) {
        status.textContent = text;
      }
    }

    function attachSource() {
      var src = video.getAttribute("data-src");
      if (!src) {
        setStatus("当前影片暂无可用播放源");
        return false;
      }
      if (video.getAttribute("src")) {
        return true;
      }
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.setAttribute("src", src);
        return true;
      }
      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(src);
        hlsInstance.attachMedia(video);
        return true;
      }
      setStatus("当前浏览器暂不支持该播放格式");
      return false;
    }

    function playVideo() {
      if (!attachSource()) {
        return;
      }
      shell.classList.add("is-playing");
      setStatus("正在加载播放源");
      video.play().then(function () {
        setStatus("正在播放");
      }).catch(function () {
        setStatus("请再次点击播放按钮");
      });
    }

    button.addEventListener("click", playVideo);
    video.addEventListener("click", function () {
      if (!video.getAttribute("src") && !hlsInstance) {
        playVideo();
      }
    });
  }

  function movieCard(item) {
    var article = document.createElement("article");
    article.className = "movie-card";
    var tags = [item.year, item.region, item.type].filter(Boolean).map(function (tag) {
      return "<span>" + escapeHtml(tag) + "</span>";
    }).join("");
    article.innerHTML = [
      "<a class=\"poster-frame\" href=\"" + escapeHtml(item.url) + "\" aria-label=\"" + escapeHtml(item.title) + "\">",
      "<img src=\"" + escapeHtml(item.image) + "\" alt=\"" + escapeHtml(item.title) + "\" loading=\"lazy\">",
      "<span class=\"poster-badge\">" + escapeHtml(item.year) + "</span>",
      "<span class=\"play-float\">▶</span>",
      "</a>",
      "<div class=\"movie-card-body\">",
      "<h3><a href=\"" + escapeHtml(item.url) + "\">" + escapeHtml(item.title) + "</a></h3>",
      "<div class=\"movie-mini-tags\">" + tags + "</div>",
      "<p>" + escapeHtml(item.oneLine || "") + "</p>",
      "</div>"
    ].join("");
    return article;
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function setupSearch() {
    var input = document.getElementById("movieSearch");
    var results = document.getElementById("searchResults");
    var clear = document.querySelector("[data-search-clear]");
    var data = window.MOVIE_SEARCH_DATA || [];
    if (!input || !results || !data.length) {
      return;
    }

    function render(items) {
      results.innerHTML = "";
      items.slice(0, 120).forEach(function (item) {
        results.appendChild(movieCard(item));
      });
    }

    function update() {
      var query = input.value.trim().toLowerCase();
      if (!query) {
        results.innerHTML = "";
        return;
      }
      var terms = query.split(/\s+/).filter(Boolean);
      var matches = data.filter(function (item) {
        var haystack = [item.title, item.region, item.type, item.year, item.genre, item.tags, item.oneLine].join(" ").toLowerCase();
        return terms.every(function (term) {
          return haystack.indexOf(term) !== -1;
        });
      });
      render(matches);
    }

    input.addEventListener("input", update);
    if (clear) {
      clear.addEventListener("click", function () {
        input.value = "";
        input.focus();
        update();
      });
    }
  }

  ready(function () {
    setupImages();
    setupMenu();
    setupHero();
    setupPlayer();
    setupSearch();
  });
})();
