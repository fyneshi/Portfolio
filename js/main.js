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

    var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var finePointer = window.matchMedia && window.matchMedia('(hover: hover) and (pointer: fine)').matches;

    // 3D globe behind the hero photo (plain canvas, no library)
    var canvas = document.querySelector('.hero-canvas');
    if (canvas && canvas.getContext) {
        var ctx = canvas.getContext('2d');
        var hero = canvas.parentElement;
        var frame = document.querySelector('.photo-frame');
        var points = [];
        var COUNT = 480;
        // Fibonacci sphere: evenly spread points on a unit sphere
        for (var i = 0; i < COUNT; i++) {
            var y = 1 - (i / (COUNT - 1)) * 2;
            var r = Math.sqrt(1 - y * y);
            var t = Math.PI * (3 - Math.sqrt(5)) * i;
            points.push([Math.cos(t) * r, y, Math.sin(t) * r]);
        }
        var W, H, cx, cy, R;
        var spin = 0, tiltX = 0.35, tiltY = 0, targetX = 0.35, targetY = 0;
        var running = false, visible = true;

        var resize = function () {
            var dpr = Math.min(window.devicePixelRatio || 1, 2);
            W = hero.clientWidth;
            H = hero.clientHeight;
            canvas.width = W * dpr;
            canvas.height = H * dpr;
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
            var hr = hero.getBoundingClientRect();
            var fr = frame ? frame.getBoundingClientRect() : null;
            if (fr && fr.width) {
                cx = fr.left - hr.left + fr.width / 2;
                cy = fr.top - hr.top + fr.height / 2;
                R = Math.max(fr.width, fr.height) * 0.56;
            } else {
                cx = W * 0.7; cy = H / 2; R = Math.min(W, H) * 0.35;
            }
            if (!running) draw();
        };

        // Rotate a point around Y (spin) then X (tilt), then perspective-project it
        var project = function (x, y, z) {
            var a = spin + tiltY, b = tiltX;
            var x1 = x * Math.cos(a) + z * Math.sin(a);
            var z1 = -x * Math.sin(a) + z * Math.cos(a);
            var y2 = y * Math.cos(b) - z1 * Math.sin(b);
            var z2 = y * Math.sin(b) + z1 * Math.cos(b);
            var s = 3 / (3 - z2);
            return [cx + x1 * R * s, cy + y2 * R * s, (z2 + 1) / 2, s];
        };

        var draw = function () {
            var dark = root.getAttribute('data-theme') === 'dark';
            var dot = dark ? '157, 181, 255' : '30, 58, 138';
            var accent = dark ? '251, 138, 168' : '159, 18, 57';
            ctx.clearRect(0, 0, W, H);

            // Sphere of dots — nearer dots are bigger and brighter
            for (var i = 0; i < points.length; i++) {
                var p = project(points[i][0], points[i][1], points[i][2]);
                ctx.fillStyle = 'rgba(' + dot + ',' + (0.08 + p[2] * 0.5).toFixed(3) + ')';
                ctx.beginPath();
                ctx.arc(p[0], p[1], (0.6 + p[2] * 1.6) * p[3], 0, 6.2832);
                ctx.fill();
            }

            // Tilted orbit ring with a satellite travelling along it
            var ring = 1.2, steps = 120, prev = null;
            var ringPoint = function (k) {
                var ang = (k / steps) * 6.2832;
                var x = Math.cos(ang) * ring, z = Math.sin(ang) * ring;
                // tip the ring's plane by ~65° so it reads as 3D
                return project(x, z * Math.sin(1.13), z * Math.cos(1.13));
            };
            for (var k = 0; k <= steps; k++) {
                var q = ringPoint(k);
                if (prev) {
                    ctx.strokeStyle = 'rgba(' + dot + ',' + (0.05 + q[2] * 0.35).toFixed(3) + ')';
                    ctx.lineWidth = 1 + q[2];
                    ctx.beginPath();
                    ctx.moveTo(prev[0], prev[1]);
                    ctx.lineTo(q[0], q[1]);
                    ctx.stroke();
                }
                prev = q;
            }
            var sat = ringPoint(((spin * 2.2) / 6.2832 * steps) % steps);
            ctx.fillStyle = 'rgba(' + accent + ',' + (0.4 + sat[2] * 0.6).toFixed(3) + ')';
            ctx.beginPath();
            ctx.arc(sat[0], sat[1], 3 + sat[2] * 3, 0, 6.2832);
            ctx.fill();
        };

        var loop = function () {
            if (!visible || document.hidden) { running = false; return; }
            spin += 0.0025;
            tiltX += (targetX - tiltX) * 0.05;
            tiltY += (targetY - tiltY) * 0.05;
            draw();
            requestAnimationFrame(loop);
        };
        var start = function () {
            if (!running && !reduceMotion) { running = true; requestAnimationFrame(loop); }
        };

        resize();
        window.addEventListener('resize', resize);
        setTimeout(resize, 1000); // after the photo's entrance animation settles
        if (finePointer) {
            hero.addEventListener('mousemove', function (e) {
                var hr = hero.getBoundingClientRect();
                targetY = ((e.clientX - hr.left) / hr.width - 0.5) * 0.8;
                targetX = 0.35 + ((e.clientY - hr.top) / hr.height - 0.5) * 0.5;
            });
        }
        if ('IntersectionObserver' in window) {
            new IntersectionObserver(function (entries) {
                visible = entries[0].isIntersecting;
                if (visible) start();
            }).observe(hero);
        }
        document.addEventListener('visibilitychange', start);
        new MutationObserver(function () { if (!running) draw(); })
            .observe(root, { attributes: true, attributeFilter: ['data-theme'] });
        start();
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
