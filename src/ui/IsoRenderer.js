/**
 * IsoRenderer — Isometric 3D world rendering with Three.js
 * Phase 6: Low-poly dungeon-meadow, lit and shadowed.
 *
 * Same interface as the 2D Renderer: constructor(canvasId), render(state).
 * Terrain is built once per world; the snake, entities, and path are
 * updated every game tick. A continuous internal loop animates water,
 * embers, bobbing sprites, and the goal beacon between ticks.
 */

import * as THREE from 'three';

const TILE = 1; // World units per tile

const TERRAIN_STYLE = {
  grass: { color: 0x4a8f3c, height: 0.18, varies: true },
  dirt: { color: 0x8a6f4d, height: 0.14, varies: true },
  river: { color: 0x2277cc, height: 0.06, water: true },
  rocky: { color: 0x7a7a80, height: 0.75, rock: true },
  hazard: { color: 0x3a2018, height: 0.14, ember: true },
};

const ENTITY_ICONS = {
  food: '🍎', medicine: '☀️', treasure: '✨', predator: '🐺',
  goal: '🏰', npc: '🐍', trap: '⚠️', hazard: '🔥',
};

const KIND_ICONS = {
  hawk: '🦅', fox: '🦊', heron: '🐦', badger: '🦡',
  mouse: '🐭', frog: '🐸', eggs: '🥚', cricket: '🦗',
  snare: '🪤', sap: '🍯', rockfall: '🪨',
  fire: '🔥', marsh: '💨', scree: '☄️',
};

export class IsoRenderer {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);

    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
    });
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x0d1117);

    // Lighting: soft ambient + one shadow-casting sun
    this.scene.add(new THREE.AmbientLight(0xbdd3ff, 0.55));
    const sun = new THREE.DirectionalLight(0xfff2d8, 1.4);
    sun.position.set(-14, 22, 8);
    sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048);
    sun.shadow.camera.left = -18;
    sun.shadow.camera.right = 18;
    sun.shadow.camera.top = 18;
    sun.shadow.camera.bottom = -18;
    this.scene.add(sun);

    // Groups rebuilt at different cadences
    this.terrainGroup = new THREE.Group();
    this.entityGroup = new THREE.Group();
    this.snakeGroup = new THREE.Group();
    this.pathGroup = new THREE.Group();
    this.scene.add(this.terrainGroup, this.entityGroup, this.snakeGroup, this.pathGroup);

    // Caches
    this.spriteMaterials = new Map(); // icon char → SpriteMaterial
    this.builtWorldKey = null;
    this.lastState = null;
    this.waterMeshes = [];
    this.emberMeshes = [];
    this.goalBeacon = null;
    this.clock = new THREE.Clock();

    // Shared geometry/materials for the snake
    this.segmentGeo = new THREE.SphereGeometry(0.34, 18, 14);
    this.headGeo = new THREE.SphereGeometry(0.42, 20, 16);
    this.eyeGeo = new THREE.SphereGeometry(0.07, 8, 8);
    this.eyeMat = new THREE.MeshStandardMaterial({ color: 0x101010 });
    this.pathDiscGeo = new THREE.CylinderGeometry(0.09, 0.09, 0.03, 10);

    // Continuous animation loop (visual only; game ticks drive state)
    this.disposed = false;
    const animate = () => {
      if (this.disposed) return;
      requestAnimationFrame(animate);
      this.animateFrame();
    };
    animate();
  }

  /**
   * Update the scene from game state (called on each game tick)
   */
  render(state) {
    this.lastState = state;
    const { world, snake } = state;

    this.resize(world);

    // Terrain builds once per world
    const worldKey = `${world.width}x${world.height}:${world.tiles.length}:${state.worldId || ''}`;
    if (this.builtWorldKey !== worldKey) {
      this.buildTerrain(world);
      this.builtWorldKey = worldKey;
    }

    this.updateEntities(world);
    this.updateSnake(snake);
    this.updatePath(state.path || []);

    // Paint immediately: game ticks must show even when the tab is
    // hidden and requestAnimationFrame is throttled
    this.animateFrame();
  }

  /**
   * Fit renderer + isometric camera to the canvas and world
   */
  resize(world) {
    const w = this.canvas.clientWidth || 400;
    const h = this.canvas.clientHeight || 400;
    if (this.lastW !== w || this.lastH !== h || !this.camera) {
      this.lastW = w;
      this.lastH = h;
      this.renderer.setSize(w, h, false);
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

      const span = Math.max(world.width, world.height) * TILE * 0.78;
      const aspect = w / h;
      this.camera = new THREE.OrthographicCamera(
        -span * aspect / 2, span * aspect / 2, span / 2, -span / 2, 0.1, 200
      );
      const cx = (world.width * TILE) / 2;
      const cz = (world.height * TILE) / 2;
      // Classic isometric angle: equal x/z offset, raised y
      this.camera.position.set(cx + 16, 19, cz + 16);
      this.camera.lookAt(cx, 0, cz);
    }
  }

  /**
   * Build the low-poly terrain once per world
   */
  buildTerrain(world) {
    this.terrainGroup.clear();
    this.waterMeshes = [];
    this.emberMeshes = [];

    const boxGeo = new THREE.BoxGeometry(TILE * 0.98, 1, TILE * 0.98);
    const rockGeo = new THREE.DodecahedronGeometry(TILE * 0.32, 0);
    const materials = {};

    for (const tile of world.tiles) {
      const style = TERRAIN_STYLE[tile.terrain] || TERRAIN_STYLE.grass;

      // Deterministic per-tile shade variance for a hand-laid look
      let color = style.color;
      if (style.varies) {
        const n = ((tile.x * 7 + tile.y * 13) % 5) - 2;
        const c = new THREE.Color(color);
        c.offsetHSL(0, 0, n * 0.016);
        color = c.getHex();
      }

      const matKey = `${tile.terrain}:${color}`;
      if (!materials[matKey]) {
        materials[matKey] = style.water
          ? new THREE.MeshStandardMaterial({
              color, transparent: true, opacity: 0.82, roughness: 0.15, metalness: 0.35,
            })
          : new THREE.MeshStandardMaterial({ color, roughness: 0.9 });
      }

      const mesh = new THREE.Mesh(boxGeo, materials[matKey]);
      mesh.scale.y = style.height;
      mesh.position.set(tile.x * TILE, style.height / 2, tile.y * TILE);
      mesh.receiveShadow = true;
      this.terrainGroup.add(mesh);

      if (style.water) this.waterMeshes.push(mesh);

      // Boulders on rocky tiles
      if (style.rock) {
        const rock = new THREE.Mesh(
          rockGeo,
          new THREE.MeshStandardMaterial({ color: 0x8d8d95, roughness: 1 })
        );
        const jitter = ((tile.x * 11 + tile.y * 17) % 10) / 30;
        rock.position.set(tile.x * TILE + jitter - 0.15, style.height + 0.12, tile.y * TILE - jitter + 0.1);
        rock.rotation.set(jitter * 4, jitter * 9, jitter * 2);
        rock.castShadow = true;
        this.terrainGroup.add(rock);
      }

      // Glowing embers on hazard tiles
      if (style.ember) {
        const ember = new THREE.Mesh(
          new THREE.SphereGeometry(0.09, 8, 6),
          new THREE.MeshStandardMaterial({
            color: 0xff5522, emissive: 0xff3300, emissiveIntensity: 2.2,
          })
        );
        ember.position.set(
          tile.x * TILE + (((tile.x + tile.y) % 3) - 1) * 0.22,
          style.height + 0.1,
          tile.y * TILE + (((tile.x * tile.y) % 3) - 1) * 0.18
        );
        this.emberMeshes.push(ember);
        this.terrainGroup.add(ember);
      }
    }
  }

  /**
   * Sprite material from an emoji, cached
   */
  getSpriteMaterial(icon) {
    if (!this.spriteMaterials.has(icon)) {
      const c = document.createElement('canvas');
      c.width = 128;
      c.height = 128;
      const ctx = c.getContext('2d');
      ctx.font = '96px serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(icon, 64, 70);
      const tex = new THREE.CanvasTexture(c);
      tex.colorSpace = THREE.SRGBColorSpace;
      this.spriteMaterials.set(icon, new THREE.SpriteMaterial({ map: tex, transparent: true }));
    }
    return this.spriteMaterials.get(icon);
  }

  /**
   * Rebuild entity sprites (cheap — materials are cached)
   */
  updateEntities(world) {
    this.entityGroup.clear();
    this.goalBeacon = null;

    for (const tile of world.tiles) {
      for (const entity of tile.entities) {
        if (entity.type === 'snake') continue;

        const icon = (entity.kind && KIND_ICONS[entity.kind]) || ENTITY_ICONS[entity.type] || '❓';
        const sprite = new THREE.Sprite(this.getSpriteMaterial(icon));
        sprite.scale.set(0.85, 0.85, 1);
        sprite.position.set(tile.x * TILE, 0.75, tile.y * TILE);
        sprite.userData.baseY = 0.75;
        sprite.userData.phase = (tile.x * 3 + tile.y * 5) % 7;
        this.entityGroup.add(sprite);

        // The goal gets a glowing beacon ring
        if (entity.type === 'goal') {
          const ring = new THREE.Mesh(
            new THREE.TorusGeometry(0.42, 0.05, 10, 28),
            new THREE.MeshStandardMaterial({
              color: 0x33ff88, emissive: 0x22cc66, emissiveIntensity: 1.8,
            })
          );
          ring.rotation.x = Math.PI / 2;
          ring.position.set(tile.x * TILE, 0.28, tile.y * TILE);
          this.goalBeacon = ring;
          this.entityGroup.add(ring);
        }
      }
    }
  }

  /**
   * Rebuild the snake: head with eyes + tapering body spheres
   */
  updateSnake(snake) {
    this.snakeGroup.clear();

    const segments = (snake.segments && snake.segments.length > 0)
      ? snake.segments
      : [{ x: snake.x, y: snake.y }];

    const lowHealth = snake.maxHealth && snake.health / snake.maxHealth <= 0.3;

    for (let i = segments.length - 1; i >= 0; i--) {
      const seg = segments[i];
      const isHead = i === 0;
      const t = segments.length > 1 ? i / (segments.length - 1) : 0;

      const color = new THREE.Color(lowHealth ? 0xcc5544 : 0x35c96f);
      color.offsetHSL(0, 0, -t * 0.12); // Darker toward the tail

      const mesh = new THREE.Mesh(
        isHead ? this.headGeo : this.segmentGeo,
        new THREE.MeshStandardMaterial({ color, roughness: 0.55 })
      );
      const scale = isHead ? 1 : 1 - t * 0.4;
      mesh.scale.setScalar(scale);
      mesh.position.set(seg.x * TILE, 0.36 * scale + 0.14, seg.y * TILE);
      mesh.castShadow = true;
      this.snakeGroup.add(mesh);

      if (isHead) {
        // Eyes placed by facing direction
        const offsets = {
          right: [{ x: 0.3, z: -0.18 }, { x: 0.3, z: 0.18 }],
          left: [{ x: -0.3, z: -0.18 }, { x: -0.3, z: 0.18 }],
          up: [{ x: -0.18, z: -0.3 }, { x: 0.18, z: -0.3 }],
          down: [{ x: -0.18, z: 0.3 }, { x: 0.18, z: 0.3 }],
        };
        for (const o of offsets[snake.facing] || offsets.right) {
          const eye = new THREE.Mesh(this.eyeGeo, this.eyeMat);
          eye.position.set(seg.x * TILE + o.x, 0.62, seg.y * TILE + o.z);
          this.snakeGroup.add(eye);
        }
      }
    }
  }

  /**
   * Planned route as fading discs
   */
  updatePath(path) {
    this.pathGroup.clear();
    for (let i = 0; i < path.length; i++) {
      const pos = path[i];
      const alpha = Math.max(0.08, 0.5 - i * 0.02);
      const disc = new THREE.Mesh(
        this.pathDiscGeo,
        new THREE.MeshBasicMaterial({ color: 0x3ddc84, transparent: true, opacity: alpha })
      );
      disc.position.set(pos.x * TILE, 0.24, pos.y * TILE);
      this.pathGroup.add(disc);
    }
  }

  /**
   * Per-frame visual animation: water shimmer, ember pulse,
   * bobbing sprites, spinning goal beacon
   */
  animateFrame() {
    if (!this.camera) return;
    const t = this.clock.getElapsedTime();

    for (const w of this.waterMeshes) {
      w.position.y = (w.scale.y / 2) + Math.sin(t * 1.8 + w.position.x * 1.3 + w.position.z) * 0.02;
    }
    for (const e of this.emberMeshes) {
      e.material.emissiveIntensity = 1.6 + Math.sin(t * 5 + e.position.x * 2) * 0.9;
    }
    for (const s of this.entityGroup.children) {
      if (s.isSprite) {
        s.position.y = s.userData.baseY + Math.sin(t * 2 + s.userData.phase) * 0.06;
      }
    }
    if (this.goalBeacon) {
      this.goalBeacon.rotation.z = t * 1.5;
      this.goalBeacon.position.y = 0.28 + Math.sin(t * 2.4) * 0.08;
    }

    this.renderer.render(this.scene, this.camera);
  }

  /**
   * Tear down GL resources
   */
  dispose() {
    this.disposed = true;
    this.renderer.dispose();
  }
}
