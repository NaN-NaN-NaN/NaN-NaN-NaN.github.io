const CHAPTERS = [
  {
    id: "about",
    name: "01 About",
    hold: [0, 0.1],
    html: `
      <div class="ch">
        <div class="bug">CH 01 · ABOUT</div>
        <h1>NAN FANG-YING</h1>
        <p class="role">Senior / Staff Software Engineer</p>
        <p class="role">AI Systems</p>
        <p class="lead" data-gate="0">Turning complex problems<br>into useful products with AI.</p>
      </div>`
  },
  {
    id: "experience",
    name: "02 Experience",
    hold: [0.27, 0.37],
    html: `
      <div class="ch exp">
        <div class="bug">CH 02 · EXPERIENCE</div>
        <h1>MOONFARE</h1>
        <p class="role">Engineering Manager / Staff Engineer</p>
        <p class="meta">2020–2025</p>
        <div class="metrics">
          <div data-gate="0.12"><b>8</b><span>ENGINEERS</span></div>
          <div data-gate="0.24"><b>+10–15%</b><span>CONVERSION</span></div>
          <div data-gate="0.36"><b>MULTI-MILLION €</b><span>AUM GROWTH</span></div>
          <div data-gate="0.48"><b>200+ HOURS</b><span>ANNUAL AUTOMATION</span></div>
        </div>
        <ul class="roles">
          <li data-gate="0.58">Nokia HERE</li>
          <li data-gate="0.66">PlusDental</li>
          <li data-gate="0.74">Moonfare</li>
          <li data-gate="0.84">Ahead Health</li>
          <li data-gate="0.92">Independent / AI Product Engineer</li>
        </ul>
      </div>`
  },
  {
    id: "projects",
    name: "03 Projects",
    hold: [0.44, 0.57],
    html: `
      <div class="ch">
        <div class="bug">CH 03 · PROJECTS</div>
        <h1>LetterON</h1>
        <p class="role">AI FOR REAL-WORLD DOCUMENTS</p>
        <ol class="pipe">
          <li data-gate="0.08">DOCUMENT</li>
          <li data-gate="0.18">OCR</li>
          <li data-gate="0.28">REASONING</li>
          <li data-gate="0.38">CLASSIFICATION</li>
          <li data-gate="0.48">TRANSLATION</li>
          <li data-gate="0.58">DEADLINES</li>
          <li data-gate="0.68">ACTION</li>
        </ol>
        <p class="secondary" data-gate="0.82">RagEasy</p>
      </div>`
  },
  {
    id: "skills",
    name: "04 Skills",
    hold: [0.64, 0.73],
    html: `
      <div class="ch">
        <div class="bug">CH 04 · SKILLS</div>
        <div class="cols">
          <div data-gate="0.04">
            <h2>AI ENGINEERING</h2>
            <ul>
              <li>Agentic Systems</li><li>LLM Workflows</li><li>RAG</li><li>BAML</li>
              <li>MCP</li><li>Evals</li><li>Gemini</li><li>Vertex AI</li><li>Ollama</li>
            </ul>
          </div>
          <div data-gate="0.34">
            <h2>ENGINEERING</h2>
            <ul>
              <li>React</li><li>Next.js</li><li>Python</li><li>TypeScript</li>
              <li>FastAPI</li><li>GraphQL</li><li>PostgreSQL</li><li>Redis</li>
            </ul>
          </div>
          <div data-gate="0.64">
            <h2>INFRASTRUCTURE</h2>
            <ul>
              <li>AWS</li><li>GCP</li><li>Docker</li><li>Terraform</li><li>CI/CD</li>
            </ul>
          </div>
        </div>
      </div>`
  },
  {
    id: "journey",
    name: "05 Journey",
    hold: [0.8, 0.87],
    html: `
      <div class="ch">
        <div class="bug">CH 05 · JOURNEY</div>
        <ul class="stops">
          <li data-gate="0.05"><b>TAIPEI</b><span>2010–2012</span><em>National Taiwan University</em></li>
          <li data-gate="0.38"><b>BERLIN</b><span>2013–2025</span><em>TU Berlin + professional career</em></li>
          <li data-gate="0.7"><b>ZURICH</b><span>2026–</span></li>
        </ul>
      </div>`
  },
  {
    id: "contact",
    name: "06 Contact",
    hold: [0.94, 1],
    html: `
      <div class="ch">
        <div class="bug">CH 06 · CONTACT</div>
        <h1>LET'S BUILD<br>SOMETHING USEFUL.</h1>
        <div class="links">
          <a href="https://www.linkedin.com/in/nan-fang-ying-483351a7/" target="_blank" rel="noopener noreferrer">LinkedIn</a>
          <a href="https://github.com/NaN-NaN-NaN" target="_blank" rel="noopener noreferrer">GitHub</a>
          <a href="mailto:nanfangying1@gmail.com">Email</a>
        </div>
        <p class="where">Zurich, Switzerland</p>
      </div>`
  }
];

// Each turn is approach → grip → rotate → static. Content swaps under the static.
const TURNS = [
  { start: 0.10, approachEnd: 0.17, gripEnd: 0.21, rotateEnd: 0.25, staticEnd: 0.27, to: 1 },
  { start: 0.37, approachEnd: 0.388, gripEnd: 0.402, rotateEnd: 0.42, staticEnd: 0.44, to: 2 },
  { start: 0.57, approachEnd: 0.588, gripEnd: 0.602, rotateEnd: 0.62, staticEnd: 0.64, to: 3 },
  { start: 0.73, approachEnd: 0.748, gripEnd: 0.762, rotateEnd: 0.78, staticEnd: 0.80, to: 4 },
  { start: 0.87, approachEnd: 0.888, gripEnd: 0.902, rotateEnd: 0.92, staticEnd: 0.94, to: 5 }
];

const FRAME_RATIO = 1016 / 792;

const scene = document.querySelector("#scene");
const shotA = document.querySelector("#shotA");
const shotB = document.querySelector("#shotB");
const channel = document.querySelector("#channel");
const crt = document.querySelector("#crt");
const staticCanvas = document.querySelector("#static");
const tear = document.querySelector("#tear");
const bar = document.querySelector("#bar");
const hint = document.querySelector("#hint");
const explore = document.querySelector("#explore");
const nav = document.querySelector("#chapters");
const staticCtx = staticCanvas.getContext("2d", { alpha: true });

const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const smooth = (t) => {
  t = clamp(t, 0, 1);
  return t * t * (3 - 2 * t);
};
const frameSrc = (index) => `assets/frames/${String(index).padStart(2, "0")}.webp`;

function progress() {
  const max = document.documentElement.scrollHeight - window.innerHeight;
  return max > 0 ? clamp(window.scrollY / max, 0, 1) : 0;
}

function switchAt(turn) {
  return turn.rotateEnd + (turn.staticEnd - turn.rotateEnd) * 0.62;
}

function channelIndex(p) {
  let index = 0;
  for (const turn of TURNS) {
    if (p >= switchAt(turn)) index = turn.to;
  }
  return index;
}

function localOf(index, p) {
  const [from, to] = CHAPTERS[index].hold;
  const start = index === 0 ? from : switchAt(TURNS[index - 1]);
  return clamp((p - start) / (to - start), 0, 1);
}

function frameAt(p) {
  for (const turn of TURNS) {
    if (p < turn.start || p >= turn.staticEnd) continue;
    const spans = [
      [turn.start, turn.approachEnd, 1, 6],
      [turn.approachEnd, turn.gripEnd, 6, 10],
      [turn.gripEnd, turn.rotateEnd, 10, 19],
      [turn.rotateEnd, turn.staticEnd, 19, 22]
    ];
    for (const [from, to, startFrame, endFrame] of spans) {
      if (p < from || p >= to) continue;
      const t = (p - from) / (to - from);
      return startFrame + (endFrame - startFrame) * t;
    }
  }
  return 1;
}

function showFrame(frame) {
  const base = clamp(Math.floor(frame), 1, 22);
  const next = clamp(base + 1, 1, 22);
  const mix = frame - Math.floor(frame);
  if (shotA.dataset.frame !== String(base)) {
    shotA.src = frameSrc(base);
    shotA.dataset.frame = String(base);
  }
  if (shotB.dataset.frame !== String(next)) {
    shotB.src = frameSrc(next);
    shotB.dataset.frame = String(next);
  }
  shotB.style.opacity = String(clamp(mix, 0, 1));
}

function staticAmount(p) {
  for (const turn of TURNS) {
    const a = turn.rotateEnd;
    const b = turn.staticEnd;
    if (p < a || p >= b) continue;
    const t = (p - a) / (b - a);
    if (t < 0.22) return smooth(t / 0.22);
    if (t > 0.78) return 1 - smooth((t - 0.78) / 0.22);
    return 1;
  }
  return 0;
}

function layout() {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const ratio = FRAME_RATIO;
  let width = Math.min(vw, vh * ratio);
  let height = width / ratio;
  if (height > vh) {
    height = vh;
    width = height * ratio;
  }
  scene.style.width = `${width}px`;
  scene.style.height = `${height}px`;
  scene.style.left = `${(vw - width) / 2}px`;
  scene.style.top = `${(vh - height) / 2}px`;
}

let built = -1;
let noiseSeed = -1;
let noiseSize = "";

function showChannel(index) {
  if (built === index) return;
  built = index;
  channel.innerHTML = CHAPTERS[index].html;
}

function reveal(index, p) {
  const local = localOf(index, p);
  channel.querySelectorAll("[data-gate]").forEach((el) => {
    const gate = Number(el.dataset.gate);
    const t = gate === 0 ? 1 : smooth((local - gate) / 0.08);
    el.style.opacity = String(t);
    el.style.transform = `translateY(${(1 - t) * 6}px)`;
  });
}

function drawStatic(amount, seed) {
  const rect = crt.getBoundingClientRect();
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const w = Math.max(2, Math.round(rect.width * dpr));
  const h = Math.max(2, Math.round(rect.height * dpr));
  const sizeKey = `${w}x${h}`;
  if (amount < 0.02) {
    staticCanvas.style.opacity = "0";
    return;
  }
  if (seed === noiseSeed && sizeKey === noiseSize) {
    staticCanvas.style.opacity = String(amount * 0.9);
    return;
  }
  noiseSeed = seed;
  noiseSize = sizeKey;
  staticCanvas.width = w;
  staticCanvas.height = h;
  const image = staticCtx.createImageData(w, h);
  const data = image.data;
  let s = (seed + 1) * 9973;
  const next = () => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    return s & 255;
  };
  for (let y = 0; y < h; y += 2) {
    for (let x = 0; x < w; x += 2) {
      const v = next();
      const alpha = v > 80 ? 170 + (v % 70) : 18;
      for (let oy = 0; oy < 2 && y + oy < h; oy += 1) {
        for (let ox = 0; ox < 2 && x + ox < w; ox += 1) {
          const i = ((y + oy) * w + (x + ox)) * 4;
          data[i] = v;
          data[i + 1] = v;
          data[i + 2] = Math.min(255, v + 24);
          data[i + 3] = alpha;
        }
      }
    }
  }
  for (let band = 0; band < 3; band += 1) {
    const y = (next() / 255) * (h - 4);
    for (let yy = 0; yy < 3; yy += 1) {
      for (let x = 0; x < w; x += 1) {
        const i = ((Math.floor(y) + yy) * w + x) * 4;
        if (i < 0 || i >= data.length) continue;
        data[i] = 230;
        data[i + 1] = 240;
        data[i + 2] = 245;
        data[i + 3] = 150;
      }
    }
  }
  staticCtx.putImageData(image, 0, 0);
  staticCanvas.style.opacity = String(amount * 0.9);
}

function render() {
  const p = progress();
  const index = channelIndex(p);
  const noise = staticAmount(p);
  const wobble = Math.sin(p * 90) * noise;
  showFrame(frameAt(p));

  showChannel(index);
  reveal(index, p);

  channel.style.opacity = String(1 - noise * 0.96);
  channel.style.filter = `blur(${noise * 1.4}px)`;
  channel.style.transform = `translateX(${wobble * 12}px) scaleX(${1 + noise * 0.04})`;
  crt.style.filter = `brightness(${1 + Math.sin(p * 220) * noise * 0.45}) contrast(${1 + noise * 0.25})`;

  tear.style.opacity = String(noise * 0.85);
  tear.style.top = `${((p * 173) % 1) * 78}%`;

  drawStatic(noise, Math.floor(p * 360));

  bar.style.width = `${p * 100}%`;
  const fade = 1 - smooth(p / 0.06);
  hint.style.opacity = String(fade);
  explore.style.opacity = String(0.35 + fade * 0.65);

  [...nav.children].forEach((button, i) => button.classList.toggle("on", i === index));
}

nav.innerHTML = CHAPTERS.map((chapter) => `<button type="button">${chapter.name}</button>`).join("");
[...nav.children].forEach((button, i) => {
  button.addEventListener("click", () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const target = CHAPTERS[i].hold[0] + (i === 0 ? 0.01 : 0.012);
    window.scrollTo({ top: target * max, behavior: "auto" });
  });
});

let frame = 0;
function requestRender() {
  if (frame) return;
  frame = requestAnimationFrame(() => {
    frame = 0;
    render();
  });
}

window.addEventListener("scroll", requestRender, { passive: true });
window.addEventListener("resize", () => {
  noiseSize = "";
  layout();
  render();
});

for (let index = 1; index <= 22; index += 1) {
  const image = new Image();
  image.src = frameSrc(index);
}

layout();
render();
