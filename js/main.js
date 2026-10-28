// Small UI enhancements — the site works fully without this file.
(function () {
    // Light / dark mode toggle (initial theme is set inline in the <head>)
    var root = document.documentElement;
    var toggle = document.querySelector('.theme-toggle');
    function applyTheme(theme) {
        root.setAttribute('data-theme', theme);
        if (toggle) {
            toggle.setAttribute('aria-label', theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
        }
    }
    function savedTheme() {
        try { return localStorage.getItem('theme'); } catch (e) { return null; }
    }
    applyTheme(root.getAttribute('data-theme') || 'light');
    if (toggle) {
        toggle.addEventListener('click', function () {
            var next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
            applyTheme(next);
            try { localStorage.setItem('theme', next); } catch (e) {}
        });
    }
    // Follow the system setting until the visitor picks a theme themselves
    if (window.matchMedia) {
        var media = window.matchMedia('(prefers-color-scheme: dark)');
        var onSystemChange = function (e) {
            if (!savedTheme()) applyTheme(e.matches ? 'dark' : 'light');
        };
        if (media.addEventListener) media.addEventListener('change', onSystemChange);
    }

    // Header shadow once the page is scrolled
    var header = document.querySelector('.site-header');
    function onScroll() {
        header.classList.toggle('scrolled', window.scrollY > 8);
    }
    if (header) {
        onScroll();
        window.addEventListener('scroll', onScroll, { passive: true });
    }

    // Fade sections in as they enter the viewport
    var reveals = document.querySelectorAll('.reveal');
    if ('IntersectionObserver' in window) {
        var observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.12 });
        reveals.forEach(function (el) { observer.observe(el); });
    } else {
        reveals.forEach(function (el) { el.classList.add('is-visible'); });
    }

    // Character counter for the message box
    document.querySelectorAll('.char-count').forEach(function (counter) {
        var field = document.getElementById(counter.dataset.for);
        if (!field) return;
        function update() {
            counter.textContent = field.value.length + ' / ' + field.maxLength;
        }
        update();
        field.addEventListener('input', update);
    });

    // Live search on the admin dashboard
    var search = document.getElementById('message-search');
    var table = document.getElementById('messages-table');
    if (search && table) {
        var rows = table.querySelectorAll('tbody tr');
        var empty = document.querySelector('.no-results');
        search.addEventListener('input', function () {
            var q = search.value.trim().toLowerCase();
            var shown = 0;
            rows.forEach(function (row) {
                var match = row.textContent.toLowerCase().indexOf(q) !== -1;
                row.hidden = !match;
                if (match) shown++;
            });
            if (empty) empty.hidden = shown !== 0;
        });
    }
})();
