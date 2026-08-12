/* Общие хелперы демо-страниц «Вибрация корабля». */
'use strict';
const V = (() => {
  const NS = 'http://www.w3.org/2000/svg';

  /* число с русской запятой */
  function fmt(x, d = 4) {
    if (!isFinite(x)) return '∞';
    let s = x.toFixed(d);
    if (Object.is(+s, 0)) s = (0).toFixed(d);
    return s.replace('-', '−').replace('.', ',');
  }

  /* привязка ползунка: on(value) при каждом изменении, значение в соседний .val */
  function slider(id, on) {
    const el = document.getElementById(id);
    const out = document.querySelector(`[data-for="${id}"]`);
    const fire = () => {
      const v = parseFloat(el.value);
      if (out) out.textContent = fmt(v, +(el.dataset.d ?? 2));
      on(v);
    };
    el.addEventListener('input', fire);
    fire();
    return {
      el,
      set(v) { el.value = v; fire(); },
      get() { return parseFloat(el.value); },
    };
  }

  /* Гаусс с выбором главного элемента: A x = b */
  function solveLin(Ain, bin) {
    const n = bin.length;
    const A = Ain.map((r, i) => [...r, bin[i]]);
    for (let c = 0; c < n; c++) {
      let p = c;
      for (let r = c + 1; r < n; r++) if (Math.abs(A[r][c]) > Math.abs(A[p][c])) p = r;
      [A[c], A[p]] = [A[p], A[c]];
      const d = A[c][c];
      if (Math.abs(d) < 1e-14) return null; // вырождение (резонанс)
      for (let r = 0; r < n; r++) {
        if (r === c) continue;
        const k = A[r][c] / d;
        for (let j = c; j <= n; j++) A[r][j] -= k * A[c][j];
      }
    }
    return A.map((r, i) => r[n] / r[i]);
  }

  /* пружина-зигзаг из (x1,y1) в (x2,y2): points для polyline */
  function springPts(x1, y1, x2, y2, coils = 20, w = 12) {
    const dx = x2 - x1, dy = y2 - y1;
    const len = Math.hypot(dx, dy) || 1;
    const ux = dx / len, uy = dy / len;       // вдоль
    const px = -uy, py = ux;                  // поперёк
    const lead = Math.min(14, len * 0.12);    // прямые хвостики
    const pts = [[x1, y1], [x1 + ux * lead, y1 + uy * lead]];
    const body = len - 2 * lead;
    for (let i = 0; i < coils; i++) {
      const s = lead + body * (i + 0.5) / coils;
      const side = (i % 2 ? -1 : 1) * w;
      pts.push([x1 + ux * s + px * side, y1 + uy * s + py * side]);
    }
    pts.push([x2 - ux * lead, y2 - uy * lead], [x2, y2]);
    return pts.map((p) => `${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ');
  }

  /* штриховка заделки: группа коротких линий вдоль отрезка */
  function hatch(x1, y1, x2, y2, step = 9, len = 9, ang = Math.PI * 0.75) {
    const dx = x2 - x1, dy = y2 - y1, L = Math.hypot(dx, dy);
    const ux = dx / L, uy = dy / L;
    const hx = Math.cos(ang) * ux - Math.sin(ang) * uy;
    const hy = Math.sin(ang) * ux + Math.cos(ang) * uy;
    let d = '';
    for (let s = step / 2; s < L; s += step) {
      const x = x1 + ux * s, y = y1 + uy * s;
      d += `M${x.toFixed(1)},${y.toFixed(1)} l${(hx * len).toFixed(1)},${(hy * len).toFixed(1)} `;
    }
    return d;
  }

  /* цикл анимации: step(dt, t) с dt по часам; параметры моделей меняют t извне */
  function loop(step) {
    let last = null, t = 0, run = true;
    function frame(now) {
      if (!run) return;
      if (last == null) last = now;
      let dt = (now - last) / 1000; last = now;
      if (dt > 0.05) dt = 0.05;          // вкладка была скрыта — не прыгаем
      t += dt;
      step(dt, t);
      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
    return {
      reset() { t = 0; },
      get t() { return t; },
      set t(v) { t = v; },
      stop() { run = false; },
    };
  }

  function el(name, attrs = {}, parent = null) {
    const e = document.createElementNS(NS, name);
    for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, v);
    if (parent) parent.appendChild(e);
    return e;
  }

  /* график y(t) в готовом svg: фиксированное окно по t, кривые + бегущая точка.
     opts: {x0,y0,w,h, t1, ymin, ymax, series:[{color,w,dash}], xlab, ylab, ticks} */
  function plot(svg, opts) {
    const { x0, y0, w, h, ymin, ymax } = opts;
    let t1 = opts.t1;
    const g = el('g', {}, svg);
    // рамка и сетка
    el('rect', { x: x0, y: y0, width: w, height: h, fill: '#fff', stroke: '#d8d6cf' }, g);
    const gGrid = el('g', { stroke: '#ececec', 'stroke-width': 1 }, g);
    const gAxis = el('g', {}, g);
    const zeroY = y0 + h * (ymax / (ymax - ymin));
    if (ymin < 0 && ymax > 0)
      el('line', { x1: x0, y1: zeroY, x2: x0 + w, y2: zeroY, stroke: '#b9b9c0', 'stroke-width': 1 }, gAxis);
    el('text', { x: x0 + w - 4, y: y0 + h - 6, 'text-anchor': 'end', class: 'lbl-axis' }, gAxis)
      .textContent = opts.xlab || 't, с';
    el('text', { x: x0 + 6, y: y0 + 16, class: 'lbl-axis' }, gAxis).textContent = opts.ylab || '';
    const curves = opts.series.map((s) => el('polyline', {
      fill: 'none', stroke: s.color, 'stroke-width': s.w || 2,
      ...(s.dash ? { 'stroke-dasharray': s.dash } : {}),
      'stroke-linejoin': 'round',
    }, g));
    const dots = opts.series.map((s) => el('circle', { r: 4, fill: s.color, stroke: '#fff', 'stroke-width': 1.2 }, g));
    const X = (t) => x0 + (t / t1) * w;
    const Y = (v) => {
      const yy = y0 + h * ((ymax - v) / (ymax - ymin));
      return Math.max(y0 - 40, Math.min(y0 + h + 40, yy));
    };
    function grid() {
      gGrid.innerHTML = '';
      const stepT = t1 > 12 ? 5 : t1 > 5 ? 2 : 1;
      for (let t = stepT; t < t1 - 1e-9; t += stepT) {
        el('line', { x1: X(t), y1: y0, x2: X(t), y2: y0 + h }, gGrid);
        el('text', { x: X(t), y: y0 + h + 14, 'text-anchor': 'middle', class: 'lbl-axis', stroke: 'none' }, gGrid)
          .textContent = fmt(t, 0);
      }
    }
    grid();
    return {
      X, Y,
      get t1() { return t1; },
      set t1(v) { t1 = v; grid(); },
      /* funcs[i](t) → значение; рисуем до tCur, точка на конце */
      draw(funcs, tCur) {
        const N = 400;
        funcs.forEach((f, i) => {
          if (!f) { curves[i].setAttribute('points', ''); dots[i].setAttribute('display', 'none'); return; }
          const tEnd = Math.min(tCur, t1);
          const pts = [];
          for (let j = 0; j <= N; j++) {
            const t = tEnd * j / N;
            pts.push(`${X(t).toFixed(1)},${Y(f(t)).toFixed(1)}`);
          }
          curves[i].setAttribute('points', pts.join(' '));
          dots[i].setAttribute('display', '');
          dots[i].setAttribute('cx', X(tEnd));
          dots[i].setAttribute('cy', Y(f(tEnd)));
        });
      },
      /* статические кривые целиком (огибающие) — вернёт polyline */
      curve(f, attrs) {
        const p = el('polyline', { fill: 'none', ...attrs }, g);
        const N = 300, pts = [];
        for (let j = 0; j <= N; j++) {
          const t = t1 * j / N;
          const v = f(t);
          if (isFinite(v)) pts.push(`${X(t).toFixed(1)},${Y(v).toFixed(1)}`);
        }
        p.setAttribute('points', pts.join(' '));
        return {
          el: p,
          update(f2) {
            const pts2 = [];
            for (let j = 0; j <= N; j++) {
              const t = t1 * j / N;
              const v = f2(t);
              if (isFinite(v)) pts2.push(`${X(t).toFixed(1)},${Y(v).toFixed(1)}`);
            }
            p.setAttribute('points', pts2.join(' '));
          },
        };
      },
    };
  }

  /* шкала частот 0..fmax со стрелкой текущего значения и метками резонансов */
  function freqScale(svg, { x0, y0, w, fmax, marks }) {
    const g = el('g', {}, svg);
    el('line', { x1: x0, y1: y0, x2: x0 + w, y2: y0, stroke: '#16161a', 'stroke-width': 2 }, g);
    const X = (f) => x0 + (Math.max(0, Math.min(fmax, f)) / fmax) * w;
    for (let f = 0; f <= fmax + 1e-9; f += fmax <= 10 ? 1 : 5) {
      el('line', { x1: X(f), y1: y0 - 4, x2: X(f), y2: y0 + 4, stroke: '#16161a' }, g);
      el('text', { x: X(f), y: y0 + 18, 'text-anchor': 'middle', class: 'lbl-axis' }, g).textContent = fmt(f, 0);
    }
    const markEls = marks.map((m) => {
      const mg = el('g', {}, g);
      el('line', { x1: X(m.f), y1: y0 - 14, x2: X(m.f), y2: y0, stroke: m.color || '#b3382e', 'stroke-width': 2 }, mg);
      el('text', { x: X(m.f), y: y0 - 18, 'text-anchor': 'middle', class: 'lbl', fill: m.color || '#b3382e', 'font-size': 13 }, mg)
        .textContent = m.label;
      return mg;
    });
    const cur = el('g', {}, g);
    el('path', { d: 'M0,-10 L5,-2 L-5,-2 z', fill: '#155e75', transform: `translate(${x0},${y0 + 10}) rotate(180)` }, cur);
    const curTxt = el('text', { 'text-anchor': 'middle', class: 'lbl', fill: '#155e75', 'font-size': 13 }, cur);
    return {
      X,
      set(f, label) {
        cur.firstChild.setAttribute('transform', `translate(${X(f)},${y0 + 12}) rotate(180)`);
        curTxt.setAttribute('x', X(f)); curTxt.setAttribute('y', y0 + 34);
        curTxt.textContent = label;
      },
      moveMark(i, f, label) {
        const mg = markEls[i];
        mg.children[0].setAttribute('x1', X(f)); mg.children[0].setAttribute('x2', X(f));
        mg.children[1].setAttribute('x', X(f));
        if (label) mg.children[1].textContent = label;
      },
    };
  }

  /* детерминированный ГПСЧ (mulberry32) для случайной дороги */
  function rng(seed) {
    let a = seed >>> 0;
    return () => {
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  /* самопроверка: сравнение с эталонами Mathcad, лог в консоль */
  function selfcheck(name, rows) {
    let ok = true;
    const out = rows.map(([label, got, ref, tol]) => {
      const pass = Math.abs(got - ref) <= (tol ?? Math.abs(ref) * 1e-4 + 1e-9);
      if (!pass) ok = false;
      return `${pass ? 'OK ' : 'FAIL'} ${label}: got=${got} ref=${ref}`;
    });
    console.log(`[selfcheck ${name}] ${ok ? 'PASSED' : 'FAILED'}\n` + out.join('\n'));
    window.SELFCHECK = window.SELFCHECK || {};
    window.SELFCHECK[name] = { ok, rows: out };
    return ok;
  }

  return { fmt, slider, solveLin, springPts, hatch, loop, el, plot, freqScale, rng, selfcheck, NS };
})();
