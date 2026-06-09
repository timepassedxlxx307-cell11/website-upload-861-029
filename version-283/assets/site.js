(function () {
    const menuButton = document.querySelector('[data-menu-toggle]');
    const mobileNav = document.querySelector('[data-mobile-nav]');

    if (menuButton && mobileNav) {
        menuButton.addEventListener('click', function () {
            mobileNav.classList.toggle('is-open');
        });
    }

    const slides = Array.from(document.querySelectorAll('[data-hero-slide]'));
    const dots = Array.from(document.querySelectorAll('[data-hero-dot]'));
    let activeSlide = 0;
    let timer = null;

    function showSlide(index) {
        if (!slides.length) {
            return;
        }
        activeSlide = (index + slides.length) % slides.length;
        slides.forEach(function (slide, current) {
            slide.classList.toggle('active', current === activeSlide);
        });
        dots.forEach(function (dot, current) {
            dot.classList.toggle('active', current === activeSlide);
        });
    }

    function startHero() {
        if (slides.length < 2) {
            return;
        }
        timer = window.setInterval(function () {
            showSlide(activeSlide + 1);
        }, 5200);
    }

    dots.forEach(function (dot, index) {
        dot.addEventListener('click', function () {
            if (timer) {
                window.clearInterval(timer);
            }
            showSlide(index);
            startHero();
        });
    });

    showSlide(0);
    startHero();

    document.querySelectorAll('[data-filter-panel]').forEach(function (panel) {
        const input = panel.querySelector('[data-filter-input]');
        const cards = Array.from(document.querySelectorAll('.movie-card'));
        const typeButtons = Array.from(panel.querySelectorAll('[data-filter-type]'));
        const regionButtons = Array.from(panel.querySelectorAll('[data-filter-region]'));
        let currentType = 'all';
        let currentRegion = 'all';

        function normalize(value) {
            return String(value || '').trim().toLowerCase();
        }

        function applyFilters() {
            const query = normalize(input ? input.value : '');
            cards.forEach(function (card) {
                const keywords = normalize(card.getAttribute('data-keywords'));
                const cardType = card.getAttribute('data-type') || '';
                const cardRegion = card.getAttribute('data-region') || '';
                const matchesQuery = !query || keywords.indexOf(query) !== -1;
                const matchesType = currentType === 'all' || cardType === currentType;
                const matchesRegion = currentRegion === 'all' || cardRegion === currentRegion;
                card.classList.toggle('is-hidden', !(matchesQuery && matchesType && matchesRegion));
            });
        }

        if (input) {
            input.addEventListener('input', applyFilters);
        }

        typeButtons.forEach(function (button) {
            button.addEventListener('click', function () {
                currentType = button.getAttribute('data-filter-type') || 'all';
                typeButtons.forEach(function (item) {
                    item.classList.toggle('active', item === button);
                });
                applyFilters();
            });
        });

        regionButtons.forEach(function (button) {
            button.addEventListener('click', function () {
                currentRegion = button.getAttribute('data-filter-region') || 'all';
                regionButtons.forEach(function (item) {
                    item.classList.toggle('active', item === button);
                });
                applyFilters();
            });
        });
    });
}());
