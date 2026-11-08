// Projects mega menu: a grid icon in the top nav that opens the same glass sheet as the homepage's
// leadership principles, listing what Scott is building in large type. Styles are in projects-menu.css;
// this script builds the sheet and wires up the triggers.
//
// Trigger: <button class="pm-trigger" type="button" data-projects-menu aria-label="Projects">(grid svg)</button>
// in the header, with projects-menu.css linked in <head>.
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

  // The styles live in projects-menu.css, linked in each page's <head> so the icon never flashes
  // unstyled. Pages that forget the link still get it here.
  if (![...document.styleSheets].some((s) => s.href && s.href.includes("projects-menu.css"))) {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = new URL("projects-menu.css", base).href;
    document.head.appendChild(link);
  }

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
