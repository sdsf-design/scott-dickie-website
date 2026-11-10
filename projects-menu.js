// Projects mega menu: a grid icon in the top nav that opens the same glass sheet as the homepage's
// leadership principles, listing every project card from the homepage's Work and Play sides. Styles are in projects-menu.css;
// this script builds the sheet and wires up the triggers.
//
// Trigger: <button class="pm-trigger" type="button" data-projects-menu aria-label="Projects">(grid svg)</button>
// in the header, with projects-menu.css linked in <head>.
// Pages without one get a floating trigger in the top-right corner.
(() => {
  const base = new URL(".", document.currentScript.src);
  const href = (p) => (/^https?:/.test(p) ? p : new URL(p, base).href);

  // Every project card from the homepage's Work and Play sides. Cards that have no page of their own
  // open the homepage's Play "More projects" stack.
  const MORE = "index.html?mode=play#fun-stack";
  const GROUPS = [
    { name: "Work", label: "selected work", items: [
      { name: "AI Projects", note: "AI initiatives to drive growth, quality and efficiency", url: "ai-initiatives.html", img: "assets/ai-portfolio-thumbnail.jpg" },
      { name: "Upwork", note: "Expanding upmarket for IPO", url: "upwork.html", img: "assets/upwork-thumbnail.jpg" },
      { name: "Study.com", note: "Accelerating growth for multiple B2C businesses", url: "study.html", img: "assets/study-thumbnail.jpg" },
      { name: "Udacity", note: "Becoming B2C first and elevating B2B", url: "udacity.html", img: "assets/udacity-thumbnail.jpg" },
      { name: "Comfy (Siemens)", note: "0-1 B2C product launch post COVID", url: "comfy.html", img: "assets/siemens-thumbnail.jpg" },
    ] },
    { name: "Play", label: "side projects", items: [
      { name: "Music", note: "Songs I write, produce and master", url: "music/index.html", record: true },
      { name: "Get Unstuck", note: "AI-powered help through tough decisions", url: "https://www.unstuck.services/", img: "assets/videos/unstuck-demo-poster.jpg", external: true },
      { name: "Should I buy it?", note: "A 14-question gut check before you buy something", url: "shouldibuyit/index.html", img: "assets/play/shouldibuyit.jpg" },
      { name: "Dad jokes for kids", note: "Joke Flip: flip the card for the punchline", url: "jokes/index.html", img: "assets/play/jokes.jpg" },
      { name: "IceBreaker", note: "Questions to get kids talking, with a follow-up on the back", url: "icebreaker/index.html", img: "assets/play/icebreaker.jpg" },
      { name: "Impact & Influence", note: "Helping designers learn non-design skills", url: MORE, img: "assets/play/impact-influence.jpg" },
      { name: "GoTracks", note: "Travel toy for kids", url: MORE, img: "assets/play/gotracks.jpg" },
      { name: "Snowboard bench", note: "Homemade bench from a snowboard and metal legs", url: MORE, img: "assets/play/snowboard-bench.jpg" },
      { name: "Snowboarding", note: "My favorite sport, in the onesie on the season’s last day", url: MORE, img: "assets/play/snowboarding.jpg", top: true },
    ] },
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

  const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");
  const here = location.href.split("#")[0].replace(/index\.html$/, "");
  // The arrow stays on the line with the title's last word
  const title = (name, arrow) => {
    const i = name.lastIndexOf(" ");
    return `${esc(name.slice(0, i + 1))}<span class="pm-nw">${esc(name.slice(i + 1))} <span class="pm-go" aria-hidden="true">${arrow}</span></span>`;
  };
  const card = (p, i) => {
    const url = href(p.url);
    const current = !p.external && url.split("?")[0].replace(/index\.html$/, "") === here && !url.includes("#");
    const ext = p.external ? ' target="_blank" rel="noopener"' : "";
    const thumb = p.record
      ? '<span class="pm-thumb pm-record" aria-hidden="true"></span>'
      : `<img class="pm-thumb${p.top ? " pm-top-crop" : ""}" src="${href(p.img)}" alt="" loading="lazy" decoding="async">`;
    return `<li><a href="${url}"${ext}${current ? ' aria-current="page"' : ""}>${thumb}
      <p class="pm-label"><b>${String(i + 1).padStart(2, "0")}</b></p>
      <h3>${title(p.name, p.external ? "\u2197" : "\u2192")}</h3>
      <p class="pm-note">${esc(p.note)}</p></a></li>`;
  };
  const groups = GROUPS.map((g) => `<section class="pm-group" aria-labelledby="pm-${g.name.toLowerCase()}">
      <div class="pm-group-head"><h3 class="pm-group-title" id="pm-${g.name.toLowerCase()}">${g.name}</h3><p class="pm-label"><b>&gt;</b> ${g.label}</p></div>
      <ol class="pm-list">${g.items.map(card).join("")}</ol>
    </section>`).join("");

  const dlg = document.createElement("dialog");
  dlg.className = "pm";
  dlg.id = "projects-menu";
  dlg.setAttribute("aria-labelledby", "pm-title");
  dlg.innerHTML = `<div class="pm-inner">
    <div class="pm-top">
      <div><p class="pm-label"><b>&gt;</b> what I&rsquo;m building</p><h2 id="pm-title">Projects</h2></div>
      <button class="pm-close" type="button" aria-label="Close projects">${CLOSE}</button>
    </div>
    ${groups}
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
