// 開いて少ししたら全部ずり落ちる

// [セレクタ, 横, 縦, 角度, 始まるまでの秒数, ホバーで起き上がるか]
const slumpList = [
  [".avatar", -30, 14, -14, 0],
  [".site-header p", 34, 20, 4, 0.5],
  [".about", -44, 12, -3, 0.25, true],
  [".work:nth-child(1)", 64, 22, 5, 0.7, true],
  [".work:nth-child(2)", -52, -6, -7, 0.9, true],
  [".work:nth-child(1) .tags li:nth-child(1)", 6, 46, -18, 1.4],
  [".work:nth-child(1) .tags li:nth-child(2)", 24, 58, 27, 1.5],
  [".work:nth-child(2) .tags li:nth-child(2)", -10, 52, -33, 1.6],
  [".speedrun .section-note", 12, 4, 1.5, 1],
  [".runs li:nth-child(1)", 22, 0, -2, 1.1, true],
  [".runs li:nth-child(2)", -34, -8, 4, 1.25, true],
  [".runs li:nth-child(3)", 46, -18, -9, 1.4, true],
  [".contact", -38, 10, 2.5, 1.6, true],
  [".links", 10, 6, 14, 1.9, true],
  [".site-footer", 90, 4, -3, 2.2],
];

function slump(el, x, y, r, delay) {
  el.classList.add("slump");
  el.style.setProperty("--tx", x + "px");
  el.style.setProperty("--ty", y + "px");
  el.style.setProperty("--r", r + "deg");
  el.style.setProperty("--d", delay + "s");
}

slumpList.forEach(([sel, x, y, r, delay, lift]) => {
  const el = document.querySelector(sel);
  if (!el) return;
  slump(el, x, y, r, delay);
  if (lift) el.classList.add("lift");
});

// 見出しは1文字ずつ分けて、後ろの文字ほど下がるようにする
function splitText(heading, drop, tilt, delay) {
  const text = heading.textContent.trim();
  heading.setAttribute("aria-label", text);
  heading.textContent = "";

  const box = document.createElement("span");
  box.className = "letters";
  box.setAttribute("aria-hidden", "true");

  const chars = [...text];
  chars.forEach((ch, i) => {
    const span = document.createElement("span");
    span.textContent = ch;
    const t = i / Math.max(chars.length - 1, 1);
    slump(span, 0, t * t * drop, t * t * tilt, delay + i * 0.08);
    box.append(span);
  });
  heading.append(box);
  return box;
}

// 名前の最後の1文字だけは完全に落ちる
const nameLetters = splitText(document.querySelector(".site-header h1"), 22, 26, 0.2);
slump(nameLetters.lastChild, 14, 64, 96, 0.2 + (nameLetters.children.length - 1) * 0.08);

document.querySelectorAll(".section h2").forEach((h2, i) => {
  splitText(h2, 16, i % 2 ? -20 : 20, 0.4 + i * 0.3);
});

// linksは釘1本でぶら下がってる
const nail = document.createElement("span");
nail.className = "nail";
document.querySelector(".links h2").prepend(nail);

// フォーム。送り先はないのでやめたことにする
document.getElementById("contact-form").addEventListener("submit", (e) => {
  e.preventDefault();
  const out = document.getElementById("contact-out");
  if (document.getElementById("contact-msg").value.trim() === "") {
    out.textContent = "何も書いてないので、送らずに済みました。";
    return;
  }
  out.innerHTML = '送ろうとしましたが、やめました。このフォームはどこにも届きません。用があれば <a href="https://github.com/alice3589" target="_blank" rel="noopener">GitHub</a> から。';
});

// 1.2秒だけ元の見た目を見せる
const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
setTimeout(() => document.body.classList.add("collapsed"), reduceMotion ? 0 : 1200);

// リセットボタン。押すと元に戻って、また崩れる
let loop = 1;
try {
  loop = Number(localStorage.getItem("loop")) || 1;
} catch (e) {}
document.getElementById("loop-count").textContent = loop;

let seconds = 0; // 04:58:00 からの経過秒数
let resetting = false;

function resetAll() {
  if (resetting) return;
  resetting = true;
  loop++;
  try {
    localStorage.setItem("loop", loop);
  } catch (e) {}
  document.getElementById("loop-count").textContent = loop;
  seconds = 0;

  document.body.classList.add("resetting");
  document.body.classList.remove("collapsed");
  setTimeout(() => {
    document.body.classList.remove("resetting");
    document.body.classList.add("collapsed");
    resetting = false;
  }, 1500);
}

document.getElementById("reset-button").addEventListener("click", resetAll);

// 時計は04:58から進んで、05:00になったら勝手にリセットされる
setInterval(() => {
  seconds++;
  const t = 4 * 3600 + 58 * 60 + seconds;
  const mm = String(Math.floor(t / 60) % 60).padStart(2, "0");
  const ss = String(t % 60).padStart(2, "0");
  document.getElementById("clock").textContent = "0" + Math.floor(t / 3600) + ":" + mm + ":" + ss;
  if (seconds >= 120) resetAll();
}, 1000);

// 周回が進むほど壊れる（10周で頭打ち）
const decay = Math.min(10, loop - 1);
document.documentElement.style.setProperty("--decay", decay);

// 名前に■が混ざる
const nameChars = nameLetters.children;
if (decay >= 3) nameChars[2].textContent = "■";
if (decay >= 6) nameChars[1].textContent = "■";
if (decay >= 9) nameChars[3].textContent = "■";

// about の頭に一文足す
if (decay >= 4) {
  const extra = document.createElement("p");
  extra.className = "about-extra";
  extra.textContent = decay >= 7 ? "はじめまして。はじめまして。はじめまして。" : "はじめまして。……ですよね？";
  document.querySelector(".about h2").after(extra);
}

// ときどき見出しや名前が文字化けする
const junk = "縺繧驕螟蜑譁■□";
if (!reduceMotion) {
  const targets = [...document.querySelectorAll(".letters")];
  setInterval(() => {
    const box = targets[Math.floor(Math.random() * targets.length)];
    const spans = [...box.children];
    const saved = spans.map((s) => s.textContent);
    spans.forEach((s) => {
      if (Math.random() < 0.4) s.textContent = junk[Math.floor(Math.random() * junk.length)];
    });
    setTimeout(() => spans.forEach((s, i) => (s.textContent = saved[i])), 300);
  }, Math.max(2000, 7000 - decay * 500));
}

// 4周目からは、送ったメッセージが逆さまに返ってくる
document.getElementById("contact-form").addEventListener("submit", () => {
  const msg = document.getElementById("contact-msg").value.trim();
  if (decay < 4 || msg === "") return;
  const rev = document.createElement("span");
  rev.className = "reverse";
  rev.textContent = "「" + [...msg].reverse().join("") + "」 ← 前回のあなたも、同じことを書いていました";
  document.getElementById("contact-out").append(rev);
});

// アイコン。周回が進むほど顔を塗りつぶされて、最後は目だけがこっちを見る
const avatar = document.querySelector(".avatar");
const box = document.createElement("span");
box.className = "avatar-box";
// 崩れる動きはimgから外して、箱のほうに移す
box.className += " slump";
["--tx", "--ty", "--r", "--d"].forEach((name) => {
  box.style.setProperty(name, avatar.style.getPropertyValue(name));
});
avatar.classList.remove("slump");
avatar.replaceWith(box);
box.append(avatar);

const scribble = document.createElement("canvas");
scribble.width = 100;
scribble.height = 100;
box.append(scribble);
const g = scribble.getContext("2d");

// 線の位置は最初に決めておく
const lines = [];
for (let i = 0; i < decay * 7; i++) {
  const a = Math.random() * Math.PI * 2;
  const r = Math.random() * 38;
  lines.push([50 + Math.cos(a) * r, 46 + Math.sin(a) * r]);
}

let mouseX = 0.5;
let mouseY = 0.4;

function drawAvatar() {
  g.clearRect(0, 0, 100, 100);
  if (decay >= 3) {
    g.strokeStyle = "#1d2320";
    g.lineCap = "round";
    g.lineWidth = 2 + decay * 0.5;
    g.beginPath();
    lines.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y)));
    g.stroke();
  }
  // 6周目から目だけが残って、マウスを追う
  if (decay >= 6) {
    [36, 64].forEach((x) => {
      g.fillStyle = "#eef1f2";
      g.beginPath();
      g.ellipse(x, 44, 7, 5, 0, 0, Math.PI * 2);
      g.fill();
      g.fillStyle = "#1d2320";
      g.beginPath();
      g.arc(x + (mouseX - 0.5) * 6, 44 + (mouseY - 0.4) * 4, 2.5, 0, Math.PI * 2);
      g.fill();
    });
  }
}
drawAvatar();

document.addEventListener("pointermove", (e) => {
  mouseX = e.clientX / window.innerWidth;
  mouseY = e.clientY / window.innerHeight;
  if (decay >= 6) drawAvatar();
});
