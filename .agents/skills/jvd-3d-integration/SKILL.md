---
name: jvd-3d-integration
description: Integrate, inspect or troubleshoot the existing JVD portfolio models in React, or create a new 3D model when explicitly requested. Preserve reference fidelity, select generation tools only for a concrete need, and validate geometry plus actual browser rendering.
---

# Integrate or create portfolio models

## Establish the task

Read applicable AGENTS.md, context/MODELS.md, context/ARCHITECTURE.md, context/CURRENT_STATE.md and the affected feature specification. Read context/THREE_D_TOOL_VERIFICATION.md only when selecting an external tool. Select integration/repair or explicit new-model creation. Never interpret a missing preview as permission to regenerate an asset.

## Integrate existing models

1. Inspect reference/site/renderer.js and assets/models/scene-data.json. The baseline renders procedural scene data; it does not load the GLBs or play their embedded clips. Preserve this renderer in a React lifecycle wrapper first.
2. Keep canonical assets unchanged. Use scripts/sync-assets.mjs and scripts/verify-assets.mjs according to their documented invocation. Preserve skill_react.glb, its scene geometry and thumbnail exactly.
3. Match the source camera, bounds, scale, axes, palette, lighting and filled/edge passes. Use one animation clock and clean up frame callbacks, buffers/programs, listeners and observers on unmount. Handle React development remounts without duplicate loops.
4. Diagnose inversion through pointer delta, camera/world axes and pitch clamping; do not mirror model geometry to conceal a control bug. Keep two eyes visible from front and oblique views. Inspect crafting-table top/side alignment, depth and edge offsets without assuming the mesh is the cause.
5. Preserve the 39 provided thumbnails and intentional fallbacks for legacy models. Do not reference invented images. Maintain accessible static/reduced-motion alternatives.
6. Test the changed view in a GPU-enabled browser: pointer drag, touch where available, resize, route mount/unmount and console errors. Record genuine screenshots and input behavior. Thumbnail fallback or geometry checks alone do not prove WebGL parity.

## Create a model only when requested

1. Establish subject, intended view, scale, palette, moving parts and target renderer from the request/reference. Choose reasonable defaults for simple items. Ask only when an unresolved detail materially changes the asset. Preserve existing models and especially the React model unless replacement is explicitly requested.
2. Prefer deterministic editable voxel geometry for Minecraft-style objects. Inspect assets/source before reusing its generators, and direct outputs to a separate staging directory. Never run a generator that overwrites canonical assets as a side effect.
3. Stage new assets under work/model-drafts/<asset-id>/<version>/, ignored by Git, with editable source, preview, GLB and a manifest containing dimensions, materials, origin/axes, provenance, and runtime compatibility. Include matching scene-data output if the current custom renderer requires it. A new GLB alone is not enough for this renderer.
4. Use Blender Python or one Blender MCP bridge only if mesh inspection, rigging, UV work or export needs it and the tool is actually available. MCP is optional development access, not a website runtime dependency. Do not install multiple overlapping bridges or a whole skill pack for one task.
5. Consider Meshy, Tripo or another generator only for a concrete need that procedural geometry cannot meet efficiently. Recheck current official capabilities, access and costs. State the proposed provider and why it helps before starting a generation; follow existing authorization for external upload and paid work. Never upload private media or incur unapproved charges. If access is unavailable, use the local procedural workflow or report the specific missing capability; never pretend a service was used.
6. Treat generated meshes as drafts. Inspect silhouette, triangle budget appropriate to the scene, finite coordinates, normals/winding, duplicate faces, edge artifacts, material/texture paths, origin, axes and scale. Check rig deformation only if the model is rigged. Do not label a mesh manifold or production-ready without relevant evidence.
7. Render front, side and oblique previews and test the actual website integration with lighting and motion. Include touch/rotation checks and fallback behavior. Preserve versioned editable sources so revisions do not require regeneration.
8. Present a reviewable asset and manifest. Publish into canonical assets only under the project's protected-file policy and existing task authorization; update catalog, runtime data and thumbnails together. Record exactly which provider/MCP was used, or say local procedural creation. Do not claim a 1:1 result without visual comparison.

## Report

List changed assets/code, tool choice, geometry and browser evidence, unchanged protected hashes, and unresolved limitations. Record evidence in context/PROGRESS.md. Do not add a library, connector or service simply because it exists.
