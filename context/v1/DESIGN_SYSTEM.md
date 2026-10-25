# Design system and fidelity rules

Use `reference/site/style.css` as the exact stylesheet baseline, including later overrides. Do not extract just the first occurrence of a selector and discard the cascade.

| Element | Baseline |
| --- | --- |
| Body | Background #111e1a; text #eee9d5; 16px/1.55 system UI sans-serif |
| Header | #0e1a17; base height 94px; responsive rules in source |
| Pixel display font | JVD from `assets/fonts/JVDPixel.woff`; font-weight 400 |
| h1 baseline | clamp(32px, 4.4vw, 62px), with section-specific overrides |
| h2 baseline | clamp(24px, 2.5vw, 35px) |
| Metadata | 11px/1.5 ui-monospace; letter-spacing .08em |
| Eyebrow | #c7b778; uppercase; 15px bottom spacing |
| Muted text | #8fa397 |
| Focus | 3px #f1cf7f outline, 5px offset |
| Status light | #c4d899 with soft green shadow |
| Section container | Base max-width 1440px; padding 48px 5% 55px |

Maintain sharp corners, block-like borders, inset highlights, dense inventory cells and restrained glows. Inventory backgrounds must be opaque at rest. Transient entrance fades must settle at full opacity.

## Distinct page compositions

- Spawn: asymmetric name/intro and world scene.
- About: portrait-in-oak-frame beside a page-like journal.
- Projects: inventory grid plus model inspector and project preview.
- Skills: always-visible loadout above a centered crafting-table scene; actual crafting in a modal workspace.
- Experience: character-selection stage and narrative chapters with comparison cards.
- Advancements: map explorer with branches, node selection and inspector.
- Contact: correspondence/book composition.
- Editor: sidebar, list/detail forms, preview/save controls; do not turn it into another public content page.

Reuse class names while converting markup to JSX. Keep DOM nesting where CSS depends on child selectors. Preserve the bundled font; do not replace it with a superficially similar Google font. Avoid introducing a reset, Tailwind preflight or component kit that changes spacing and form styles.

Responsive baseline contains 760, 1000, 1100, 1150 and 1600px rules. Keep applicable rules and ordering. Compare at 1440×900, 1366×768, 1024×768, 768×1024 and 390×844. Smaller screens may scroll within inventory/maps; page controls must remain usable without accidental horizontal page overflow.
