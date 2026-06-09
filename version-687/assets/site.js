(function () {
    var menuButton = document.querySelector('[data-nav-toggle]');
    var mobileMenu = document.querySelector('[data-mobile-menu]');

    if (menuButton && mobileMenu) {
        menuButton.addEventListener('click', function () {
            mobileMenu.classList.toggle('open');
        });
    }

    var hero = document.querySelector('[data-hero]');

    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
        var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
        var previous = document.querySelector('[data-hero-prev]');
        var next = document.querySelector('[data-hero-next]');
        var current = 0;
        var timer = null;

        function showSlide(index) {
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

        function startTimer() {
            clearInterval(timer);
            timer = setInterval(function () {
                showSlide(current + 1);
            }, 6200);
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
                startTimer();
            });
        });

        if (previous) {
            previous.addEventListener('click', function () {
                showSlide(current - 1);
                startTimer();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                showSlide(current + 1);
                startTimer();
            });
        }

        startTimer();
    }

    var filterForm = document.querySelector('[data-filter-form]');
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-card]'));
    var emptyState = document.querySelector('[data-empty-state]');

    if (filterForm && cards.length) {
        var searchInput = filterForm.querySelector('[data-search-input]');
        var typeSelect = filterForm.querySelector('[data-filter-type]');
        var regionSelect = filterForm.querySelector('[data-filter-region]');
        var yearSelect = filterForm.querySelector('[data-filter-year]');
        var params = new URLSearchParams(window.location.search);
        var initialQuery = params.get('q');

        if (initialQuery && searchInput) {
            searchInput.value = initialQuery;
        }

        function normalize(value) {
            return String(value || '').trim().toLowerCase();
        }

        function applyFilters() {
            var query = normalize(searchInput ? searchInput.value : '');
            var type = normalize(typeSelect ? typeSelect.value : '');
            var region = normalize(regionSelect ? regionSelect.value : '');
            var year = normalize(yearSelect ? yearSelect.value : '');
            var visible = 0;

            cards.forEach(function (card) {
                var haystack = normalize([
                    card.getAttribute('data-title'),
                    card.getAttribute('data-region'),
                    card.getAttribute('data-type'),
                    card.getAttribute('data-year'),
                    card.getAttribute('data-genre'),
                    card.getAttribute('data-tags')
                ].join(' '));
                var matchesQuery = !query || haystack.indexOf(query) !== -1;
                var matchesType = !type || normalize(card.getAttribute('data-type')).indexOf(type) !== -1;
                var matchesRegion = !region || normalize(card.getAttribute('data-region')).indexOf(region) !== -1;
                var matchesYear = !year || normalize(card.getAttribute('data-year')) === year;
                var show = matchesQuery && matchesType && matchesRegion && matchesYear;

                card.classList.toggle('hidden-card', !show);

                if (show) {
                    visible += 1;
                }
            });

            if (emptyState) {
                emptyState.classList.toggle('show', visible === 0);
            }
        }

        filterForm.addEventListener('input', applyFilters);
        filterForm.addEventListener('change', applyFilters);
        filterForm.addEventListener('reset', function () {
            window.setTimeout(applyFilters, 0);
        });
        applyFilters();
    }
})();
