# F09 — Content editor

Match the existing editor layout and forms, then add real Supabase-backed authentication and persistence. See EDITOR.md for the field matrix and SUPABASE.md for authorization.

Tabs: Landing, About, Projects, Skills, Experience, Achievements, Certifications, Contact. Skills has Portfolio skills, Recipes and Starting inventory. The two tree editors remain separate even though public Advancements houses both.

Preserve list selection, add/edit/remove, symbol chooser, photo collection, portrait handling, JSON backup/import and public-section preview. Extend Save draft and Publish with truthful pending/success/error states and revision conflict handling. Do not label a browser-only write as a shared save.

Visitors cannot mutate owner content. Hiding buttons or route guards alone is insufficient authorization. Keep the public appearance unchanged when adding backend behavior.
