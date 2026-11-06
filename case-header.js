// Case study header: a small ASCII face in head-turn mode that follows the cursor around the page.
(() => {
  const canvas = document.getElementById("case-face");
  if (!canvas || !window.createAsciiPortrait) return;
  createAsciiPortrait(canvas, document.createElement("video"), {
    photo: "flannel", effect: "turn", minCols: 30,
    look: { ground: "#e8ebf0", ink: "#16233b", pushed: "#b4531a", colorful: false },
  });
})();
