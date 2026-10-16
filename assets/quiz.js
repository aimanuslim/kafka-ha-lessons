// Retrieval-practice quiz. Usage:
// <div class="quiz"><script type="application/json">{"questions":[...]}</script></div>
// A question is either {"q", "choices": [...], "answer": index, "why"}
// or {"q", "type": "number", "answer": n, "tol": n, "unit": "s", "why"}.
// Feedback is immediate; only the first try counts toward the score.
const STYLE = `
.quiz{font:15px/1.5 var(--sans)}
.quiz .qq{margin:22px 0;padding:14px 16px;border:1px solid var(--rule);border-radius:6px}
.quiz .qn{font-size:12px;color:var(--muted);letter-spacing:.08em;text-transform:uppercase}
.quiz .qt{margin:4px 0 10px;font:17px/1.5 var(--serif)}
.quiz button.c{display:block;width:100%;text-align:left;margin:6px 0;padding:8px 12px;border:1px solid var(--rule);border-radius:5px;background:transparent;color:inherit;font:inherit;cursor:pointer}
.quiz button.c:hover{border-color:var(--muted)}
.quiz button.c[data-r="ok"]{border-color:var(--ok);color:var(--ok)}
.quiz button.c[data-r="bad"]{border-color:var(--bad);color:var(--bad);text-decoration:line-through}
.quiz .num{display:flex;gap:8px}
.quiz .num input{width:120px;padding:7px 10px;border:1px solid var(--rule);border-radius:5px;background:transparent;color:inherit;font:inherit}
.quiz .num button{padding:7px 14px;border:1px solid var(--muted);border-radius:5px;background:transparent;color:inherit;font:inherit;cursor:pointer}
.quiz .why{display:none;margin-top:10px;padding-top:10px;border-top:1px dashed var(--rule)}
.quiz .qq[data-done] .why{display:block}
.quiz .fb{font-weight:600;margin-top:6px}
.quiz .fb[data-r="ok"]{color:var(--ok)}.quiz .fb[data-r="bad"]{color:var(--bad)}
.quiz .score{font-weight:600;margin-top:8px}
`;
const el = (tag, cls, html) => {
  const n = document.createElement(tag);
  if (cls) n.className = cls;
  if (html !== undefined) n.innerHTML = html;
  return n;
};
function mount(root) {
  const { questions, title } = JSON.parse(root.querySelector("script").textContent);
  const firstTry = new Array(questions.length).fill(null);
  const score = el("p", "score");
  const updateScore = () => {
    const done = firstTry.filter((v) => v !== null).length;
    const right = firstTry.filter((v) => v === true).length;
    score.textContent = done === questions.length ? `Skor try pertama: ${right}/${questions.length}` : `${done}/${questions.length} dijawab`;
  };
  if (title) root.append(el("h3", "", title));
  questions.forEach((q, i) => {
    const box = el("div", "qq");
    box.append(el("div", "qn", `Soalan ${i + 1}`), el("div", "qt", q.q));
    const fb = el("div", "fb");
    const why = el("div", "why", q.why || "");
    const settle = (ok) => {
      if (firstTry[i] === null) firstTry[i] = ok;
      fb.dataset.r = ok ? "ok" : "bad";
      fb.textContent = ok ? "Betul! 🎉" : "Tak tepat lagi, try lagi.";
      if (ok) box.dataset.done = "";
      updateScore();
    };
    if (q.type === "number") {
      const row = el("div", "num");
      const input = el("input");
      input.type = "number";
      input.inputMode = "decimal";
      input.setAttribute("aria-label", `Jawapan soalan ${i + 1}${q.unit ? " dalam " + q.unit : ""}`);
      const go = el("button", "", "Semak");
      const check = () => {
        const v = parseFloat(input.value);
        if (Number.isNaN(v)) return;
        settle(Math.abs(v - q.answer) <= (q.tol ?? 0));
      };
      go.addEventListener("click", check);
      input.addEventListener("keydown", (e) => e.key === "Enter" && check());
      row.append(input, go);
      if (q.unit) row.append(el("span", "", q.unit));
      box.append(row);
    } else {
      q.choices.forEach((c, j) => {
        const b = el("button", "c", c);
        b.type = "button";
        b.addEventListener("click", () => {
          if (box.hasAttribute("data-done")) return;
          const ok = j === q.answer;
          b.dataset.r = ok ? "ok" : "bad";
          settle(ok);
        });
        box.append(b);
      });
    }
    box.append(fb, why);
    root.append(box);
  });
  root.append(score);
  updateScore();
}
document.head.append(el("style", "", STYLE));
document.querySelectorAll(".quiz").forEach(mount);
