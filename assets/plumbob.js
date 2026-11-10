/* Faceted emerald, two tiny baked glow cards, and seven desktop sparks.
 * 30fps / 1.5 DPR max on desktop; 15fps / 1 DPR and eight faces on mobile.
 * No WebGL, full-frame bloom, dependencies, or work while out of view.
 */
(() => {
  'use strict';
  const root = document.documentElement;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const compact = matchMedia('(max-width: 760px), (pointer: coarse)');
  const hasVisibility = 'IntersectionObserver' in window;
  const saveData = Boolean(navigator.connection && navigator.connection.saveData);
  const mounts = [...document.querySelectorAll('[data-plumbob]')];
  const states = [];
  let frame = 0;
  let pageHidden = false;

  const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
  const midpoint = (a, b) => a.map((v, i) => (v + b[i]) * .5);
  const unit = v => {
    const n = Math.hypot(...v) || 1;
    return v.map(x => x / n);
  };
  const light = unit([-.6, -.8, 1.1]);
  const specularLight = unit([light[0], light[1], light[2] + 1]);
  const crown = [0, -1.03, 0];
  const tip = [0, 1.12, 0];
  const belt = [[-.44, 0, -.44], [.44, 0, -.44], [.44, 0, .44], [-.44, 0, .44]];
  const faces = [];
  for (let i = 0; i < 4; i++) {
    faces.push([crown, belt[i], belt[(i + 1) % 4]]);
    faces.push([tip, belt[(i + 1) % 4], belt[i]]);
  }

  function glowCard(color) {
    const card = document.createElement('canvas');
    card.width = card.height = 128;
    const ctx = card.getContext('2d');
    if (!ctx) return null;
    const g = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
    g.addColorStop(0, `rgba(${color}, .64)`);
    g.addColorStop(.23, `rgba(${color}, .24)`);
    g.addColorStop(.55, `rgba(${color}, .09)`);
    g.addColorStop(1, `rgba(${color}, 0)`);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 128, 128);
    return card;
  }

  // Shared cached textures are only 128 x 128 pixels each.
  const emeraldGlow = mounts.length ? glowCard('91, 255, 139') : null;
  const mintGlow = mounts.length ? glowCard('207, 255, 199') : null;

  function rotate(v, angle, tilt) {
    const cos = Math.cos(angle), sin = Math.sin(angle);
    const x = v[0] * cos + v[2] * sin;
    const z = -v[0] * sin + v[2] * cos;
    const y = v[1] * Math.cos(.12) - z * Math.sin(.12);
    const depth = v[1] * Math.sin(.12) + z * Math.cos(.12);
    return [x * Math.cos(tilt) - y * Math.sin(tilt), x * Math.sin(tilt) + y * Math.cos(tilt), depth];
  }

  function geometry(angle, tilt, detailed) {
    const mesh = [];
    faces.forEach((face, index) => {
      const p = face.map(v => rotate(v, angle, tilt));
      const a = p[1].map((v, i) => v - p[0][i]);
      const b = p[2].map((v, i) => v - p[0][i]);
      let normal = unit([a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]]);
      const center = p[0].map((v, i) => (v + p[1][i] + p[2][i]) / 3);
      if (dot(normal, center) < 0) normal = normal.map(v => -v);
      // Perspective camera is six model units in front of the gem.
      if (dot(normal, [-center[0], -center[1], 6 - center[2]]) <= 0) return;
      const diffuse = Math.max(0, dot(normal, light));
      const shine = Math.pow(Math.max(0, dot(normal, specularLight)), 20);
      const ab = midpoint(p[0], p[1]), bc = midpoint(p[1], p[2]), ca = midpoint(p[2], p[0]);
      const triangles = detailed ? [[p[0], ab, ca], [ab, p[1], bc], [ca, bc, p[2]], [ab, bc, ca]] : [p];
      triangles.forEach((vertices, facet) => mesh.push({
        vertices, index, facet, diffuse, shine,
        depth: vertices.reduce((sum, v) => sum + v[2], 0) / 3
      }));
    });
    return mesh.sort((a, b) => a.depth - b.depth);
  }

  function draw(state, time) {
    const { ctx, width: w, height: h, ratio, cheap } = state;
    if (!w || !h) return;
    const night = root.dataset.theme === 'dark';
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    ctx.clearRect(0, 0, w, h);
    const cx = w * .5;
    const cy = h * .46 + Math.sin(time * 1.4) * h * .014;
    const scale = h * .29;
    const angle = -.58 + time * .55;
    const tilt = -.1 + Math.sin(time * .6) * .035;

    // Glow is a pair of pre-baked translucent cards, never a blur pass.
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(-.28 + Math.sin(time * .35) * .18);
    if (emeraldGlow) {
      ctx.globalAlpha = night ? .98 : .76;
      ctx.drawImage(emeraldGlow, -w * .5, -h * .44, w, h * .88);
    }
    if (!cheap && mintGlow) {
      ctx.rotate(.8 + time * .1);
      ctx.globalAlpha = .28 + Math.sin(time * 1.5) * .06;
      ctx.drawImage(mintGlow, -w * .44, -h * .13, w * .88, h * .26);
    }
    ctx.restore();

    // Tight floor halo gives the floating jewel a soft grounding point.
    ctx.save();
    ctx.translate(cx, h * .88);
    ctx.scale(1, .18);
    ctx.globalAlpha = night ? .38 : .27;
    if (emeraldGlow) ctx.drawImage(emeraldGlow, -w * .3, -w * .3, w * .6, w * .6);
    ctx.restore();

    const project = v => {
      const perspective = 6 / (6 - v[2]);
      return [cx + v[0] * scale * perspective, cy + v[1] * scale * perspective];
    };
    for (const face of geometry(angle, tilt, !cheap)) {
      const p = face.vertices.map(project);
      const facet = cheap ? 0 : [-2, 4, -5, 1][face.facet];
      const lum = 24 + face.diffuse * 34 + face.shine * 22 + facet;
      const hue = 137 + face.index % 3 * 6;
      const gradient = ctx.createLinearGradient(p[0][0], p[0][1], p[2][0], p[2][1]);
      gradient.addColorStop(0, `hsl(${hue} 76% ${Math.min(89, lum + 9)}%)`);
      gradient.addColorStop(1, `hsl(${hue + 5} 89% ${Math.max(15, lum - 7)}%)`);
      ctx.beginPath();
      ctx.moveTo(...p[0]);
      ctx.lineTo(...p[1]);
      ctx.lineTo(...p[2]);
      ctx.closePath();
      ctx.fillStyle = gradient;
      ctx.fill();
      // Same-color subpixel stroke closes antialiasing seams between facets.
      ctx.strokeStyle = gradient;
      ctx.lineWidth = .6;
      ctx.stroke();
      if (!cheap) {
        ctx.strokeStyle = `rgba(219, 255, 218, ${.06 + face.shine * .27})`;
        ctx.lineWidth = .5;
        ctx.stroke();
      }
    }

    if (!cheap) {
      // Seven tiny screen-space sparks, rather than a particle engine.
      ctx.save();
      ctx.globalCompositeOperation = 'screen';
      for (let i = 0; i < 7; i++) {
        const phase = time * (.3 + i * .012) + i * 2.399;
        const x = cx + Math.cos(phase) * w * (.32 + (i % 2) * .06);
        const y = cy + Math.sin(phase * .8 + i) * h * .31;
        const alpha = .3 + (Math.sin(time * 1.5 + i * 1.8) + 1) * .22;
        const radius = i % 3 === 0 ? 1.5 : .8;
        ctx.globalAlpha = alpha;
        ctx.fillStyle = '#e2ffbf';
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
        if (i % 3 === 0) {
          ctx.fillRect(x - 4, y - .4, 8, .8);
          ctx.fillRect(x - .4, y - 4, .8, 8);
        }
      }
      ctx.restore();
    }
  }

  function size(state) {
    const bounds = state.mount.getBoundingClientRect();
    state.cheap = compact.matches || saveData;
    // Cap both CSS backing dimensions and device scale on very large displays.
    state.width = Math.min(state.cheap ? 132 : 220, Math.max(1, bounds.width));
    state.height = state.width * 4 / 3;
    state.ratio = Math.min(state.cheap ? 1 : 1.5, window.devicePixelRatio || 1);
    state.canvas.width = Math.round(state.width * state.ratio);
    state.canvas.height = Math.round(state.height * state.ratio);
    state.lastTick = null;
  }

  function running(state) {
    return hasVisibility && state.visible && !pageHidden && !document.hidden &&
      !reduced.matches && root.dataset.paused !== 'true';
  }

  function tick(now) {
    frame = 0;
    for (const state of states) {
      if (!running(state)) continue;
      if (state.lastTick === null) state.lastTick = now;
      const delta = now - state.lastTick;
      if (delta >= (state.cheap ? 1000 / 15 : 1000 / 30) - 1) {
        state.time += Math.min(delta, 100) / 1000;
        state.lastTick = now;
        draw(state, state.time);
      }
    }
    if (states.some(running)) frame = requestAnimationFrame(tick);
  }

  function sync(redraw = false) {
    for (const state of states) {
      if (!running(state)) state.lastTick = null;
      if (redraw && !document.hidden && !pageHidden) draw(state, reduced.matches ? 0 : state.time);
    }
    if (states.some(running)) {
      if (!frame) frame = requestAnimationFrame(tick);
    } else if (frame) {
      cancelAnimationFrame(frame);
      frame = 0;
    }
  }

  mounts.forEach(mount => {
    if (mount.dataset.plumbobReady === 'true') return;
    const canvas = mount.querySelector('canvas');
    if (!canvas) return;
    let ctx;
    try { ctx = canvas.getContext('2d', { alpha: true }); } catch { return; }
    if (!ctx) return; // The inline SVG remains a fully faceted static fallback.
    const state = { mount, canvas, ctx, visible: false, time: 0, lastTick: null };
    size(state);
    draw(state, 0);
    states.push(state);
    mount.dataset.plumbobReady = 'true';
  });
  if (!states.length) return;

  if (hasVisibility) {
    const observer = new IntersectionObserver(entries => {
      for (const entry of entries) {
        const state = states.find(item => item.mount === entry.target);
        if (state) state.visible = entry.isIntersecting && entry.intersectionRatio > 0;
      }
      sync();
    }, { threshold: 0 });
    states.forEach(state => observer.observe(state.mount));
  }
  // With no IntersectionObserver, keep the static gem, not a blind render loop.
  const resize = () => {
    states.forEach(size);
    sync(true);
  };
  if ('ResizeObserver' in window) {
    const observer = new ResizeObserver(resize);
    states.forEach(state => observer.observe(state.mount));
  }
  window.addEventListener('resize', resize, { passive: true });
  compact.addEventListener('change', resize);
  reduced.addEventListener('change', () => sync(true));
  document.addEventListener('visibilitychange', () => sync());
  new MutationObserver(() => sync(true)).observe(root, {
    attributes: true, attributeFilter: ['data-paused', 'data-theme']
  });
  window.addEventListener('pagehide', () => { pageHidden = true; sync(); });
  window.addEventListener('pageshow', () => { pageHidden = false; resize(); });
})();
