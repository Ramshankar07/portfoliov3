/**
 * Teardown: an RTX 5090 Founders Edition, stood on its long edge and pulled
 * apart into its five layers: backplate, the short central PCB with its die,
 * the heatsink's two fin stacks, the shroud with its two openings, and the
 * fans. The layer under the pointer lifts, and the layers in front of it part
 * forward, staggered outwards from it on the 700ms lift curve. At rest the
 * 16-pin power connector on the PCB's top edge is the bright mark. The slider
 * is how far the layers in front part, in world units.
 *
 * The pattern: discrete items, as Riffle. The hit test unprojects the pointer
 * onto the plane of the resting top edges and picks the nearest resting layer,
 * so a layer moving out from under the pointer cannot flip the choice.
 */
const {
  Cam, circ, clamp, fit, hull, lerp, open, poly, proj, rad, rrect, seg, unproj,
  spring, stepS, reducedMotion, tdone, tset, tval, tween, disposer, mk, pointer, register,
} = HL;

const L = 150, H = 60, R = 23, FV = 30, FAN = [33, 117];
const NAMES = ["backplate", "pcb", "heatsink", "shroud", "fans"];
const Y = [0, 13, 29, 47, 53], LIFT = 12, STEP = 45, GMAX = 34, SPIN = 240;

const area = (pts) => pts.reduce((a, p, i) => { const q = pts[(i + 1) % pts.length]; return a + p[0] * q[1] - q[0] * p[1]; }, 0);
const wind = (pts, s) => (Math.sign(area(pts)) === s ? pts : pts.slice().reverse());
const ring = (w, rg) => rg.map((q) => w(q.u, q.v));
const disc = (cu, cv, r, n) => circ(r, n).map((q) => ({ u: q.u + cu, v: q.v + cv }));
const slab = (fd) => (w, wb) => poly(hull(ring(w, fd).concat(ring(wb, fd))));
const flat = (rg) => (w) => poly(ring(w, rg));

/** The five layers, back to front. Each is a thickness and its paths, as [class, (w, wb) => d]; w maps (u, v) on its front face, wb on its back. */
function layers(spin) {
  const full = rrect(0, 0, L, H, 5, 5), inset = rrect(2.4, 2.4, L - 2.4, H - 2.4, 3, 5);
  const board = rrect(46, 2, 104, H - 1, 2, 4);
  const chips = [];
  for (const u of [56, 94]) for (const v of [15, 25, 35, 45]) chips.push(rrect(u - 2.6, v - 2.6, u + 2.6, v + 2.6, 0.8, 2));
  const fins = (w) => {
    let d = "";
    for (let k = 0; k < 12; k++) for (const u of [7 + k * 3.4, L - 7 - k * 3.4]) d += seg(w(u, 5), w(u, H - 5));
    return d;
  };
  const shroud = rrect(0, 0, L, H, 6, 5);
  const blades = (w) => {
    let d = "";
    for (const cu of FAN) for (let k = 0; k < 7; k++) {
      const pts = [];
      for (let j = 0; j <= 4; j++) { const r = lerp(7, R - 2, j / 4), a = rad(spin.ph + k * 360 / 7 + j * 11); pts.push(w(cu + r * Math.cos(a), FV + r * Math.sin(a))); }
      d += open(pts);
    }
    return d;
  };
  return [
    { T: 1.6, parts: [["sil", slab(full)], ["nf lo", flat(inset)]] },
    { T: 1.4, parts: [
      ["sil", slab(board)],
      ["nf", flat(rrect(66, 21, 84, 39, 1.5, 3))],
      ["nf lo", flat(rrect(69.5, 24.5, 80.5, 35.5, 1, 3))],
      ["nf lo", (w) => chips.map((c) => poly(ring(w, c))).join("")],
      ["nf lo", (w) => { let d = ""; for (let u = 52; u <= 98; u += 3) d += seg(w(u, 2.5), w(u, 7)); return d; }],
      ["", slab(rrect(70, H - 2, 81, H + 4.5, 1.2, 3))],
    ] },
    { T: 11, parts: [["sil", slab(full)], ["nf lo", flat(inset)], ["nf lo", fins], ["nf lo", flat(rrect(52, 9, 98, 51, 3, 4))]] },
    { T: 4, parts: [
      ["sil", (w, wb) => {
        const h = hull(ring(w, shroud).concat(ring(wb, shroud))), s = Math.sign(area(h));
        return poly(h) + FAN.map((cu) => poly(wind(ring(w, disc(cu, FV, R + 1.5, 32)), -s))).join("");
      }],
      ["nf lo", (w) => seg(w(64, 3), w(64, H - 3)) + seg(w(86, 3), w(86, H - 3))],
    ] },
    { T: 2.5, parts: [
      ["nf sil", (w) => FAN.map((cu) => poly(ring(w, disc(cu, FV, R, 32)))).join("")],
      ["nf", blades],
      ["sil", (w, wb) => FAN.map((cu) => poly(hull(ring(w, disc(cu, FV, 7, 16)).concat(ring(wb, disc(cu, FV, 7, 16)))))).join("")],
    ] },
  ];
}

function mount({ stage, svg, read }, value) {
  const bag = disposer();
  let gap = value;

  // Fitted to the most extreme pose: the fans parted to the slider's far end, a layer lifted.
  const C = Cam(45, 0.5, 1.65);
  const Yf = Y[4] + GMAX;
  fit(C, [[0, -2, 0], [L, -2, 0], [0, Yf, 0], [L, Yf, 0], [0, -2, H + LIFT + 5], [L, -2, H + LIFT + 5], [L, Yf, H + LIFT]], 200, 166);
  const P = proj(C);

  const g = mk("g", {}, svg);
  // The fans turn at SPIN degrees a second; the rate is a spring, so they spin up on mount and stand still under reduced motion.
  const spin = { ph: 0, rate: spring(0) };
  spin.rate.t = reducedMotion() ? 0 : SPIN;
  const ls = layers(spin).map((ly, i) => {
    const grp = mk("g", {}, g);
    const els = ly.parts.map(([cls]) => mk("path", { class: cls }, grp));
    return { ...ly, els, sils: els.filter((_, k) => ly.parts[k][0].includes("sil")), dy: tween(0), dz: tween(0), last: "" };
  });
  const plug = ls[1].els[5];
  plug.classList.add("hi");

  function draw(i, now) {
    const ly = ls[i], y = Y[i] + tval(ly.dy, now), z = tval(ly.dz, now), key = y.toFixed(2) + "," + z.toFixed(2) + (i === 4 ? "," + spin.ph.toFixed(1) : "");
    if (key === ly.last) return;
    ly.last = key;
    const w = (u, v) => P(u, y, v + z), wb = (u, v) => P(u, y - ly.T, v + z);
    ly.parts.forEach(([, fn], k) => ly.els[k].setAttribute("d", fn(w, wb)));
  }

  const B = register(stage, (dt, now) => {
    let moving = stepS(spin.rate, dt) || spin.rate.x > 0.5;
    spin.ph = (spin.ph + spin.rate.x * dt) % (360 / 7);
    ls.forEach((ly, i) => { draw(i, now); if (!tdone(ly.dy, now) || !tdone(ly.dz, now)) moving = true; });
    return moving;
  });
  bag.add(B.unregister);

  /** The resting layer nearest the pointer, read on the plane of the resting top edges; -1 off the card. */
  function hit([sx, sy]) {
    const [x, y] = unproj(C, sx, sy, H);
    if (x < -30 || x > L + 30 || y < Y[0] - 14 || y > Y[4] + 70) return -1;
    let best = 0;
    Y.forEach((yi, i) => { if (Math.abs(y - yi) < Math.abs(y - Y[best])) best = i; });
    return best;
  }

  let act = -1;
  /** Lifts layer a and parts the ones in front of it (-1 closes the card). The stagger spreads out from the layer touched, or the one let go. */
  function setActive(a, force) {
    if (a === act && !force) return;
    const now = performance.now(), from = a >= 0 ? a : act;
    act = a;
    ls.forEach((ly, i) => {
      const delay = Math.abs(i - from) * STEP;
      tset(ly.dy, a >= 0 && i > a ? clamp(gap, 0, GMAX) : 0, now, delay);
      tset(ly.dz, a === i ? LIFT : 0, now, delay);
      ly.sils.forEach((el) => el.classList.toggle("hi", i === a));
    });
    plug.classList.toggle("hi", a < 0);
    read.textContent = a < 0 ? "rest" : NAMES[a];
    B.wake();
  }

  bag.add(pointer(stage, { move: (p) => setActive(hit(p)), leave: () => setActive(-1) }));
  bag.add(() => svg.replaceChildren());

  return {
    set: (v) => { gap = v; if (act >= 0) setActive(act, true); },
    destroy: bag.dispose,
  };
}

hairline({
  name: "teardown",
  means: "An RTX 5090 pulled apart into its layers, fans turning: the one under the pointer lifts, and the ones in front of it part.",
  rules: [1, 2, 7, 8],
  range: [10, 22, 34],
  mount,
});
