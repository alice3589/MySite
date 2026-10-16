// 崩壊版：ページを開いて少しすると、各要素が力尽きて傾き・ずり落ちる
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  // 要素ごとの崩れ方。tx / ty は PC での px（スマホは CSS 側で半分になる）、r は角度、d は崩れ始めるまでの秒数
  const plan = [
    [".avatar", -30, 14, -14, 0.0],
    [".site-header p", 34, 20, 4, 0.5],
    [".about", -44, 12, -3, 0.25, true],
    [".work:nth-child(1)", 64, 22, 5, 0.7, true],
    [".work:nth-child(2)", -52, -6, -7, 0.9, true],
    [".work:nth-child(1) .tags li:nth-child(1)", 6, 46, -18, 1.4],
    [".work:nth-child(1) .tags li:nth-child(2)", 24, 58, 27, 1.5],
    [".work:nth-child(2) .tags li:nth-child(2)", -10, 52, -33, 1.6],
    [".speedrun .section-note", 12, 4, 1.5, 1.0],
    [".runs li:nth-child(1)", 22, 0, -2, 1.1, true],
    [".runs li:nth-child(2)", -34, -8, 4, 1.25, true],
    [".runs li:nth-child(3)", 46, -18, -9, 1.4, true],
    [".contact", -38, 10, 2.5, 1.6, true],
    [".links", 10, 6, 14, 1.9, true],
    [".site-footer", 90, 4, -3, 2.2],
  ];

  const slumps = [];
  for (const [sel, tx, ty, r, d, lift] of plan) {
    const el = document.querySelector(sel);
    if (!el) continue;
    el.classList.add("slump");
    if (lift) el.classList.add("lift");
    el.style.setProperty("--tx", tx + "px");
    el.style.setProperty("--ty", ty + "px");
    el.style.setProperty("--r", r + "deg");
    el.style.setProperty("--d", d + "s");
    slumps.push(el);
  }

  // 見出しを1文字ずつに分ける。読み上げ用に元の文字列は aria-label に残す
  function splitLetters(heading, drop, tilt, delay, fallLast) {
    const text = heading.textContent.trim();
    heading.setAttribute("aria-label", text);
    const wrap = document.createElement("span");
    wrap.className = "letters";
    wrap.setAttribute("aria-hidden", "true");
    const n = text.length;
    [...text].forEach((ch, i) => {
      const s = document.createElement("span");
      s.textContent = ch;
      const t = n > 1 ? i / (n - 1) : 1;
      s.classList.add("slump");
      s.style.setProperty("--tx", "0px");
      s.style.setProperty("--ty", (t * t * drop).toFixed(1) + "px");
      s.style.setProperty("--r", (t * t * tilt).toFixed(1) + "deg");
      s.style.setProperty("--d", (delay + i * 0.08).toFixed(2) + "s");
      if (fallLast && i === n - 1) {
        s.style.setProperty("--tx", "14px");
        s.style.setProperty("--ty", "64px");
        s.style.setProperty("--r", "96deg");
      }
      wrap.append(s);
    });
    heading.textContent = "";
    heading.append(wrap);
  }

  splitLetters(document.querySelector(".site-header h1"), 22, 26, 0.2, true);
  document.querySelectorAll(".section h2").forEach((h2, i) => {
    splitLetters(h2, 16, i % 2 ? -20 : 20, 0.4 + i * 0.3, false);
  });

  // ぶら下がっているリンク欄の釘
  const linksHead = document.querySelector(".links h2");
  if (linksHead) {
    const nail = document.createElement("span");
    nail.className = "nail";
    nail.setAttribute("aria-hidden", "true");
    linksHead.prepend(nail);
  }

  // 連絡フォームは送信先がないので、送るのをやめたことにして GitHub へ案内する
  const form = document.getElementById("contact-form");
  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const out = document.getElementById("contact-out");
      const msg = document.getElementById("contact-msg").value.trim();
      if (!msg) {
        out.textContent = "何も書いてないので、送らずに済みました。";
        return;
      }
      out.textContent = "送ろうとしましたが、やめました。このフォームはどこにも届きません。用があれば ";
      const a = document.createElement("a");
      a.href = "https://github.com/alice3589";
      a.target = "_blank";
      a.rel = "noopener";
      a.textContent = "GitHub";
      out.append(a, " から。");
    });
  }

  // 最初は元のレイアウトのまま見せて、1.2秒後に崩れる
  const collapse = () => document.body.classList.add("collapsed");
  if (reduce) collapse();
  else setTimeout(collapse, 1200);

  // 崩れたあとも、ときどきどれか1つがもう少しだけ傾く（最大で元の角度の2倍まで）
  if (!reduce) {
    setInterval(() => {
      const el = slumps[Math.floor(Math.random() * slumps.length)];
      const now = parseFloat(el.style.getPropertyValue("--r")) || 0;
      const base = parseFloat(el.dataset.baseR ?? now);
      el.dataset.baseR = base;
      if (Math.abs(now) >= Math.abs(base) * 2 || base === 0) return;
      el.style.setProperty("--d", "0s");
      el.style.setProperty("--r", (now + Math.sign(base) * 0.8).toFixed(1) + "deg");
    }, 6000);
  }
})();
