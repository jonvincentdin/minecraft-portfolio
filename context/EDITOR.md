# Editor fields and operations

| Tab | Editable content |
| --- | --- |
| Landing | Name, hero label, tagline, intro title, GitHub, LinkedIn, highlight records |
| About | Title, biography, portrait file/crop, journal chapters |
| Projects | All case-study fields, selected symbol, sample flag, gallery files/alt/captions/order |
| Skills / Portfolio skills | Name, category, description, experience level, artifact ID, result model override, project/evidence link, sample flag |
| Skills / Recipes | Title, output skill, dye, special item, three ingredient quantities, output quantity, prerequisite IDs, note and result model |
| Skills / Starting inventory | Unique item ID and initial quantity 0–256; preview split stacks |
| Experience | Five character names/labels/intros; experience records and assigned character |
| Achievements | Node content, symbol, evidence, parent connections and position |
| Certifications | Same node controls in independent certification tree |
| Contact | Title/copy and contact links |

Create/read/update/delete apply to content collections. Character category IDs are fixed; edit their labels and content rather than deleting required categories. Settings are singleton edit forms. Project/skill references need explicit handling when deleting referenced records. Do not cascade-delete unrelated stories.

## Save and publication

Every save validates the draft and increments its revision only if the expected revision still matches. Display dirty/saving/saved/error/conflict states. On conflict, preserve local edits and offer reload or manual merge; do not silently overwrite.

Preview shows the current draft through public components. Publish validates the entire document and referenced media and atomically replaces the public snapshot. Published content remains readable if the editor later has unsaved/invalid changes.

Keep JSON export/import; support the baseline version 5 format through a documented migration. Import validates before replacing a draft, retains a recovery export, and never automatically publishes. Convert data-URL images from old exports to approved Storage files during the migration flow.

Provide image previews, upload status, alt/caption editing and ordering. Failed upload/save must not clear the form. Delete media only after confirming that no saved or published content references it.
