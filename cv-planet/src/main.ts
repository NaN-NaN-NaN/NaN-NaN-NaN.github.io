import "./style.css";
import * as THREE from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "three/examples/jsm/postprocessing/OutputPass.js";
import {
  ArrowRight,
  ArrowUpRight,
  ExternalLink,
  FileText,
  Github,
  List,
  Mail,
  MapPin,
  Maximize2,
  Phone,
  RotateCcw,
  X,
  createIcons,
} from "lucide";
import { profile, sections, type CVLink, type CVSection } from "./data";

const PLANET_RADIUS = 13;
const PLAYER_SURFACE_OFFSET = 0.48;
const INTERACTION_DISTANCE = 4.2;
const ARENA_RADIUS = 7;
const STATION_RING_RADIUS = 8.15;
const STATION_COLLISION_RADIUS = 2.8;
const STATION_APPROACH_DISTANCE = 3.5;
const ARENA_CENTER = new THREE.Vector3(1, 0, 0);
const ARENA_NORTH = new THREE.Vector3(0, 1, 0);
const ARENA_EAST = new THREE.Vector3(0, 0, 1);
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const isCoarsePointer = window.matchMedia("(pointer: coarse)").matches;

function isCompactMode(): boolean {
  return isCoarsePointer || window.innerWidth <= 760;
}

const requestedStationId = new URLSearchParams(window.location.search).get("station");
const requestedStationIndex = sections.findIndex((section) => section.id === requestedStationId);

const iconSet = {
  ArrowRight,
  ArrowUpRight,
  ExternalLink,
  FileText,
  Github,
  List,
  Mail,
  MapPin,
  Maximize2,
  Phone,
  RotateCcw,
  X,
};

function refreshIcons(): void {
  createIcons({ icons: iconSet });
}

refreshIcons();

const canvas = document.querySelector<HTMLCanvasElement>("#scene")!;
const loading = document.querySelector<HTMLElement>("#loading")!;
const entry = document.querySelector<HTMLElement>("#entry")!;
const enterButton = document.querySelector<HTMLButtonElement>("#enter")!;
const detailPanel = document.querySelector<HTMLElement>("#detail-panel")!;
const detailSignal = document.querySelector<HTMLElement>("#detail-signal")!;
const detailEyebrow = document.querySelector<HTMLElement>("#detail-eyebrow")!;
const detailTitle = document.querySelector<HTMLElement>("#detail-title")!;
const detailMeta = document.querySelector<HTMLElement>("#detail-meta")!;
const detailLead = document.querySelector<HTMLElement>("#detail-lead")!;
const detailEntries = document.querySelector<HTMLElement>("#detail-entries")!;
const detailPoints = document.querySelector<HTMLUListElement>("#detail-points")!;
const detailTags = document.querySelector<HTMLElement>("#detail-tags")!;
const detailLinks = document.querySelector<HTMLElement>("#detail-links")!;
const closeDetailButton = document.querySelector<HTMLButtonElement>("#close-detail")!;
const cvSheet = document.querySelector<HTMLElement>("#cv-sheet")!;
const cvListContent = document.querySelector<HTMLElement>("#cv-list-content")!;
const toggleListButton = document.querySelector<HTMLButtonElement>("#toggle-list")!;
const closeListButton = document.querySelector<HTMLButtonElement>("#close-list")!;
const interactButton = document.querySelector<HTMLButtonElement>("#interact")!;
const interactLabel = document.querySelector<HTMLElement>("#interact-label")!;
const locatorIndex = document.querySelector<HTMLElement>("#locator-index")!;
const locatorTitle = document.querySelector<HTMLElement>("#locator-title")!;
const locatorBar = document.querySelector<HTMLElement>("#locator-bar")!;
const resetViewButton = document.querySelector<HTMLButtonElement>("#reset-view")!;
const fullscreenButton = document.querySelector<HTMLButtonElement>("#fullscreen")!;
const mobileAction = document.querySelector<HTMLButtonElement>("#mobile-action")!;
const joystick = document.querySelector<HTMLElement>("#joystick")!;
const joystickThumb = document.querySelector<HTMLElement>("#joystick-thumb")!;
const categoryNav = document.querySelector<HTMLElement>("#category-nav")!;

const state = {
  entered: false,
  detailOpen: false,
  listOpen: false,
  nearest: null as Station | null,
  inputX: 0,
  inputY: 0,
  joystickX: 0,
  joystickY: 0,
  cameraYaw: 0,
  cameraPitch: 0.35,
  cameraZoom: 0,
  jumpHeight: 0,
  jumpVelocity: 0,
  flight: null as Flight | null,
  proximityStationId: null as string | null,
};

type Station = {
  section: CVSection;
  group: THREE.Group;
  up: THREE.Vector3;
  facing: THREE.Vector3;
  panel: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial>;
  frameMaterial: THREE.MeshStandardMaterial;
  light: THREE.PointLight;
};

type Flight = {
  startUp: THREE.Vector3;
  endUp: THREE.Vector3;
  station: Station;
  elapsed: number;
  duration: number;
};

const stations: Station[] = [];
const hitTargets: THREE.Object3D[] = [];
const celestialSpinners: Array<{ mesh: THREE.Mesh; speed: number }> = [];
const keys = new Set<string>();

let renderer: THREE.WebGLRenderer;
let scene: THREE.Scene;
let camera: THREE.PerspectiveCamera;
let composer: EffectComposer;
let playerRoot: THREE.Group;
let playerForward = new THREE.Vector3(0, 0, 1);
let playerUp = new THREE.Vector3(1, 0, 0);
let cameraHeading = new THREE.Vector3(0, 0, 1);
let steeringReference: THREE.Vector3 | null = null;
let leftArm: THREE.Mesh;
let rightArm: THREE.Mesh;
let leftLeg: THREE.Mesh;
let rightLeg: THREE.Mesh;
let elapsed = 0;
let lastTime = performance.now();
let dragging = false;
let pointerMoved = false;
let dragStartX = 0;
let dragStartY = 0;
let lastPointerX = 0;
let lastPointerY = 0;

const cameraPosition = new THREE.Vector3();
const cameraTarget = new THREE.Vector3();
const desiredCameraPosition = new THREE.Vector3();
const desiredCameraTarget = new THREE.Vector3();
const tempUp = new THREE.Vector3();
const tempForward = new THREE.Vector3();
const tempRight = new THREE.Vector3();
const tempMove = new THREE.Vector3();
const tempCandidate = new THREE.Vector3();
const orientationMatrix = new THREE.Matrix4();
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();

function buildCVList(): void {
  const summary = sections.find((section) => section.id === "summary")!;
  const credentials = sections.find((section) => section.id === "credentials")!;
  const experience = sections.find((section) => section.id === "experience")!;
  const skills = sections.find((section) => section.id === "skills")!;
  const projects = sections.find((section) => section.id === "projects")!;

  cvListContent.innerHTML = `
    <aside class="cv-aside">
      <img class="cv-photo" src="./profile-photo.jpg" alt="Nan Fang-Ying" />
      <h3>Personal</h3>
      <p>${profile.address}<br>${profile.location}<br>${profile.visa}</p>
      <a href="mailto:${profile.email}">${profile.email}</a>
      <a href="tel:${profile.phone.replace(/\s/g, "")}">${profile.phone}</a>
      <a href="${profile.github}" target="_blank" rel="noreferrer">github.com/NaN-NaN-NaN</a>
      <h3>Languages</h3>
      <p>${profile.languages.join("<br>")}</p>
      <h3>Certification</h3>
      <p>${credentials.points.join("<br><br>")}</p>
      <h3>Projects</h3>
      <p>${projects.points.join("<br><br>")}</p>
    </aside>
    <main class="cv-main">
      <p class="cv-summary">${summary.lead} Proven track record of driving multi-million euro AUM growth and 15% conversion gains through mission-critical, AI-enhanced solutions.</p>
      <h3>Professional Experience</h3>
      ${(experience.entries ?? [])
        .map(
          (role) => `
            <article class="cv-entry">
              <div class="cv-entry__head">
                <h4>${role.company}<small>${role.role}</small></h4>
                <span>${role.location} · ${role.period}</span>
              </div>
              <ul>${role.points.map((point) => `<li>${point}</li>`).join("")}</ul>
            </article>
          `,
        )
        .join("")}
      <h3>Skills</h3>
      <article class="cv-entry">
        <ul>${skills.points.map((point) => `<li>${point}</li>`).join("")}</ul>
      </article>
    </main>
  `;
}

buildCVList();

function buildCategoryNav(): void {
  categoryNav.innerHTML = sections
    .map(
      (section, index) =>
        `<button type="button" data-station-index="${index}" style="--nav-color:${section.color}"><span>${section.index}</span>${section.navLabel}</button>`,
    )
    .join("");
}

buildCategoryNav();

function hexToNumber(hex: string): number {
  return Number.parseInt(hex.replace("#", ""), 16);
}

function fitText(
  context: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  startSize: number,
  weight = 800,
): number {
  let size = startSize;
  while (size > 28) {
    context.font = `${weight} ${size}px Inter, Arial, sans-serif`;
    if (context.measureText(text).width <= maxWidth) return size;
    size -= 2;
  }
  return size;
}

function makeSignTexture(section: CVSection): THREE.CanvasTexture {
  const signCanvas = document.createElement("canvas");
  signCanvas.width = 1024;
  signCanvas.height = 576;
  const context = signCanvas.getContext("2d")!;
  const color = section.color;

  context.fillStyle = "#030708";
  context.fillRect(0, 0, signCanvas.width, signCanvas.height);
  context.strokeStyle = color;
  context.lineWidth = 5;
  context.shadowColor = color;
  context.shadowBlur = 20;
  context.strokeRect(22, 22, 980, 532);
  context.shadowBlur = 0;

  context.fillStyle = color;
  context.font = "500 24px monospace";
  context.fillText(`${section.index} / ${section.landmarkCity.toUpperCase()}`, 58, 78);
  context.textAlign = "right";
  context.fillText(section.landmark.toUpperCase(), 964, 78);
  context.textAlign = "left";

  const titleSize = fitText(context, section.signTitle, 900, 100);
  context.font = `800 ${titleSize}px Inter, Arial, sans-serif`;
  context.fillStyle = "#f4ffff";
  context.shadowColor = color;
  context.shadowBlur = 22;
  context.fillText(section.signTitle, 58, 232);
  context.shadowBlur = 0;

  context.font = "600 32px monospace";
  context.fillStyle = color;
  section.signLines.forEach((line, index) => context.fillText(line, 60, 324 + index * 54));

  context.fillStyle = "rgba(255,255,255,0.45)";
  context.fillRect(58, 485, 700, 2);
  context.fillStyle = color;
  context.font = "600 24px monospace";
  context.fillText(section.signal, 58, 529);
  context.fillStyle = "rgba(255,255,255,0.65)";
  context.textAlign = "right";
  context.fillText("OPEN SIGNAL  ↗", 964, 529);

  const texture = new THREE.CanvasTexture(signCanvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = Math.min(renderer.capabilities.getMaxAnisotropy(), 8);
  return texture;
}

function orientObject(object: THREE.Object3D, up: THREE.Vector3, forward: THREE.Vector3): void {
  tempRight.crossVectors(up, forward).normalize();
  orientationMatrix.makeBasis(tempRight, up, forward);
  object.quaternion.setFromRotationMatrix(orientationMatrix);
}

function createStars(): void {
  const starCount = isCompactMode() ? 1800 : 3200;
  const positions = new Float32Array(starCount * 3);
  const colors = new Float32Array(starCount * 3);
  const cool = new THREE.Color("#9ad7ff");
  const warm = new THREE.Color("#ffe0aa");

  for (let index = 0; index < starCount; index += 1) {
    const radius = 48 + Math.random() * 62;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    positions[index * 3] = radius * Math.sin(phi) * Math.cos(theta);
    positions[index * 3 + 1] = radius * Math.cos(phi);
    positions[index * 3 + 2] = radius * Math.sin(phi) * Math.sin(theta);
    const starColor = cool.clone().lerp(warm, Math.random());
    colors[index * 3] = starColor.r;
    colors[index * 3 + 1] = starColor.g;
    colors[index * 3 + 2] = starColor.b;
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
  const material = new THREE.PointsMaterial({
    size: isCompactMode() ? 0.11 : 0.085,
    sizeAttenuation: true,
    vertexColors: true,
    transparent: true,
    opacity: 0.88,
    depthWrite: false,
  });
  scene.add(new THREE.Points(geometry, material));
}

function makeCelestialLabel(name: string, color: string): THREE.Sprite {
  const labelCanvas = document.createElement("canvas");
  labelCanvas.width = 512;
  labelCanvas.height = 112;
  const context = labelCanvas.getContext("2d")!;
  context.fillStyle = "rgba(2, 6, 8, 0.78)";
  context.fillRect(4, 4, 504, 104);
  context.strokeStyle = color;
  context.lineWidth = 3;
  context.strokeRect(4, 4, 504, 104);
  context.fillStyle = color;
  context.font = "600 44px DM Mono, monospace";
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.fillText(name.toUpperCase(), 256, 58);
  const texture = new THREE.CanvasTexture(labelCanvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  const sprite = new THREE.Sprite(
    new THREE.SpriteMaterial({ map: texture, transparent: true, depthWrite: false, toneMapped: false }),
  );
  sprite.scale.set(4.2, 0.92, 1);
  return sprite;
}

function makeSunGlow(): THREE.Sprite {
  const glowCanvas = document.createElement("canvas");
  glowCanvas.width = 256;
  glowCanvas.height = 256;
  const context = glowCanvas.getContext("2d")!;
  const gradient = context.createRadialGradient(128, 128, 18, 128, 128, 128);
  gradient.addColorStop(0, "rgba(255, 248, 190, 1)");
  gradient.addColorStop(0.28, "rgba(255, 190, 75, 0.72)");
  gradient.addColorStop(1, "rgba(255, 116, 35, 0)");
  context.fillStyle = gradient;
  context.fillRect(0, 0, 256, 256);
  const texture = new THREE.CanvasTexture(glowCanvas);
  const sprite = new THREE.Sprite(
    new THREE.SpriteMaterial({
      map: texture,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      toneMapped: false,
    }),
  );
  sprite.scale.set(8, 8, 1);
  return sprite;
}

type PlanetStyle = {
  name: string;
  color: string;
  radius: number;
  distance: number;
  angle: number;
  lift: number;
  ring?: string;
  banded?: boolean;
};

function celestialPosition(distance: number, angle: number, lift: number): THREE.Vector3 {
  return new THREE.Vector3(lift, Math.cos(angle), Math.sin(angle)).normalize().multiplyScalar(distance);
}

function createCelestialSystem(): void {
  const sun = new THREE.Group();
  sun.position.copy(celestialPosition(62, 0.1, 0.18));
  const sunMesh = new THREE.Mesh(
    new THREE.SphereGeometry(2, 32, 20),
    new THREE.MeshBasicMaterial({ color: 0xffc45c, toneMapped: false }),
  );
  sun.add(makeSunGlow(), sunMesh);
  const sunLabel = makeCelestialLabel("Sun", "#ffc45c");
  sunLabel.position.x = -3.5;
  sun.add(sunLabel);
  scene.add(sun);
  celestialSpinners.push({ mesh: sunMesh, speed: 0.025 });

  const moon = new THREE.Group();
  moon.position.copy(celestialPosition(37, -0.58, 0.38));
  const moonMesh = new THREE.Mesh(
    new THREE.SphereGeometry(1.12, 28, 18),
    new THREE.MeshStandardMaterial({ color: 0xbac5c8, roughness: 0.92, metalness: 0.02 }),
  );
  const craterMaterial = new THREE.MeshBasicMaterial({ color: 0x667174 });
  [
    new THREE.Vector3(0.82, 0.38, 0.42),
    new THREE.Vector3(0.9, -0.28, 0.25),
    new THREE.Vector3(0.72, 0.05, -0.62),
  ].forEach((position, index) => {
    const crater = new THREE.Mesh(new THREE.SphereGeometry(0.15 + index * 0.035, 12, 8), craterMaterial);
    crater.position.copy(position);
    moonMesh.add(crater);
  });
  moon.add(moonMesh);
  const moonLabel = makeCelestialLabel("Moon", "#d7e4e7");
  moonLabel.position.x = -2.3;
  moon.add(moonLabel);
  scene.add(moon);
  celestialSpinners.push({ mesh: moonMesh, speed: 0.018 });

  const planets: PlanetStyle[] = [
    { name: "Mercury", color: "#9d9690", radius: 0.38, distance: 43, angle: 0.55, lift: 0.17 },
    { name: "Venus", color: "#e2ae6d", radius: 0.58, distance: 47, angle: 1.12, lift: 0.25 },
    { name: "Earth", color: "#4da0e8", radius: 0.61, distance: 50, angle: 1.72, lift: 0.12 },
    { name: "Mars", color: "#cf6648", radius: 0.49, distance: 45, angle: 2.32, lift: 0.3 },
    { name: "Jupiter", color: "#d5a477", radius: 1.42, distance: 58, angle: 2.93, lift: 0.14, banded: true },
    { name: "Saturn", color: "#e3c985", radius: 1.18, distance: 57, angle: 3.57, lift: 0.28, ring: "#d9b96f" },
    { name: "Uranus", color: "#8de1dd", radius: 0.84, distance: 52, angle: 4.18, lift: 0.18, ring: "#77c8c8" },
    { name: "Neptune", color: "#527bdd", radius: 0.8, distance: 54, angle: 4.82, lift: 0.33 },
    { name: "Pluto", color: "#b49b89", radius: 0.3, distance: 41, angle: 5.48, lift: 0.2 },
  ];

  planets.forEach((planet, index) => {
    const body = new THREE.Group();
    body.position.copy(celestialPosition(planet.distance, planet.angle, planet.lift));
    const color = new THREE.Color(planet.color);
    const mesh = new THREE.Mesh(
      new THREE.SphereGeometry(planet.radius, 28, 18),
      new THREE.MeshStandardMaterial({
        color,
        emissive: color,
        emissiveIntensity: 0.08,
        roughness: 0.78,
        metalness: 0.04,
      }),
    );
    body.add(mesh);

    if (planet.ring) {
      const ring = new THREE.Mesh(
        new THREE.RingGeometry(planet.radius * 1.35, planet.radius * 2.05, 64),
        new THREE.MeshBasicMaterial({
          color: planet.ring,
          transparent: true,
          opacity: 0.72,
          side: THREE.DoubleSide,
          toneMapped: false,
        }),
      );
      ring.rotation.set(Math.PI / 2.35, 0.2, 0.12);
      body.add(ring);
    }

    if (planet.banded) {
      [-0.42, 0, 0.42].forEach((offset) => {
        const band = new THREE.Mesh(
          new THREE.TorusGeometry(planet.radius * Math.sqrt(1 - (offset / planet.radius) ** 2), 0.035, 6, 40),
          new THREE.MeshBasicMaterial({ color: 0x8f624c, toneMapped: false }),
        );
        band.rotation.x = Math.PI / 2;
        band.position.y = offset;
        body.add(band);
      });
    }

    const label = makeCelestialLabel(planet.name, planet.color);
    label.position.x = planet.radius + 1.25;
    body.add(label);
    scene.add(body);
    celestialSpinners.push({ mesh, speed: 0.012 + index * 0.002 });
  });
}

function createPlanet(): void {
  const planet = new THREE.Mesh(
    new THREE.SphereGeometry(PLANET_RADIUS, isCompactMode() ? 48 : 72, isCompactMode() ? 24 : 40),
    new THREE.MeshStandardMaterial({
      color: 0x071d1b,
      roughness: 0.84,
      metalness: 0.18,
    }),
  );
  planet.receiveShadow = true;
  scene.add(planet);

  const grid = new THREE.Mesh(
    new THREE.SphereGeometry(PLANET_RADIUS + 0.035, 36, 18),
    new THREE.MeshBasicMaterial({
      color: 0x1d7d72,
      wireframe: true,
      transparent: true,
      opacity: 0.075,
      depthWrite: false,
    }),
  );
  scene.add(grid);

  const arenaPoints: THREE.Vector3[] = [];
  for (let index = 0; index <= 256; index += 1) {
    const angle = (index / 256) * Math.PI * 2;
    const direction = ARENA_NORTH.clone().multiplyScalar(Math.cos(angle)).addScaledVector(ARENA_EAST, Math.sin(angle));
    const normal = ARENA_CENTER.clone()
      .multiplyScalar(Math.cos(ARENA_RADIUS / PLANET_RADIUS))
      .addScaledVector(direction, Math.sin(ARENA_RADIUS / PLANET_RADIUS));
    arenaPoints.push(normal.multiplyScalar(PLANET_RADIUS + 0.085));
  }
  const arenaBoundary = new THREE.Line(
    new THREE.BufferGeometry().setFromPoints(arenaPoints),
    new THREE.LineBasicMaterial({ color: 0x45ddc0, transparent: true, opacity: 0.7 }),
  );
  scene.add(arenaBoundary);

  const markerGeometry = new THREE.BoxGeometry(0.035, 0.24, 0.035);
  const markerMaterial = new THREE.MeshBasicMaterial({ color: 0x62f8da, toneMapped: false });
  const markers = new THREE.InstancedMesh(markerGeometry, markerMaterial, 72);
  const dummy = new THREE.Object3D();
  for (let index = 0; index < 72; index += 1) {
    const angle = (index / 72) * Math.PI * 2;
    const radial = ARENA_NORTH.clone().multiplyScalar(Math.cos(angle)).addScaledVector(ARENA_EAST, Math.sin(angle));
    const up = ARENA_CENTER.clone()
      .multiplyScalar(Math.cos(ARENA_RADIUS / PLANET_RADIUS))
      .addScaledVector(radial, Math.sin(ARENA_RADIUS / PLANET_RADIUS));
    const forward = ARENA_CENTER.clone().projectOnPlane(up).normalize();
    dummy.position.copy(up).multiplyScalar(PLANET_RADIUS + 0.19);
    orientObject(dummy, up, forward);
    dummy.updateMatrix();
    markers.setMatrixAt(index, dummy.matrix);
  }
  scene.add(markers);
}

function stationCoordinates(index: number): { up: THREE.Vector3; facing: THREE.Vector3 } {
  const angle = (index / sections.length) * Math.PI * 2;
  const radial = ARENA_NORTH.clone().multiplyScalar(Math.cos(angle)).addScaledVector(ARENA_EAST, Math.sin(angle));
  const up = ARENA_CENTER.clone()
    .multiplyScalar(Math.cos(STATION_RING_RADIUS / PLANET_RADIUS))
    .addScaledVector(radial, Math.sin(STATION_RING_RADIUS / PLANET_RADIUS))
    .normalize();
  return { up, facing: ARENA_CENTER.clone().projectOnPlane(up).normalize() };
}

function surfaceDistance(from: THREE.Vector3, to: THREE.Vector3): number {
  return Math.acos(THREE.MathUtils.clamp(from.dot(to), -1, 1)) * PLANET_RADIUS;
}

function stationApproach(station: Station): THREE.Vector3 {
  return station.up
    .clone()
    .multiplyScalar(Math.cos(STATION_APPROACH_DISTANCE / PLANET_RADIUS))
    .addScaledVector(station.facing, Math.sin(STATION_APPROACH_DISTANCE / PLANET_RADIUS))
    .normalize();
}

type LandmarkMaterials = {
  fill: THREE.MeshStandardMaterial;
  edge: THREE.LineBasicMaterial;
};

function createLandmarkMaterials(color: number): LandmarkMaterials {
  return {
    fill: new THREE.MeshStandardMaterial({
      color: 0x07100f,
      emissive: color,
      emissiveIntensity: 0.08,
      metalness: 0.74,
      roughness: 0.42,
    }),
    edge: new THREE.LineBasicMaterial({ color, toneMapped: false, transparent: true, opacity: 0.94 }),
  };
}

function addOutlined(
  parent: THREE.Object3D,
  geometry: THREE.BufferGeometry,
  materials: LandmarkMaterials,
  position = new THREE.Vector3(),
  rotation = new THREE.Euler(),
  scale = new THREE.Vector3(1, 1, 1),
): THREE.Group {
  const part = new THREE.Group();
  part.position.copy(position);
  part.rotation.copy(rotation);
  part.scale.copy(scale);
  const mesh = new THREE.Mesh(geometry, materials.fill);
  mesh.castShadow = !isCompactMode();
  const outline = new THREE.LineSegments(new THREE.EdgesGeometry(geometry, 22), materials.edge);
  part.add(mesh, outline);
  parent.add(part);
  return part;
}

function addBeam(
  parent: THREE.Object3D,
  start: THREE.Vector3,
  end: THREE.Vector3,
  radius: number,
  materials: LandmarkMaterials,
): void {
  const direction = end.clone().sub(start);
  const beam = addOutlined(
    parent,
    new THREE.CylinderGeometry(radius, radius, direction.length(), 6),
    materials,
    start.clone().add(end).multiplyScalar(0.5),
  );
  beam.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction.normalize());
}

function createMatterhorn(materials: LandmarkMaterials): THREE.Group {
  const landmark = new THREE.Group();
  addOutlined(landmark, new THREE.ConeGeometry(2.15, 4.8, 5), materials, new THREE.Vector3(0, 2.4, 0));
  addOutlined(
    landmark,
    new THREE.ConeGeometry(0.92, 1.75, 5),
    materials,
    new THREE.Vector3(0.18, 4.05, 0.02),
    new THREE.Euler(0, 0.18, -0.12),
  );
  addOutlined(
    landmark,
    new THREE.ConeGeometry(1.05, 2.5, 5),
    materials,
    new THREE.Vector3(-1.25, 1.25, -0.35),
    new THREE.Euler(0, 0.4, 0.08),
  );
  return landmark;
}

function createOperaHouse(materials: LandmarkMaterials): THREE.Group {
  const landmark = new THREE.Group();
  addOutlined(landmark, new THREE.BoxGeometry(4.6, 0.28, 1.8), materials, new THREE.Vector3(0, 0.18, 0));
  const sails = [
    { x: -1.35, y: 1.18, scale: 1.12, tilt: -0.34 },
    { x: -0.48, y: 1.52, scale: 1.35, tilt: -0.22 },
    { x: 0.48, y: 1.35, scale: 1.2, tilt: 0.2 },
    { x: 1.35, y: 1.02, scale: 0.98, tilt: 0.34 },
  ];
  sails.forEach((sail) =>
    addOutlined(
      landmark,
      new THREE.ConeGeometry(0.75, 2.6, 18, 1, true),
      materials,
      new THREE.Vector3(sail.x, sail.y, 0),
      new THREE.Euler(0, 0, sail.tilt),
      new THREE.Vector3(0.48, sail.scale, 0.86),
    ),
  );
  return landmark;
}

function createBrandenburgGate(materials: LandmarkMaterials): THREE.Group {
  const landmark = new THREE.Group();
  for (let index = 0; index < 6; index += 1) {
    const x = -2.1 + index * 0.84;
    addOutlined(
      landmark,
      new THREE.CylinderGeometry(0.17, 0.24, 2.55, 8),
      materials,
      new THREE.Vector3(x, 1.3, 0),
    );
    addOutlined(landmark, new THREE.BoxGeometry(0.48, 0.13, 0.7), materials, new THREE.Vector3(x, 2.57, 0));
  }
  addOutlined(landmark, new THREE.BoxGeometry(5.2, 0.52, 1), materials, new THREE.Vector3(0, 2.9, 0));
  addOutlined(landmark, new THREE.BoxGeometry(4.65, 0.36, 0.82), materials, new THREE.Vector3(0, 3.34, 0));
  addOutlined(landmark, new THREE.BoxGeometry(1.15, 0.22, 0.4), materials, new THREE.Vector3(0, 3.72, 0));
  for (let index = 0; index < 4; index += 1) {
    addOutlined(
      landmark,
      new THREE.BoxGeometry(0.24, 0.22, 0.38),
      materials,
      new THREE.Vector3(-0.44 + index * 0.3, 3.95, 0),
    );
  }
  return landmark;
}

function createEiffelTower(materials: LandmarkMaterials): THREE.Group {
  const landmark = new THREE.Group();
  const lowerCorners = [
    new THREE.Vector3(-1.45, 0, -0.52),
    new THREE.Vector3(1.45, 0, -0.52),
    new THREE.Vector3(-1.45, 0, 0.52),
    new THREE.Vector3(1.45, 0, 0.52),
  ];
  lowerCorners.forEach((corner) => {
    addBeam(landmark, corner, new THREE.Vector3(corner.x * 0.28, 3.35, corner.z * 0.38), 0.075, materials);
  });
  addOutlined(landmark, new THREE.BoxGeometry(3.05, 0.18, 1.25), materials, new THREE.Vector3(0, 1.18, 0));
  addOutlined(landmark, new THREE.BoxGeometry(1.28, 0.16, 0.82), materials, new THREE.Vector3(0, 3.28, 0));
  addBeam(landmark, new THREE.Vector3(-0.4, 3.3, 0), new THREE.Vector3(-0.08, 5.25, 0), 0.06, materials);
  addBeam(landmark, new THREE.Vector3(0.4, 3.3, 0), new THREE.Vector3(0.08, 5.25, 0), 0.06, materials);
  addOutlined(landmark, new THREE.BoxGeometry(0.58, 0.14, 0.58), materials, new THREE.Vector3(0, 4.55, 0));
  addOutlined(landmark, new THREE.CylinderGeometry(0.035, 0.055, 1.25, 6), materials, new THREE.Vector3(0, 5.65, 0));
  return landmark;
}

function createEmpireState(materials: LandmarkMaterials): THREE.Group {
  const landmark = new THREE.Group();
  addOutlined(landmark, new THREE.BoxGeometry(2.8, 1.25, 1.65), materials, new THREE.Vector3(0, 0.63, 0));
  addOutlined(landmark, new THREE.BoxGeometry(2.2, 1.45, 1.4), materials, new THREE.Vector3(0, 1.95, 0));
  addOutlined(landmark, new THREE.BoxGeometry(1.58, 1.28, 1.15), materials, new THREE.Vector3(0, 3.3, 0));
  addOutlined(landmark, new THREE.BoxGeometry(0.92, 0.72, 0.8), materials, new THREE.Vector3(0, 4.3, 0));
  addOutlined(landmark, new THREE.CylinderGeometry(0.08, 0.22, 1.6, 8), materials, new THREE.Vector3(0, 5.45, 0));
  return landmark;
}

function createBigBen(materials: LandmarkMaterials): THREE.Group {
  const landmark = new THREE.Group();
  addOutlined(landmark, new THREE.BoxGeometry(1.55, 3.85, 1.28), materials, new THREE.Vector3(0, 1.92, 0));
  addOutlined(landmark, new THREE.BoxGeometry(1.78, 0.38, 1.48), materials, new THREE.Vector3(0, 3.72, 0));
  addOutlined(landmark, new THREE.ConeGeometry(0.92, 1.35, 4), materials, new THREE.Vector3(0, 4.58, 0), new THREE.Euler(0, Math.PI / 4, 0));
  addOutlined(landmark, new THREE.CylinderGeometry(0.035, 0.06, 0.8, 6), materials, new THREE.Vector3(0, 5.6, 0));
  const clock = addOutlined(
    landmark,
    new THREE.CylinderGeometry(0.42, 0.42, 0.08, 24),
    materials,
    new THREE.Vector3(0, 3.15, 0.67),
    new THREE.Euler(Math.PI / 2, 0, 0),
  );
  clock.scale.set(1, 1, 1);
  return landmark;
}

function createTaipei101(materials: LandmarkMaterials): THREE.Group {
  const landmark = new THREE.Group();
  addOutlined(landmark, new THREE.BoxGeometry(1.55, 0.55, 1.38), materials, new THREE.Vector3(0, 0.28, 0));
  for (let index = 0; index < 8; index += 1) {
    const width = 1.48 - index * 0.055;
    addOutlined(
      landmark,
      new THREE.BoxGeometry(width, 0.48, width * 0.82),
      materials,
      new THREE.Vector3(0, 0.75 + index * 0.49, 0),
      new THREE.Euler(0, 0, 0),
      new THREE.Vector3(1 - (index % 2) * 0.05, 1, 1),
    );
  }
  addOutlined(landmark, new THREE.BoxGeometry(0.65, 0.5, 0.58), materials, new THREE.Vector3(0, 4.85, 0));
  addOutlined(landmark, new THREE.CylinderGeometry(0.04, 0.1, 1.25, 6), materials, new THREE.Vector3(0, 5.72, 0));
  return landmark;
}

function createAtomium(materials: LandmarkMaterials): THREE.Group {
  const landmark = new THREE.Group();
  const corners = [
    new THREE.Vector3(-1.35, 0.55, -0.72),
    new THREE.Vector3(1.35, 0.55, -0.72),
    new THREE.Vector3(-1.35, 0.55, 0.72),
    new THREE.Vector3(1.35, 0.55, 0.72),
    new THREE.Vector3(-1.35, 3.45, -0.72),
    new THREE.Vector3(1.35, 3.45, -0.72),
    new THREE.Vector3(-1.35, 3.45, 0.72),
    new THREE.Vector3(1.35, 3.45, 0.72),
  ];
  const center = new THREE.Vector3(0, 2, 0);
  const edges = [
    [0, 1], [0, 2], [1, 3], [2, 3],
    [4, 5], [4, 6], [5, 7], [6, 7],
    [0, 4], [1, 5], [2, 6], [3, 7],
  ];
  edges.forEach(([start, end]) => addBeam(landmark, corners[start], corners[end], 0.055, materials));
  corners.forEach((corner) => addBeam(landmark, center, corner, 0.045, materials));
  corners.concat(center).forEach((point) =>
    addOutlined(landmark, new THREE.SphereGeometry(0.34, 14, 10), materials, point),
  );
  addBeam(landmark, new THREE.Vector3(-0.72, 0, 0), corners[0], 0.08, materials);
  addBeam(landmark, new THREE.Vector3(0.72, 0, 0), corners[1], 0.08, materials);
  return landmark;
}

function createArcDeTriomphe(materials: LandmarkMaterials): THREE.Group {
  const landmark = new THREE.Group();
  addOutlined(landmark, new THREE.BoxGeometry(1.05, 2.65, 1.25), materials, new THREE.Vector3(-1.35, 1.33, 0));
  addOutlined(landmark, new THREE.BoxGeometry(1.05, 2.65, 1.25), materials, new THREE.Vector3(1.35, 1.33, 0));
  addOutlined(landmark, new THREE.BoxGeometry(3.75, 0.95, 1.35), materials, new THREE.Vector3(0, 3.1, 0));
  addOutlined(
    landmark,
    new THREE.TorusGeometry(1.35, 0.31, 8, 24, Math.PI),
    materials,
    new THREE.Vector3(0, 2.05, 0.66),
  );
  addOutlined(landmark, new THREE.BoxGeometry(4.15, 0.24, 1.5), materials, new THREE.Vector3(0, 3.7, 0));
  return landmark;
}

function createLandmark(section: CVSection): THREE.Group {
  const materials = createLandmarkMaterials(hexToNumber(section.color));
  const factories: Record<string, (style: LandmarkMaterials) => THREE.Group> = {
    "Matterhorn": createMatterhorn,
    "Brandenburg Gate": createBrandenburgGate,
    "Eiffel Tower": createEiffelTower,
    "Empire State Building": createEmpireState,
    "Taipei 101": createTaipei101,
    "Atomium": createAtomium,
  };
  return factories[section.landmark](materials);
}

function createStation(section: CVSection, index: number): Station {
  const { up, facing } = stationCoordinates(index);
  const group = new THREE.Group();
  group.position.copy(up).multiplyScalar(PLANET_RADIUS + 0.05);
  orientObject(group, up, facing);

  const colorNumber = hexToNumber(section.color);
  const pad = new THREE.Mesh(
    new THREE.CylinderGeometry(3.05, 3.28, 0.14, 32),
    new THREE.MeshStandardMaterial({
      color: 0x071110,
      emissive: colorNumber,
      emissiveIntensity: 0.06,
      roughness: 0.7,
      metalness: 0.65,
    }),
  );
  pad.position.y = 0.04;
  pad.receiveShadow = true;
  group.add(pad);

  const frameMaterial = new THREE.MeshStandardMaterial({
    color: 0x07100f,
    emissive: colorNumber,
    emissiveIntensity: 0.35,
    metalness: 0.9,
    roughness: 0.3,
  });
  const landmark = createLandmark(section);
  landmark.position.set(isCompactMode() ? -1.15 : -1.7, 0.11, -0.65);
  landmark.scale.setScalar(isCompactMode() ? 0.54 : 0.7);
  landmark.userData.sectionId = section.id;
  group.userData.sectionId = section.id;
  group.add(landmark);
  hitTargets.push(landmark);

  const plaque = new THREE.Group();
  plaque.position.set(isCompactMode() ? 1 : 2.65, isCompactMode() ? 2 : 0, 0);
  plaque.scale.setScalar(isCompactMode() ? 0.72 : 1);
  group.add(plaque);

  const boardBody = new THREE.Mesh(new THREE.BoxGeometry(3.82, 2.26, 0.12), frameMaterial);
  boardBody.position.set(0, 1.48, 0.72);
  boardBody.castShadow = !isCompactMode();
  plaque.add(boardBody);

  const panel = new THREE.Mesh(
    new THREE.PlaneGeometry(3.6, 2.02),
    new THREE.MeshBasicMaterial({
      map: makeSignTexture(section),
      toneMapped: false,
      transparent: true,
    }),
  );
  panel.position.set(0, 1.48, 0.786);
  panel.userData.sectionId = section.id;
  plaque.add(panel);
  hitTargets.push(panel);

  const edgeMaterial = new THREE.MeshBasicMaterial({ color: colorNumber, toneMapped: false });
  const panelTop = new THREE.Mesh(new THREE.BoxGeometry(3.94, 0.035, 0.18), edgeMaterial);
  const panelBottom = panelTop.clone();
  const panelLeft = new THREE.Mesh(new THREE.BoxGeometry(0.035, 2.3, 0.18), edgeMaterial);
  const panelRight = panelLeft.clone();
  panelTop.position.set(0, 2.62, 0.72);
  panelBottom.position.set(0, 0.34, 0.72);
  panelLeft.position.set(-1.92, 1.48, 0.72);
  panelRight.position.set(1.92, 1.48, 0.72);
  plaque.add(panelTop, panelBottom, panelLeft, panelRight);

  const beacon = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.95, 8), edgeMaterial);
  beacon.position.set(2.17, 0.52, 0.68);
  plaque.add(beacon);

  const light = new THREE.PointLight(colorNumber, isCompactMode() ? 2.4 : 4.2, 8, 2);
  light.position.set(-1.35, 2.6, 1.35);
  group.add(light);

  scene.add(group);
  return { section, group, up, facing, panel, frameMaterial, light };
}

function createPlayer(): void {
  playerRoot = new THREE.Group();
  const darkMaterial = new THREE.MeshStandardMaterial({
    color: 0x071010,
    roughness: 0.42,
    metalness: 0.7,
  });
  const suitMaterial = new THREE.MeshStandardMaterial({
    color: 0xd8ede9,
    roughness: 0.55,
    metalness: 0.1,
  });
  const neonMaterial = new THREE.MeshBasicMaterial({ color: 0x56f5d0, toneMapped: false });

  const torso = new THREE.Mesh(new THREE.CapsuleGeometry(0.38, 0.76, 6, 10), suitMaterial);
  torso.position.y = 1.28;
  torso.castShadow = !isCompactMode();
  playerRoot.add(torso);

  const head = new THREE.Mesh(new THREE.SphereGeometry(0.36, 20, 14), darkMaterial);
  head.position.y = 2.08;
  head.castShadow = !isCompactMode();
  playerRoot.add(head);

  const visor = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.13, 0.08), neonMaterial);
  visor.position.set(0, 2.11, 0.32);
  playerRoot.add(visor);

  const backpack = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.76, 0.3), darkMaterial);
  backpack.position.set(0, 1.33, -0.4);
  playerRoot.add(backpack);

  const limbGeometry = new THREE.CapsuleGeometry(0.105, 0.48, 4, 8);
  leftArm = new THREE.Mesh(limbGeometry, darkMaterial);
  rightArm = new THREE.Mesh(limbGeometry, darkMaterial);
  leftArm.position.set(-0.48, 1.3, 0);
  rightArm.position.set(0.48, 1.3, 0);
  playerRoot.add(leftArm, rightArm);

  const legGeometry = new THREE.CapsuleGeometry(0.13, 0.5, 4, 8);
  leftLeg = new THREE.Mesh(legGeometry, darkMaterial);
  rightLeg = new THREE.Mesh(legGeometry, darkMaterial);
  leftLeg.position.set(-0.2, 0.48, 0);
  rightLeg.position.set(0.2, 0.48, 0);
  playerRoot.add(leftLeg, rightLeg);

  if (requestedStationIndex >= 0) {
    playerUp.copy(stationApproach(stations[requestedStationIndex]));
    playerForward.copy(stations[requestedStationIndex].up).projectOnPlane(playerUp).normalize();
  } else {
    playerUp.copy(ARENA_CENTER);
    playerForward.copy(ARENA_NORTH);
  }
  cameraHeading.copy(playerForward);
  updatePlayerTransform();
  scene.add(playerRoot);
}

function updatePlayerTransform(): void {
  playerRoot.position.copy(playerUp).multiplyScalar(PLANET_RADIUS + PLAYER_SURFACE_OFFSET + state.jumpHeight);
  orientObject(playerRoot, playerUp, playerForward);
}

function canOccupy(candidate: THREE.Vector3): boolean {
  if (surfaceDistance(candidate, ARENA_CENTER) > ARENA_RADIUS) return false;
  return stations.every((station) => surfaceDistance(candidate, station.up) >= STATION_COLLISION_RADIUS);
}

function setupScene(): void {
  renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: false,
    alpha: false,
    powerPreference: "high-performance",
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, isCompactMode() ? 1.25 : 1.5));
  renderer.setSize(window.innerWidth, window.innerHeight, false);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.94;
  renderer.shadowMap.enabled = !isCompactMode();
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x020506);
  scene.fog = new THREE.FogExp2(0x020506, 0.0075);

  camera = new THREE.PerspectiveCamera(48, window.innerWidth / window.innerHeight, 0.1, 180);
  camera.position.set(20, 6, -5);

  scene.add(new THREE.HemisphereLight(0x5f8ca1, 0x07120f, 1.45));
  const keyLight = new THREE.DirectionalLight(0xbadfff, 3.5);
  keyLight.position.set(18, 22, -12);
  keyLight.castShadow = !isCompactMode();
  keyLight.shadow.mapSize.set(1024, 1024);
  keyLight.shadow.camera.near = 5;
  keyLight.shadow.camera.far = 60;
  keyLight.shadow.camera.left = -22;
  keyLight.shadow.camera.right = 22;
  keyLight.shadow.camera.top = 22;
  keyLight.shadow.camera.bottom = -22;
  scene.add(keyLight);

  const rimLight = new THREE.DirectionalLight(0xff4fd8, 1.9);
  rimLight.position.set(-20, -5, 18);
  scene.add(rimLight);

  createStars();
  createCelestialSystem();
  createPlanet();
  sections.forEach((section, index) => stations.push(createStation(section, index)));
  createPlayer();

  const renderPass = new RenderPass(scene, camera);
  const bloomPass = new UnrealBloomPass(
    new THREE.Vector2(window.innerWidth, window.innerHeight),
    isCompactMode() ? 0.28 : 0.4,
    0.3,
    0.62,
  );
  composer = new EffectComposer(renderer);
  composer.setPixelRatio(Math.min(window.devicePixelRatio, isCompactMode() ? 1 : 1.25));
  composer.addPass(renderPass);
  composer.addPass(bloomPass);
  composer.addPass(new OutputPass());

  cameraPosition.copy(playerRoot.position).add(new THREE.Vector3(6, 4, -6));
  cameraTarget.copy(playerRoot.position);
}

function updateMovement(delta: number): void {
  if (!state.entered || state.detailOpen || state.listOpen || state.flight) return;

  const keyboardX = (keys.has("KeyD") || keys.has("ArrowRight") ? 1 : 0) -
    (keys.has("KeyA") || keys.has("ArrowLeft") ? 1 : 0);
  const keyboardY = (keys.has("KeyW") || keys.has("ArrowUp") ? 1 : 0) -
    (keys.has("KeyS") || keys.has("ArrowDown") ? 1 : 0);
  state.inputX = THREE.MathUtils.clamp(keyboardX + state.joystickX, -1, 1);
  state.inputY = THREE.MathUtils.clamp(keyboardY - state.joystickY, -1, 1);

  tempForward.copy(cameraHeading).applyAxisAngle(playerUp, state.cameraYaw).projectOnPlane(playerUp).normalize();
  const isSteering = Math.abs(state.inputX) > 0.05;
  if (isSteering) {
    if (!steeringReference) steeringReference = tempForward.clone();
    steeringReference.projectOnPlane(playerUp).normalize();
    tempForward.copy(steeringReference);
  } else {
    steeringReference = null;
  }
  tempRight.crossVectors(tempForward, playerUp).normalize();
  tempMove.set(0, 0, 0).addScaledVector(tempForward, state.inputY).addScaledVector(tempRight, state.inputX);

  const moving = tempMove.lengthSq() > 0.02;
  if (moving) {
    tempMove.normalize();
    const speed = keys.has("ShiftLeft") || keys.has("ShiftRight") ? 5.6 : 3.85;
    const stepAngle = (speed * delta) / PLANET_RADIUS;
    tempCandidate
      .copy(playerUp)
      .multiplyScalar(Math.cos(stepAngle))
      .addScaledVector(tempMove, Math.sin(stepAngle))
      .normalize();
    if (canOccupy(tempCandidate)) playerUp.copy(tempCandidate);
    const turnAmount = 1 - Math.exp(-delta * 12);
    playerForward.lerp(tempMove, turnAmount).projectOnPlane(playerUp).normalize();

    if (isSteering) {
      const cameraFollowAmount = 1 - Math.exp(-delta * 7.5);
      cameraHeading.lerp(playerForward, cameraFollowAmount).projectOnPlane(playerUp).normalize();
      state.cameraYaw *= Math.exp(-delta * 5.5);
      if (Math.abs(state.cameraYaw) < 0.001) state.cameraYaw = 0;
    } else {
      cameraHeading.projectOnPlane(playerUp).normalize();
    }
  }

  if (state.jumpHeight > 0 || state.jumpVelocity > 0) {
    state.jumpVelocity -= 9.5 * delta;
    state.jumpHeight += state.jumpVelocity * delta;
    if (state.jumpHeight <= 0) {
      state.jumpHeight = 0;
      state.jumpVelocity = 0;
    }
  }

  const stride = moving ? Math.sin(elapsed * 10) * 0.55 : Math.sin(elapsed * 2) * 0.035;
  leftArm.rotation.x = stride;
  rightArm.rotation.x = -stride;
  leftLeg.rotation.x = -stride;
  rightLeg.rotation.x = stride;
  updatePlayerTransform();
}

function updateFlight(delta: number): void {
  const flight = state.flight;
  if (!flight) return;
  flight.elapsed = Math.min(flight.elapsed + delta, flight.duration);
  const progress = flight.elapsed / flight.duration;
  const eased = progress < 0.5 ? 4 * progress ** 3 : 1 - (-2 * progress + 2) ** 3 / 2;
  playerUp.copy(flight.startUp).lerp(flight.endUp, eased).normalize();
  tempForward.copy(flight.station.up).projectOnPlane(playerUp).normalize();
  playerForward.copy(tempForward);
  cameraHeading.copy(tempForward);
  state.jumpHeight = Math.sin(progress * Math.PI) * (isCompactMode() ? 1.25 : 1.75);
  updatePlayerTransform();
  if (progress >= 1) {
    playerUp.copy(flight.endUp);
    state.jumpHeight = 0;
    state.flight = null;
    updatePlayerTransform();
  }
}

function updateCamera(delta: number): void {
  tempForward.copy(cameraHeading).applyAxisAngle(playerUp, state.cameraYaw).projectOnPlane(playerUp).normalize();
  const distance = (isCompactMode() ? 11.2 : 6.7) + state.cameraZoom;
  const height = (isCompactMode() ? 4.1 : 3.2) + state.cameraPitch * (isCompactMode() ? 2.7 : 3.1);
  desiredCameraPosition
    .copy(playerRoot.position)
    .addScaledVector(tempForward, -distance)
    .addScaledVector(playerUp, height);
  desiredCameraTarget.copy(playerRoot.position).addScaledVector(playerUp, 1.2);
  const smoothing = 1 - Math.exp(-delta * (reducedMotion ? 18 : 7));
  cameraPosition.lerp(desiredCameraPosition, smoothing);
  cameraTarget.lerp(desiredCameraTarget, smoothing);
  camera.position.copy(cameraPosition);
  camera.up.copy(playerUp);
  camera.lookAt(cameraTarget);
}

function updateStations(): void {
  let nearest: Station | null = null;
  let nearestDistance = Number.POSITIVE_INFINITY;

  for (const station of stations) {
    const distance = surfaceDistance(playerUp, station.up);
    if (distance < nearestDistance) {
      nearestDistance = distance;
      nearest = station;
    }
    station.frameMaterial.emissiveIntensity = THREE.MathUtils.lerp(
      station.frameMaterial.emissiveIntensity,
      distance < INTERACTION_DISTANCE ? 0.85 : 0.32,
      0.08,
    );
    station.light.intensity = distance < INTERACTION_DISTANCE ? (isCompactMode() ? 2.2 : 3) : (isCompactMode() ? 1.35 : 2);
  }

  if (!nearest) return;
  state.nearest = nearest;
  locatorIndex.textContent = nearest.section.index;
  locatorTitle.textContent = nearest.section.title;
  locatorBar.style.width = `${THREE.MathUtils.clamp(100 - nearestDistance * 5, 8, 100)}%`;
  const canInteract = nearestDistance <= INTERACTION_DISTANCE;
  interactButton.classList.toggle("is-visible", canInteract && state.entered && !state.detailOpen);
  mobileAction.classList.toggle("is-active", canInteract && state.entered && !state.detailOpen);
  interactLabel.textContent = `Open ${nearest.section.title}`;
  categoryNav.querySelectorAll<HTMLButtonElement>("button").forEach((button, index) => {
    const active = stations[index] === nearest;
    button.classList.toggle("is-active", active);
    if (active) button.setAttribute("aria-current", "true");
    else button.removeAttribute("aria-current");
  });

  const proximityStationId = canInteract ? nearest.section.id : null;
  if (!state.entered || state.flight) {
    state.proximityStationId = null;
  } else if (!state.listOpen && proximityStationId !== state.proximityStationId) {
    state.proximityStationId = proximityStationId;
    if (proximityStationId && !state.detailOpen) openDetail(nearest.section);
  }
}

function animate(now: number): void {
  const delta = Math.min((now - lastTime) / 1000, 0.05);
  lastTime = now;
  elapsed += delta;
  celestialSpinners.forEach(({ mesh, speed }) => {
    mesh.rotation.y += delta * speed;
  });
  updateFlight(delta);
  updateMovement(delta);
  updateCamera(delta);
  updateStations();
  composer.render();
  requestAnimationFrame(animate);
}

function linkIcon(link: CVLink): string {
  return link.icon === "external-link" ? "external-link" : link.icon;
}

function openDetail(section: CVSection): void {
  state.detailOpen = true;
  detailPanel.style.setProperty("--section-color", section.color);
  detailSignal.textContent = section.signal;
  detailEyebrow.textContent = `${section.index} / ${section.eyebrow}`;
  detailTitle.textContent = section.title;
  detailMeta.innerHTML = [section.location, section.period].filter(Boolean).map((item) => `<span>${item}</span>`).join("");
  detailLead.textContent = section.lead;
  detailEntries.innerHTML = (section.entries ?? [])
    .map(
      (role) => `
        <article class="detail-role">
          <div><h3>${role.company}</h3><span>${role.location} · ${role.period}</span></div>
          <h4>${role.role}</h4>
          <ul>${role.points.map((point) => `<li>${point}</li>`).join("")}</ul>
        </article>`,
    )
    .join("");
  detailPoints.innerHTML = section.points.map((point) => `<li>${point}</li>`).join("");
  detailTags.innerHTML = section.tags.map((tag) => `<span>${tag}</span>`).join("");
  detailLinks.innerHTML = (section.links ?? [])
    .map(
      (link) =>
        `<a href="${link.href}" ${link.href.startsWith("http") || link.href.endsWith(".pdf") ? 'target="_blank" rel="noreferrer"' : ""}><i data-lucide="${linkIcon(link)}"></i>${link.label}</a>`,
    )
    .join("");
  detailPanel.classList.add("is-open");
  detailPanel.setAttribute("aria-hidden", "false");
  refreshIcons();
  closeDetailButton.focus();
}

function closeDetail(): void {
  state.detailOpen = false;
  detailPanel.classList.remove("is-open");
  detailPanel.setAttribute("aria-hidden", "true");
}

function openNearest(): void {
  if (!state.nearest) return;
  const distance = surfaceDistance(playerUp, state.nearest.up);
  if (distance <= INTERACTION_DISTANCE) openDetail(state.nearest.section);
}

function flyToStation(index: number): void {
  const station = stations[index];
  if (!station) return;
  state.entered = true;
  entry.classList.add("is-hidden");
  if (state.detailOpen) closeDetail();
  if (state.listOpen) toggleList(false);
  keys.clear();
  state.inputX = 0;
  state.inputY = 0;
  state.joystickX = 0;
  state.joystickY = 0;
  state.cameraYaw = 0;
  state.cameraPitch = 0.35;
  state.jumpVelocity = 0;
  state.flight = {
    startUp: playerUp.clone(),
    endUp: stationApproach(station),
    station,
    elapsed: 0,
    duration: reducedMotion ? 0.15 : 1.05,
  };
}

function toggleList(force?: boolean): void {
  const shouldOpen = force ?? !state.listOpen;
  state.listOpen = shouldOpen;
  cvSheet.classList.toggle("is-open", shouldOpen);
  cvSheet.setAttribute("aria-hidden", shouldOpen ? "false" : "true");
  if (shouldOpen) closeListButton.focus();
}

function resetView(): void {
  state.cameraYaw = 0;
  state.cameraPitch = 0.35;
  state.cameraZoom = 0;
  cameraHeading.copy(playerForward).projectOnPlane(playerUp).normalize();
}

function onResize(): void {
  if (!renderer || !camera || !composer) return;
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight, false);
  composer.setSize(window.innerWidth, window.innerHeight);
}

function onCanvasPointerDown(event: PointerEvent): void {
  if (!state.entered || state.listOpen) return;
  dragging = true;
  pointerMoved = false;
  dragStartX = event.clientX;
  dragStartY = event.clientY;
  lastPointerX = event.clientX;
  lastPointerY = event.clientY;
  canvas.setPointerCapture(event.pointerId);
}

function onCanvasPointerMove(event: PointerEvent): void {
  if (!dragging) return;
  const deltaX = event.clientX - lastPointerX;
  const deltaY = event.clientY - lastPointerY;
  if (Math.hypot(event.clientX - dragStartX, event.clientY - dragStartY) > 4) pointerMoved = true;
  if (state.detailOpen) {
    lastPointerX = event.clientX;
    lastPointerY = event.clientY;
    return;
  }
  state.cameraYaw -= deltaX * 0.004;
  state.cameraPitch = THREE.MathUtils.clamp(state.cameraPitch + deltaY * 0.003, -0.2, 1.05);
  lastPointerX = event.clientX;
  lastPointerY = event.clientY;
}

function onCanvasPointerUp(event: PointerEvent): void {
  if (!dragging) return;
  dragging = false;
  canvas.releasePointerCapture(event.pointerId);
  if (pointerMoved) return;
  const rect = canvas.getBoundingClientRect();
  pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
  raycaster.setFromCamera(pointer, camera);
  const hit = raycaster.intersectObjects(hitTargets, true)[0];
  if (!hit) {
    if (state.detailOpen) closeDetail();
    return;
  }
  let target: THREE.Object3D | null = hit.object;
  while (target && !target.userData.sectionId) target = target.parent;
  const section = sections.find((item) => item.id === target?.userData.sectionId);
  if (section) openDetail(section);
}

function setupJoystick(): void {
  let joystickPointer: number | null = null;

  const updateJoystick = (event: PointerEvent): void => {
    const rect = joystick.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    let x = event.clientX - centerX;
    let y = event.clientY - centerY;
    const radius = 29;
    const length = Math.hypot(x, y);
    if (length > radius) {
      x = (x / length) * radius;
      y = (y / length) * radius;
    }
    state.joystickX = x / radius;
    state.joystickY = y / radius;
    joystickThumb.style.transform = `translate(${x}px, ${y}px)`;
  };

  joystick.addEventListener("pointerdown", (event) => {
    joystickPointer = event.pointerId;
    joystick.setPointerCapture(event.pointerId);
    updateJoystick(event);
  });
  joystick.addEventListener("pointermove", (event) => {
    if (event.pointerId === joystickPointer) updateJoystick(event);
  });
  const release = (event: PointerEvent): void => {
    if (event.pointerId !== joystickPointer) return;
    joystickPointer = null;
    state.joystickX = 0;
    state.joystickY = 0;
    joystickThumb.style.transform = "translate(0, 0)";
  };
  joystick.addEventListener("pointerup", release);
  joystick.addEventListener("pointercancel", release);
}

function setupEvents(): void {
  window.addEventListener("resize", onResize);
  window.addEventListener("keydown", (event) => {
    keys.add(event.code);
    if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Space"].includes(event.code)) {
      event.preventDefault();
    }
    if (event.code === "Space" && state.entered && !state.detailOpen && !state.listOpen && state.jumpHeight === 0) {
      state.jumpVelocity = 4.4;
    }
    if ((event.code === "Enter" || event.code === "KeyE") && !state.detailOpen && !state.listOpen) openNearest();
    if (event.code === "Escape") {
      if (state.detailOpen) closeDetail();
      else if (state.listOpen) toggleList(false);
    }
  });
  window.addEventListener("keyup", (event) => keys.delete(event.code));
  canvas.addEventListener("pointerdown", onCanvasPointerDown);
  canvas.addEventListener("pointermove", onCanvasPointerMove);
  canvas.addEventListener("pointerup", onCanvasPointerUp);
  canvas.addEventListener("pointercancel", () => {
    dragging = false;
  });
  canvas.addEventListener(
    "wheel",
    (event) => {
      state.cameraZoom = THREE.MathUtils.clamp(state.cameraZoom + event.deltaY * 0.005, -1.2, 4.5);
    },
    { passive: true },
  );

  enterButton.addEventListener("click", () => {
    state.entered = true;
    entry.classList.add("is-hidden");
    canvas.focus();
  });
  interactButton.addEventListener("click", openNearest);
  mobileAction.addEventListener("click", openNearest);
  closeDetailButton.addEventListener("click", closeDetail);
  toggleListButton.addEventListener("click", () => toggleList(true));
  closeListButton.addEventListener("click", () => toggleList(false));
  resetViewButton.addEventListener("click", resetView);
  fullscreenButton.addEventListener("click", async () => {
    if (!document.fullscreenElement) await document.documentElement.requestFullscreen();
    else await document.exitFullscreen();
  });
  categoryNav.addEventListener("click", (event) => {
    const button = (event.target as HTMLElement).closest<HTMLButtonElement>("button[data-station-index]");
    if (!button) return;
    flyToStation(Number(button.dataset.stationIndex));
  });
  setupJoystick();
}

function failToListView(): void {
  loading.classList.add("is-hidden");
  entry.classList.add("is-hidden");
  state.entered = true;
  toggleList(true);
}

try {
  setupScene();
  setupEvents();
  requestAnimationFrame(animate);
  requestAnimationFrame(() => {
    loading.classList.add("is-hidden");
  });
} catch (error) {
  console.error("Unable to initialize the CV planet", error);
  failToListView();
}
