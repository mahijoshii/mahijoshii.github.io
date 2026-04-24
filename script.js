/* ── EXPERIENCE TABS ── */
document.getElementById('exp-tabs').addEventListener('click', e => {
  const t = e.target.closest('.exp-tab');
  if (!t) return;
  const i = t.dataset.i;
  document.querySelectorAll('.exp-tab').forEach(x => x.classList.remove('active'));
  document.querySelectorAll('.exp-panel').forEach(x => x.classList.remove('active'));
  t.classList.add('active');
  document.querySelector('.exp-panel[data-i="' + i + '"]').classList.add('active');
});

/* ── SKILL BARS (animate on scroll) ── */
const skillObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.querySelectorAll('.bar-fill').forEach(b => { b.style.width = b.dataset.w + '%'; });
      skillObs.unobserve(e.target);
    }
  });
}, { threshold: 0.3 });
document.querySelectorAll('#skills').forEach(s => skillObs.observe(s));

/* ── NEURAL NETWORK ── */
(function () {
  const c = document.getElementById('nn-canvas');
  if (!c) return;
  const ctx = c.getContext('2d');
  const W = 1040, H = 320;
  c.width = W; c.height = H;

  const layers = [
    { n: 6, label: 'input' },
    { n: 8, label: 'hidden 1' },
    { n: 8, label: 'hidden 2' },
    { n: 6, label: 'hidden 3' },
    { n: 4, label: 'output' }
  ];
  const outputLabels = ['SWE', 'ML / AI', 'Full Stack', 'Research'];
  const layerX = layers.map((_, i) => 80 + i * (W - 160) / (layers.length - 1));

  const nodes = [];
  layers.forEach((l, li) => {
    for (let ni = 0; ni < l.n; ni++) {
      const gap = H / (l.n + 1);
      nodes.push({ li, ni, x: layerX[li], y: gap * (ni + 1), act: 0, targetAct: 0 });
    }
  });

  const edges = [];
  for (let li = 0; li < layers.length - 1; li++) {
    const from = nodes.filter(n => n.li === li);
    const to = nodes.filter(n => n.li === li + 1);
    from.forEach(f => to.forEach(t => {
      edges.push({ f, t, w: Math.random() * 0.6 + 0.2 });
    }));
  }

  let mouse = { x: -999, y: -999 };
  // track mouse relative to canvas
  c.addEventListener('mousemove', e => {
    const r = c.getBoundingClientRect();
    mouse.x = (e.clientX - r.left) * (W / r.width);
    mouse.y = (e.clientY - r.top) * (H / r.height);
  });
  c.addEventListener('mouseleave', () => { mouse.x = -999; mouse.y = -999; });

  const sig = x => 1 / (1 + Math.exp(-x * 4));

  function compute() {
    nodes.filter(n => n.li === 0).forEach(n => {
      const d = Math.hypot(mouse.x - n.x, mouse.y - n.y);
      n.targetAct = Math.max(0, 1 - d / 220);
    });
    for (let li = 1; li < layers.length; li++) {
      nodes.filter(n => n.li === li).forEach(t => {
        const sum = edges.filter(e => e.t === t).reduce((acc, e) => acc + e.f.act * e.w, 0);
        t.targetAct = sig(sum - 0.5);
      });
    }
    nodes.forEach(n => { n.act += (n.targetAct - n.act) * 0.12; });
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = '#0a0605';
    ctx.fillRect(0, 0, W, H);

    edges.forEach(e => {
      const alpha = e.f.act * e.t.act * 0.7;
      if (alpha < 0.01) return;
      ctx.beginPath();
      ctx.moveTo(e.f.x, e.f.y);
      ctx.lineTo(e.t.x, e.t.y);
      ctx.strokeStyle = `rgba(242,196,168,${Math.min(alpha * 1.2, 0.65)})`;
      ctx.lineWidth = alpha * 2.5;
      ctx.stroke();
    });

    nodes.forEach(n => {
      const a = n.act;
      const r = 7 + a * 6;
      if (a > 0.15) {
        const grd = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, r * 3.5);
        grd.addColorStop(0, `rgba(242,196,168,${a * 0.3})`);
        grd.addColorStop(1, 'rgba(242,196,168,0)');
        ctx.beginPath(); ctx.arc(n.x, n.y, r * 3.5, 0, Math.PI * 2);
        ctx.fillStyle = grd; ctx.fill();
      }
      ctx.beginPath(); ctx.arc(n.x, n.y, r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${Math.floor(201 + 41 * a)},${Math.floor(123 + 73 * a)},${Math.floor(110 + 58 * a)},${0.2 + a * 0.8})`;
      ctx.fill();
      ctx.strokeStyle = `rgba(242,196,168,${a * 0.8 + 0.15})`;
      ctx.lineWidth = 1; ctx.stroke();
    });

    // layer labels
    layers.forEach((l, li) => {
      ctx.fillStyle = 'rgba(242,196,168,0.25)';
      ctx.font = '11px DM Sans,sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(l.label, layerX[li], H - 6);
    });

    // output labels
    nodes.filter(n => n.li === layers.length - 1).forEach((n, i) => {
      if (n.act > 0.25) {
        ctx.fillStyle = `rgba(242,196,168,${n.act})`;
        ctx.font = `500 11px DM Sans,sans-serif`;
        ctx.textAlign = 'left';
        ctx.fillText(outputLabels[i], n.x + 14, n.y + 4);
      }
    });
  }

  (function loop() { compute(); draw(); requestAnimationFrame(loop); })();
})();

/* ── SPACE SHOOTER GAME ── */
const canvas = document.getElementById('gc');
const gctx = canvas.getContext('2d');
const GW = 380, GH = 420;
canvas.width = GW; canvas.height = GH;

let gRunning = false, score = 0, best = 0, lives = 3, level = 1;
let bullets = [], asteroids = [], stars = [], particles = [];
let ship = { x: GW / 2, y: GH - 60, speed: 5 };
let keys = {}, lastTime = 0, asteroidTimer = 0, starTimer = 0, shootCooldown = 0, animId;

function resetGame() {
  score = 0; lives = 3; level = 1;
  bullets = []; asteroids = []; stars = []; particles = [];
  ship.x = GW / 2; shootCooldown = 0; asteroidTimer = 0; starTimer = 0;
  document.getElementById('gs').textContent = '0';
  document.getElementById('gl').textContent = '❤❤❤';
}

function startGame() {
  resetGame(); gRunning = true;
  document.getElementById('gov').style.display = 'none';
  lastTime = performance.now();
  animId = requestAnimationFrame(gloop);
}

function endGame() {
  gRunning = false; cancelAnimationFrame(animId);
  if (score > best) { best = score; document.getElementById('gb').textContent = best; }
  const ov = document.getElementById('gov');
  ov.querySelector('h3').textContent = score >= 30 ? '🌟 Amazing!' : score >= 15 ? 'Nice flying!' : '💥 Game Over';
  ov.querySelector('p').textContent = 'You scored ' + score + ' points' + (score === best && score > 0 ? ' - new high score! ✦' : '') + '.';
  const sd = document.getElementById('gov-score');
  sd.style.display = 'block'; sd.textContent = 'score: ' + score + ' | best: ' + best;
  ov.querySelector('button').textContent = 'Play again 🚀';
  ov.style.display = 'flex';
}

function spawnAsteroid() {
  const sizes = [16, 22, 28];
  const s = sizes[Math.floor(Math.random() * sizes.length)];
  asteroids.push({ x: Math.random() * (GW - 40) + 20, y: -s, r: s, speed: 1 + Math.random() * 1.5 + level * 0.12, rot: 0, rotSpeed: (Math.random() - 0.5) * 0.05 });
}
function spawnStar() { stars.push({ x: Math.random() * (GW - 40) + 20, y: -10, speed: 1.2 + Math.random() }); }
function spawnBullet() { bullets.push({ x: ship.x, y: ship.y - 16, speed: 9 }); }
function spawnParticles(x, y, col, n) {
  for (let i = 0; i < n; i++) {
    const a = Math.random() * Math.PI * 2, sp = 1 + Math.random() * 3;
    particles.push({ x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, life: 1, col });
  }
}
function dist(a, b) { return Math.hypot(a.x - b.x, a.y - b.y); }

function drawShip(x, y) {
  gctx.save(); gctx.translate(x, y);
  gctx.beginPath(); gctx.moveTo(0, -14); gctx.lineTo(11, 12); gctx.lineTo(0, 7); gctx.lineTo(-11, 12); gctx.closePath();
  gctx.fillStyle = '#F7E8E0'; gctx.fill();
  gctx.strokeStyle = '#C97B6E'; gctx.lineWidth = 1.5; gctx.stroke();
  gctx.beginPath(); gctx.arc(0, -2, 5, 0, Math.PI * 2);
  gctx.fillStyle = 'rgba(242,196,168,0.6)'; gctx.fill();
  gctx.strokeStyle = '#E8A5A0'; gctx.lineWidth = 1; gctx.stroke();
  if (keys['ArrowUp'] || keys['w']) {
    gctx.beginPath(); gctx.moveTo(-5, 12); gctx.lineTo(0, 22 + Math.random() * 6); gctx.lineTo(5, 12);
    gctx.fillStyle = 'rgba(242,196,168,0.8)'; gctx.fill();
  }
  gctx.restore();
}

function drawAsteroid(a) {
  gctx.save(); gctx.translate(a.x, a.y); gctx.rotate(a.rot);
  gctx.beginPath();
  for (let i = 0; i < 8; i++) {
    const ang = (i / 8) * Math.PI * 2;
    const r = a.r * (0.75 + Math.sin(i * 7 + a.rot) * 0.25);
    i === 0 ? gctx.moveTo(Math.cos(ang) * r, Math.sin(ang) * r) : gctx.lineTo(Math.cos(ang) * r, Math.sin(ang) * r);
  }
  gctx.closePath();
  gctx.fillStyle = 'rgba(80,50,45,0.85)'; gctx.fill();
  gctx.strokeStyle = 'rgba(201,123,110,0.4)'; gctx.lineWidth = 1.5; gctx.stroke();
  gctx.restore();
}

function gloop(ts) {
  const dt = Math.min(ts - lastTime, 50); lastTime = ts;
  gctx.clearRect(0, 0, GW, GH);
  gctx.fillStyle = '#0F0A0A'; gctx.fillRect(0, 0, GW, GH);

  // starfield bg
  gctx.fillStyle = 'rgba(250,240,234,0.25)';
  for (let i = 0; i < 40; i++) {
    gctx.fillRect((i * 73 + ts * 0.01 * (i % 3 + 1)) % GW, (i * 137 + ts * 0.005) % GH, 1, 1);
  }

  if ((keys['ArrowLeft'] || keys['a']) && ship.x > 20) ship.x -= ship.speed;
  if ((keys['ArrowRight'] || keys['d']) && ship.x < GW - 20) ship.x += ship.speed;
  if ((keys['ArrowUp'] || keys['w']) && ship.y > 40) ship.y -= ship.speed * 0.7;
  if ((keys['ArrowDown'] || keys['s']) && ship.y < GH - 30) ship.y += ship.speed * 0.7;

  shootCooldown -= dt;
  if ((keys[' '] || keys['z']) && shootCooldown <= 0) { spawnBullet(); shootCooldown = 220; }

  asteroidTimer += dt;
  if (asteroidTimer > Math.max(700, 1600 - level * 80)) { spawnAsteroid(); asteroidTimer = 0; }
  starTimer += dt;
  if (starTimer > 2200) { spawnStar(); starTimer = 0; }
  level = 1 + Math.floor(score / 10);

  // bullets
  bullets = bullets.filter(b => {
    b.y -= b.speed;
    if (b.y < -10) return false;
    gctx.fillStyle = '#F2C4A8';
    gctx.beginPath(); gctx.ellipse(b.x, b.y, 2, 5, 0, 0, Math.PI * 2); gctx.fill();
    return true;
  });

  // asteroids
  asteroids = asteroids.filter(a => {
    a.y += a.speed * (dt / 16); a.rot += a.rotSpeed;
    let hit = false;
    bullets = bullets.filter(b => {
      if (!hit && dist(b, a) < a.r + 4) {
        hit = true; spawnParticles(a.x, a.y, '#D4897A', 8);
        score += a.r > 24 ? 2 : 1;
        document.getElementById('gs').textContent = score;
        return false;
      }
      return true;
    });
    if (hit) return false;
    if (dist(a, ship) < a.r + 10) {
      lives--;
      const h = ['', '❤', '❤❤', '❤❤❤'];
      document.getElementById('gl').textContent = h[Math.max(0, lives)] || '';
      spawnParticles(ship.x, ship.y, '#E8A5A0', 12);
      if (lives <= 0) { endGame(); return false; }
      return false;
    }
    if (a.y > GH + a.r) return false;
    drawAsteroid(a);
    return true;
  });

  // stars
  stars = stars.filter(s => {
    s.y += s.speed * (dt / 16);
    if (dist(s, ship) < 20) {
      score += 3; document.getElementById('gs').textContent = score;
      spawnParticles(s.x, s.y, '#F2C4A8', 6);
      return false;
    }
    if (s.y > GH + 10) return false;
    gctx.fillStyle = '#F2C4A8'; gctx.font = '12px serif';
    gctx.textAlign = 'center'; gctx.textBaseline = 'middle';
    gctx.fillText('✦', s.x, s.y);
    return true;
  });

  // particles
  particles = particles.filter(p => {
    p.x += p.vx; p.y += p.vy; p.life -= 0.04;
    gctx.globalAlpha = p.life;
    gctx.fillStyle = p.col; gctx.fillRect(p.x, p.y, 2, 2);
    gctx.globalAlpha = 1;
    return p.life > 0;
  });

  drawShip(ship.x, ship.y);

  gctx.fillStyle = 'rgba(242,196,168,0.7)';
  gctx.font = '500 12px DM Sans,sans-serif';
  gctx.textAlign = 'left'; gctx.fillText('LVL ' + level, 10, 18);
  gctx.textAlign = 'right'; gctx.fillText('SPACE to shoot', GW - 10, 18);

  if (gRunning) animId = requestAnimationFrame(gloop);
}

document.addEventListener('keydown', e => { keys[e.key] = true; if (e.key === ' ') e.preventDefault(); });
document.addEventListener('keyup', e => { keys[e.key] = false; });

let touchX = null;
canvas.addEventListener('touchstart', e => { touchX = e.touches[0].clientX; e.preventDefault(); }, { passive: false });
canvas.addEventListener('touchmove', e => {
  if (touchX === null) return;
  ship.x = Math.max(20, Math.min(GW - 20, ship.x + (e.touches[0].clientX - touchX) * 1.2));
  touchX = e.touches[0].clientX;
  e.preventDefault();
}, { passive: false });
canvas.addEventListener('touchend', () => { keys[' '] = true; setTimeout(() => keys[' '] = false, 100); }, { passive: false });


/* ── FLOATING ROBOT COMPANION ── */
document.addEventListener('DOMContentLoaded', function () {
  const robot = document.getElementById('robot-companion');
  const floater = document.getElementById('robot-float');
  const bubble = document.getElementById('robot-bubble');
  const bubbleText = document.getElementById('robot-bubble-text');
  const badge = document.getElementById('robot-badge');
  const body = document.getElementById('robot-body');
  if (!robot || !floater || !bubble || !bubbleText || !badge || !body) return;

  const facts = [
    "Mahi did competitive gymnastics, so yes, the discipline and chaos tolerance started early.",
    "She trained in ballet for 14 years, which might explain the mix of precision, patience, and strong posture.",
    "When she started university, she won a $120K scholarship :) kind of iconic.",
    "Mahi keeps a Sudoku book with her to keep her mind stimulated!",
    "Mahi won a hackathon and was able to present her project @ Microsoft HQ in Toronto.",
    "She loves cooking and baking, so building things doesn't stop at code... sometimes it ends in dessert :D.",
    "She loves Harry Potter! She's read the books, seen the movies, and been to Universal!",
    "Mahi has been an ambassador for Canadian Association for Girls in Science (CAGIS), and Canada Learning Code (CLC)!",
    "She's into running and wants to run a marathon soon.",
    "Mahi began a STEM Club in high school, and it is still growing to this day.",
    "She sometimes builds things just to see if she can.",
    "Mahi has been to 15+ countries and genuinely loves traveling.",
    "Mahi has a habit of turning small ideas into full projects.",
    "She loves building things, whether that's robots, full-stack apps, or ideas that somehow become real."
  ];

  let factIndex = 0;
  let bubbleTimer = null;
  let introTimer = null;
  let attentionTimer = null;
  let lastClick = Date.now();
  let visible = true;
  let introActive = true;

  function hideBubble() {
    bubble.classList.remove('show');
    visible = false;
  }

  function showBubble(text, autoHideMs = 6500, hintText = '') {
    bubbleText.textContent = text;
    const hint = bubble.querySelector('.robot-bubble-hint');
    if (hint) {
      hint.textContent = hintText;
      hint.style.display = hintText ? 'block' : 'none';
    }
    bubble.classList.add('show');
    visible = true;
    if (bubbleTimer) clearTimeout(bubbleTimer);
    if (autoHideMs > 0) {
      bubbleTimer = setTimeout(() => {
        hideBubble();
      }, autoHideMs);
    }
  }

  function nextFact() {
    const text = facts[factIndex % facts.length];
    factIndex += 1;
    return text;
  }

  function celebrateAttention() {
    badge.classList.add('show');
    floater.classList.add('attention');
    floater.classList.add('wave');
    setTimeout(() => badge.classList.remove('show'), 2200);
    setTimeout(() => {
      floater.classList.remove('attention');
      floater.classList.remove('wave');
    }, 2500);
  }

  function maybeGrabAttention() {
    const idleFor = Date.now() - lastClick;
    if (idleFor > 18000 && !visible) {
      celebrateAttention();
    }
  }

  function onActivate() {
    lastClick = Date.now();
    body.blur();

    if (introActive) {
      introActive = false;
      if (introTimer) clearTimeout(introTimer);
      if (bubbleTimer) clearTimeout(bubbleTimer);
    }

    showBubble(nextFact(), 7000, '');
    floater.classList.add('wave');
    setTimeout(() => floater.classList.remove('wave'), 2400);
    badge.classList.remove('show');
  }

  body.addEventListener('click', onActivate);
  body.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onActivate();
    }
  });

  introTimer = setTimeout(() => {
    introActive = false;
    hideBubble();
  }, 60000);

  attentionTimer = setInterval(maybeGrabAttention, 5000);
})();
