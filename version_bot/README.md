# Nan Fang-Ying — CRT portfolio

Static HTML, CSS and JavaScript. No build step or backend. Relative URLs work at the site root and under `/version_bot/` on GitHub Pages.

## Read the portfolio

Desktop: native scrolling visits **every one of the 17 scenes**, including every job, project detail and education page. Five channel thumbnails are shortcuts; previous/next arrows also cross channel boundaries. No content requires clicking an index link. Each scene occupies 70vh of scrolling (`CONFIG.scrollPerPage`), so the page stays still while reading. Every page change queues one complete robot-hand turn. The full source clip plays at 4× speed (about 1.3 seconds); quick page changes queue rather than interrupting an unfinished turn.

Index links and URL hashes jump directly to a scene. Channel shortcuts always return to the first scene in that group. Resizing retains the current scene. Smaller screens, reduced-motion preferences, disabled JavaScript and complete media failure use the complete, vertically flowing reading layout. `cv.html` remains the printable classic resume.

## Preview

```sh
python3 -m http.server 8000
```

Open `http://localhost:8000/`. To review only new screen art and text, use `http://localhost:8000/?preview=screen`. This mode requests **none of the original image, video or audio files**.

The original room media is preserved. The active video is `assets/video/scene.mp4?v=16`; frame images and a fallback still remain optional recovery paths. Audio is off; no audio assets are requested.

## Content and visual structure

- `index.html`: all visible text, semantic articles, source-order reading sequence, chapter indexes, links and decorative room layers. Backgrounds contain no resume text.
- `styles.css`: shared typography, mobile reading layout, curved glass mask, CRT effects and classic print styling. `--glass-*` coordinates and the inline `crt-glass-shape` clip path were calibrated against the 1504×832 video at its start, middle and end.
- `script.js`: page-to-scroll mapping, native navigation and focus state, group-start navigation, video seeking and media fallbacks. Minimum readable glass size: 500×410 CSS pixels; otherwise use reading mode.
- `assets/art-v2/`: eight new, text-free WebP backgrounds. For the analog treatment, JavaScript renders them into 192×144 decorative canvases. HTML text remains selectable and accessible. CSS adds coarse grain, scanlines, soft focus, reduced color depth, phosphor glow, ghosting and occasional jitter.

Ambient room effects are independent of the robot turn playback: warm desk-lamp flicker, six rising coffee steam wisps and ten brighter white/red/green/yellow Zurich window lights. Their positions are percentages of the stage, so they scale with the video. Reduced-motion mode disables animation.

### Content correspondence

| Channel | Source / grouping |
| --- | --- |
| About (3 scenes) | Identity, Summary, both Education entries |
| Experience (10 scenes) | Impact overview plus nine company/organization pages. Moonfare roles share one page; NTU research/teaching share one page. |
| Projects (2 scenes) | One page per project; LetterON includes landing-page and repository links. |
| Skills (1 scene) | Six concise skill groups and AWS certification; the full inventory remains in Classic CV. |
| Contact (1 scene) | Email, LinkedIn, GitHub, phone, location, Permit B, classic/print link |

Interactive company/project summaries consolidate long achievements for readable single-page scenes. All 27 original work/project bullets remain in `cv.html`. Tests check important outcomes, single-page grouping and the LetterON landing link. When editing facts, update both versions. Dates, financial outcomes and employment claims must come from the existing CV, not generated art.

## Verification

Requires Playwright and a local Chrome installation:

```sh
NODE_PATH=/path/to/node_modules node tests/browser-review.cjs
# Also inspect the authorized source video:
NODE_PATH=/path/to/node_modules REVIEW_VIDEO=1 node tests/browser-review.cjs
```

The test server only reads an explicit allowlist of HTML, CSS, JavaScript and **new** art. In `REVIEW_VIDEO=1` mode it additionally serves the existing video with byte-range support. Existing images and audio stay blocked. One synthetic frame fallback uses newly generated art.

Checks cover all scenes at 1440×900, 1366×768, 1920×1080, 390×844 and 320×740; scroll-only traversal; hashes; overview and keyboard navigation; group-start behavior; resize; reduced motion; no-JavaScript reading; complete/partial media failure; key outcomes and intact Classic CV bullets; and Classic print output. Screenshots, a print PDF and `report.json` are written to the OS temporary `portfolio-review` directory, or `REVIEW_OUTPUT` if provided.
