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
            try { localStorage.setItem('theme', next); } catch (e) {}

            // Spin the sun/moon icon in
            root.classList.add('theme-anim');
            setTimeout(function () { root.classList.remove('theme-anim'); }, 800);

            if (!document.startViewTransition || reduceMotion) {
                applyTheme(next);
                return;
            }

            // Circular reveal: the new theme grows out of the toggle button
            var rect = toggle.getBoundingClientRect();
            var x = rect.left + rect.width / 2;
            var y = rect.top + rect.height / 2;
            var radius = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y));
            // .theme-switching keeps this separate from the page-to-page transitions in the CSS
            root.classList.add('theme-switching');
            var cleanup = function () { root.classList.remove('theme-switching'); };
            var transition = document.startViewTransition(function () { applyTheme(next); });
            transition.finished.then(cleanup, cleanup);
            setTimeout(cleanup, 1500);
            // Safety net: never leave the theme unchanged if the transition stalls
            setTimeout(function () {
                if (root.getAttribute('data-theme') !== next) applyTheme(next);
            }, 400);
            transition.ready.then(function () {
                root.animate(
                    { clipPath: ['circle(0px at ' + x + 'px ' + y + 'px)', 'circle(' + radius + 'px at ' + x + 'px ' + y + 'px)'] },
                    { duration: 750, easing: 'cubic-bezier(0.4, 0, 0.2, 1)', pseudoElement: '::view-transition-new(root)' }
                );
            });
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

    var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var finePointer = window.matchMedia && window.matchMedia('(hover: hover) and (pointer: fine)').matches;

    // Page transition fallback for browsers without cross-document View Transitions
    if (root.classList.contains('no-vt') && !reduceMotion) {
        document.addEventListener('click', function (e) {
            var link = e.target.closest && e.target.closest('a[href]');
            if (!link || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey
                || link.target === '_blank' || link.hasAttribute('download')) return;
            var url = new URL(link.href, location.href);
            if (url.origin !== location.origin || (url.pathname === location.pathname && url.hash)) return;
            e.preventDefault();
            root.classList.add('page-leaving');
            setTimeout(function () { location.href = url.href; }, 220);
        });
        // Coming back via the back button restores the page from cache — undo the fade-out
        window.addEventListener('pageshow', function (e) {
            if (e.persisted) root.classList.remove('page-leaving');
        });
    }

    // Dark mode backdrop: starry night sky over a pine forest (fixed behind the page)
    var sky = document.querySelector('.night-sky');
    if (sky && sky.getContext) {
        var sctx = sky.getContext('2d');
        var back = document.createElement('canvas');   // sky gradient + moon (static)
        var front = document.createElement('canvas');  // forest silhouettes (static)
        var stars = [], shooting = null, nextShot = 0;
        var SW, SH, skyRunning = false;

        // Seeded random so the forest looks the same on every visit
        var seeded = function (seed) {
            return function () {
                seed |= 0; seed = seed + 0x6D2B79F5 | 0;
                var t = Math.imul(seed ^ seed >>> 15, 1 | seed);
                t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
                return ((t ^ t >>> 14) >>> 0) / 4294967296;
            };
        };

        var drawPine = function (c, x, baseY, h, w) {
            // Five stacked tiers with drooping branch tips, widening toward the ground
            var tiers = 5;
            c.beginPath();
            for (var tier = 0; tier < tiers; tier++) {
                var top = baseY - h + tier * h * 0.16;
                var bottom = top + h * 0.3;
                var half = w * 0.5 * (0.35 + 0.65 * (tier + 1) / tiers);
                c.moveTo(x, top);
                c.quadraticCurveTo(x + half * 0.35, bottom - h * 0.1, x + half, bottom);
                c.lineTo(x - half, bottom);
                c.quadraticCurveTo(x - half * 0.35, bottom - h * 0.1, x, top);
            }
            c.rect(x - w * 0.05, baseY - h * 0.08, w * 0.1, h * 0.08);
            c.fill();
        };

        var buildScene = function () {
            var dpr = Math.min(window.devicePixelRatio || 1, 2);
            SW = window.innerWidth;
            SH = window.innerHeight;
            [sky, back, front].forEach(function (cv) {
                cv.width = SW * dpr;
                cv.height = SH * dpr;
                cv.getContext('2d').setTransform(dpr, 0, 0, dpr, 0, 0);
            });

            // Sky gradient, deep navy fading to a faint glow at the horizon
            var b = back.getContext('2d');
            var g = b.createLinearGradient(0, 0, 0, SH);
            g.addColorStop(0, '#040814');
            g.addColorStop(0.55, '#0a1430');
            g.addColorStop(1, '#16264d');
            b.fillStyle = g;
            b.fillRect(0, 0, SW, SH);

            // Moon with a soft halo
            var mx = Math.max(60, SW * 0.06), my = Math.min(SH * 0.2, 190), mr = Math.max(16, Math.min(SW, SH) * 0.028);
            var halo = b.createRadialGradient(mx, my, mr, mx, my, mr * 7);
            halo.addColorStop(0, 'rgba(200, 215, 255, 0.22)');
            halo.addColorStop(1, 'rgba(200, 215, 255, 0)');
            b.fillStyle = halo;
            b.fillRect(mx - mr * 7, my - mr * 7, mr * 14, mr * 14);
            b.fillStyle = '#e9eeff';
            b.beginPath();
            b.arc(mx, my, mr, 0, 6.2832);
            b.fill();

            // Forest: three layers, far (lighter, misty) to near (darkest)
            var f = front.getContext('2d');
            var rand = seeded(42);
            var scale = Math.min(SH, 900);
            var layers = [
                { color: '#13213f', min: 0.2,  max: 0.32, gap: 0.5,  mist: 'rgba(40, 62, 110, 0.35)' },
                { color: '#0b1530', min: 0.14, max: 0.23, gap: 0.45, mist: 'rgba(25, 40, 80, 0.3)' },
                { color: '#050a18', min: 0.08, max: 0.15, gap: 0.4,  mist: null }
            ];
            layers.forEach(function (layer, li) {
                var baseY = SH + 4;
                // ground band so gaps between trees aren't see-through
                f.fillStyle = layer.color;
                f.fillRect(0, SH - scale * (0.03 + 0.015 * (2 - li)), SW, SH);
                var x = -20;
                while (x < SW + 40) {
                    var h = scale * (layer.min + rand() * (layer.max - layer.min));
                    var w = h * (0.38 + rand() * 0.12);
                    drawPine(f, x, baseY, h, w);
                    x += w * (layer.gap + rand() * 0.35);
                }
                if (layer.mist) {
                    var mist = f.createLinearGradient(0, SH - scale * 0.12, 0, SH);
                    mist.addColorStop(0, 'rgba(0, 0, 0, 0)');
                    mist.addColorStop(1, layer.mist);
                    f.fillStyle = mist;
                    f.fillRect(0, SH - scale * 0.12, SW, scale * 0.12);
                }
            });

            // Stars, denser near the top of the sky
            stars = [];
            var count = Math.min(650, Math.round(SW * SH / 2600));
            var srand = seeded(7);
            for (var i = 0; i < count; i++) {
                stars.push({
                    x: srand() * SW,
                    y: Math.pow(srand(), 1.6) * SH * 0.85,
                    r: 0.3 + Math.pow(srand(), 3) * 1.4,
                    a: 0.35 + srand() * 0.65,
                    speed: 0.5 + srand() * 2,
                    phase: srand() * 6.2832
                });
            }
        };

        var drawSky = function (time) {
            var t = (time || 0) / 1000;
            sctx.drawImage(back, 0, 0, SW, SH);

            for (var i = 0; i < stars.length; i++) {
                var s = stars[i];
                var twinkle = reduceMotion ? 1 : 0.6 + 0.4 * Math.sin(t * s.speed + s.phase);
                sctx.fillStyle = 'rgba(235, 240, 255,' + (s.a * twinkle).toFixed(3) + ')';
                sctx.beginPath();
                sctx.arc(s.x, s.y, s.r, 0, 6.2832);
                sctx.fill();
            }

            // Occasional shooting star
            if (!reduceMotion) {
                if (!shooting && t > nextShot) {
                    shooting = { x: Math.random() * SW * 0.7, y: Math.random() * SH * 0.3, start: t };
                    nextShot = t + 6 + Math.random() * 8;
                }
                if (shooting) {
                    var p = (t - shooting.start) / 0.9;
                    if (p >= 1) {
                        shooting = null;
                    } else {
                        var len = 140, dx = 1, dy = 0.45;
                        var hx = shooting.x + p * 420, hy = shooting.y + p * 420 * dy;
                        var trail = sctx.createLinearGradient(hx, hy, hx - len * dx, hy - len * dy);
                        trail.addColorStop(0, 'rgba(255, 255, 255,' + (1 - p).toFixed(2) + ')');
                        trail.addColorStop(1, 'rgba(255, 255, 255, 0)');
                        sctx.strokeStyle = trail;
                        sctx.lineWidth = 1.5;
                        sctx.beginPath();
                        sctx.moveTo(hx, hy);
                        sctx.lineTo(hx - len * dx, hy - len * dy);
                        sctx.stroke();
                    }
                }
            }

            sctx.drawImage(front, 0, 0, SW, SH);
        };

        var isDark = function () { return root.getAttribute('data-theme') === 'dark'; };
        var skyLoop = function (time) {
            if (!isDark() || document.hidden) { skyRunning = false; return; }
            drawSky(time);
            requestAnimationFrame(skyLoop);
        };
        var updateSky = function () {
            if (!isDark()) return;
            if (reduceMotion) { drawSky(0); return; }
            if (!skyRunning) { skyRunning = true; requestAnimationFrame(skyLoop); }
        };

        buildScene();
        window.addEventListener('resize', function () { buildScene(); if (isDark()) drawSky(performance.now()); });
        document.addEventListener('visibilitychange', updateSky);
        new MutationObserver(updateSky).observe(root, { attributes: true, attributeFilter: ['data-theme'] });
        updateSky();
    }

    // 3D tilt: elements with data-tilt="maxDegrees" lean toward the cursor
    if (finePointer && !reduceMotion) {
        document.querySelectorAll('[data-tilt]').forEach(function (el) {
            var max = parseFloat(el.getAttribute('data-tilt')) || 8;
            el.addEventListener('mousemove', function (e) {
                var rect = el.getBoundingClientRect();
                var px = (e.clientX - rect.left) / rect.width;
                var py = (e.clientY - rect.top) / rect.height;
                el.classList.add('is-tilting');
                el.style.transform = 'perspective(900px) rotateX(' + ((0.5 - py) * max).toFixed(2) + 'deg) rotateY('
                    + ((px - 0.5) * max).toFixed(2) + 'deg) translateY(-6px)';
                el.style.setProperty('--gx', (px * 100).toFixed(1) + '%');
                el.style.setProperty('--gy', (py * 100).toFixed(1) + '%');
            });
            el.addEventListener('mouseleave', function () {
                el.classList.remove('is-tilting');
                el.style.transform = '';
            });
        });
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
