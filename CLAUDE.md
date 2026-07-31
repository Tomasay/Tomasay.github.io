# Project notes

Static portfolio site on GitHub Pages (custom domain `dev-tom.com`, see `CNAME`).
No build step: `index.html` loads `main.js` directly as an ES module and resolves
`three` through an **importmap pointing at jsdelivr**. Vite is a devDependency and
is only used for local preview (`npx vite`), not to produce anything shipped.

## Layout

- `main.js` — the three.js hero scene (model, lights, camera, render loop, loader bar)
- `js/main.js` — unrelated page scripts (GSAP/ScrollTrigger, project data). Both are
  loaded from `index.html`; don't confuse them.
- `model.glb` — the single 3D asset, meshopt-compressed
- `ProjectHTML/` — per-project pages

## The 3D model pipeline

`model.glb` is **meshopt-compressed** (`EXT_meshopt_compression` + `KHR_mesh_quantization`).

**`loader.setMeshoptDecoder(MeshoptDecoder)` in `main.js` is load-bearing.** The
extension is listed in `extensionsRequired`, so without the decoder registered
`GLTFLoader` throws rather than falling back — the model simply won't load.

To regenerate after a Blender re-export:

```bash
npx @gltf-transform/cli meshopt model.glb model.out.glb
```

Export from Blender as **glTF Binary (.glb)**. Leave `Data ▸ Material ▸ Images` on
**Automatic** — setting it to JPEG destroys the alpha channel on the Coffee Steam and
Monitor Glow textures, which is where those effects' entire shape lives.

Size history (gzipped wire size, which is what matters — GitHub Pages *does* gzip
`model/gltf-binary`, confirmed against a Pages-hosted `.glb`):

| stage | wire |
|---|---|
| original embedded `.gltf` | 1.98 MB |
| `.glb` re-export (Blender 5.1 exporter) | 1.74 MB |
| coffee steam texture 1024² → 256² | 1.05 MB |
| meshopt | **395 KB** |

Measure the **gzipped** size, not the on-disk size. The original `.gltf` was 4.27 MB
on disk but only 1.98 MB on the wire — base64 bloat is almost entirely absorbed by
gzip, so "convert to binary" wins far less than the disk numbers suggest.

### Things that were tried and rejected

- **WebGPU renderer.** The scene is ~34 primitives and one 512² shadow map — nowhere
  near draw-call bound, which is what WebGPU accelerates. `three.webgpu.js` is ~150 KB
  larger than `three.module.js`, and Safari only got WebGPU in v26, so it means
  shipping and maintaining two renderer backends. Net negative here.
- **WebP textures** (Blender's glTF export option). Textures are now only ~10% of the
  payload. Blender's WebP export is lossy and applies to *all* textures including the
  two 5120×1439 dark-UI monitor screenshots, where lossy compression produces visible
  ringing on text. ~5% saving for a real quality risk on the most-looked-at surface.
- **JPEG textures.** Two of the four images need their alpha channel; the other two are
  flat-colour UI screenshots, PNG's best case and JPEG's worst.
- **Draco.** Only compresses geometry. This model's weight is spread across geometry,
  animation keyframes, and morph targets — meshopt covers all three and decodes faster.

## Model bindings that break on re-export

`main.js` reaches into the model by name. A Blender re-export can silently change these:

- **Animation clips are looked up by name** (`ArmatureAction` = character,
  `KeyAction` = coffee steam), with the index kept only as a fallback. This is
  deliberate: a re-export already swapped clips 1 and 2. Don't revert to bare indices.
- **`Monitor_Screen_Light_Mode`** — the theme toggle animates this mesh's material
  opacity. The Blender object is named `Monitor Screen Light Mode` *with spaces*;
  three's `PropertyBinding.sanitizeNodeName` converts them to underscores. Rename the
  object in Blender and the toggle throws on `undefined.material`.
- The coffee steam animation drives **morph-target weights**, not UVs or material
  properties — so texture and resolution changes are safe.

## Loading and failure paths

`<main>` starts `display: none` and is revealed by `loadingComplete()` in `main.js`.
Two separate safety nets, for two different failures:

1. **Model fails to load** — the `GLTFLoader` error callback sets `assetsLoaded = true`
   and `LOADER_FAILSAFE_MS` (15s) caps the wait. The site reveals without the 3D scene.
2. **A module import fails** — inline `setTimeout` at the bottom of `index.html`, 20s.
   `main.js` is an ES module with static CDN imports; if any fails to resolve, the
   module body never executes, so safety net #1 never runs either. That script has no
   imports specifically so nothing can prevent it running. **Don't convert it to a
   module or move its logic into `main.js`** — that defeats its entire purpose.

The importmap requires Safari 16.4+ / Chrome 89+. Older in-app browsers (Instagram,
Facebook, stale Android WebView) can't resolve it and rely on net #2.

## Mobile GPU handling

`glDegradeLevel` (0–2, persisted in `localStorage`) steps down quality after a
`webglcontextlost` event, because repeated losses make Chrome block WebGL for the whole
domain. Android starts one level down. Resolution is never degraded — a pixelated model
reads as broken; AA and shadows are shed instead.

Meshopt quantization helps here as a side effect: decoded vertex memory dropped from
1.46 MB to 0.64 MB (~56% less VRAM), which works against the context-loss pressure.

## Verifying model changes without a browser

There's no headless browser in this project. `GLTFLoader` can be driven in Node with
`globalThis.createImageBitmap` stubbed to check that the scene graph, animation clips,
and mixer bindings all resolve (watch for unbound tracks). Useful, but it does **not**
check appearance — quantization and texture changes still need a real visual check.

When diffing geometry before/after meshopt, compare position *sets* via nearest
neighbour, not vertex index to vertex index: **meshopt reorders vertices** for cache
locality, so index-wise comparison reports enormous bogus errors. Actual quantization
error on this model is ~0.012% of model size.
