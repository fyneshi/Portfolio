// 3D hero: the profile photo as a floating card with orbiting shapes (Three.js).
// If WebGL or the library is unavailable, the normal HTML photo stays visible.
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';

const canvas = document.querySelector('.hero-3d');
const frame = canvas && canvas.closest('.photo-frame');
const hero = document.querySelector('.hero');
if (canvas && frame && hero) init();

function roundedRect(w, h, r) {
    const s = new THREE.Shape();
    const x = -w / 2, y = -h / 2;
    s.moveTo(x + r, y);
    s.lineTo(x + w - r, y);
    s.quadraticCurveTo(x + w, y, x + w, y + r);
    s.lineTo(x + w, y + h - r);
    s.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    s.lineTo(x + r, y + h);
    s.quadraticCurveTo(x, y + h, x, y + h - r);
    s.lineTo(x, y + r);
    s.quadraticCurveTo(x, y, x + r, y);
    return s;
}

function init() {
    let renderer;
    try {
        renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    } catch (e) {
        return; // no WebGL: keep the flat photo
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;

    const root = document.documentElement;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const scene = new THREE.Scene();

    // The canvas is 150% of the photo's height, so this camera distance makes
    // the 3D card appear exactly the same size as the HTML photo it replaces.
    const FOV = 35, CARD_W = 3, CARD_H = 3.75;
    const camera = new THREE.PerspectiveCamera(FOV, 1, 0.1, 100);
    camera.position.z = (CARD_H * 1.5) / (2 * Math.tan(THREE.MathUtils.degToRad(FOV / 2)));

    // --- Photo card -------------------------------------------------------
    const card = new THREE.Group();
    scene.add(card);

    const slab = { depth: 0.08, bevelEnabled: true, bevelThickness: 0.04, bevelSize: 0.04, bevelSegments: 4, curveSegments: 12 };

    const bodyMat = new THREE.MeshStandardMaterial({ roughness: 0.45, metalness: 0.1 });
    const body = new THREE.Mesh(new THREE.ExtrudeGeometry(roundedRect(CARD_W + 0.12, CARD_H + 0.12, 0.32), slab), bodyMat);
    body.position.z = -0.12; // front face sits at z = 0
    card.add(body);

    const backMat = new THREE.MeshStandardMaterial({ color: 0x3355c4, roughness: 0.3, metalness: 0.35 });
    const back = new THREE.Mesh(new THREE.ExtrudeGeometry(roundedRect(CARD_W, CARD_H, 0.3), slab), backMat);
    back.position.set(0.3, -0.3, -0.7);
    card.add(back);

    const photoMat = new THREE.MeshBasicMaterial({ transparent: true, opacity: 0 });
    const photo = new THREE.Mesh(new THREE.PlaneGeometry(CARD_W, CARD_H), photoMat);
    photo.position.z = 0.005;
    card.add(photo);

    // Crop the photo to 4:5 from the top with rounded corners, like the CSS version
    const htmlImg = frame.querySelector('img');
    const img = new Image();
    img.onload = () => {
        const c = document.createElement('canvas');
        c.width = 800;
        c.height = 1000;
        const g = c.getContext('2d');
        g.beginPath();
        if (g.roundRect) g.roundRect(0, 0, 800, 1000, 80); else g.rect(0, 0, 800, 1000);
        g.clip();
        const scale = Math.max(800 / img.width, 1000 / img.height);
        g.drawImage(img, (800 - img.width * scale) / 2, 0, img.width * scale, img.height * scale);

        const tex = new THREE.CanvasTexture(c);
        tex.colorSpace = THREE.SRGBColorSpace;
        tex.anisotropy = renderer.capabilities.getMaxAnisotropy();
        photoMat.map = tex;
        photoMat.opacity = 1;
        photoMat.needsUpdate = true;
        render();
        frame.classList.add('is-3d'); // hide the flat photo now that the 3D one is ready
    };
    img.src = htmlImg.currentSrc || htmlImg.src;

    // --- Orbiting shapes ----------------------------------------------------
    const ringMatA = new THREE.MeshBasicMaterial({ transparent: true, opacity: 0.4 });
    const ringMatB = new THREE.MeshBasicMaterial({ transparent: true, opacity: 0.35 });

    const orbitA = new THREE.Group();
    orbitA.rotation.set(1.2, 0.25, 0);
    orbitA.add(new THREE.Mesh(new THREE.TorusGeometry(2.6, 0.012, 8, 200), ringMatA));
    scene.add(orbitA);

    const orbitB = new THREE.Group();
    orbitB.rotation.set(-1.05, -0.5, 0.4);
    orbitB.add(new THREE.Mesh(new THREE.TorusGeometry(2.3, 0.01, 8, 200), ringMatB));
    scene.add(orbitB);

    const spinA = new THREE.Group();
    const spinB = new THREE.Group();
    orbitA.add(spinA);
    orbitB.add(spinB);

    const navy = new THREE.MeshStandardMaterial({ color: 0x2f4fb0, roughness: 0.25, metalness: 0.45, flatShading: true });
    const maroon = new THREE.MeshStandardMaterial({ color: 0xbe1d4b, roughness: 0.3, metalness: 0.35, flatShading: true });
    const pearl = new THREE.MeshStandardMaterial({ color: 0xf1f4ff, roughness: 0.2, metalness: 0.1 });
    const glow = new THREE.MeshBasicMaterial({ color: 0xfb8aa8 });

    const shapes = [];
    const addShape = (parent, geometry, material, radius, angle) => {
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(Math.cos(angle) * radius, Math.sin(angle) * radius, 0);
        parent.add(mesh);
        shapes.push(mesh);
    };
    addShape(spinA, new THREE.IcosahedronGeometry(0.3, 0), navy, 2.6, 0.3);
    addShape(spinA, new THREE.TorusGeometry(0.2, 0.075, 16, 40), pearl, 2.6, 2.4);
    addShape(spinA, new THREE.OctahedronGeometry(0.25, 0), maroon, 2.6, 4.3);
    addShape(spinB, new THREE.DodecahedronGeometry(0.22, 0), pearl, 2.3, 1.2);
    addShape(spinB, new THREE.SphereGeometry(0.09, 16, 16), glow, 2.3, 3.6);
    addShape(spinB, new THREE.TetrahedronGeometry(0.24, 0), navy, 2.3, 5.2);

    // --- Floating dust --------------------------------------------------------
    const dotCanvas = document.createElement('canvas');
    dotCanvas.width = dotCanvas.height = 32;
    const dg = dotCanvas.getContext('2d');
    const grad = dg.createRadialGradient(16, 16, 0, 16, 16, 16);
    grad.addColorStop(0, 'rgba(255,255,255,1)');
    grad.addColorStop(1, 'rgba(255,255,255,0)');
    dg.fillStyle = grad;
    dg.fillRect(0, 0, 32, 32);

    const COUNT = window.innerWidth < 700 ? 260 : 520;
    const positions = new Float32Array(COUNT * 3);
    for (let i = 0; i < COUNT; i++) {
        const r = 3.2 + Math.random() * 3;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
        positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta) * 0.8;
        positions[i * 3 + 2] = r * Math.cos(phi);
    }
    const dustGeo = new THREE.BufferGeometry();
    dustGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const dust = new THREE.Points(dustGeo, new THREE.PointsMaterial({
        size: 0.07, map: new THREE.CanvasTexture(dotCanvas), transparent: true, depthWrite: false
    }));
    scene.add(dust);

    // --- Lights -------------------------------------------------------------
    scene.add(new THREE.AmbientLight(0xffffff, 0.9));
    const key = new THREE.DirectionalLight(0xffffff, 2.2);
    key.position.set(3, 4, 6);
    scene.add(key);
    const rimPink = new THREE.PointLight(0xff5c8a, 2.5, 0, 0);
    rimPink.position.set(-4, -2, 3);
    scene.add(rimPink);
    const rimBlue = new THREE.PointLight(0x6f8fff, 2.5, 0, 0);
    rimBlue.position.set(4, -3, 2);
    scene.add(rimBlue);

    // --- Theme colours ------------------------------------------------------
    const applyTheme = () => {
        const dark = root.getAttribute('data-theme') === 'dark';
        bodyMat.color.set(dark ? 0x1b2540 : 0xffffff);
        ringMatA.color.set(dark ? 0x9db5ff : 0x1e3a8a);
        ringMatB.color.set(dark ? 0xfb8aa8 : 0x9f1239);
        dust.material.color.set(dark ? 0xc7d4ff : 0x3355c4);
        dust.material.opacity = dark ? 0.85 : 0.5;
        if (!running) render();
    };

    // --- Render loop --------------------------------------------------------
    let running = false, visible = true;
    let mx = 0, my = 0;
    const clock = new THREE.Clock();
    const render = () => renderer.render(scene, camera);

    const tick = () => {
        if (!visible || document.hidden) { running = false; return; }
        const t = clock.getElapsedTime();
        // Card leans toward the pointer, with a gentle idle sway
        card.rotation.y += ((mx * 0.4 + Math.sin(t * 0.5) * 0.08) - card.rotation.y) * 0.06;
        card.rotation.x += ((my * 0.25 + Math.cos(t * 0.4) * 0.04) - card.rotation.x) * 0.06;
        card.position.y = Math.sin(t * 0.8) * 0.06;
        spinA.rotation.z = t * 0.35;
        spinB.rotation.z = -t * 0.25;
        shapes.forEach((s, i) => {
            s.rotation.x = t * (0.6 + i * 0.1);
            s.rotation.y = t * (0.4 + i * 0.08);
        });
        dust.rotation.y = t * 0.03;
        dust.rotation.x = Math.sin(t * 0.1) * 0.1;
        render();
        requestAnimationFrame(tick);
    };
    const start = () => {
        if (!running && !reduceMotion) { running = true; requestAnimationFrame(tick); }
    };

    const resize = () => {
        const w = canvas.clientWidth, h = canvas.clientHeight;
        if (!w || !h) return;
        renderer.setSize(w, h, false);
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        render();
    };

    hero.addEventListener('pointermove', (e) => {
        const r = hero.getBoundingClientRect();
        mx = ((e.clientX - r.left) / r.width) * 2 - 1;
        my = ((e.clientY - r.top) / r.height) * 2 - 1;
    });
    hero.addEventListener('pointerleave', () => { mx = 0; my = 0; });

    new ResizeObserver(resize).observe(canvas);
    new MutationObserver(applyTheme).observe(root, { attributes: true, attributeFilter: ['data-theme'] });
    new IntersectionObserver((entries) => {
        visible = entries[0].isIntersecting;
        if (visible) start();
    }).observe(hero);
    document.addEventListener('visibilitychange', start);

    applyTheme();
    resize();
    start();
}
