const CONFIG = {
  totalFrames: 10,
  framePath: (index) => `assets/images/frames/frame_${String(index).padStart(2, "0")}.png`,
  fallbackImage: "assets/images/fallback.png",
  videoSrc: "assets/video/scene.mp4?v=18",
  mediaRatio: 1664 / 928,
  // The clip's knob turn finishes before the file ends. Map the whole scroll onto that motion.
  motionEnd: 0.75,
  scrollPerPage: 70, // Each scene holds for 70vh of native scrolling.
  minGlassWidth: 120,
  minGlassHeight: 80,
  channels: [
    { id: "about" },
    { id: "experience" },
    { id: "projects" },
    { id: "skills" },
    { id: "education" },
    { id: "contact" },
  ],
};

document.getElementById("print-cv")?.addEventListener("click", () => window.print());
if (document.getElementById("stage")) initPortfolio();

function initPortfolio() {
  const root = document.documentElement;
  const stage = document.getElementById("stage");
  const glass = document.getElementById("glass");
  const video = document.getElementById("scene-video");
  const still = document.getElementById("hero-still");
  const canvas = document.getElementById("view");
  const context = canvas.getContext("2d");
  const bar = document.getElementById("dock-bar");
  const previous = document.getElementById("page-prev");
  const next = document.getElementById("page-next");
  const index = document.getElementById("page-index");
  const status = document.getElementById("page-status");
  const controls = document.querySelector(".screen-controls");
  const pages = [...document.querySelectorAll(".chapter")];
  const groups = [...document.querySelectorAll(".channel")];
  const channelPages = new Map(CONFIG.channels.map(({ id }) => [id, pages.filter((page) => page.dataset.channel === id)]));
  const remembered = new Map(CONFIG.channels.map(({ id }) => [id, 0]));
  const narrowQuery = matchMedia("(max-width: 800px)");
  const reducedQuery = matchMedia("(prefers-reduced-motion: reduce)");
  // Safe isolated review: no original room image, frame, video or audio is requested.
  const screenPreview = new URLSearchParams(location.search).get("preview") === "screen";
  root.classList.toggle("screen-preview", screenPreview);
  root.style.setProperty("--timeline", `${100 + pages.length * CONFIG.scrollPerPage}vh`);
  let cinematic = false;
  let activeChannel = "about";
  let observer;
  let frameRequest = 0;
  let resizeRequest = 0;
  let pulseTimer;
  let ratio = CONFIG.mediaRatio;
  let currentProgress = 0;
  let videoStarted = false;
  let videoReady = false;
  let videoFailed = false;
  let mediaUnavailable = false;
  let failedFrames = 0;
  let stillFailed = false;
  let framesStarted = false;
  let turnRunning = false;
  let pendingTurns = 0;
  let turnFrame = 0;
  let playbackToken = 0;
  let lastRenderedPage = null;
  let turnsRequested = 0;
  let turnsCompleted = 0;
  let videoSeeking = false;
  let lastTurnAt = 0;
  const turnCooldown = 2600;
  let watchdog;

  const frames = new Array(CONFIG.totalFrames).fill(null);
  let targetFrame = 0;
  let lastFrame = -1;

  function currentPage() { return channelPages.get(activeChannel)[remembered.get(activeChannel)]; }
  function maxScroll() { return Math.max(1, document.documentElement.scrollHeight - innerHeight); }
  function progress() { return Math.min(1, Math.max(0, scrollY / maxScroll())); }
  function pageAt(value) { return pages[Math.min(pages.length - 1, Math.floor(value * pages.length + .0001))]; }
  function pageProgress(page) { return (pages.indexOf(page) + .015) / pages.length; }
  function scrollToPage(page) { window.scrollTo({ top: pageProgress(page) * maxScroll(), behavior: "instant" }); }
  function selectPage(page) {
    activeChannel = page.dataset.channel;
    remembered.set(activeChannel, channelPages.get(activeChannel).indexOf(page));
  }
  function writeHash(id) {
    if (location.hash !== `#${id}`) history.replaceState(null, "", `#${id}`);
  }
  function pulse() {
    if (!cinematic || reducedQuery.matches) return;
    glass.classList.remove("is-tuning");
    void glass.offsetWidth;
    glass.classList.add("is-tuning");
    clearTimeout(pulseTimer);
    pulseTimer = setTimeout(() => glass.classList.remove("is-tuning"), 210);
  }
  function render(animate = false, updateHash = true) {
    const selected = currentPage();
    const changed = lastRenderedPage !== null && lastRenderedPage !== selected.id;
    lastRenderedPage = selected.id;
    groups.forEach((group) => group.classList.toggle("is-active", group.dataset.channelGroup === activeChannel));
    pages.forEach((page) => {
      const active = page === selected;
      page.classList.toggle("is-active", active);
      page.inert = cinematic && !active;
      if (cinematic && !active) page.setAttribute("aria-hidden", "true");
      else page.removeAttribute("aria-hidden");
    });
    document.querySelectorAll("[data-channel-link]").forEach((link) => {
      if (link.dataset.channelLink === activeChannel) link.setAttribute("aria-current", "true");
      else link.removeAttribute("aria-current");
    });
    const list = channelPages.get(activeChannel);
    const position = remembered.get(activeChannel);
    previous.disabled = pages.indexOf(selected) === 0;
    next.disabled = pages.indexOf(selected) === pages.length - 1;
    const overviewPosition = 0;
    index.disabled = position === overviewPosition;
    index.textContent = "↖ Overview";
    status.textContent = `${activeChannel[0].toUpperCase() + activeChannel.slice(1)} · ${position + 1} / ${list.length}`;
    previous.setAttribute("aria-label", `Previous ${activeChannel} page`);
    next.setAttribute("aria-label", `Next ${activeChannel} page`);
    root.dataset.channel = activeChannel;
    root.dataset.page = selected.id;
    if (updateHash) writeHash(selected.id);
    if (animate && changed) pulse();
    if (cinematic) requestAnimationFrame(fitSheets);
  }
  function commitStagedPage() {
    const page = stagedPage;
    stagedPage = null;
    if (!page || page === currentPage()) return;
    selectPage(page);
    render(true);
  }
  function stagePageChange(page) {
    if (!page || (page === currentPage() && !turnRunning)) return;
    stagedPage = page;
    if (turnRunning) return;
    if (performance.now() - lastTurnAt < turnCooldown || (!videoReady && !frames.some(Boolean))) {
      commitStagedPage();
      return;
    }
    pendingTurns = 1;
    root.dataset.turnsRequested = String(++turnsRequested);
    playTurn();
    if (!turnRunning) commitStagedPage();
  }
  function turnPage(position) {
    const list = channelPages.get(activeChannel);
    const page = list[Math.min(list.length - 1, Math.max(0, position))];
    jump(activeChannel, page.id);
    // If a paging button becomes disabled, place focus on the remaining paging control.
    if (document.activeElement === next && next.disabled) previous.focus();
    else if (document.activeElement === previous && previous.disabled) next.focus();
    else if (document.activeElement === index && index.disabled) next.focus();
  }
  function jump(channel, pageId, focus = false, immediate = false) {
    const list = channelPages.get(channel);
    if (!list) return;
    const found = pageId ? list.findIndex((page) => page.id === pageId) : remembered.get(channel) || 0;
    const page = list[Math.max(0, found)];
    activeChannel = channel;
    remembered.set(channel, list.indexOf(page));
    render(false);
    if (cinematic) {
      scrollToPage(currentPage());
      schedule();
    } else page.scrollIntoView({ behavior: "instant", block: "start" });
    if (focus) page.querySelector("h1, h2")?.focus({ preventScroll: true });
  }
  function stepPage(direction) {
    const target = pages[Math.min(pages.length - 1, Math.max(0, pages.indexOf(currentPage()) + direction))];
    jump(target.dataset.channel, target.id);
    if (document.activeElement === next && next.disabled) previous.focus();
    else if (document.activeElement === previous && previous.disabled) next.focus();
  }
  previous.addEventListener("click", () => stepPage(-1));
  next.addEventListener("click", () => stepPage(1));
  index.addEventListener("click", () => turnPage(0));
  document.querySelectorAll("[data-channel-link], [data-page]").forEach((link) => {
    link.addEventListener("click", (event) => {
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const pageId = link.dataset.page;
      const target = pageId ? document.getElementById(pageId) : null;
      const channel = target?.dataset.channel || link.dataset.channelLink;
      if (!channelPages.has(channel)) return;
      event.preventDefault();
      jump(channel, pageId || channelPages.get(channel)[0].id, Boolean(pageId));
    });
  });
  controls.addEventListener("keydown", (event) => {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
    event.preventDefault();
    stepPage(event.key === "ArrowRight" ? 1 : -1);
  });
  function restoreHash() {
    let id;
    try { id = decodeURIComponent(location.hash.slice(1)); } catch { return false; }
    const aliases = { "experience-index": "experience", "work-moonfare-2": "work-moonfare", "work-moonfare-3": "work-moonfare", "work-moonfare-engineer": "work-moonfare", "work-moonfare-engineer-2": "work-moonfare", "work-plusdental-2": "work-plusdental", "work-ntu-teaching": "work-ntu-research", "early-software": "work-herobear", "early-research": "work-ntu-research", "letteron-intelligence": "projects", "letteron-engineering": "projects", "skills-product": "skills", "skills-leadership": "skills", "skills-systems": "skills" };
    id = aliases[id] || id;
    const page = pages.find((item) => item.id === id);
    if (!page) return false;
    jump(page.dataset.channel, page.id, false, true);
    return true;
  }
  addEventListener("hashchange", restoreHash);

  function stageSize() {
    const dockEl = document.querySelector(".dock");
    const reserve = dockEl.getBoundingClientRect().height || 72;
    const dockHeight = cinematic ? reserve : Math.min(194, Math.max(64, innerHeight * .14));
    const availH = Math.max(160, innerHeight - dockHeight);
    const narrow = narrowQuery.matches;
    let width;
    let height;
    let focus = 0.5;
    if (narrow) {
      height = Math.min(availH, innerWidth / ratio);
      width = height * ratio;
      focus = 0.5;
    } else {
      height = Math.min(innerWidth / ratio, availH);
      width = height * ratio;
    }
    return { width, height, focus, narrow };
  }
  function placeStage(size) {
    stage.style.width = `${size.width}px`;
    stage.style.height = `${size.height}px`;
    stage.style.left = `${(innerWidth - size.width) / 2}px`;
    const dockHeight = document.querySelector(".dock").getBoundingClientRect().height;
    stage.style.top = `${Math.max(0, (innerHeight - dockHeight - size.height) / 2)}px`;
    const dpr = Math.min(devicePixelRatio || 1, 2);
    canvas.width = Math.round(size.width * dpr);
    canvas.height = Math.round(size.height * dpr);
    lastFrame = -1;
  }
  function fitSheets() {
    document.querySelectorAll(".sheet").forEach((sheet) => {
      sheet.classList.toggle("can-scroll", sheet.scrollHeight > sheet.clientHeight + 8);
    });
  }
  function observeReading() {
    observer?.disconnect();
    if (cinematic || !("IntersectionObserver" in window)) return;
    // The observer only schedules a measurement. Queued entries from a previous
    // hash jump must never overwrite the actual page now under the reading line.
    observer = new IntersectionObserver(schedule, { threshold: [0, .5] });
    pages.forEach((page) => observer.observe(page));
  }
  function readingPage() {
    if (scrollY >= maxScroll() - 2) return pages[pages.length - 1];
    const line = innerHeight * .24;
    return pages.find((page) => {
      const rect = page.getBoundingClientRect();
      return rect.top <= line && rect.bottom > line;
    }) || pages.find((page) => page.getBoundingClientRect().top >= 0) || pages[0];
  }
  function syncMode(initial = false) {
    const oldMode = cinematic;
    const selected = currentPage();
    const size = stageSize();
    cinematic = !mediaUnavailable && !reducedQuery.matches && innerWidth >= 320 && size.width * .448 >= CONFIG.minGlassWidth && size.height * .656 >= CONFIG.minGlassHeight;
    root.classList.toggle("is-cinematic", cinematic);
    if (cinematic) {
      placeStage(stageSize());
      observer?.disconnect();
      ensureMedia();
      requestAnimationFrame(fitSheets);
    } else {
      stage.removeAttribute("style");
      stopTurns();
      observeReading();
    }
    render(false, false);
    if (!initial) {
      if (cinematic) {
        scrollToPage(selected);
      } else if (oldMode) selected.scrollIntoView({ behavior: "instant", block: "start" });
    }
    schedule();
  }

  function ensureMedia() {
    if (screenPreview || !cinematic) return;
    if (!still.getAttribute("src")) still.src = still.dataset.src;
    if (videoFailed) { ensureFrames(); return; }
    if (videoStarted) return;
    videoStarted = true;
    video.muted = true;
    video.preload = "auto";
    video.src = CONFIG.videoSrc;
    video.load();
    watchdog = setTimeout(failVideo, 10000);
  }
  function fallbackToReading() {
    if (failedFrames === CONFIG.totalFrames && stillFailed) {
      mediaUnavailable = true;
      syncMode();
    }
  }
  still.addEventListener("load", () => still.classList.add("is-loaded"));
  still.addEventListener("error", () => {
    if (still.dataset.fallback) {
      stillFailed = true;
      still.style.visibility = "hidden";
      fallbackToReading();
      return;
    }
    still.dataset.fallback = "true";
    still.src = CONFIG.fallbackImage;
  });
  video.addEventListener("loadedmetadata", () => {
    if (videoFailed || !video.videoWidth || !video.videoHeight) return;
    ratio = video.videoWidth / video.videoHeight;
    syncMode();
  });
  video.addEventListener("loadeddata", () => {
    if (videoFailed) return;
    const end = video.seekable.length ? video.seekable.end(video.seekable.length - 1) : 0;
    if (end < 0.2 && video.dataset.blob !== "1") {
      video.dataset.blob = "1";
      fetch(CONFIG.videoSrc).then((response) => {
        if (!response.ok) throw new Error("video");
        return response.blob();
      }).then((blob) => {
        video.src = URL.createObjectURL(blob);
        video.load();
      }).catch(() => failVideo());
      return;
    }
    if (!Number.isFinite(video.duration) || video.duration <= 0) { failVideo(); return; }
    videoReady = true;
    clearTimeout(watchdog);
    root.classList.add("use-video");
    video.pause();
    schedule();
  });
  video.addEventListener("error", failVideo);
  video.addEventListener("seeked", () => {
    videoSeeking = false;
    if (!videoReady || videoFailed) return;
    const target = videoTime(currentProgress);
    if (Math.abs(video.currentTime - target) >= 0.04) scrubVideo();
  });
  function requestTurn() {
    if (!cinematic || reducedQuery.matches || screenPreview || turnRunning) return;
    const now = performance.now();
    if (now - lastTurnAt < turnCooldown) return;
    pendingTurns = 1;
    root.dataset.turnsRequested = String(++turnsRequested);
    playTurn();
  }
  function stopTurns() {
    playbackToken++;
    pendingTurns = 0;
    turnRunning = false;
    cancelAnimationFrame(turnFrame);
    video.pause();
  }
  function finishTurn() {
    if (!turnRunning) return;
    turnRunning = false;
    pendingTurns = 0;
    root.dataset.turnsCompleted = String(++turnsCompleted);
    commitStagedPage();
  }
  function playTurn() {
    if (turnRunning || !pendingTurns || !cinematic || reducedQuery.matches) return;
    lastTurnAt = performance.now();
    if (videoReady && !videoFailed) {
      turnRunning = true;
      const token = ++playbackToken;
      const start = () => {
        if (token !== playbackToken || !cinematic) return;
        video.playbackRate = 2;
        const promise = video.play();
        promise?.catch(() => {
          if (token !== playbackToken || !cinematic) return;
          turnRunning = false;
          failVideo();
        });
      };
      if (video.currentTime > 0.05) {
        video.addEventListener("seeked", start, { once: true });
        video.currentTime = 0;
      } else start();
    } else if (frames.some(Boolean)) {
      turnRunning = true;
      const started = performance.now();
      const animate = (now) => {
        if (!cinematic || !turnRunning) return;
        const value = Math.min(1, (now - started) / 1250);
        targetFrame = Math.round(value * (CONFIG.totalFrames - 1));
        drawFrame();
        if (value < 1) turnFrame = requestAnimationFrame(animate);
        else finishTurn();
      };
      turnFrame = requestAnimationFrame(animate);
    }
  }
  function failVideo() {
    if (videoFailed || screenPreview) return;
    videoFailed = true;
    videoReady = false;
    turnRunning = false;
    clearTimeout(watchdog);
    commitStagedPage();
    root.classList.remove("use-video");
    video.pause();
    ensureFrames();
  }
  function ensureFrames() {
    if (framesStarted || screenPreview || !cinematic) return;
    framesStarted = true;
    for (let number = 1; number <= CONFIG.totalFrames; number++) {
      const image = new Image();
      image.decoding = "async";
      image.onload = () => { frames[number - 1] = image; lastFrame = -1; schedule(); };
      image.onerror = () => { failedFrames++; fallbackToReading(); };
      image.src = CONFIG.framePath(number);
    }
  }
  function drawFrame() {
    if (!context || !cinematic) return;
    let nearest = -1;
    frames.forEach((frame, i) => {
      if (frame && (nearest < 0 || Math.abs(i - targetFrame) < Math.abs(nearest - targetFrame))) nearest = i;
    });
    if (nearest < 0 || nearest === lastFrame) return;
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.drawImage(frames[nearest], 0, 0, canvas.width, canvas.height);
    root.classList.add("frames-ready");
    lastFrame = nearest;
  }
  function tick() {
    frameRequest = 0;
    if (!cinematic) {
      const target = readingPage();
      if (target !== currentPage()) { selectPage(target); render(false, false); }
      return;
    }
    currentProgress = progress();
    const targetPage = pageAt(currentProgress);
    if (targetPage !== currentPage()) {
      selectPage(targetPage);
      render(true);
    }
    bar.style.transform = `scaleX(${currentProgress})`;
    if (videoReady && !videoFailed) scrubVideo();
    else {
      targetFrame = Math.round(currentProgress * (CONFIG.totalFrames - 1));
      drawFrame();
    }
  }
  function videoTime(progress) {
    const duration = video.duration;
    if (!Number.isFinite(duration) || duration <= 0) return null;
    const span = Math.min(1, Math.max(0.05, CONFIG.motionEnd || 1));
    return progress * Math.max(0, duration * span - 1 / 24);
  }
  function scrubVideo() {
    if (!videoReady || videoFailed || videoSeeking) return;
    const target = videoTime(currentProgress);
    if (target == null) return;
    if (Math.abs(video.currentTime - target) < 0.03) return;
    const pinned = window.scrollY;
    videoSeeking = true;
    video.pause();
    video.currentTime = target;
    if (window.scrollY !== pinned) window.scrollTo(0, pinned);
  }
  function schedule() { if (!frameRequest) frameRequest = requestAnimationFrame(tick); }
  addEventListener("scroll", schedule, { passive: true });
  addEventListener("resize", () => {
    cancelAnimationFrame(resizeRequest);
    resizeRequest = requestAnimationFrame(() => syncMode());
  }, { passive: true });
  narrowQuery.addEventListener("change", () => syncMode());
  reducedQuery.addEventListener("change", () => syncMode());
  addEventListener("pageshow", (event) => { if (event.persisted) { syncMode(); restoreHash(); } });
  const artCanvases = new Map();
  document.querySelectorAll(".chapter[data-art]").forEach((article) => {
    const name = article.dataset.art;
    const layer = article.querySelector(".scene-art");
    const raster = document.createElement("canvas");
    raster.width = 192; raster.height = 144;
    raster.setAttribute("aria-hidden", "true");
    layer.append(raster);
    if (!artCanvases.has(name)) artCanvases.set(name, []);
    artCanvases.get(name).push(raster);
  });
  artCanvases.forEach((canvases, name) => {
    const source = new Image();
    source.onload = () => canvases.forEach((raster) => {
      const ctx = raster.getContext("2d");
      if (!ctx) return;
      ctx.filter = "saturate(.24) contrast(.8) brightness(1.15) blur(.45px)";
      ctx.drawImage(source, 0, 0, 192, 144);
      const pixels = ctx.getImageData(0, 0, 192, 144);
      for (let i = 0; i < pixels.data.length; i += 4) {
        for (let c = 0; c < 3; c++) pixels.data[i + c] = Math.round(pixels.data[i + c] / 12) * 12;
      }
      ctx.putImageData(pixels, 0, 0);
      raster.classList.add("is-ready");
    });
    source.src = `assets/art-v2/${name}.webp`;
  });
  syncMode(true);
  if (!restoreHash()) render(false, false);
}
