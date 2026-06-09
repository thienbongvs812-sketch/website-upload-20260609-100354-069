(function() {
  var menuButton = document.querySelector('[data-menu-button]');
  var mobileNav = document.querySelector('[data-mobile-nav]');
  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function() {
      mobileNav.classList.toggle('open');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
  var current = 0;

  function setSlide(index) {
    if (!slides.length) {
      return;
    }
    current = (index + slides.length) % slides.length;
    slides.forEach(function(slide, i) {
      slide.classList.toggle('active', i === current);
    });
    dots.forEach(function(dot, i) {
      dot.classList.toggle('active', i === current);
    });
  }

  dots.forEach(function(dot, index) {
    dot.addEventListener('click', function() {
      setSlide(index);
    });
  });

  if (slides.length > 1) {
    setInterval(function() {
      setSlide(current + 1);
    }, 5200);
  }

  setSlide(0);

  var panel = document.querySelector('[data-filter-panel]');
  if (!panel) {
    return;
  }

  var searchInput = panel.querySelector('[data-search-input]');
  var yearSelect = panel.querySelector('[data-filter-year]');
  var regionSelect = panel.querySelector('[data-filter-region]');
  var categorySelect = panel.querySelector('[data-filter-category]');
  var cards = Array.prototype.slice.call(document.querySelectorAll('[data-movie-card]'));
  var emptyState = document.querySelector('[data-empty-state]');

  function applyFilters() {
    var keyword = searchInput ? searchInput.value.trim().toLowerCase() : '';
    var year = yearSelect ? yearSelect.value : '';
    var region = regionSelect ? regionSelect.value : '';
    var category = categorySelect ? categorySelect.value : '';
    var visible = 0;

    cards.forEach(function(card) {
      var text = (card.getAttribute('data-search') || '').toLowerCase();
      var matched = true;
      if (keyword && text.indexOf(keyword) === -1) {
        matched = false;
      }
      if (year && card.getAttribute('data-year') !== year) {
        matched = false;
      }
      if (region && card.getAttribute('data-region') !== region) {
        matched = false;
      }
      if (category && card.getAttribute('data-category') !== category) {
        matched = false;
      }
      card.style.display = matched ? '' : 'none';
      if (matched) {
        visible += 1;
      }
    });

    if (emptyState) {
      emptyState.classList.toggle('show', visible === 0);
    }
  }

  [searchInput, yearSelect, regionSelect, categorySelect].forEach(function(control) {
    if (control) {
      control.addEventListener('input', applyFilters);
      control.addEventListener('change', applyFilters);
    }
  });
})();
