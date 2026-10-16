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
