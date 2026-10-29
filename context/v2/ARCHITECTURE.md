# Architecture

Updated 2026-10-27. The production target remains React + TypeScript + Vite with plain CSS. The local previs is an isolated design artifact, not a production implementation shortcut.

## Production composition

PublicPage consumes one validated PortfolioContent snapshot from the existing repository. Components: PortfolioHeader, Hero, ProjectShowcase, ProjectIndex, About, Skills, Experience, Advancements, Contact, CaseStudyDialog and MotionControls. The future /editor entry mounts the existing editor with its full content coverage.

Use semantic sections and stable anchors. Planned aliases: #home and #spawn → hero; #projects and #work → work; #achievements → advancements; #editor → /editor. Redirects preserve ordinary browser navigation. The logo opens /editor; a separate labelled top link returns to the hero.

## Scroll layer

Start with native scroll, CSS sticky and a small lifecycle-owned progress hook. Expose progress to a VoxelView wrapper. No virtual document translation or whole-page skew. Do not install GSAP/Lenis without a concrete approved dependency proposal. Reduced motion produces the same DOM content in vertical flow.

## Model integration

Keep the existing custom renderer and scene-data input. New decorative geometry lives in a versioned presentation-asset registry outside PortfolioContent. It must not add model IDs to the database crafting catalog. Preserve skill_react and its thumbnail. The previs uses the existing renderer unchanged plus an affine DOM project image; richer lighting remains a separate proposal.

## Backend reuse

Reuse src/data/ContentRepository.ts, SupabaseContentRepository.ts, LocalContentRepository.ts, document-store.ts, src/domain validators, src/lib/media and URL resolution. Same v1 schema, RPC signatures, revision checks and media references. See DATA_MODEL.md for exact mapping. No new table, bucket, API, auth role or schema version for this redesign.

Published data is public. Drafts and unpublished media remain authorized. Owner preview must use the same public components with a draft snapshot and clear banner. Visitor interactions remain local UI state.

## Previs boundary

previs/server.mjs serves only explicitly allowed preview assets on loopback. It does not read environment files or expose arbitrary repository files. The preview reads context/v1/content-seed.json, not hosted content. Its dialogs demonstrate reading/review only; no saves, email or publication.

Production must not embed this HTML in an iframe, copy it as a wholesale innerHTML bridge, or ship context/. Port approved composition into React components in V2-01 onward.
