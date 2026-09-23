# Nan Fang-Ying CV Planet

An interactive Three.js CV built from `CV_NanFangYing.pdf` (May 2026).

## Development

```bash
npm install
npm run dev
```

## Production build

```bash
npm run build
npm run preview
```

The production site is generated in `dist/`. Vite uses relative asset paths, so the build can be published at a GitHub Pages root domain or inside a repository subdirectory.

## Content

CV content is centralized in `src/data.ts`. The same data feeds the 3D neon stations, detail drawers, and complete list view.

## Controls

- Desktop: WASD or arrow keys to move, drag to orbit the camera, Space to jump, and Enter/E to open a nearby station.
- Mobile: virtual joystick, drag the scene to orbit, and use the action button near a station.
