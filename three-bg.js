/**
 * Hero background — GPU occupancy grid
 * Pure Canvas 2D, zero external libraries.
 *
 * Not a picture of a GPU: a running one. A fixed lattice of streaming
 * multiprocessors, each holding warp slots that fill as thread blocks are
 * dispatched, hold for their residency, then retire. Occupancy rises and falls
 * in waves the way it does under a real launch — some SMs saturate, some sit
 * half-idle, and the tail of a wave drains unevenly.
 *
 * The structure is the whole point. The previous background drew a sparse
 * vertex cloud plus matrix rain plus floating glyphs plus lightning arcs plus
 * scanlines — five effects at once, none of which read as anything. A stable
 * rectilinear lattice changing state in place reads as hardware instantly,
 * where moving streams of glyphs read as noise.
 *
 * Monochrome by binding commitment: cells vary in alpha only, never hue.
 */
(function () {
    'use strict';

    const canvas = document.getElementById('three-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });

    /* ══════════════════════════════════════════════════════════
       GEOMETRY
       Two levels, because one level is a grid and two levels is a chip:
       SM blocks laid out on a coarse lattice, each subdivided into warp slots.
       ══════════════════════════════════════════════════════════ */
    const SLOT_COLS = 4;      // warp slots across one SM
    const SLOT_ROWS = 4;      // warp slots down one SM
    const SLOT = 7;           // slot edge, px
    const SLOT_GAP = 2;       // between slots inside an SM
    const SM_GAP = 16;        // between SMs

    const SM_W = SLOT_COLS * SLOT + (SLOT_COLS - 1) * SLOT_GAP;
    const SM_H = SLOT_ROWS * SLOT + (SLOT_ROWS - 1) * SLOT_GAP;

    let W = 0, H = 0, dpr = 1;
    // Clearing around the portrait, measured from the element rather than
    // guessed: the lattice should seat the photo, not crowd it.
    let clear = null;
    let sms = [];
    let frame = 0;
    let lastTime = 0;
    const mouse = { x: 0.5, y: 0.5 };

    /* ══════════════════════════════════════════════════════════
       THEME
       ══════════════════════════════════════════════════════════ */
    function ink() {
        return document.documentElement.classList.contains('dark')
            ? '255, 255, 255'
            : '17, 17, 17';
    }

    /* ══════════════════════════════════════════════════════════
       LATTICE
       ══════════════════════════════════════════════════════════ */
    function buildGrid() {
        sms = [];
        const stepX = SM_W + SM_GAP;
        const stepY = SM_H + SM_GAP;
        const cols = Math.ceil(W / stepX) + 1;
        const rows = Math.ceil(H / stepY) + 1;

        // Centre the lattice so it never looks cropped at one edge only.
        const offX = (W - (cols * stepX - SM_GAP)) / 2;
        const offY = (H - (rows * stepY - SM_GAP)) / 2;

        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                const slots = [];
                for (let i = 0; i < SLOT_COLS * SLOT_ROWS; i++) {
                    slots.push({ load: 0, target: 0, until: 0 });
                }
                sms.push({
                    x: offX + c * stepX,
                    y: offY + r * stepY,
                    col: c,
                    row: r,
                    slots,
                    // Per-SM bias: real launches never balance perfectly.
                    // Wide spread: a launch where every SM behaves the same
                    // reads as wallpaper. Some of these will sit near-idle for
                    // the whole sweep, which is what real occupancy looks like.
                    bias: 0.12 + Math.random() * 0.88,
                    nextDispatch: Math.random() * 900
                });
            }
        }
    }

    /* ══════════════════════════════════════════════════════════
       SCHEDULER
       A wave sweeps across the lattice; SMs it touches dispatch blocks into
       free warp slots. Slots hold for a residency, then drain. Occupancy is an
       emergent property of the sweep, not a random flicker.
       ══════════════════════════════════════════════════════════ */
    // Three launches in flight at once, at different speeds and offsets. One
    // wave lights about a tenth of the lattice at any instant, which left most
    // of the field dark; overlapping launches keep it working while the
    // per-SM bias still decides who saturates and who idles.
    const waves = [
        { pos: 0,           speed: 1.15 },
        { pos: -(420),      speed: 0.72 },
        { pos: -(840),      speed: 1.55 }
    ];

    function schedule(t) {
        const span = W + 520;
        for (const w of waves) {
            w.pos = (w.pos + w.speed + mouse.x * 0.55 + span) % span;
        }

        for (const sm of sms) {
            let dist = Infinity;
            for (const w of waves) dist = Math.min(dist, Math.abs(sm.x - (w.pos - 260)));
            const inWave = dist < 190;

            if (inWave && t > sm.nextDispatch) {
                // Dispatch a block: claim a run of free slots.
                const want = Math.floor(Math.random() * 9 * sm.bias);
                let claimed = 0;
                for (let i = 0; i < sm.slots.length && claimed < want; i++) {
                    const s = sm.slots[i];
                    if (s.target === 0) {
                        s.target = 0.62 + Math.random() * 0.38;
                        s.until = t + 600 + Math.random() * 1600;
                        claimed++;
                    }
                }
                sm.nextDispatch = t + 120 + Math.random() * 420;
            }

            for (const s of sm.slots) {
                if (s.target > 0 && t > s.until) s.target = 0;       // retire
                // Fill fast, drain slow: that asymmetry is what makes it read
                // as work being done rather than a light blinking.
                const rate = s.target > s.load ? 0.16 : 0.035;
                s.load += (s.target - s.load) * rate;
                if (s.load < 0.004) s.load = 0;
            }
        }
    }

    /* ══════════════════════════════════════════════════════════
       RENDER
       ══════════════════════════════════════════════════════════ */
    function render(t) {
        ctx.clearRect(0, 0, W, H);
        const rgb = ink();

        for (const sm of sms) {
            // Vertical falloff. Edge-to-edge uniform density reads as a
            // repeating tile; easing it out top and bottom makes the lattice
            // sit in the composition instead of behind it.
            const vy = (sm.y + SM_H / 2) / H;
            let fall = Math.max(0, 1 - Math.pow(Math.abs(vy - 0.5) * 2, 2.1));

            if (clear) {
                const dx = sm.x + SM_W / 2 - clear.x;
                const dy = sm.y + SM_H / 2 - clear.y;
                const d = Math.sqrt(dx * dx + dy * dy);
                // Full clear inside the disc, easing back to full density over
                // the same distance again, so the photo has air around it.
                if (d < clear.r) fall = 0;
                else if (d < clear.r * 2) fall *= (d - clear.r) / clear.r;
            }

            // SM boundary: a hairline that only resolves once the block is
            // carrying load, so idle regions recede instead of drawing a
            // uniform net across the whole hero.
            let occ = 0;
            for (const s of sm.slots) occ += s.load;
            occ /= sm.slots.length;

            if (occ > 0.02) {
                ctx.strokeStyle = `rgba(${rgb}, ${(0.04 + occ * 0.14) * fall})`;
                ctx.lineWidth = 1;
                ctx.strokeRect(
                    Math.round(sm.x) - 3.5,
                    Math.round(sm.y) - 3.5,
                    SM_W + 7,
                    SM_H + 7
                );
            }

            for (let i = 0; i < sm.slots.length; i++) {
                const s = sm.slots[i];
                const sx = sm.x + (i % SLOT_COLS) * (SLOT + SLOT_GAP);
                const sy = sm.y + Math.floor(i / SLOT_COLS) * (SLOT + SLOT_GAP);

                if (s.load < 0.01) {
                    // Idle slot: a dim seat, so the lattice is legible as
                    // structure even where nothing is scheduled.
                    ctx.fillStyle = `rgba(${rgb}, ${0.028 * fall})`;
                    ctx.fillRect(sx, sy, SLOT, SLOT);
                } else {
                    ctx.fillStyle = `rgba(${rgb}, ${(0.07 + s.load * 1.05) * fall})`;
                    ctx.fillRect(sx, sy, SLOT, SLOT);
                }
            }
        }

        frame++;
    }

    /* ══════════════════════════════════════════════════════════
       SIZING
       ══════════════════════════════════════════════════════════ */
    function resize() {
        const parent = canvas.parentElement;
        const rect = parent ? parent.getBoundingClientRect() : { width: window.innerWidth, height: window.innerHeight };
        W = Math.max(1, Math.floor(rect.width));
        H = Math.max(1, Math.floor(rect.height));
        dpr = Math.min(window.devicePixelRatio || 1, 2);
        canvas.width = Math.floor(W * dpr);
        canvas.height = Math.floor(H * dpr);
        canvas.style.width = W + 'px';
        canvas.style.height = H + 'px';
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

        const portrait = document.querySelector('#hero img');
        if (portrait && parent) {
            const pr = portrait.getBoundingClientRect();
            const cr = canvas.getBoundingClientRect();
            clear = {
                x: pr.left - cr.left + pr.width / 2,
                y: pr.top - cr.top + pr.height / 2,
                r: pr.width / 2 + 26
            };
        } else {
            clear = null;
        }

        buildGrid();
    }

    window.addEventListener('resize', resize, { passive: true });
    window.addEventListener('pointermove', (e) => {
        mouse.x = e.clientX / window.innerWidth;
        mouse.y = e.clientY / window.innerHeight;
    }, { passive: true });

    resize();

    /* ══════════════════════════════════════════════════════════
       ANIMATION LOOP — 60fps cap (paused when hidden / reduced motion)
       ══════════════════════════════════════════════════════════ */
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let animating = false;

    function loop(ts) {
        if (!animating) return;
        requestAnimationFrame(loop);
        if (document.hidden) return;
        const delta = ts - lastTime;
        if (delta < 16) return; // ~60fps
        lastTime = ts - (delta % 16);
        schedule(ts);
        render(ts);
    }

    function startLoop() {
        if (animating || prefersReducedMotion.matches) return;
        animating = true;
        lastTime = performance.now();
        requestAnimationFrame(loop);
    }

    function stopLoop() {
        animating = false;
    }

    function staticFrame() {
        // Reduced motion gets a settled snapshot rather than an empty grid:
        // one pass of scheduling, then a single paint.
        for (let i = 0; i < 90; i++) schedule(i * 16);
        render(0);
    }

    if (prefersReducedMotion.matches) {
        staticFrame();
    } else {
        startLoop();
    }

    prefersReducedMotion.addEventListener('change', (e) => {
        if (e.matches) {
            stopLoop();
            staticFrame();
        } else {
            startLoop();
        }
    });

    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            stopLoop();
        } else if (!prefersReducedMotion.matches) {
            startLoop();
        }
    });

    // Pause the loop once the hero scrolls out of view — the canvas only
    // lives behind the hero, so there's no reason to keep painting it while
    // the visitor reads the rest of the page.
    if ('IntersectionObserver' in window) {
        const heroEl = document.getElementById('hero') || canvas;
        const io = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting) {
                if (!document.hidden && !prefersReducedMotion.matches) startLoop();
            } else {
                stopLoop();
            }
        }, { threshold: 0 });
        io.observe(heroEl);
    }
})();
