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
