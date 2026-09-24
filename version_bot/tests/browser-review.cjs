/* Run: NODE_PATH=/path/to/node_modules node tests/browser-review.cjs
 * Requires Playwright and Chrome. Uses only explicitly allowlisted NEW assets.
 * Original images/audio are blocked; REVIEW_VIDEO=1 permits only scene.mp4.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const http = require('node:http');
const os = require('node:os');
const path = require('node:path');
const { chromium } = require('playwright');
const root = path.resolve(__dirname, '..');
const output = process.env.REVIEW_OUTPUT || path.join(os.tmpdir(), 'portfolio-review');
const requested = [];
const served = [];
let allowVideo = false;
const server = http.createServer((req, res) => {
  const pathname = new URL(req.url, 'http://localhost').pathname;
  const relative = pathname.replace(/^\/version_bot\//, '/').replace(/^\//, '') || 'index.html';
  requested.push(relative);
  if (allowVideo && relative === 'assets/video/scene.mp4') {
    const file = path.join(root, relative);
    const size = fs.statSync(file).size;
    const range = req.headers.range?.match(/bytes=(\d+)-(\d*)/);
    const start = range ? Number(range[1]) : 0;
    const end = range && range[2] ? Math.min(Number(range[2]), size - 1) : size - 1;
    res.writeHead(range ? 206 : 200, { 'Content-Type': 'video/mp4', 'Accept-Ranges': 'bytes', 'Content-Length': end - start + 1, ...(range ? { 'Content-Range': `bytes ${start}-${end}/${size}` } : {}) });
    fs.createReadStream(file, { start, end }).pipe(res);
    served.push(relative);
    return;
  }
  const allowed = ['index.html', 'styles.css', 'script.js', 'cv.html'].includes(relative) || /^assets\/art-v2\/[a-z]+\.webp$/.test(relative);
  if (!allowed || !fs.existsSync(path.join(root, relative))) { res.writeHead(404); res.end(); return; }
  served.push(relative);
  res.setHeader('Content-Type', relative.endsWith('.html') ? 'text/html' : relative.endsWith('.js') ? 'text/javascript' : relative.endsWith('.css') ? 'text/css' : 'image/webp');
  res.end(fs.readFileSync(path.join(root, relative)));
});
const legacy = (value) => /^assets\/(images|video|audio)\//.test(value);
(async () => {
  fs.mkdirSync(output, { recursive: true });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const base = `http://127.0.0.1:${server.address().port}/version_bot/`;
  const browser = await chromium.launch({ headless: true, channel: process.env.BROWSER_CHANNEL || 'chrome' });
  try {
    const page = await browser.newPage();
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    const checks = [];
    const gotoPage = async (id) => {
      await page.evaluate(id => { location.hash = id; }, id);
      await page.waitForFunction(id => document.documentElement.dataset.page === id, id, { timeout: 5000 }).catch(error => { throw new Error(`Could not reach ${id}: ${error.message}`); });
    };
    for (const [width, height] of [[1440, 900], [1366, 768], [1920, 1080], [390, 844], [320, 740]]) {
      await page.setViewportSize({ width, height });
      await page.goto(base + '?preview=screen');
      await page.waitForFunction(() => Boolean(document.documentElement.dataset.page));
      const cinematic = await page.locator('html').evaluate(el => el.classList.contains('is-cinematic'));
      assert.equal(cinematic, true, `Expected the cinematic scene at ${width}`);
      const ids = await page.locator('.chapter').evaluateAll(els => els.map(el => el.id));
      for (const id of ids) {
        await gotoPage(id);
        const layout = await page.evaluate(() => {
          const article = document.querySelector('.chapter.is-active');
          const sheet = article.querySelector('.sheet');
          const body = article.querySelector('.page-body');
          const controls = document.querySelector('.screen-controls');
          const rect = body.getBoundingClientRect();
          const glass = document.querySelector('.glass').getBoundingClientRect();
          const textLeaves = [...article.querySelectorAll('p, li, dd, dt, h1, h2, h3, a')];
          return {
            id: article.id,
            overflow: rect.bottom > controls.getBoundingClientRect().top - 4,
            horizontal: document.documentElement.scrollWidth > innerWidth,
            textClipped: textLeaves.some(el => el.getBoundingClientRect().right > glass.right - 8),
            bodySize: parseFloat(getComputedStyle(body).fontSize),
            activeCount: document.querySelectorAll('.chapter:not([inert])').length,
            hiddenExposed: [...document.querySelectorAll('.chapter:not(.is-active)')].some(el => !el.inert || el.getAttribute('aria-hidden') !== 'true'),
          };
        });
        assert.equal(layout.horizontal, false, `${width}: horizontal overflow on ${id}`);
        assert.ok(layout.bodySize >= (width >= 1000 ? 14 : 6), `${width}: small body text on ${id}`);
        if (cinematic) {
          assert.equal(layout.overflow, false, `${width}: controls overlap on ${id}`);
          assert.equal(layout.textClipped, false, `${width}: text clipped on ${id}`);
          assert.equal(layout.activeCount, 1);
          assert.equal(layout.hiddenExposed, false);
        } else assert.equal(layout.activeCount, ids.length);
      }
      checks.push(`${width}×${height}: ${ids.length} pages fit; readable text and correct focus visibility`);
      await gotoPage('about');
      await page.waitForTimeout(260);
      await page.screenshot({ path: path.join(output, `about-${width}.png`) });
    }
    assert.equal(requested.filter(legacy).length, 0, 'Preview must not request original media');
    // Every scene must be reachable in order using scroll alone, with no clicks or hashes.
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(base + '?preview=screen');
    const sequence = await page.locator('.chapter').evaluateAll(els => els.map(el => el.id));
    for (let i = 0; i < sequence.length; i++) {
      await page.evaluate(({ i, count }) => window.scrollTo(0, ((i + .1) / count) * (document.documentElement.scrollHeight - innerHeight)), { i, count: sequence.length });
      await page.waitForFunction(id => document.documentElement.dataset.page === id, sequence[i]);
    }
    await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
    await page.waitForFunction(() => document.documentElement.dataset.page === 'contact');
    checks.push(`All ${sequence.length} scenes reached in order by scrolling alone`);

    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(base + '?preview=screen#work-moonfare-2');
    await page.waitForFunction(() => document.documentElement.dataset.page === 'work-moonfare');
    await page.locator('.dock [data-channel-link="projects"]').click();
    await page.waitForFunction(() => document.documentElement.dataset.channel === 'projects');
    await page.locator('.dock [data-channel-link="experience"]').click();
    await page.waitForFunction(() => document.documentElement.dataset.page === 'experience');
    checks.push('Old deep links redirect to consolidated content; dock always returns to group start');

    await gotoPage('work-moonfare');
    await page.locator('#page-index').click();
    await page.waitForFunction(() => document.documentElement.dataset.page === 'experience');
    await page.locator('[data-page="work-independent"]').click();
    await page.waitForFunction(() => document.documentElement.dataset.page === 'work-independent');
    await page.locator('#page-next').focus();
    await page.keyboard.press('ArrowRight');
    await page.waitForFunction(() => document.documentElement.dataset.page === 'work-ahead');
    await page.keyboard.press('ArrowLeft');
    await page.waitForFunction(() => document.documentElement.dataset.page === 'work-independent');
    checks.push('Career index, next/previous controls and keyboard arrows');

    for (const [id, name] of [['about', 'about'], ['experience', 'impact'], ['work-moonfare', 'moonfare'], ['projects', 'letteron'], ['skills', 'skills'], ['contact', 'contact']]) {
      await gotoPage(id); await page.waitForTimeout(260);
      await page.locator('#glass').screenshot({ path: path.join(output, `screen-${name}.png`) });
    }
    await gotoPage('rageasy');
    await page.setViewportSize({ width: 390, height: 844 });
    await page.waitForFunction(() => document.documentElement.classList.contains('is-cinematic'));
    assert.equal(await page.locator('html').getAttribute('data-page'), 'rageasy');
    checks.push('Phone keeps the cinematic scene and the current page');

    const requestMark = requested.length;
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto(base);
    await page.waitForFunction(() => Boolean(document.documentElement.dataset.page));
    assert.equal(await page.locator('html').evaluate(el => el.classList.contains('is-cinematic')), false);
    assert.equal(await page.locator('.chapter[inert]').count(), 0);
    assert.equal(requested.slice(requestMark).filter(legacy).length, 0);
    checks.push('Reduced motion renders all content without original media');
    await page.emulateMedia({ reducedMotion: 'no-preference' });

    // All original media URLs receive 404 without being read. The site must stay usable.
    await page.goto(base);
    await page.waitForFunction(() => !document.documentElement.classList.contains('is-cinematic'));
    assert.equal(await page.locator('.chapter[inert]').count(), 0);
    checks.push('Complete media failure falls back to the full reading layout');

    // Serve NEW art as synthetic frame responses to test partial media fallback.
    await page.route('**/assets/images/**', route => {
      if (route.request().url().includes('frame_05.png')) route.fulfill({ contentType: 'image/webp', body: fs.readFileSync(path.join(root, 'assets/art-v2/about.webp')) });
      else route.fulfill({ status: 404, body: '' });
    });
    await page.goto(base);
    await page.waitForFunction(() => document.documentElement.classList.contains('frames-ready'));
    await page.locator('.dock [data-channel-link="contact"]').click();
    await page.waitForFunction(() => document.documentElement.dataset.channel === 'contact');
    assert.equal(await page.locator('html').evaluate(el => el.classList.contains('is-cinematic')), true);
    checks.push('One available synthetic frame keeps navigation operational');
    await page.unroute('**/assets/images/**');

    if (process.env.REVIEW_VIDEO === '1') {
      // Explicitly authorized source video only; original images remain blocked.
      allowVideo = true;
      await page.goto(base);
      await page.waitForFunction(() => document.documentElement.classList.contains('use-video'));
      for (const [id, name] of [['about', 'about'], ['experience', 'impact'], ['work-moonfare', 'moonfare'], ['projects', 'letteron'], ['contact', 'contact']]) {
        await gotoPage(id);
        await page.waitForFunction(() => Number(document.documentElement.dataset.turnsCompleted || 0) === Number(document.documentElement.dataset.turnsRequested || 0));
        await page.waitForTimeout(400);
        await page.screenshot({ path: path.join(output, `room-${name}.png`) });
      }
      const mediaState = await page.locator('#scene-video').evaluate(el => ({ time: el.currentTime, duration: el.duration }));
      assert.ok(mediaState.time > mediaState.duration * .9, 'Each page turn plays through to the end of the video');
      const turnCount = await page.locator('html').evaluate(el => Number(el.dataset.turnsCompleted));
      await gotoPage('work-ahead');
      await gotoPage('projects');
      await page.waitForFunction(count => Number(document.documentElement.dataset.turnsCompleted) === count + 2, turnCount);
      assert.equal(await page.locator('html').evaluate(el => Number(el.dataset.turnsRequested)), turnCount + 2);
      const colors = await page.locator('.city-lights i').evaluateAll(els => new Set(els.map(el => getComputedStyle(el).backgroundColor)).size);
      assert.equal(colors, 4);
      const effects = await page.locator('.lamp, .steam span, .city-lights i').evaluateAll(els => els.every(el => getComputedStyle(el).animationName !== 'none'));
      assert.equal(effects, true);
      checks.push('Each page triggers a full turn, rapid turns queue to completion; four window colors and active room effects');
      allowVideo = false;
    }

    // Condensed screen summaries retain the key outcomes; full copy stays in Classic CV.
    await page.goto(base + '?preview=screen');
    assert.equal(await page.locator('[data-channel="skills"]').count(), 1);
    assert.equal(await page.locator('[data-channel="projects"]').count(), 2);
    assert.equal(await page.locator('#about-education .education h3').count(), 5);
    assert.equal(await page.locator('#projects a[href="https://letteron.app/"]').count(), 1);
    assert.equal(await page.locator('.chapter[id^="work-moonfare"]').count(), 1);
    const portfolioText = await page.locator('main').textContent();
    for (const fact of ['10–15%', '200+', '7–8', '15–20%', '800ms', '10K+', '2013–2018', '2010–2012']) assert.ok(portfolioText.includes(fact), `Missing outcome: ${fact}`);
    await page.goto(base + 'cv.html');
    const sourceBullets = await page.locator('.job li').allTextContents();
    assert.equal(sourceBullets.length, 27);
    await page.emulateMedia({ media: 'print' });
    assert.equal(await page.locator('.cv-toolbar').isVisible(), false);
    await page.pdf({ path: path.join(output, 'classic-print-check.pdf'), format: 'A4' });
    checks.push(`${sourceBullets.length} original CV achievements preserved; Classic print layout available`);

    const noJs = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 390, height: 844 } });
    const staticPage = await noJs.newPage();
    await staticPage.goto(base);
    assert.equal(await staticPage.locator('.chapter[inert]').count(), 0);
    assert.equal(await staticPage.locator('#contact').isVisible(), true);
    await noJs.close();
    checks.push('No-JavaScript reading fallback');
    assert.deepEqual(errors, []);
    assert.equal(served.filter(item => legacy(item) && item !== 'assets/video/scene.mp4').length, 0, 'No original image or audio was read or served');
    const report = { checks, browserErrors: errors, originalImagesRead: 0, authorizedVideoReviewed: process.env.REVIEW_VIDEO === '1', screenshots: output };
    fs.writeFileSync(path.join(output, 'report.json'), JSON.stringify(report, null, 2));
    console.log(JSON.stringify(report, null, 2));
  } finally { await browser.close(); server.close(); }
})().catch(error => { console.error(error); server.close(); process.exitCode = 1; });
