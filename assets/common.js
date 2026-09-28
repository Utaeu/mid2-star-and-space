/* ===========================================================
   Ⅷ. 별과 우주 — 공통 스크립트 (상단 메뉴 / 배경 / 애니메이션 도우미 / 퀴즈)
   =========================================================== */
(function () {
  "use strict";

  /* ---------- 페이지 목록 ---------- */
  var PAGES = [
    { f: "index.html", t: "단원 홈", s: "별과 우주" },
    { f: "s1-01-distance.html", t: "1-01 별까지의 거리", s: "시차 · 연주 시차 · 파섹" },
    { f: "s1-02-magnitude.html", t: "1-02 별의 등급과 밝기", s: "밝기와 거리 · 겉보기/절대 등급" },
    { f: "s1-03-temperature.html", t: "1-03 별의 표면 온도와 색", s: "별의 색 · 표면 온도" },
    { f: "s2-01-galaxy.html", t: "2-01 우리은하", s: "우리은하 · 성단 · 성운" },
    { f: "s2-02-expansion.html", t: "2-02 팽창하는 우주", s: "외부 은하 · 우주 팽창" },
    { f: "s2-03-exploration.html", t: "2-03 우주 탐사", s: "탐사 성과 · 일상 속 기술" },
    { f: "review.html", t: "단원 정리·평가", s: "개념 정리 · 확인 문제" }
  ];

  var here = location.pathname.split("/").pop() || "index.html";
  here = decodeURIComponent(here);

  /* ---------- 상단 바 만들기 ---------- */
  function buildChrome() {
    var bar = document.querySelector(".topbar-inner nav.chips");
    if (bar) {
      PAGES.forEach(function (p) {
        var a = document.createElement("a");
        a.href = p.f;
        a.textContent = p.t;
        if (p.f === here) a.className = "on";
        bar.appendChild(a);
      });
    }
    // file:// 로 열면 localStorage 가 막힐 수 있으므로 감싸 둔다
    var store = {
      get: function (k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
      set: function (k, v) { try { localStorage.setItem(k, v); } catch (e) { } }
    };
    // 화면 밝기 (어두운 화면 / 밝은 화면)
    var tg = document.querySelector(".tmode");
    if (tg) {
      var th = document.createElement("button");
      th.type = "button";
      th.className = "theme-btn";
      var paint = function () {
        var light = document.documentElement.getAttribute("data-theme") === "light";
        th.innerHTML = light ? '<span class="ic">🌙</span>어두운 화면' : '<span class="ic">☀</span>밝은 화면';
        th.title = light ? "어두운 화면으로 바꾸기" : "밝은 화면으로 바꾸기";
      };
      th.addEventListener("click", function () {
        var light = document.documentElement.getAttribute("data-theme") !== "light";
        if (light) document.documentElement.setAttribute("data-theme", "light");
        else document.documentElement.removeAttribute("data-theme");
        store.set("suj-theme", light ? "light" : "dark");
        paint();
      });
      paint();
      tg.parentNode.insertBefore(th, tg);
    }
    // 교사 모드
    if (tg) {
      if (store.get("suj-teacher") === "1") document.body.classList.add("teacher-on");
      tg.addEventListener("click", function () {
        var on = document.body.classList.toggle("teacher-on");
        store.set("suj-teacher", on ? "1" : "0");
      });
    }
    // 이전/다음
    var pg = document.querySelector(".pager");
    if (pg) {
      var i = PAGES.findIndex(function (p) { return p.f === here; });
      var html = "";
      if (i > 0) html += '<a class="prev" href="' + PAGES[i - 1].f + '"><div class="lb">◀ 이전</div><div class="tt">' + PAGES[i - 1].t + "</div></a>";
      else html += "<span></span>";
      if (i >= 0 && i < PAGES.length - 1) html += '<a class="next" href="' + PAGES[i + 1].f + '"><div class="lb">다음 ▶</div><div class="tt">' + PAGES[i + 1].t + "</div></a>";
      pg.innerHTML = html;
    }
    // 진행 막대
    var pr = document.getElementById("progress");
    if (pr) {
      var upd = function () {
        var h = document.documentElement;
        var max = h.scrollHeight - h.clientHeight;
        pr.style.width = (max > 0 ? (h.scrollTop / max) * 100 : 0) + "%";
      };
      document.addEventListener("scroll", upd, { passive: true });
      upd();
    }
  }

  /* ---------- 배경 별 ---------- */
  function background() {
    var cv = document.getElementById("bg-stars");
    if (!cv) return;
    var ctx = cv.getContext("2d");
    var stars = [], dpr = Math.min(2, window.devicePixelRatio || 1), W = 0, H = 0;
    function build() {
      W = window.innerWidth; H = window.innerHeight;
      cv.width = W * dpr; cv.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      var n = Math.round((W * H) / 5200);
      stars = [];
      for (var i = 0; i < n; i++) {
        stars.push({
          x: Math.random() * W, y: Math.random() * H,
          r: Math.pow(Math.random(), 2.4) * 1.5 + 0.25,
          a: Math.random() * 0.55 + 0.18,
          sp: Math.random() * 0.9 + 0.25,
          ph: Math.random() * Math.PI * 2,
          h: Math.random() < 0.15 ? 35 : (Math.random() < 0.3 ? 210 : 0)
        });
      }
    }
    build();
    window.addEventListener("resize", build);
    var t0 = performance.now();
    (function tick(now) {
      var t = (now - t0) / 1000;
      // 밝은 화면에서는 배경 별을 숨기므로 그리지 않는다
      if (document.documentElement.getAttribute("data-theme") === "light") { requestAnimationFrame(tick); return; }
      ctx.clearRect(0, 0, W, H);
      for (var i = 0; i < stars.length; i++) {
        var s = stars[i];
        var a = s.a * (0.68 + 0.32 * Math.sin(t * s.sp + s.ph));
        ctx.beginPath();
        ctx.fillStyle = s.h === 0 ? "rgba(255,255,255," + a + ")"
          : (s.h === 35 ? "rgba(255,225,180," + a + ")" : "rgba(190,215,255," + a + ")");
        ctx.arc(s.x, s.y, s.r, 0, 6.2832);
        ctx.fill();
      }
      requestAnimationFrame(tick);
    })(t0);
  }

  /* ---------- 캔버스 / 애니메이션 도우미 ---------- */
  function Canvas(cv, aspect) {
    var ctx = cv.getContext("2d");
    var o = { cv: cv, ctx: ctx, w: 0, h: 0, dpr: 1 };
    function resize() {
      var rect = cv.parentNode.getBoundingClientRect();
      var w = Math.max(280, rect.width);
      var h = aspect ? w / aspect : cv.clientHeight;
      if (aspect && h > window.innerHeight * 0.78) h = window.innerHeight * 0.78;
      o.w = w; o.h = h;
      o.dpr = Math.min(2, window.devicePixelRatio || 1);
      cv.style.width = "100%"; cv.style.height = h + "px";
      cv.width = Math.round(w * o.dpr); cv.height = Math.round(h * o.dpr);
      ctx.setTransform(o.dpr, 0, 0, o.dpr, 0, 0);
      if (o.onResize) o.onResize(o);
    }
    o.resize = resize;
    resize();
    window.addEventListener("resize", function () { clearTimeout(o._t); o._t = setTimeout(resize, 90); });
    return o;
  }

  /* 화면에 보일 때만 도는 애니메이션 루프 */
  var SCENES = [];
  function loop(el, fn) {
    var live = true, last = performance.now();
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (es) { live = es[0].isIntersecting; }, { threshold: 0.01 }).observe(el);
    }
    document.addEventListener("visibilitychange", function () { if (!document.hidden) last = performance.now(); });
    SCENES.push(fn);
    try { fn(0, 0); } catch (e) { /* 최초 1회 정지 화면 */ }
    (function step(now) {
      var dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      if (live && !document.hidden) fn(dt, now / 1000);
      requestAnimationFrame(step);
    })(last);
  }
  /* 애니메이션이 멈춘 환경에서도 한 장면을 그리게 하는 보조 함수 */
  function tick(time, dt) {
    SCENES.forEach(function (f) { try { f(dt === undefined ? 1 / 60 : dt, time || 0); } catch (e) { } });
    return SCENES.length;
  }

  /* ---------- 수학 도우미 ---------- */
  var U = {
    lerp: function (a, b, t) { return a + (b - a) * t; },
    clamp: function (v, a, b) { return v < a ? a : (v > b ? b : v); },
    ease: function (t) { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; },
    easeOut: function (t) { return 1 - Math.pow(1 - t, 3); },
    approach: function (cur, tgt, dt, rate) { return cur + (tgt - cur) * (1 - Math.exp(-rate * dt)); },
    /* 표면 온도(K) → 색 (근사) */
    kelvin: function (k) {
      var t = Math.min(40000, Math.max(1000, k)) / 100, r, g, b;
      if (t <= 66) { r = 255; g = 99.4708025861 * Math.log(t) - 161.1195681661; }
      else { r = 329.698727446 * Math.pow(t - 60, -0.1332047592); g = 288.1221695283 * Math.pow(t - 60, -0.0755148492); }
      if (t >= 66) b = 255; else if (t <= 19) b = 0; else b = 138.5177312231 * Math.log(t - 10) - 305.0447927307;
      var c = function (v) { return Math.max(0, Math.min(255, Math.round(v))); };
      return [c(r), c(g), c(b)];
    },
    rgb: function (a, al) { return "rgba(" + a[0] + "," + a[1] + "," + a[2] + "," + (al === undefined ? 1 : al) + ")"; },
    /* 부드러운 빛나는 별 그리기 */
    glow: function (ctx, x, y, r, col, core) {
      var g = ctx.createRadialGradient(x, y, 0, x, y, r);
      g.addColorStop(0, "rgba(255,255,255," + (core === undefined ? 0.95 : core) + ")");
      g.addColorStop(0.16, col.replace(/[\d.]+\)$/, "0.85)"));
      g.addColorStop(0.42, col.replace(/[\d.]+\)$/, "0.28)"));
      g.addColorStop(1, col.replace(/[\d.]+\)$/, "0)"));
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(x, y, r, 0, 6.2832); ctx.fill();
    },
    /* 별빛 십자 광채 */
    spike: function (ctx, x, y, len, col, w) {
      ctx.save();
      ctx.globalCompositeOperation = "lighter";
      var g = ctx.createLinearGradient(x - len, y, x + len, y);
      g.addColorStop(0, "rgba(255,255,255,0)"); g.addColorStop(0.5, col); g.addColorStop(1, "rgba(255,255,255,0)");
      ctx.fillStyle = g; ctx.fillRect(x - len, y - (w || 1) / 2, len * 2, w || 1);
      var g2 = ctx.createLinearGradient(x, y - len, x, y + len);
      g2.addColorStop(0, "rgba(255,255,255,0)"); g2.addColorStop(0.5, col); g2.addColorStop(1, "rgba(255,255,255,0)");
      ctx.fillStyle = g2; ctx.fillRect(x - (w || 1) / 2, y - len, w || 1, len * 2);
      ctx.restore();
    },
    /* 화살표 */
    arrow: function (ctx, x1, y1, x2, y2, col, w, head) {
      head = head || 8; w = w || 2;
      var a = Math.atan2(y2 - y1, x2 - x1);
      ctx.strokeStyle = col; ctx.fillStyle = col; ctx.lineWidth = w;
      ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2 - Math.cos(a) * head * 0.8, y2 - Math.sin(a) * head * 0.8); ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(x2, y2);
      ctx.lineTo(x2 - Math.cos(a - 0.4) * head, y2 - Math.sin(a - 0.4) * head);
      ctx.lineTo(x2 - Math.cos(a + 0.4) * head, y2 - Math.sin(a + 0.4) * head);
      ctx.closePath(); ctx.fill();
    },
    label: function (ctx, x, y, text, col, size, align, weight) {
      ctx.font = (weight || 700) + " " + (size || 13) + "px " + getComputedStyle(document.body).fontFamily;
      ctx.textAlign = align || "center";
      ctx.textBaseline = "middle";
      ctx.fillStyle = "rgba(0,0,0,0.55)";
      ctx.fillText(text, x + 1, y + 1);
      ctx.fillStyle = col;
      ctx.fillText(text, x, y);
    },
    chip: function (ctx, x, y, text, col, size) {
      size = size || 12;
      ctx.font = "800 " + size + "px " + getComputedStyle(document.body).fontFamily;
      var w = ctx.measureText(text).width + 14, h = size + 10;
      ctx.fillStyle = "rgba(6,10,24,0.82)";
      ctx.strokeStyle = col; ctx.lineWidth = 1;
      var r = 6, x0 = x - w / 2, y0 = y - h / 2;
      ctx.beginPath();
      ctx.moveTo(x0 + r, y0); ctx.arcTo(x0 + w, y0, x0 + w, y0 + h, r);
      ctx.arcTo(x0 + w, y0 + h, x0, y0 + h, r); ctx.arcTo(x0, y0 + h, x0, y0, r);
      ctx.arcTo(x0, y0, x0 + w, y0, r); ctx.closePath();
      ctx.fill(); ctx.stroke();
      ctx.fillStyle = col; ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.fillText(text, x, y + 0.5);
      return w;
    }
  };

  /* ---------- 퀴즈 ---------- */
  function quiz() {
    var qs = Array.prototype.slice.call(document.querySelectorAll(".q[data-a]"));
    if (!qs.length) return;
    var done = 0, right = 0;
    var bar = document.querySelector(".score-bar");
    function update() {
      if (!bar) return;
      bar.querySelector(".s").innerHTML = "푼 문제 <em>" + done + "</em> / " + qs.length + " · 맞힌 개수 <em>" + right + "</em>";
    }
    qs.forEach(function (q) {
      var ans = parseInt(q.getAttribute("data-a"), 10);
      var opts = Array.prototype.slice.call(q.querySelectorAll(".opt"));
      var sol = q.querySelector(".sol");
      opts.forEach(function (o, i) {
        o.addEventListener("click", function () {
          if (q.dataset.done) return;
          q.dataset.done = "1";
          done++;
          opts.forEach(function (x, j) {
            if (j === ans) { x.classList.add("correct"); x.insertAdjacentHTML("beforeend", '<span class="mk">✔ 정답</span>'); }
            else if (j === i) { x.classList.add("wrong"); x.insertAdjacentHTML("beforeend", '<span class="mk">✘</span>'); }
          });
          if (i === ans) right++;
          if (sol) sol.classList.add("show");
          update();
        });
      });
    });
    var rs = document.querySelector("[data-reset-quiz]");
    if (rs) rs.addEventListener("click", function () { location.reload(); });
    var sa = document.querySelector("[data-show-all]");
    if (sa) sa.addEventListener("click", function () {
      qs.forEach(function (q) {
        var ans = parseInt(q.getAttribute("data-a"), 10);
        var opts = q.querySelectorAll(".opt");
        if (!q.dataset.done) { q.dataset.done = "1"; done++; opts[ans].classList.add("correct"); }
        var sol = q.querySelector(".sol"); if (sol) sol.classList.add("show");
      });
      update();
    });
    update();
  }

  /* ---------- 답 보기 버튼 ---------- */
  function reveals() {
    document.querySelectorAll("[data-reveal]").forEach(function (b) {
      b.addEventListener("click", function () {
        var t = document.getElementById(b.getAttribute("data-reveal"));
        if (!t) return;
        var on = t.classList.toggle("show");
        b.textContent = on ? "답 숨기기" : (b.dataset.label || "답 확인하기");
      });
    });
  }

  /* ---------- 공개 ---------- */
  window.SU = { Canvas: Canvas, loop: loop, tick: tick, scenes: SCENES, U: U, PAGES: PAGES };

  document.addEventListener("DOMContentLoaded", function () {
    buildChrome(); background(); quiz(); reveals();
  });
})();
