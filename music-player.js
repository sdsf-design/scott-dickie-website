// The music player from scott-dickie.com/music, brought into the Play side projects.
// Same behavior: a record that spins while a song plays, a wave in the label driven by the live audio,
// a blurred copy of the wave behind the record, previous / play / next, and a list of songs.
(() => {
  // Songs live in music/audio/, shared with the /music page.
  const songs = [
    { title: "Forward Motion", src: "/music/audio/forward-motion.m4a" },
    { title: "Surprisingly Hot", src: "/music/audio/surprisingly-hot.m4a" },
    { title: "Elevate", src: "/music/audio/elevate.m4a" },
    { title: "Calm Chaos", src: "/music/audio/calm-chaos.m4a" },
    { title: "Rise", src: "/music/audio/become.m4a" },
  ];

  const audio = document.getElementById("audio");
  if (!audio) return;
  const record = document.getElementById("record");
  const canvas = document.getElementById("music-visualizer");
  const backdrop = document.getElementById("music-backdrop");
  const playBtn = document.getElementById("play-btn");
  const iconPlay = document.getElementById("icon-play");
  const iconPause = document.getElementById("icon-pause");
  const titleEl = document.getElementById("song-title");
  const errorEl = document.getElementById("player-error");
  const tracklist = document.getElementById("tracklist");
  let current = 0;

  function setPlayingUI(playing) {
    iconPlay.toggleAttribute("hidden", playing);
    iconPause.toggleAttribute("hidden", !playing);
    playBtn.setAttribute("aria-label", playing ? "Pause" : "Play");
    record.classList.toggle("is-playing", playing);
  }

  function loadSong(index, autoplay) {
    current = index;
    const song = songs[index];
    titleEl.textContent = song.title;
    errorEl.hidden = true;
    audio.src = song.src;
    tracklist.querySelectorAll(".track").forEach((btn, i) => btn.setAttribute("aria-current", i === index ? "true" : "false"));
    if (autoplay) play(); else setPlayingUI(false);
  }

  function play() { startAnalyser(); audio.play().catch(() => {}); }
  function togglePlay() { if (audio.paused) play(); else audio.pause(); }

  songs.forEach((song, i) => {
    const li = document.createElement("li");
    const btn = Object.assign(document.createElement("button"), { type: "button", className: "track", textContent: song.title });
    btn.addEventListener("click", () => { if (i === current && audio.src) togglePlay(); else loadSong(i, true); });
    li.appendChild(btn);
    tracklist.appendChild(li);
  });

  playBtn.addEventListener("click", togglePlay);
  document.getElementById("prev-btn").addEventListener("click", () => {
    if (audio.currentTime > 3) audio.currentTime = 0;
    else loadSong((current - 1 + songs.length) % songs.length, !audio.paused);
  });
  document.getElementById("next-btn").addEventListener("click", () => loadSong((current + 1) % songs.length, !audio.paused));

  audio.addEventListener("play", () => { setPlayingUI(true); drawLoop(); });
  audio.addEventListener("pause", () => { setPlayingUI(false); drawLoop(); });
  audio.addEventListener("ended", () => { if (current < songs.length - 1) loadSong(current + 1, true); else setPlayingUI(false); });
  audio.addEventListener("error", () => { errorEl.hidden = false; setPlayingUI(false); });

  // Siri-style wave driven by the live audio: crisp inside the label, and a larger blurred copy behind the record.
  const ctx = canvas.getContext("2d");
  const bgCtx = backdrop.getContext("2d");
  const FLOOR = 0.04, CEILING = 0.48;   // fixed loudness scale, so every song is drawn the same way
  const AUDIO_DELAY = 0.068;            // sound is held back slightly so the wave lands on the beat
  let analyser = null, samples = null, drawing = false;

  function startAnalyser() {
    if (analyser) { if (analyser.context.state === "suspended") analyser.context.resume(); return; }
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const audioCtx = new AudioCtx({ latencyHint: "interactive" });
    const source = audioCtx.createMediaElementSource(audio);
    analyser = audioCtx.createAnalyser();
    analyser.fftSize = 2048;
    const delay = audioCtx.createDelay(1);
    delay.delayTime.value = AUDIO_DELAY;
    source.connect(analyser);
    source.connect(delay);
    delay.connect(audioCtx.destination);
    samples = new Float32Array(analyser.fftSize);
  }

  function currentLevel() {
    if (!analyser || audio.paused) return 0;
    analyser.getFloatTimeDomainData(samples);
    let sum = 0;
    for (let i = 0; i < samples.length; i++) sum += samples[i] * samples[i];
    const v = Math.min(1, Math.max(0, (Math.sqrt(sum / samples.length) - FLOOR) / (CEILING - FLOOR)));
    return Math.pow(v, 1.6);
  }

  function sizeCanvas() {
    const dpr = window.devicePixelRatio || 1;
    for (const [el, c] of [[canvas, ctx], [backdrop, bgCtx]]) {
      el.width = Math.round(el.clientWidth * dpr);
      el.height = Math.round(el.clientHeight * dpr);
      c.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    draw();
  }

  const LINES = [
    { attenuation: -2, alpha: 0.1, width: 1, freq: 1.3, speed: 0.7, offset: 0.0 },
    { attenuation: -6, alpha: 0.2, width: 1, freq: 1.9, speed: 1.3, offset: 1.1 },
    { attenuation: 4, alpha: 0.35, width: 1, freq: 1.5, speed: 0.9, offset: 2.3 },
    { attenuation: 2, alpha: 0.6, width: 1, freq: 1.7, speed: 1.15, offset: 3.4 },
    { attenuation: 1, alpha: 0.95, width: 1.5, freq: 1.6, speed: 1, offset: 0.6 },
  ];
  const RISE = { stiffness: 4000, damping: 110 }, FALL = { stiffness: 320, damping: 20 };
  let amp = 0, vel = 0, phase = 0, lastFrame = 0;

  function drawWave(c, width, height, maxHeight, lineScale, clipRadius, t) {
    if (width < 8 || height < 8) return;
    const cy = height / 2;
    c.clearRect(0, 0, width, height);
    c.save();
    if (clipRadius) { c.beginPath(); c.arc(width / 2, cy, clipRadius, 0, Math.PI * 2); c.clip(); }
    const stepX = Math.max(1, width / 400);
    for (const line of LINES) {
      const breath = 0.8 + 0.2 * Math.sin(t * 1.7 + line.offset);
      const a = (amp * maxHeight * breath) / line.attenuation;
      const p = phase * line.speed + line.offset;
      c.beginPath();
      for (let x = 0; x <= width + stepX; x += stepX) {
        const u = (x / width) * 4 - 2;
        const taper = Math.pow(4 / (4 + Math.pow(u, 4)), 4);
        const y = cy + a * taper * Math.sin(line.freq * Math.PI * u - p);
        if (x === 0) c.moveTo(x, y); else c.lineTo(x, y);
      }
      c.strokeStyle = `rgba(235, 235, 235, ${Math.min(1, line.alpha * (0.75 + amp * 0.6))})`;
      c.lineWidth = line.width * lineScale;
      c.stroke();
    }
    c.restore();
  }

  function draw(now = performance.now()) {
    const dt = lastFrame ? Math.min(0.05, (now - lastFrame) / 1000) : 0;
    lastFrame = now;
    const target = currentLevel();
    const steps = Math.ceil(dt / 0.004), h = steps ? dt / steps : 0;
    for (let i = 0; i < steps; i++) {
      const spring = target > amp ? RISE : FALL;
      vel += ((target - amp) * spring.stiffness - vel * spring.damping) * h;
      amp = Math.min(1.3, Math.max(0, amp + vel * h));
    }
    phase += dt * (5 + amp * 24);
    const t = now / 1000, size = canvas.clientWidth;
    drawWave(ctx, size, size, size * 0.4, 1, size / 2 - 4, t);
    const bgW = backdrop.clientWidth, bgH = backdrop.clientHeight, scale = bgW / (size || 1);
    drawWave(bgCtx, bgW, bgH, Math.min(size * 0.4 * scale, bgH * 0.48), Math.min(4, scale), 0, t);
  }

  function drawLoop() {
    if (drawing) return;
    drawing = true;
    lastFrame = 0;
    const tick = now => {
      draw(now);
      if (!audio.paused || amp > 0.003 || Math.abs(vel) > 0.01) requestAnimationFrame(tick);
      else drawing = false;
    };
    requestAnimationFrame(tick);
  }

  loadSong(0, false);
  addEventListener("resize", sizeCanvas);
  // The player starts hidden in Work, so size the canvases whenever it becomes visible.
  new ResizeObserver(sizeCanvas).observe(canvas);
  window.musicPlayer = { pause: () => audio.pause() };
})();
