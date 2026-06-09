(function () {
    function ready(callback) {
        if (document.readyState !== 'loading') {
            callback();
            return;
        }
        document.addEventListener('DOMContentLoaded', callback);
    }

    ready(function () {
        var menuButton = document.querySelector('.mobile-menu-button');
        var mobilePanel = document.querySelector('.mobile-panel');
        if (menuButton && mobilePanel) {
            menuButton.addEventListener('click', function () {
                mobilePanel.classList.toggle('open');
            });
        }

        var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
        var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dots button'));
        var current = 0;

        function showSlide(index) {
            if (!slides.length) {
                return;
            }
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, idx) {
                slide.classList.toggle('active', idx === current);
            });
            dots.forEach(function (dot, idx) {
                dot.classList.toggle('active', idx === current);
            });
        }

        dots.forEach(function (dot, idx) {
            dot.addEventListener('click', function () {
                showSlide(idx);
            });
        });

        if (slides.length > 1) {
            window.setInterval(function () {
                showSlide(current + 1);
            }, 5000);
        }

        function textOf(card) {
            return [
                card.getAttribute('data-title') || '',
                card.getAttribute('data-region') || '',
                card.getAttribute('data-type') || '',
                card.getAttribute('data-year') || '',
                card.getAttribute('data-genre') || ''
            ].join(' ').toLowerCase();
        }

        var filterPanel = document.querySelector('.filter-panel');
        if (filterPanel) {
            var input = filterPanel.querySelector('.filter-search');
            var buttons = Array.prototype.slice.call(filterPanel.querySelectorAll('.filter-button'));
            var cards = Array.prototype.slice.call(document.querySelectorAll('.search-card'));
            var empty = document.querySelector('.result-empty');
            var activeYear = 'all';
            var activeType = 'all';

            function applyFilter() {
                var keyword = input ? input.value.trim().toLowerCase() : '';
                var visible = 0;

                cards.forEach(function (card) {
                    var year = card.getAttribute('data-year') || '';
                    var type = card.getAttribute('data-type') || '';
                    var matchKeyword = !keyword || textOf(card).indexOf(keyword) !== -1;
                    var matchYear = activeYear === 'all' || year === activeYear;
                    var matchType = activeType === 'all' || type.indexOf(activeType) !== -1;
                    var ok = matchKeyword && matchYear && matchType;
                    card.style.display = ok ? '' : 'none';
                    if (ok) {
                        visible += 1;
                    }
                });

                if (empty) {
                    empty.classList.toggle('show', visible === 0);
                }
            }

            if (input) {
                input.addEventListener('input', applyFilter);
                var params = new URLSearchParams(window.location.search);
                var query = params.get('q');
                if (query) {
                    input.value = query;
                }
            }

            buttons.forEach(function (button) {
                button.addEventListener('click', function () {
                    var group = button.getAttribute('data-filter-group');
                    var value = button.getAttribute('data-filter-value') || 'all';
                    buttons.filter(function (item) {
                        return item.getAttribute('data-filter-group') === group;
                    }).forEach(function (item) {
                        item.classList.remove('active');
                    });
                    button.classList.add('active');
                    if (group === 'year') {
                        activeYear = value;
                    }
                    if (group === 'type') {
                        activeType = value;
                    }
                    applyFilter();
                });
            });

            applyFilter();
        }

        var detailPage = document.querySelector('.movie-detail-page');
        if (detailPage) {
            var video = document.querySelector('.movie-player');
            var playButton = document.querySelector('.player-start');
            var url = detailPage.getAttribute('data-play-url');
            var attached = false;
            var hls = null;

            function attachVideo() {
                if (!video || !url || attached) {
                    return;
                }
                attached = true;
                if (window.Hls && window.Hls.isSupported()) {
                    hls = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });
                    hls.loadSource(url);
                    hls.attachMedia(video);
                } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = url;
                } else {
                    video.src = url;
                }
            }

            function startVideo() {
                attachVideo();
                if (!video) {
                    return;
                }
                var promise = video.play();
                if (promise && typeof promise.catch === 'function') {
                    promise.catch(function () {});
                }
            }

            if (playButton) {
                playButton.addEventListener('click', startVideo);
            }
            if (video) {
                video.addEventListener('play', function () {
                    if (playButton) {
                        playButton.classList.add('hidden');
                    }
                });
                video.addEventListener('pause', function () {
                    if (playButton && video.currentTime === 0) {
                        playButton.classList.remove('hidden');
                    }
                });
                video.addEventListener('click', function () {
                    if (video.paused) {
                        startVideo();
                    }
                });
            }
            window.addEventListener('pagehide', function () {
                if (hls && typeof hls.destroy === 'function') {
                    hls.destroy();
                }
            });
        }
    });
})();
