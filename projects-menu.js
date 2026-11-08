// Projects mega menu: a grid icon in the top nav that opens the same glass sheet as the homepage's
// leadership principles, listing what Scott is building in large type. Self-contained (styles,
// fonts and dialog are injected here) so every page only needs a trigger and this script.
//
// Trigger: <button class="pm-trigger" type="button" data-projects-menu>…</button> anywhere in the header.
// Pages without one get a floating trigger in the top-right corner.
(() => {
  const base = new URL(".", document.currentScript.src);
  const href = (p) => (/^https?:/.test(p) ? p : new URL(p, base).href);

  const PROJECTS = [
    { name: "Music", note: "Songs I write and record", url: "music/index.html" },
    { name: "Get Unstuck", note: "Name the real problem, compare paths, leave with a 90-day plan", url: "https://www.unstuck.services/", external: true },
    { name: "Should I buy it?", note: "A 14-question gut check that ends in Buy, Wait or Skip", url: "shouldibuyit/index.html" },
    { name: "Dad jokes for kids", note: "Joke Flip: read the setup, flip the card for the punchline", url: "jokes/index.html" },
  ];

  const ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><rect x="4" y="4" width="6.5" height="6.5"/><rect x="13.5" y="4" width="6.5" height="6.5"/><rect x="4" y="13.5" width="6.5" height="6.5"/><rect x="13.5" y="13.5" width="6.5" height="6.5"/></svg>';
  const CLOSE = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" aria-hidden="true"><path d="M7 7l10 10M17 7L7 17"/></svg>';

  const css = `
.pm-trigger, .pm {
  --pm-ground: #e8ebf0; --pm-paper: #f3f5f8; --pm-ink: #16233b; --pm-quiet: #55617a; --pm-pushed: #b4531a;
  --pm-line: rgba(22, 35, 59, .16); --pm-gutter: clamp(16px, 4vw, 48px);
  --pm-sans: Inter, system-ui, -apple-system, "Segoe UI", sans-serif;
  --pm-mono: "Fragment Mono", ui-monospace, "SF Mono", Menlo, Consolas, monospace;
}
[data-mode="play"] .pm-trigger, [data-mode="play"] .pm {
  --pm-ground: #11132a; --pm-paper: #1a1d3a; --pm-ink: #f3eefc; --pm-quiet: #aeb3d0; --pm-pushed: #ffd166;
  --pm-line: rgba(243, 238, 252, .18);
}
.pm-trigger {
  display: grid; place-items: center; width: 40px; height: 40px; padding: 0; margin: 0; border: 0; border-radius: 0;
  cursor: pointer; color: var(--pm-ink); background: transparent; box-shadow: inset 0 0 0 1px var(--pm-line);
  transition: background .3s, color .3s; flex: none;
}
.pm-trigger:hover, .pm-trigger[aria-expanded="true"] { background: var(--pm-ink); color: var(--pm-ground); }
.pm-trigger:focus-visible { outline: 2px solid var(--pm-pushed); outline-offset: 2px; }
.pm-trigger svg { width: 18px; height: 18px; }
.pm-trigger--float {
  position: fixed; z-index: 60; top: max(12px, env(safe-area-inset-top, 0px)); right: 12px;
  background: color-mix(in srgb, var(--pm-paper) 80%, transparent);
  backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px);
}

html:has(.pm[open]) { overflow: hidden; }
.pm {
  --feather: clamp(28px, 4vw, 64px);
  width: min(1320px, 100vw - var(--pm-gutter)); max-width: none; max-height: calc(100svh - var(--pm-gutter));
  margin: auto; padding: 0; border: 0; color: var(--pm-ink); font: 16px/1.6 var(--pm-sans);
  overflow: auto; overscroll-behavior: contain; scrollbar-width: none;
  background: color-mix(in srgb, var(--pm-paper) 62%, transparent);
  backdrop-filter: blur(28px) saturate(1.5); -webkit-backdrop-filter: blur(28px) saturate(1.5);
  -webkit-mask-image: linear-gradient(to right, transparent, #000 var(--feather), #000 calc(100% - var(--feather)), transparent), linear-gradient(to bottom, transparent, #000 var(--feather), #000 calc(100% - var(--feather)), transparent);
  -webkit-mask-composite: source-in;
  mask-image: linear-gradient(to right, transparent, #000 var(--feather), #000 calc(100% - var(--feather)), transparent), linear-gradient(to bottom, transparent, #000 var(--feather), #000 calc(100% - var(--feather)), transparent);
  mask-composite: intersect;
}
.pm::-webkit-scrollbar { display: none; }
.pm::backdrop { background: rgba(232, 235, 240, .28); backdrop-filter: blur(14px); -webkit-backdrop-filter: blur(14px); }
[data-mode="play"] .pm::backdrop { background: rgba(17, 19, 42, .4); }
.pm[open] { animation: pm-in .35s cubic-bezier(.2, .8, .2, 1); }
.pm[open]::backdrop { animation: pm-fade .35s cubic-bezier(.2, .8, .2, 1); }
@keyframes pm-in { from { opacity: 0; transform: translateY(12px) scale(.985); } }
@keyframes pm-fade { from { opacity: 0; } }
.pm *, .pm *::before, .pm *::after { box-sizing: border-box; }
.pm h2, .pm h3, .pm p, .pm ol { margin: 0; }
.pm-inner { display: grid; gap: 32px; padding: calc(var(--feather) + 8px) calc(var(--feather) + clamp(8px, 2vw, 32px)); }
.pm-top { display: flex; justify-content: space-between; align-items: flex-start; gap: 16px; }
.pm-label { font: 12px/1.4 var(--pm-mono); color: var(--pm-quiet); letter-spacing: .02em; }
.pm-label b { font-weight: 400; color: var(--pm-pushed); }
.pm-top h2 { font: 300 clamp(36px, 4.6vw, 60px)/1 var(--pm-sans); letter-spacing: -.035em; margin-top: 10px; color: var(--pm-ink); }
.pm-close {
  flex: none; display: grid; place-items: center; width: 40px; height: 40px; padding: 0; border: 0; border-radius: 0; cursor: pointer;
  color: var(--pm-ink); background: transparent; box-shadow: inset 0 0 0 1px var(--pm-line); transition: background .3s, color .3s;
}
.pm-close:hover { background: var(--pm-ink); color: var(--pm-ground); }
.pm-close:focus-visible { outline: 2px solid var(--pm-pushed); outline-offset: 2px; }
.pm-close svg { width: 20px; height: 20px; }
.pm-list { list-style: none; padding: 0; display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 0 40px; border-top: 1px solid var(--pm-line); }
.pm-list li { border-bottom: 1px solid var(--pm-line); }
.pm-list a {
  display: grid; grid-template-columns: minmax(0, 1fr) auto; gap: 14px 16px; align-items: end;
  padding: 30px 0 28px; color: inherit; text-decoration: none;
}
.pm-list .pm-label { grid-column: 1 / -1; }
.pm-list h3 {
  font: 300 clamp(40px, 5.6vw, 84px)/.98 var(--pm-sans); letter-spacing: -.04em; color: var(--pm-ink);
  text-wrap: balance; transition: color .3s, transform .4s cubic-bezier(.2, .8, .2, 1);
}
.pm-list .pm-go { font: 300 clamp(28px, 3vw, 44px)/1 var(--pm-sans); color: var(--pm-quiet); transition: color .3s, transform .4s cubic-bezier(.2, .8, .2, 1); }
.pm-list p.pm-note { grid-column: 1 / -1; font-size: 15px; line-height: 1.6; color: var(--pm-quiet); max-width: 34em; }
.pm-list a:hover h3, .pm-list a:focus-visible h3 { color: var(--pm-pushed); transform: translateX(6px); }
.pm-list a:hover .pm-go, .pm-list a:focus-visible .pm-go { color: var(--pm-pushed); transform: translate(4px, -4px); }
.pm-list a:focus-visible { outline: 2px solid var(--pm-pushed); outline-offset: 4px; }
.pm-list a[aria-current="page"] .pm-label::after { content: " · you are here"; }
@media (max-width: 760px) {
  .pm-inner { gap: 24px; }
  .pm-list { grid-template-columns: 1fr; }
  .pm-list a { padding: 22px 0 20px; gap: 10px 12px; }
}
@media (prefers-reduced-motion: reduce) {
  .pm[open], .pm[open]::backdrop { animation: none; }
  .pm-list h3, .pm-list .pm-go { transition: none; }
}`;

  const style = document.createElement("style");
  style.textContent = css;
  document.head.appendChild(style);

  // Fonts the sheet is set in; harmless if the page already loads them
  const font = document.createElement("link");
  font.rel = "stylesheet";
  font.href = "https://fonts.googleapis.com/css2?family=Fragment+Mono&family=Inter:wght@300;400&display=swap";
  document.head.appendChild(font);

  const here = location.href.split("#")[0].replace(/index\.html$/, "");
  const items = PROJECTS.map((p, i) => {
    const url = href(p.url);
    const current = !p.external && url.replace(/index\.html$/, "") === here;
    const ext = p.external ? ' target="_blank" rel="noopener"' : "";
    return `<li><a href="${url}"${ext}${current ? ' aria-current="page"' : ""}>
      <p class="pm-label"><b>0${i + 1}</b></p>
      <h3>${p.name}</h3><span class="pm-go" aria-hidden="true">${p.external ? "↗" : "→"}</span>
      <p class="pm-note">${p.note}</p></a></li>`;
  }).join("");

  const dlg = document.createElement("dialog");
  dlg.className = "pm";
  dlg.id = "projects-menu";
  dlg.setAttribute("aria-labelledby", "pm-title");
  dlg.innerHTML = `<div class="pm-inner">
    <div class="pm-top">
      <div><p class="pm-label"><b>&gt;</b> what I&rsquo;m building</p><h2 id="pm-title">Projects</h2></div>
      <button class="pm-close" type="button" aria-label="Close projects">${CLOSE}</button>
    </div>
    <ol class="pm-list">${items}</ol>
  </div>`;
  document.body.appendChild(dlg);

  let triggers = [...document.querySelectorAll("[data-projects-menu]")];
  if (!triggers.length) {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "pm-trigger pm-trigger--float";
    b.setAttribute("data-projects-menu", "");
    document.body.appendChild(b);
    triggers = [b];
  }
  triggers.forEach((b) => {
    b.classList.add("pm-trigger");
    if (!b.innerHTML.trim()) b.innerHTML = ICON;
    if (!b.getAttribute("aria-label")) b.setAttribute("aria-label", "Projects");
    b.setAttribute("aria-haspopup", "dialog");
    b.setAttribute("aria-controls", dlg.id);
    b.setAttribute("aria-expanded", "false");
  });

  const sync = (open) => triggers.forEach((b) => b.setAttribute("aria-expanded", String(open)));
  const open = () => {
    if (dlg.open) return;
    if (typeof dlg.showModal === "function") dlg.showModal(); else dlg.setAttribute("open", "");
    sync(true);
  };
  triggers.forEach((b) => b.addEventListener("click", open));
  dlg.querySelector(".pm-close").addEventListener("click", () => dlg.close());
  dlg.addEventListener("close", () => sync(false));
  // A click on the blurred backdrop (outside the sheet) closes it
  dlg.addEventListener("click", (e) => {
    const r = dlg.getBoundingClientRect();
    if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) dlg.close();
  });
  if (location.hash === "#projects") open();
})();
