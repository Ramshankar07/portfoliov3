/**
 * Pensarai-inspired ASCII Hero Background
 * Pure Canvas 2D — zero external libraries
 *
 * Features:
 *  - 3D rotating GPU/chip object rendered in ASCII with depth shading
 *  - Matrix-style digital rain strips on edges
 *  - Green-on-black terminal aesthetic
 *  - Mouse-reactive parallax tilt on the 3D object
 *  - Ambient floating data symbols
 *  - Lightning / energy arcs
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

    // Green terminal palette
    const GREEN_BRIGHT = '#00FF41';
    const GREEN_MID    = '#00CC33';
    const GREEN_DIM    = '#007722';
    const GREEN_FAINT  = '#003311';
    const CYAN_GLOW    = '#00FFCC';

    let W = 0, H = 0;
    let mouse = { x: 0.5, y: 0.5 }; // Normalized 0-1
    let frame = 0;
    let lastTime = 0;

    /* ══════════════════════════════════════════════════════════
       3D GPU CHIP — vertex-based wireframe cube rendered as ASCII
       ══════════════════════════════════════════════════════════ */

    // GPU chip: a bevelled box with internal detail lines
    // Vertices of a unit cube scaled to chip proportions
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

    // Edges for the main box wireframe
    const chipEdges = [
        // Board outline bottom
        [0, 1], [1, 2], [2, 3], [3, 0],
        // Board outline top  (indices from corners added above)
        [4, 5], [5, 6], [6, 7], [7, 4],
        // Verticals
        [0, 4], [1, 5], [2, 6], [3, 7],
    ];

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
        const leftCount = Math.floor(W * 0.08 / RAIN_COL_W);
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
            speed: 0.5 + Math.random() * 1.5,
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
        const count = Math.floor((W * H) / 18000);
        for (let i = 0; i < count; i++) {
            floaters.push({
                x: Math.random() * W,
                y: Math.random() * H,
                ch: DATA_SYMS[Math.floor(Math.random() * DATA_SYMS.length)],
                alpha: 0.03 + Math.random() * 0.08,
                drift: (Math.random() - 0.5) * 0.3,
                speed: 0.1 + Math.random() * 0.3,
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
        // Arc emanates from near the chip
        const angle = Math.random() * Math.PI * 2;
        const startR = 60 + Math.random() * 40;
        const endR = startR + 80 + Math.random() * 120;
        const sx = chipCx + Math.cos(angle) * startR;
        const sy = chipCy + Math.sin(angle) * startR;
        const ex = chipCx + Math.cos(angle) * endR;
        const ey = chipCy + Math.sin(angle) * endR;

        const segs = [{ x: sx, y: sy }];
        const steps = 5 + Math.floor(Math.random() * 6);
        for (let i = 1; i <= steps; i++) {
            const t = i / steps;
            segs.push({
                x: sx + (ex - sx) * t + (Math.random() - 0.5) * 30,
                y: sy + (ey - sy) * t + (Math.random() - 0.5) * 20,
            });
        }
        arcs.push({ segs, life: 1, decay: 0.025 + Math.random() * 0.03 });
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
    canvas.addEventListener('mousemove', (e) => {
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

        // ── 1. Floating data symbols ──
        ctx.font = `${RAIN_FONT}px "Courier New", monospace`;
        ctx.textBaseline = 'top';
        for (const f of floaters) {
            f.y += f.speed;
            f.x += f.drift + Math.sin(t * 0.5 + f.phase) * 0.2;
            if (f.y > H + 20) { f.y = -20; f.x = Math.random() * W; }
            if (f.x < -20) f.x = W + 20;
            if (f.x > W + 20) f.x = -20;

            // Proximity to mouse
            const dx = f.x - mouse.x * W;
            const dy = f.y - mouse.y * H;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const glow = dist < 150 ? (1 - dist / 150) * 0.25 : 0;

            ctx.fillStyle = `rgba(0, 255, 65, ${(f.alpha + glow).toFixed(3)})`;
            ctx.fillText(f.ch, f.x, f.y);
        }

        // ── 2. Matrix rain strips ──
        for (const col of rainCols) {
            col.offset += col.speed * 0.05;
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
                    alpha = 0.9;
                    ctx.fillStyle = '#CCFFCC';
                } else if (distFromHead < 4) {
                    alpha = 0.4 - distFromHead * 0.08;
                    ctx.fillStyle = GREEN_BRIGHT;
                } else {
                    alpha = Math.max(0.02, 0.15 - distFromHead * 0.008);
                    ctx.fillStyle = GREEN_DIM;
                }

                ctx.globalAlpha = alpha;
                ctx.fillText(col.chars[row], col.x, py);
            }
        }
        ctx.globalAlpha = 1;

        // ── 3. 3D GPU Chip (ASCII rendered) ──
        const chipCx = W * 0.38;
        const chipCy = H * 0.45;
        const chipScale = Math.min(W, H) * 0.22;

        // Mouse parallax tilt
        const tiltX = (mouse.y - 0.5) * 0.4 + 0.3;   // base tilt + mouse
        const tiltY = t * 0.15 + (mouse.x - 0.5) * 0.5; // slow rotate + mouse

        // Project all vertices
        const projected = chipVerts.map(v => project(v, tiltX, tiltY, chipCx, chipCy, chipScale));

        // Sort by Z for depth ordering (back to front)
        const indexed = projected.map((p, i) => ({ ...p, i }));
        indexed.sort((a, b) => b.z - a.z);

        // Draw wireframe edges first (faint)
        ctx.strokeStyle = GREEN_DIM;
        ctx.lineWidth = 1;
        ctx.globalAlpha = 0.15;
        // Board edges
        const corners = projected.slice(-chipVerts.length); // reference all
        // Draw simple connecting lines for board outline
        const boardStart = chipVerts.length - 8 - 63 - 14; // approximate start of corner verts
        // Instead, draw all pairs within reasonable distance
        for (let i = 0; i < Math.min(projected.length, 200); i++) {
            for (let j = i + 1; j < Math.min(projected.length, 200); j++) {
                const a = projected[i], b = projected[j];
                const vi = chipVerts[i], vj = chipVerts[j];
                // Only connect vertices that are close in 3D space
                const d3 = Math.sqrt((vi[0]-vj[0])**2 + (vi[1]-vj[1])**2 + (vi[2]-vj[2])**2);
                if (d3 < 0.6 && d3 > 0.01) {
                    const midZ = (a.z + b.z) / 2;
                    const lineAlpha = 0.05 + Math.max(0, 0.12 * (1 - midZ));
                    ctx.strokeStyle = `rgba(0, 255, 65, ${lineAlpha.toFixed(3)})`;
                    ctx.beginPath();
                    ctx.moveTo(a.x, a.y);
                    ctx.lineTo(b.x, b.y);
                    ctx.stroke();
                }
            }
        }
        ctx.globalAlpha = 1;

        // Draw ASCII dots at each vertex
        ctx.font = `${Math.max(10, RAIN_FONT - 1)}px "Courier New", monospace`;
        for (const p of indexed) {
            const charIdx = Math.floor(p.brightness * (DENSITY_CHARS.length - 1));
            const ch = DENSITY_CHARS[Math.min(charIdx, DENSITY_CHARS.length - 1)];
            if (ch === ' ') continue;

            const alpha = 0.2 + p.brightness * 0.7;
            // Color shifts from dim green (far) to bright green/cyan (near)
            if (p.brightness > 0.6) {
                ctx.fillStyle = `rgba(0, 255, 65, ${alpha.toFixed(2)})`;
            } else if (p.brightness > 0.3) {
                ctx.fillStyle = `rgba(0, 204, 51, ${alpha.toFixed(2)})`;
            } else {
                ctx.fillStyle = `rgba(0, 119, 34, ${alpha.toFixed(2)})`;
            }
            ctx.fillText(ch, p.x, p.y);
        }

        // ── GPU labels floating near the chip ──
        ctx.font = `10px "Courier New", monospace`;
        const labels = [
            { text: 'GPU_CORE', ox: -0.8, oy: -0.15 },
            { text: 'CUDA×128', ox: -0.3, oy: -0.2 },
            { text: 'HBM3_VRAM', ox: 0.7, oy: 0 },
            { text: 'TENSOR_CORES', ox: -0.9, oy: 0.1 },
            { text: 'PCIe_5.0', ox: 0.2, oy: 0.25 },
            { text: 'NVLink', ox: 0.8, oy: -0.15 },
        ];
        for (const lbl of labels) {
            const lp = project([lbl.ox * 1.8, lbl.oy, 0], tiltX, tiltY, chipCx, chipCy, chipScale);
            const pulse = 0.3 + 0.2 * Math.sin(t * 2 + lbl.ox * 5);
            ctx.fillStyle = `rgba(0, 255, 65, ${pulse.toFixed(2)})`;
            ctx.fillText(lbl.text, lp.x - 25, lp.y);
        }

        // ── 4. Energy arcs ──
        if (frame % 70 === 0 || (frame % 30 === 0 && Math.random() > 0.5)) {
            spawnArc();
        }

        for (let i = arcs.length - 1; i >= 0; i--) {
            const arc = arcs[i];
            arc.life -= arc.decay;
            if (arc.life <= 0) { arcs.splice(i, 1); continue; }

            const a = arc.life;
            ctx.strokeStyle = `rgba(0, 255, 200, ${(a * 0.7).toFixed(2)})`;
            ctx.lineWidth = 1.5 * a;
            ctx.shadowColor = CYAN_GLOW;
            ctx.shadowBlur = 10 * a;

            ctx.beginPath();
            ctx.moveTo(arc.segs[0].x, arc.segs[0].y);
            for (let s = 1; s < arc.segs.length; s++) {
                ctx.lineTo(arc.segs[s].x, arc.segs[s].y);
            }
            ctx.stroke();

            // ASCII along arc
            ctx.shadowBlur = 0;
            ctx.font = `${RAIN_FONT}px "Courier New", monospace`;
            ctx.fillStyle = `rgba(0, 255, 200, ${(a * 0.5).toFixed(2)})`;
            for (let s = 0; s < arc.segs.length; s += 2) {
                const ch = '⚡╳※+'[Math.floor(Math.random() * 4)];
                ctx.fillText(ch, arc.segs[s].x, arc.segs[s].y);
            }
        }
        ctx.shadowBlur = 0;

        // ── 5. Scanline overlay (subtle) ──
        ctx.fillStyle = 'rgba(0,0,0,0.03)';
        for (let y = 0; y < H; y += 3) {
            ctx.fillRect(0, y, W, 1);
        }

        // ── 6. Vignette glow at edges ──
        const grd = ctx.createRadialGradient(chipCx, chipCy, chipScale * 0.5, chipCx, chipCy, Math.max(W, H) * 0.7);
        grd.addColorStop(0, 'rgba(0, 255, 65, 0.02)');
        grd.addColorStop(0.4, 'rgba(0, 100, 30, 0.01)');
        grd.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = grd;
        ctx.fillRect(0, 0, W, H);

        frame++;
    }

    /* ══════════════════════════════════════════════════════════
       ANIMATION LOOP — 60fps cap
       ══════════════════════════════════════════════════════════ */
    function loop(ts) {
        requestAnimationFrame(loop);
        const delta = ts - lastTime;
        if (delta < 16) return; // ~60fps
        lastTime = ts - (delta % 16);
        render(ts);
    }
    requestAnimationFrame(loop);

    document.addEventListener('visibilitychange', () => {
        if (!document.hidden) lastTime = performance.now();
    });
})();
