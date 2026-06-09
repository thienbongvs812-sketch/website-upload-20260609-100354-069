(function () {
  function qs(selector, scope) {
    return (scope || document).querySelector(selector);
  }

  function qsa(selector, scope) {
    return Array.prototype.slice.call((scope || document).querySelectorAll(selector));
  }

  function initNav() {
    var toggle = qs('[data-nav-toggle]');
    var menu = qs('[data-nav-menu]');
    if (!toggle || !menu) {
      return;
    }
    toggle.addEventListener('click', function () {
      menu.classList.toggle('is-open');
    });
  }

  function initHero() {
    var carousel = qs('[data-hero-carousel]');
    if (!carousel) {
      return;
    }
    var slides = qsa('.hero-slide', carousel);
    var dots = qsa('[data-hero-dot]', carousel);
    var prev = qs('[data-hero-prev]', carousel);
    var next = qs('[data-hero-next]', carousel);
    var current = 0;
    var timer = null;

    function show(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === current);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5600);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot') || 0));
        start();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        show(current - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(current + 1);
        start();
      });
    }

    carousel.addEventListener('mouseenter', stop);
    carousel.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  function normalize(value) {
    return String(value || '').trim().toLowerCase();
  }

  function initFilters() {
    var panels = qsa('[data-filter-panel]');
    panels.forEach(function (panel) {
      var input = qs('[data-filter-input]', panel);
      var type = qs('[data-filter-type]', panel);
      var year = qs('[data-filter-year]', panel);
      var cards = qsa('[data-movie-card]');

      function apply() {
        var keyword = normalize(input && input.value);
        var selectedType = normalize(type && type.value);
        var selectedYear = normalize(year && year.value);
        cards.forEach(function (card) {
          var text = normalize([
            card.getAttribute('data-title'),
            card.getAttribute('data-genre'),
            card.getAttribute('data-type'),
            card.getAttribute('data-year')
          ].join(' '));
          var cardType = normalize(card.getAttribute('data-type'));
          var cardYear = normalize(card.getAttribute('data-year'));
          var matchedKeyword = !keyword || text.indexOf(keyword) !== -1;
          var matchedType = !selectedType || cardType.indexOf(selectedType) !== -1;
          var matchedYear = !selectedYear || cardYear === selectedYear;
          card.classList.toggle('is-hidden', !(matchedKeyword && matchedType && matchedYear));
        });
      }

      [input, type, year].forEach(function (control) {
        if (control) {
          control.addEventListener('input', apply);
          control.addEventListener('change', apply);
        }
      });

      var params = new URLSearchParams(window.location.search);
      var q = params.get('q');
      if (input && q) {
        input.value = q;
      }
      apply();
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initNav();
    initHero();
    initFilters();
  });
})();
