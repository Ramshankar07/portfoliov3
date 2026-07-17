/**
 * Dynamic Monochrome ASCII Hero Background
 * Pure Canvas 2D — zero external libraries
 *
 * Features:
 *  - 3D rotating GPU/chip object rendered in ASCII with depth shading
 *  - Responsive monochrome color schemes adapting to light/dark themes
 *  - Matrix-style falling character strips on edges in grayscale
 *  - Mouse-reactive parallax tilt on the 3D object
 *  - Ambient floating data symbols
 *  - Dynamic energy lightning arcs in stark monochrome
 */
(function () {
    'use strict';

    const canvas = document.getElementById('three-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });

    /* ══════════════════════════════════════════════════════════
       CONFIG
       ══════════════════════════════════════════════════════════ */
    const DENSITY_CHARS = ' .:-=+*#%@█';   // light → dense (for 3D shading)
    const RAIN_CHARS = 'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン0123456789ABCDEF';
    const DATA_SYMS   = '█▓▒░╔╗╚╝║═├┤┬┴┼<>{}[]01';

    let W = 0, H = 0;
    let mouse = { x: 0.5, y: 0.5 }; // Normalized 0-1
    let frame = 0;
    let lastTime = 0;

    /* ══════════════════════════════════════════════════════════
       3D GPU CHIP — vertex-based wireframe cube rendered as ASCII
       ══════════════════════════════════════════════════════════ */

    // GPU chip: a bevelled box with internal detail lines
    function makeChipVertices() {
        const sx = 1.4, sy = 0.25, sz = 1.0; // wide, thin, deep
        const verts = [];
        // Main board — top face
        for (let x = -1; x <= 1; x += 0.5) {
            for (let z = -1; z <= 1; z += 0.5) {
                verts.push([x * sx, -sy, z * sz]);
                verts.push([x * sx,  sy, z * sz]);
            }
        }
        // Edges of the board
        const corners = [
            [-sx, -sy, -sz], [ sx, -sy, -sz], [ sx, -sy,  sz], [-sx, -sy,  sz],
            [-sx,  sy, -sz], [ sx,  sy, -sz], [ sx,  sy,  sz], [-sx,  sy,  sz],
        ];
        verts.push(...corners);

        // Die/core (raised block in center)
        const ds = 0.45, dh = 0.15;
        const die = [
            [-ds, -sy - dh, -ds], [ ds, -sy - dh, -ds],
            [ ds, -sy - dh,  ds], [-ds, -sy - dh,  ds],
            [-ds, -sy,      -ds], [ ds, -sy,      -ds],
            [ ds, -sy,       ds], [-ds, -sy,       ds],
        ];
        verts.push(...die);

        // Heat pipes (lines on top)
        for (let i = -3; i <= 3; i++) {
            const px = i * 0.35;
            verts.push([px, -sy - 0.02, -sz * 0.8]);
            verts.push([px, -sy - 0.02,  sz * 0.8]);
        }

        // Pin grid on bottom
        for (let x = -4; x <= 4; x++) {
            for (let z = -3; z <= 3; z++) {
                verts.push([x * 0.28, sy + 0.08, z * 0.25]);
            }
        }

        return verts;
    }

    const chipVerts = makeChipVertices();

    // Project 3D → 2D with rotation
    function project(v, rx, ry, cx, cy, scale) {
        // Rotate Y
        let x = v[0] * Math.cos(ry) - v[2] * Math.sin(ry);
        let z = v[0] * Math.sin(ry) + v[2] * Math.cos(ry);
        let y = v[1];
        // Rotate X
        const y2 = y * Math.cos(rx) - z * Math.sin(rx);
        const z2 = y * Math.sin(rx) + z * Math.cos(rx);

        const perspective = 4 / (4 + z2);
        return {
            x: cx + x * scale * perspective,
            y: cy + y2 * scale * perspective,
            z: z2,
            brightness: Math.max(0, Math.min(1, 0.3 + (1 - z2) * 0.35)),
        };
    }

    /* ══════════════════════════════════════════════════════════
       MATRIX RAIN COLUMNS
       ══════════════════════════════════════════════════════════ */
    const RAIN_FONT = 13;
    const RAIN_COL_W = 16;
    let rainCols = [];

    function initRain() {
        rainCols = [];
        const leftCount = Math.max(2, Math.floor(W * 0.06 / RAIN_COL_W));
        const rightCount = leftCount;

        for (let i = 0; i < leftCount; i++) {
            rainCols.push(makeRainCol(i * RAIN_COL_W + 4, H));
        }
        for (let i = 0; i < rightCount; i++) {
            rainCols.push(makeRainCol(W - (i + 1) * RAIN_COL_W + 4, H));
        }
    }

    function makeRainCol(x, maxH) {
        const chars = [];
        const count = Math.floor(maxH / RAIN_FONT) + 2;
        for (let i = 0; i < count; i++) {
            chars.push(RAIN_CHARS[Math.floor(Math.random() * RAIN_CHARS.length)]);
        }
        return {
            x,
            chars,
            speed: 0.4 + Math.random() * 1.0,
            offset: Math.random() * count,
            head: Math.floor(Math.random() * count),
        };
    }

    /* ══════════════════════════════════════════════════════════
       FLOATING DATA SYMBOLS
       ══════════════════════════════════════════════════════════ */
    let floaters = [];

    function initFloaters() {
        floaters = [];
        const count = Math.floor((W * H) / 22000);
        for (let i = 0; i < count; i++) {
            floaters.push({
                x: Math.random() * W,
                y: Math.random() * H,
                ch: DATA_SYMS[Math.floor(Math.random() * DATA_SYMS.length)],
                alpha: 0.02 + Math.random() * 0.06,
                drift: (Math.random() - 0.5) * 0.2,
                speed: 0.08 + Math.random() * 0.2,
                phase: Math.random() * Math.PI * 2,
            });
        }
    }

    /* ══════════════════════════════════════════════════════════
       ENERGY ARCS (lightning)
       ══════════════════════════════════════════════════════════ */
    let arcs = [];

    function spawnArc() {
        const chipCx = W * 0.38;
        const chipCy = H * 0.45;
        const angle = Math.random() * Math.PI * 2;
        const startR = 60 + Math.random() * 40;
        const endR = startR + 60 + Math.random() * 100;
        const sx = chipCx + Math.cos(angle) * startR;
        const sy = chipCy + Math.sin(angle) * startR;
        const ex = chipCx + Math.cos(angle) * endR;
        const ey = chipCy + Math.sin(angle) * endR;

        const segs = [{ x: sx, y: sy }];
        const steps = 4 + Math.floor(Math.random() * 5);
        for (let i = 1; i <= steps; i++) {
            const t = i / steps;
            segs.push({
                x: sx + (ex - sx) * t + (Math.random() - 0.5) * 25,
                y: sy + (ey - sy) * t + (Math.random() - 0.5) * 15,
            });
        }
        arcs.push({ segs, life: 1, decay: 0.03 + Math.random() * 0.04 });
    }

    /* ══════════════════════════════════════════════════════════
       RESIZE
       ══════════════════════════════════════════════════════════ */
    function resize() {
        const parent = canvas.parentElement;
        if (!parent) return;
        W = parent.offsetWidth;
        H = parent.offsetHeight;
        canvas.width = W;
        canvas.height = H;
        initRain();
        initFloaters();
    }
    resize();
    window.addEventListener('resize', resize);

    /* ══════════════════════════════════════════════════════════
       MOUSE
       ══════════════════════════════════════════════════════════ */
    window.addEventListener('mousemove', (e) => {
        const rect = canvas.getBoundingClientRect();
        mouse.x = (e.clientX - rect.left) / W;
        mouse.y = (e.clientY - rect.top) / H;
    });

    /* ══════════════════════════════════════════════════════════
       RENDER
       ══════════════════════════════════════════════════════════ */
    function render(ts) {
        ctx.clearRect(0, 0, W, H);
        const t = ts * 0.001;

        // Dynamic theme detection
        const isDark = document.documentElement.classList.contains('dark');
        const themeRgb = isDark ? '255, 255, 255' : '0, 0, 0';
        const baseColorHex = isDark ? '#FFFFFF' : '#111111';
        const faintColorHex = isDark ? '#333333' : '#CCCCCC';

        // ── 1. Floating data symbols ──
        ctx.font = `${RAIN_FONT}px "Courier New", monospace`;
        ctx.textBaseline = 'top';
        for (const f of floaters) {
            f.y += f.speed;
            f.x += f.drift + Math.sin(t * 0.4 + f.phase) * 0.15;
            if (f.y > H + 20) { f.y = -20; f.x = Math.random() * W; }
            if (f.x < -20) f.x = W + 20;
            if (f.x > W + 20) f.x = -20;

            // Proximity to mouse
            const dx = f.x - mouse.x * W;
            const dy = f.y - mouse.y * H;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const glow = dist < 120 ? (1 - dist / 120) * 0.15 : 0;

            ctx.fillStyle = `rgba(${themeRgb}, ${(f.alpha + glow).toFixed(3)})`;
            ctx.fillText(f.ch, f.x, f.y);
        }

        // ── 2. Matrix rain strips ──
        for (const col of rainCols) {
            col.offset += col.speed * 0.04;
            const count = col.chars.length;

            for (let i = 0; i < count; i++) {
                const row = (i + Math.floor(col.offset)) % count;
                const py = i * RAIN_FONT;
                if (py > H) break;

                // Randomize char occasionally
                if (Math.random() < 0.005) {
                    col.chars[row] = RAIN_CHARS[Math.floor(Math.random() * RAIN_CHARS.length)];
                }

                // Head char is brightest
                const distFromHead = (count + i - Math.floor(col.offset) % count) % count;
                let alpha;
                if (distFromHead === 0) {
                    alpha = isDark ? 0.7 : 0.6;
                    ctx.fillStyle = baseColorHex;
                } else if (distFromHead < 4) {
                    alpha = 0.25 - distFromHead * 0.05;
                    ctx.fillStyle = baseColorHex;
                } else {
                    alpha = Math.max(0.01, 0.08 - distFromHead * 0.005);
                    ctx.fillStyle = faintColorHex;
                }

                ctx.globalAlpha = alpha;
                ctx.fillText(col.chars[row], col.x, py);
            }
        }
        ctx.globalAlpha = 1;

        // ── 3. 3D GPU Chip (ASCII rendered) ──
        const chipCx = W * 0.38;
        const chipCy = H * 0.45;
        const chipScale = Math.min(W, H) * 0.20;

        // Mouse parallax tilt
        const tiltX = (mouse.y - 0.5) * 0.3 + 0.25;   // base tilt + mouse
        const tiltY = t * 0.12 + (mouse.x - 0.5) * 0.4; // slow rotate + mouse

        // Project all vertices
        const projected = chipVerts.map(v => project(v, tiltX, tiltY, chipCx, chipCy, chipScale));

        // Sort by Z for depth ordering (back to front)
        const indexed = projected.map((p, i) => ({ ...p, i }));
        indexed.sort((a, b) => b.z - a.z);

        // Draw wireframe edges first (faint)
        ctx.lineWidth = 1;
        ctx.globalAlpha = 0.12;
        
        for (let i = 0; i < Math.min(projected.length, 180); i++) {
            for (let j = i + 1; j < Math.min(projected.length, 180); j++) {
                const a = projected[i], b = projected[j];
                const vi = chipVerts[i], vj = chipVerts[j];
                // Only connect vertices that are close in 3D space
                const d3 = Math.sqrt((vi[0]-vj[0])**2 + (vi[1]-vj[1])**2 + (vi[2]-vj[2])**2);
                if (d3 < 0.55 && d3 > 0.01) {
                    const midZ = (a.z + b.z) / 2;
                    const lineAlpha = 0.02 + Math.max(0, 0.08 * (1 - midZ));
                    ctx.strokeStyle = `rgba(${themeRgb}, ${lineAlpha.toFixed(3)})`;
                    ctx.beginPath();
                    ctx.moveTo(a.x, a.y);
                    ctx.lineTo(b.x, b.y);
                    ctx.stroke();
                }
            }
        }
        ctx.globalAlpha = 1;

        // Draw ASCII characters at each vertex
        ctx.font = `${Math.max(10, RAIN_FONT - 1)}px "Courier New", monospace`;
        for (const p of indexed) {
            const charIdx = Math.floor(p.brightness * (DENSITY_CHARS.length - 1));
            const ch = DENSITY_CHARS[Math.min(charIdx, DENSITY_CHARS.length - 1)];
            if (ch === ' ') continue;

            const alpha = 0.12 + p.brightness * 0.5;
            ctx.fillStyle = `rgba(${themeRgb}, ${alpha.toFixed(2)})`;
            ctx.fillText(ch, p.x, p.y);
        }

        // ── GPU labels floating near the chip ──
        ctx.font = `9px "Courier New", monospace`;
        const labels = [
            { text: 'GPU_CORE', ox: -0.8, oy: -0.15 },
            { text: 'TENSOR×512', ox: -0.3, oy: -0.2 },
            { text: 'HBM3_VRAM', ox: 0.7, oy: 0 },
            { text: 'ROCm_AMD', ox: -0.9, oy: 0.1 },
            { text: 'PCIe_6.0', ox: 0.2, oy: 0.25 },
            { text: 'NVLink_5', ox: 0.8, oy: -0.15 },
        ];
        for (const lbl of labels) {
            const lp = project([lbl.ox * 1.8, lbl.oy, 0], tiltX, tiltY, chipCx, chipCy, chipScale);
            const pulse = 0.15 + 0.15 * Math.sin(t * 1.8 + lbl.ox * 4);
            ctx.fillStyle = `rgba(${themeRgb}, ${pulse.toFixed(2)})`;
            ctx.fillText(lbl.text, lp.x - 22, lp.y);
        }

        // ── 4. Energy arcs ──
        if (frame % 85 === 0 || (frame % 35 === 0 && Math.random() > 0.6)) {
            spawnArc();
        }

        for (let i = arcs.length - 1; i >= 0; i--) {
            const arc = arcs[i];
            arc.life -= arc.decay;
            if (arc.life <= 0) { arcs.splice(i, 1); continue; }

            const a = arc.life;
            ctx.strokeStyle = `rgba(${themeRgb}, ${(a * 0.45).toFixed(2)})`;
            ctx.lineWidth = 1.2 * a;
            ctx.shadowColor = `rgb(${themeRgb})`;
            ctx.shadowBlur = 6 * a;

            ctx.beginPath();
            ctx.moveTo(arc.segs[0].x, arc.segs[0].y);
            for (let s = 1; s < arc.segs.length; s++) {
                ctx.lineTo(arc.segs[s].x, arc.segs[s].y);
            }
            ctx.stroke();

            // ASCII along arc
            ctx.shadowBlur = 0;
            ctx.font = `${RAIN_FONT}px "Courier New", monospace`;
            ctx.fillStyle = `rgba(${themeRgb}, ${(a * 0.3).toFixed(2)})`;
            for (let s = 0; s < arc.segs.length; s += 2) {
                const ch = '·╳+*'[Math.floor(Math.random() * 4)];
                ctx.fillText(ch, arc.segs[s].x, arc.segs[s].y);
            }
        }
        ctx.shadowBlur = 0;

        // ── 5. Scanline overlay (subtle) ──
        ctx.fillStyle = isDark ? 'rgba(255,255,255,0.008)' : 'rgba(0,0,0,0.008)';
        for (let y = 0; y < H; y += 4) {
            ctx.fillRect(0, y, W, 1);
        }

        // ── 6. Vignette glow at edges ──
        const grd = ctx.createRadialGradient(chipCx, chipCy, chipScale * 0.4, chipCx, chipCy, Math.max(W, H) * 0.7);
        if (isDark) {
            grd.addColorStop(0, 'rgba(8, 8, 8, 0)');
            grd.addColorStop(0.5, 'rgba(8, 8, 8, 0.05)');
            grd.addColorStop(1, 'rgba(8, 8, 8, 0.25)');
        } else {
            grd.addColorStop(0, 'rgba(250, 249, 246, 0)');
            grd.addColorStop(0.5, 'rgba(250, 249, 246, 0.05)');
            grd.addColorStop(1, 'rgba(250, 249, 246, 0.25)');
        }
        ctx.fillStyle = grd;
        ctx.fillRect(0, 0, W, H);

        frame++;
    }

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

    if (prefersReducedMotion.matches) {
        // Static first frame for accessibility
        render(0);
    } else {
        startLoop();
    }

    prefersReducedMotion.addEventListener('change', (e) => {
        if (e.matches) {
            stopLoop();
            render(0);
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
})();
