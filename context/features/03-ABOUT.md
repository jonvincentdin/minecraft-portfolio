# F03 — About journal and portrait

Route `#about`. Preserve the oak-framed portrait region, journal typography, selected chapter behavior and page composition. Use the owner's real photo as a framed image; do not fabricate their face or alter the supplied character models to simulate it.

Support portrait upload, preview and crop position 0–100. Store the eventual image in Supabase Storage and retain path/metadata in content. Render an accessible placeholder until a real photo is supplied. Provide alt text and a remove action.

Editor includes about title, biography, portrait, crop and journal chapter CRUD. The public page never exposes upload controls to visitors.
