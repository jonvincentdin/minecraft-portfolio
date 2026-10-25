# React architecture

## Recommended stack

React + TypeScript + Vite, plain CSS, existing WebGL renderer, browser Web Animations API, and `@supabase/supabase-js`. Keep a lockfile and choose mutually compatible stable versions at setup time. Do not use Create React App. Next.js and a separate Express server are not required for this client-focused portfolio.

A hash router preserves the existing links (`#home`, `#projects`, etc.). A maintained router may be used, but routing must preserve the reference behavior. Don't add multiple state libraries by default: reducers/context are sufficient for local workshop and editor state; add a query library only if it solves demonstrated data-cache complexity.

React is the UI layer, not a database or 3D engine. It can host the existing canvas renderer through refs/effects. React Three Fiber/Three.js is optional later; swapping it in changes camera/material/lighting behavior unless deliberately matched.

## Target folders to create during setup

| Path | Responsibility |
| --- | --- |
| context/ | This specification and progress records |
| assets/ | Immutable canonical files supplied here |
| public/assets/ | Runtime copy produced by sync-assets script |
| reference/site/ | Immutable original implementation |
| src/app/ | App, providers, route controller, error boundary |
| src/components/layout/ | Header, footer, navigation, section frame |
| src/components/ui/ | Buttons, dialogs, notices, model controls |
| src/components/three/ | VoxelCanvas lifecycle wrapper and renderer adapter |
| src/features/intro/ | Loading/ready/exiting/entered state machine |
| src/features/home/, about/, projects/ | Route-specific components |
| src/features/skills/ | Loadout, table scene, workshop, recipe UI |
| src/features/experience/, advancements/, contact/ | Remaining public sections |
| src/features/editor/ | Auth gate, shell, shared forms and tab editors |
| src/domain/ | Pure recipes, inventory, tree algorithms and validation |
| src/data/ | Content adapter, demo seed and storage migrations |
| src/lib/ | Supabase client, environment parsing, safe URL/media helpers |
| src/styles/ | Reference stylesheet with controlled path fixes |
| src/types/ | Domain types and generated Supabase types |
| supabase/migrations/, tests/ | Reviewed SQL and authorization tests |
| tests/unit/, integration/, e2e/, visual/ | Meaningful automated checks |

## Migration approach

1. Keep the old DOM shape/class names while splitting pages into JSX components.
2. Port pure domain functions unchanged, then type them without changing outputs.
3. Wrap VoxelView in an effect that creates one instance per canvas and destroys it on unmount. Callback refs must read the latest paused state. Do not invoke a second renderer over that canvas.
4. Mount the React app on a dedicated root; replace document-global selectors with refs where React owns the DOM.
5. Move animation ownership into hooks with cleanup. Never let stale async work update an unmounted route.
6. Public components consume one typed PortfolioContent object. A DemoContentRepository supplies the seed before Supabase is configured; a SupabaseContentRepository supplies the published snapshot later.
7. Editor preview uses exactly those public components with draft data. Do not duplicate the public templates in the editor.
8. Route transition state, dialog state, selected item and visitor workshop state remain client concerns; content records and publication revisions are backend concerns.

Scaffold in a temporary sibling directory if needed, then merge deliberately into this handoff folder. Never run a destructive template initializer over assets/reference/context. Keep a working app at every milestone. Frontend mode should run with placeholder environment values; backend mode must report configuration failures clearly, not pretend to save.
