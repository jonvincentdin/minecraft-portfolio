-- M06: authorized portfolio content, revision-guarded drafts, atomic publication and owner media.
--
-- Model (context/DATA_MODEL.md): one portfolio ('jvd-world') stored as versioned JSON snapshots.
-- Visitors read the publication only. Enrolled editors read the draft and change content only
-- through the RPCs below, which validate the whole document and compare-and-swap the revision.
-- Nobody but trusted administration (SQL editor / service role) can enroll editors.
--
-- Errors raised for the client (PostgREST maps PTxxx to HTTP xxx):
--   42501 not an enrolled editor · PT409 stale revision (detail = current revision)
--   PT422 invalid content or media (message is shown to the editor)

create schema if not exists portfolio_internal;
revoke all on schema portfolio_internal from public;
-- Policies and RPCs call helpers here; the schema is not in the API's exposed schemas.
grant usage on schema portfolio_internal to anon, authenticated;

-- ---------------------------------------------------------------------------
-- Catalog mirrored from src/domain/crafting-data.js and src/data/symbols.ts.
-- tests/db/catalog.test.ts fails if the two drift apart.
-- ---------------------------------------------------------------------------
create table portfolio_internal.craft_items (id text primary key, kind text not null, model text not null);
insert into portfolio_internal.craft_items (id, kind, model) values
 ('book','Material','material_book'),
 ('dye_orange','Color','dye_orange'),('dye_blue','Color','material_pigment'),('dye_yellow','Color','dye_yellow'),
 ('dye_cyan','Color','dye_cyan'),('dye_green','Color','dye_green'),('dye_purple','Color','dye_purple'),
 ('shield','Material','item_shield'),('pearl','Material','item_ender_pearl'),('compass','Material','item_compass'),
 ('plank','Material','material_plank'),('fiber','Material','material_fiber'),('pigment','Material','material_pigment'),
 ('iron','Material','material_iron'),('redstone','Material','item_redstone'),('stick','Material','material_stick'),
 ('string','Material','material_string'),('paper','Material','material_paper'),('bow','Tool','item_bow'),
 ('html','Skill','skill_html'),('css','Skill','skill_css'),('javascript','Skill','skill_javascript'),
 ('react','Skill','skill_react'),('sql','Skill','skill_sql'),('api','Skill','skill_api');

create table portfolio_internal.symbols (id text primary key);
insert into portfolio_internal.symbols (id) values
 ('diamond_pickaxe'),('diamond_sword'),('bow'),('compass'),('clock'),('potion'),('enchanted_book'),
 ('redstone'),('furnace'),('grass_block'),('lantern'),('emerald'),('shield'),('ender_pearl');

-- Same set as resultModels in crafting-data.js.
create view portfolio_internal.result_models as
 select model as id from portfolio_internal.craft_items where kind = 'Skill'
 union select 'material_book'
 union select model from portfolio_internal.craft_items where model like 'item\_%';

revoke all on all tables in schema portfolio_internal from public, anon, authenticated;

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------
create table public.portfolio_editors (
 portfolio_id text not null default 'jvd-world' check (portfolio_id = 'jvd-world'),
 user_id uuid not null references auth.users (id) on delete cascade,
 role text not null check (role in ('owner', 'editor')),
 created_at timestamptz not null default now(),
 primary key (portfolio_id, user_id)
);

create table public.portfolio_drafts (
 portfolio_id text primary key check (portfolio_id = 'jvd-world'),
 schema_version int not null,
 content jsonb not null,
 revision bigint not null check (revision > 0),
 -- The draft an import replaced, kept so the editor can download it.
 recovery jsonb,
 updated_at timestamptz not null default now(),
 updated_by uuid references auth.users (id) on delete set null
);

create table public.portfolio_publications (
 portfolio_id text primary key check (portfolio_id = 'jvd-world'),
 schema_version int not null,
 content jsonb not null,
 revision bigint not null check (revision > 0),
 published_at timestamptz not null default now(),
 published_by uuid references auth.users (id) on delete set null
);

-- One row per owner upload. The object lives at <file> in portfolio-drafts from upload, and at the
-- same immutable <file> in portfolio-media once published. Content refers to it as 'media:<file>'.
create table public.media_assets (
 id uuid primary key default gen_random_uuid(),
 portfolio_id text not null default 'jvd-world' check (portfolio_id = 'jvd-world'),
 file text not null unique,
 owner_id uuid references auth.users (id) on delete set null,
 mime text not null check (mime in ('image/png', 'image/jpeg', 'image/webp')),
 size_bytes bigint not null check (size_bytes between 1 and 10485760),
 width int not null check (width between 1 and 8192),
 height int not null check (height between 1 and 8192),
 alt text not null default '' check (length(alt) <= 500),
 created_at timestamptz not null default now(),
 published_at timestamptz,
 check (file = id::text || case mime when 'image/png' then '.png' when 'image/jpeg' then '.jpg' else '.webp' end)
);

-- ---------------------------------------------------------------------------
-- Helpers
-- ---------------------------------------------------------------------------
create function portfolio_internal.is_editor(target text default 'jvd-world') returns boolean
language sql stable security definer set search_path = '' as $$
 select exists (
  select 1 from public.portfolio_editors e
  where e.portfolio_id = target and e.user_id = (select auth.uid())
 );
$$;

-- JavaScript truthiness of a JSON value ('', 0, false, null and missing are falsy).
create function portfolio_internal.truthy(v jsonb) returns boolean
language sql immutable set search_path = '' as $$
 select v is not null and v not in ('null'::jsonb, 'false'::jsonb, '""'::jsonb, '0'::jsonb);
$$;

create function portfolio_internal.is_int_between(v jsonb, lo int, hi int) returns boolean
language sql immutable set search_path = '' as $$
 select coalesce(jsonb_typeof(v) = 'number' and (v #>> '{}')::numeric = trunc((v #>> '{}')::numeric)
  and (v #>> '{}')::numeric between lo and hi, false);
$$;

create function portfolio_internal.safe_id(v jsonb) returns boolean
language sql immutable set search_path = '' as $$
 select coalesce(jsonb_typeof(v) = 'string' and (v #>> '{}') ~ '^[a-zA-Z0-9_-]{1,120}$', false);
$$;

-- Server form of safeImage(): bundled assets, uploaded media and http(s) URLs. Inline data: images are
-- refused here; the editor uploads them instead, keeping documents small.
create function portfolio_internal.safe_image(v jsonb) returns boolean
language sql immutable set search_path = '' as $$
 select coalesce(jsonb_typeof(v) = 'string' and (
  (v #>> '{}') ~ '^assets/[a-zA-Z0-9_./-]+$'
  or (v #>> '{}') ~ '^media:[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.(webp|png|jpg)$'
  or (v #>> '{}') ~* '^https?://[^\s/?#]+[^\s]*$'), false);
$$;

-- Every 'media:' image the document shows (portrait and project photos).
create function portfolio_internal.media_files(doc jsonb) returns setof text
language sql immutable set search_path = '' as $$
 select distinct substr(src, 7) from (
  select doc #>> '{settings,portrait}' as src
  union all
  select photo ->> 'src' from jsonb_array_elements(case when jsonb_typeof(doc -> 'projects') = 'array' then doc -> 'projects' else '[]' end) p,
   jsonb_array_elements(case when jsonb_typeof(p -> 'photos') = 'array' then p -> 'photos' else '[]' end) photo
 ) s where src like 'media:%';
$$;

-- ---------------------------------------------------------------------------
-- Validator: a port of validateContent() (src/domain/content-validation.ts) including
-- validateWorkshopConfig(), returning the same message, or null when the document is valid.
-- tests/db/rls.test.ts runs both validators over the same cases.
-- ---------------------------------------------------------------------------
create function portfolio_internal.content_problem(doc jsonb) returns text
language plpgsql stable set search_path = '' as $$
declare
 recipes jsonb := doc -> 'recipes';
 inventory jsonb := doc -> 'startingInventory';
 r jsonb; x jsonb; n jsonb; p jsonb; photo jsonb; v jsonb;
 k text; f text; key text;
 ids text[]; patterns text[]; seen text[]; items text[];
 rows int;
 nodes jsonb;
 collections constant text[] := array['actualSkills','highlights','journal','projects','skills','characters','experience','achievements','certifications','contacts'];
 setting_keys constant text[] := array['name','tagline','heroLabel','github','linkedin','introTitle','aboutTitle','bio','portrait','portraitPosition','contactTitle','contactCopy'];
begin
 if doc is null or jsonb_typeof(doc) <> 'object' or doc -> 'version' is distinct from '5'::jsonb
  or jsonb_typeof(doc -> 'settings') is distinct from 'object' or jsonb_typeof(doc #> '{settings,name}') is distinct from 'string' then
  return 'Choose a version 5 portfolio content export.';
 end if;
 if octet_length(doc::text) > 2000000 then
  return 'This portfolio is larger than 2 MB. Upload images instead of embedding them.';
 end if;

 -- validateWorkshopConfig()
 if jsonb_typeof(recipes) is distinct from 'array' or jsonb_array_length(recipes) > 100
  or jsonb_typeof(inventory) is distinct from 'array' or jsonb_array_length(inventory) > 100 then
  return 'Invalid workshop configuration.';
 end if;
 ids := '{}'; patterns := '{}';
 for r in select value from jsonb_array_elements(recipes) loop
  if not portfolio_internal.safe_id(r -> 'id') or (r ->> 'id') = any(ids) then return 'Recipe IDs must be unique.'; end if;
  ids := ids || (r ->> 'id');
  if jsonb_typeof(r -> 'title') is distinct from 'string' or btrim(r ->> 'title', E' \t\n\r\f\v') = '' or jsonb_typeof(r -> 'note') is distinct from 'string' then
   return 'Add a recipe title and description.';
  end if;
  if not exists (select 1 from portfolio_internal.craft_items c where c.id = r ->> 'output' and jsonb_typeof(r -> 'output') = 'string' and c.kind = 'Skill')
   or not exists (select 1 from portfolio_internal.craft_items c where c.id = r ->> 'color' and jsonb_typeof(r -> 'color') = 'string' and c.kind = 'Color')
   or not exists (select 1 from portfolio_internal.craft_items c where c.id = r ->> 'special' and jsonb_typeof(r -> 'special') = 'string' and c.kind not in ('Color', 'Skill'))
   or r ->> 'special' = 'book' then
   return 'Choose a skill output, a dye, and a special item.';
  end if;
  if not (portfolio_internal.is_int_between(r -> 'bookCount', 1, 3) and portfolio_internal.is_int_between(r -> 'colorCount', 1, 3)
   and portfolio_internal.is_int_between(r -> 'specialCount', 1, 3) and portfolio_internal.is_int_between(r -> 'amount', 1, 16)) then
   return 'Use 1–3 of each ingredient and 1–16 output items.';
  end if;
  if jsonb_typeof(r -> 'requires') is distinct from 'array'
   or (select count(distinct value) from jsonb_array_elements(r -> 'requires')) <> jsonb_array_length(r -> 'requires')
   or exists (select 1 from jsonb_array_elements(r -> 'requires') q
    where q.value = r -> 'output' or not exists (select 1 from jsonb_array_elements(recipes) o where o.value -> 'output' = q.value)) then
   return 'Prerequisites must be other skills with recipes.';
  end if;
  if portfolio_internal.truthy(r -> 'resultModel')
   and not exists (select 1 from portfolio_internal.result_models m where m.id = r ->> 'resultModel' and jsonb_typeof(r -> 'resultModel') = 'string') then
   return 'Choose an available output model.';
  end if;
  select string_agg(concat_ws(',', case when y < (r ->> 'bookCount')::int then 'book' end,
    case when y < (r ->> 'colorCount')::int then r ->> 'color' end, case when y < (r ->> 'specialCount')::int then r ->> 'special' end) || ';', '' order by y)
   into key from generate_series(0, greatest((r ->> 'bookCount')::int, (r ->> 'colorCount')::int, (r ->> 'specialCount')::int) - 1) y;
  -- concat_ws drops nulls, so position the cells explicitly to keep patterns distinct.
  key := key || '|' || (r ->> 'bookCount') || (r ->> 'colorCount') || (r ->> 'specialCount');
  if key = any(patterns) then return 'Two recipes cannot use the same ingredient pattern.'; end if;
  patterns := patterns || key;
 end loop;
 if exists (
  with recursive edges(a, b) as (
   select o.value ->> 'output', q.value #>> '{}' from jsonb_array_elements(recipes) o, jsonb_array_elements(o.value -> 'requires') q
  ), walk(node, path, cyclic) as (
   select a, array[a], false from (select distinct a from edges) s
   union all
   select e.b, w.path || e.b, e.b = any(w.path) from walk w join edges e on e.a = w.node where not w.cyclic
  ) select 1 from walk where cyclic) then
  return 'Recipe prerequisites cannot form a cycle.';
 end if;
 ids := '{}'; items := '{}';
 for x in select value from jsonb_array_elements(inventory) loop
  if not portfolio_internal.safe_id(x -> 'id') or (x ->> 'id') = any(ids)
   or jsonb_typeof(x -> 'item') is distinct from 'string' or not exists (select 1 from portfolio_internal.craft_items c where c.id = x ->> 'item')
   or (x ->> 'item') = any(items) or not portfolio_internal.is_int_between(x -> 'quantity', 0, 256) then
   return 'Starting inventory needs unique items with quantities from 0 to 256.';
  end if;
  items := items || (x ->> 'item'); ids := ids || (x ->> 'id');
 end loop;

 -- settings
 foreach k in array setting_keys loop
  v := doc -> 'settings' -> k;
  if k = 'portraitPosition' then
   if jsonb_typeof(v) is distinct from 'number' or (v #>> '{}')::numeric not between 0 and 100 then return 'Invalid portrait crop.'; end if;
  elsif jsonb_typeof(v) is distinct from 'string' then
   return 'Missing setting: ' || k;
  end if;
 end loop;
 if portfolio_internal.truthy(doc #> '{settings,portrait}') and not portfolio_internal.safe_image(doc #> '{settings,portrait}') then
  return 'Invalid portrait image.';
 end if;

 -- collections and their required string fields
 foreach k in array collections loop
  if jsonb_typeof(doc -> k) is distinct from 'array' or jsonb_array_length(doc -> k) > 200 then return 'Invalid collection: ' || k; end if;
  ids := '{}';
  for x in select value from jsonb_array_elements(doc -> k) loop
   if not portfolio_internal.safe_id(x -> 'id') or (x ->> 'id') = any(ids) then return 'Invalid or duplicate entry in ' || k; end if;
   ids := ids || (x ->> 'id');
   foreach f in array case k
    when 'actualSkills' then array['title','category','symbol','recipeId','description','level','projectId','evidence']
    when 'highlights' then array['title','body'] when 'journal' then array['title','body']
    when 'projects' then array['symbol','title','category','summary','status','role','date','stack','overview','problem','solution','features','process','outcome','liveUrl','sourceUrl']
    when 'skills' then array['title','tools','outcome','body','symbol','projectId']
    when 'characters' then array['name','label','intro']
    when 'experience' then array['character','title','organization','start','end','description','contribution','evidence']
    when 'contacts' then array['title','url','body']
    else array['title','description','date','issuer','evidence','symbol','parent'] end
   loop
    if jsonb_typeof(x -> f) is distinct from 'string' then return 'Missing ' || f || ' in ' || k; end if;
   end loop;
   if portfolio_internal.truthy(x -> 'symbol') and not exists (select 1 from portfolio_internal.symbols s where s.id = x ->> 'symbol') then
    return 'Unknown symbol.';
   end if;
  end loop;
 end loop;

 if jsonb_array_length(doc -> 'characters') <> 5 or exists (select 1 from jsonb_array_elements(doc -> 'characters') c
  where c.value ->> 'id' not in ('professional','student','casual','builder','explorer')) then
  return 'Keep the five supplied character categories.';
 end if;

 for p in select value from jsonb_array_elements(doc -> 'projects') loop
  if jsonb_typeof(p -> 'photos') is distinct from 'array' or jsonb_array_length(p -> 'photos') > 30 then return 'Invalid project gallery.'; end if;
  ids := '{}';
  for photo in select value from jsonb_array_elements(p -> 'photos') loop
   if not portfolio_internal.safe_id(photo -> 'id') or (photo ->> 'id') = any(ids) or not portfolio_internal.safe_image(photo -> 'src')
    or jsonb_typeof(photo -> 'alt') is distinct from 'string' or jsonb_typeof(photo -> 'caption') is distinct from 'string' then
    return 'Invalid photo.';
   end if;
   ids := ids || (photo ->> 'id');
  end loop;
 end loop;

 foreach k in array array['achievements', 'certifications'] loop
  nodes := doc -> k;
  for n in select value from jsonb_array_elements(nodes) loop
   if jsonb_typeof(n -> 'x') is distinct from 'number' or jsonb_typeof(n -> 'y') is distinct from 'number'
    or (n ->> 'x')::numeric not between 0 and 900 or (n ->> 'y')::numeric not between 0 and 900 then
    return 'Invalid tree coordinates.';
   end if;
   p := n; seen := '{}';
   while p is not null loop
    if (p ->> 'id') = any(seen) then return 'Tree contains a cycle.'; end if;
    seen := seen || (p ->> 'id');
    if portfolio_internal.truthy(p -> 'parent') and not exists (select 1 from jsonb_array_elements(nodes) o where o.value -> 'id' = p -> 'parent') then
     return 'Tree parent missing.';
    end if;
    select o.value into p from jsonb_array_elements(nodes) o where o.value -> 'id' = p -> 'parent' limit 1;
    get diagnostics rows = row_count;
    if rows = 0 then p := null; end if;
   end loop;
  end loop;
 end loop;

 for x in select value from jsonb_array_elements(doc -> 'actualSkills') loop
  if portfolio_internal.truthy(x -> 'resultModel')
   and not exists (select 1 from portfolio_internal.result_models m where m.id = x ->> 'resultModel' and jsonb_typeof(x -> 'resultModel') = 'string') then
   return 'Unknown skill model.';
  end if;
  if portfolio_internal.truthy(x -> 'recipeId')
   and not exists (select 1 from portfolio_internal.craft_items c where c.id = x ->> 'recipeId' and c.kind = 'Skill') then
   return 'Unknown skill artifact.';
  end if;
  if jsonb_typeof(x -> 'sample') is distinct from 'boolean' then return 'Invalid skill sample flag.'; end if;
 end loop;
 for x in select value from jsonb_array_elements(doc -> 'actualSkills') union all select value from jsonb_array_elements(doc -> 'skills') loop
  if portfolio_internal.truthy(x -> 'projectId')
   and not exists (select 1 from jsonb_array_elements(doc -> 'projects') o where o.value -> 'id' = x -> 'projectId') then
   return 'A skill links to a project that no longer exists.';
  end if;
 end loop;
 for x in select value from jsonb_array_elements(doc -> 'experience') loop
  if not exists (select 1 from jsonb_array_elements(doc -> 'characters') c where c.value -> 'id' = x -> 'character') then
   return 'Unknown experience character.';
  end if;
 end loop;
 foreach k in array array['projects', 'experience', 'achievements', 'certifications'] loop
  if exists (select 1 from jsonb_array_elements(doc -> k) e where jsonb_typeof(e.value -> 'sample') is distinct from 'boolean') then
   return 'Invalid sample flag in ' || k || '.';
  end if;
 end loop;
 return null;
end;
$$;

-- ---------------------------------------------------------------------------
-- Row level security. Writes to content tables happen only inside the RPCs.
-- ---------------------------------------------------------------------------
alter table public.portfolio_editors enable row level security;
alter table public.portfolio_drafts enable row level security;
alter table public.portfolio_publications enable row level security;
alter table public.media_assets enable row level security;

revoke all on public.portfolio_editors, public.portfolio_drafts, public.portfolio_publications, public.media_assets from anon, authenticated;
grant select on public.portfolio_publications to anon, authenticated;
grant select on public.portfolio_editors, public.portfolio_drafts, public.media_assets to authenticated;

create policy "Anyone reads the publication" on public.portfolio_publications
 for select to anon, authenticated using (true);
create policy "Users read their own membership" on public.portfolio_editors
 for select to authenticated using (user_id = (select auth.uid()));
create policy "Editors read the draft" on public.portfolio_drafts
 for select to authenticated using ((select portfolio_internal.is_editor(portfolio_id)));
create policy "Editors read media records" on public.media_assets
 for select to authenticated using ((select portfolio_internal.is_editor(portfolio_id)));

-- ---------------------------------------------------------------------------
-- RPCs (security definer: they bypass RLS, so each checks membership itself)
-- ---------------------------------------------------------------------------
create function portfolio_internal.require_editor() returns uuid
language plpgsql stable security definer set search_path = '' as $$
begin
 if auth.uid() is null or not portfolio_internal.is_editor('jvd-world') then
  raise exception 'Sign in with an enrolled editor account to change this portfolio.' using errcode = '42501';
 end if;
 return auth.uid();
end;
$$;

create function portfolio_internal.require_valid(doc jsonb) returns void
language plpgsql stable set search_path = '' as $$
declare problem text := portfolio_internal.content_problem(doc);
begin
 if problem is not null then raise exception '%', problem using errcode = 'PT422'; end if;
end;
$$;

-- Saves the whole document if the stored revision still equals expected_revision (0 = no draft yet).
create function public.save_draft(expected_revision bigint, content jsonb) returns bigint
language plpgsql security definer set search_path = '' as $$
declare
 editor uuid := portfolio_internal.require_editor();
 current_revision bigint;
 next_revision bigint;
begin
 perform portfolio_internal.require_valid(content);
 select d.revision into current_revision from public.portfolio_drafts d where d.portfolio_id = 'jvd-world' for update;
 if coalesce(current_revision, 0) <> expected_revision then
  raise exception 'This draft was changed elsewhere.' using errcode = 'PT409', detail = coalesce(current_revision, 0)::text;
 end if;
 insert into public.portfolio_drafts as d (portfolio_id, schema_version, content, revision, updated_by)
 values ('jvd-world', 5, save_draft.content, expected_revision + 1, editor)
 on conflict (portfolio_id) do update
  set content = excluded.content, schema_version = excluded.schema_version, revision = d.revision + 1, updated_at = now(), updated_by = excluded.updated_by
  where d.revision = expected_revision
 returning d.revision into next_revision;
 -- A concurrent first save can win the insert after our read; on conflict...where then updates nothing.
 if next_revision is null then
  raise exception 'This draft was changed elsewhere.' using errcode = 'PT409',
   detail = (select d.revision from public.portfolio_drafts d where d.portfolio_id = 'jvd-world')::text;
 end if;
 return next_revision;
end;
$$;

-- Replaces the draft with an imported document and keeps the replaced one as a recovery copy. Never publishes.
create function public.import_draft(expected_revision bigint, content jsonb) returns bigint
language plpgsql security definer set search_path = '' as $$
declare
 editor uuid := portfolio_internal.require_editor();
 previous jsonb;
 current_revision bigint;
begin
 perform portfolio_internal.require_valid(content);
 select d.revision, d.content into current_revision, previous from public.portfolio_drafts d where d.portfolio_id = 'jvd-world' for update;
 if coalesce(current_revision, 0) <> expected_revision then
  raise exception 'This draft was changed elsewhere.' using errcode = 'PT409', detail = coalesce(current_revision, 0)::text;
 end if;
 previous := coalesce(previous, (select p.content from public.portfolio_publications p where p.portfolio_id = 'jvd-world'));
 insert into public.portfolio_drafts as d (portfolio_id, schema_version, content, revision, recovery, updated_by)
 values ('jvd-world', 5, import_draft.content, expected_revision + 1, previous, editor)
 on conflict (portfolio_id) do update
  set content = excluded.content, revision = d.revision + 1, recovery = excluded.recovery, updated_at = now(), updated_by = excluded.updated_by
  where d.revision = expected_revision
 returning d.revision into current_revision;
 if current_revision is null or current_revision <> expected_revision + 1 then
  raise exception 'This draft was changed elsewhere.' using errcode = 'PT409';
 end if;
 return current_revision;
end;
$$;

-- Publishes exactly the saved draft revision in one transaction. Every uploaded image the draft shows
-- must already be copied to the public bucket (the client copies before calling this).
create function public.publish_draft(expected_revision bigint) returns bigint
language plpgsql security definer set search_path = '' as $$
declare
 editor uuid := portfolio_internal.require_editor();
 draft public.portfolio_drafts;
 missing text;
begin
 select * into draft from public.portfolio_drafts d where d.portfolio_id = 'jvd-world' for update;
 if draft is null or draft.revision <> expected_revision then
  raise exception 'This draft was changed elsewhere.' using errcode = 'PT409', detail = coalesce(draft.revision, 0)::text;
 end if;
 perform portfolio_internal.require_valid(draft.content);
 select f into missing from portfolio_internal.media_files(draft.content) f
  where not exists (select 1 from public.media_assets m where m.file = f)
   or not exists (select 1 from storage.objects o where o.bucket_id = 'portfolio-media' and o.name = f)
  limit 1;
 if missing is not null then
  raise exception 'An image (%) is not ready for publishing. Publish again; if it persists, upload it again.', missing using errcode = 'PT422';
 end if;
 update public.media_assets m set published_at = now()
  where m.published_at is null and m.file in (select portfolio_internal.media_files(draft.content));
 insert into public.portfolio_publications as p (portfolio_id, schema_version, content, revision, published_by)
 values ('jvd-world', draft.schema_version, draft.content, draft.revision, editor)
 on conflict (portfolio_id) do update
  set content = excluded.content, schema_version = excluded.schema_version, revision = excluded.revision, published_at = now(), published_by = excluded.published_by;
 return draft.revision;
end;
$$;

-- Reserves a media record before upload; the storage policies only accept objects named after one.
create function public.register_media(mime text, size_bytes bigint, width int, height int, alt text default '')
returns text
language plpgsql security definer set search_path = '' as $$
declare
 editor uuid := portfolio_internal.require_editor();
 asset_id uuid := gen_random_uuid();
 asset_file text := asset_id::text || case register_media.mime when 'image/png' then '.png' when 'image/jpeg' then '.jpg' else '.webp' end;
begin
 if register_media.mime not in ('image/png', 'image/jpeg', 'image/webp') then
  raise exception 'Choose a PNG, JPEG, or WebP image.' using errcode = 'PT422';
 end if;
 if register_media.size_bytes not between 1 and 10485760 then
  raise exception 'Choose images smaller than 10 MB each.' using errcode = 'PT422';
 end if;
 insert into public.media_assets (id, file, owner_id, mime, size_bytes, width, height, alt)
 values (asset_id, asset_file, editor, register_media.mime, register_media.size_bytes, register_media.width, register_media.height, left(coalesce(register_media.alt, ''), 500));
 return asset_file;
end;
$$;

-- Deletes a media record that neither the draft nor the publication shows. The client then removes
-- the storage objects, which the storage policies allow only once the record is gone.
create function public.remove_unused_media(file text) returns void
language plpgsql security definer set search_path = '' as $$
declare editor uuid := portfolio_internal.require_editor();
begin
 if exists (select 1 from public.portfolio_drafts d where d.portfolio_id = 'jvd-world' and remove_unused_media.file in (select portfolio_internal.media_files(d.content)))
  or exists (select 1 from public.portfolio_publications p where p.portfolio_id = 'jvd-world' and remove_unused_media.file in (select portfolio_internal.media_files(p.content))) then
  raise exception 'This image is still used by the draft or the published portfolio.' using errcode = 'PT422';
 end if;
 delete from public.media_assets m where m.file = remove_unused_media.file;
end;
$$;

revoke execute on all functions in schema portfolio_internal from public, anon, authenticated;
grant execute on function portfolio_internal.is_editor(text) to anon, authenticated;
revoke execute on function public.save_draft(bigint, jsonb), public.import_draft(bigint, jsonb), public.publish_draft(bigint),
 public.register_media(text, bigint, int, int, text), public.remove_unused_media(text) from public, anon;
grant execute on function public.save_draft(bigint, jsonb), public.import_draft(bigint, jsonb), public.publish_draft(bigint),
 public.register_media(text, bigint, int, int, text), public.remove_unused_media(text) to authenticated;

-- ---------------------------------------------------------------------------
-- Storage. Drafts are private; published images are public at immutable names. Neither bucket
-- allows overwriting (no UPDATE policy) and objects are only accepted under a registered name.
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types) values
 ('portfolio-drafts', 'portfolio-drafts', false, 10485760, array['image/png', 'image/jpeg', 'image/webp']),
 ('portfolio-media', 'portfolio-media', true, 10485760, array['image/png', 'image/jpeg', 'image/webp'])
on conflict (id) do nothing;

create policy "Editors read draft media" on storage.objects
 for select to authenticated
 using (bucket_id in ('portfolio-drafts', 'portfolio-media') and (select portfolio_internal.is_editor()));
create policy "Editors add registered media" on storage.objects
 for insert to authenticated
 with check (bucket_id in ('portfolio-drafts', 'portfolio-media') and (select portfolio_internal.is_editor())
  and exists (select 1 from public.media_assets m where m.file = objects.name));
create policy "Editors remove unregistered media" on storage.objects
 for delete to authenticated
 using (bucket_id in ('portfolio-drafts', 'portfolio-media') and (select portfolio_internal.is_editor())
  and not exists (select 1 from public.media_assets m where m.file = objects.name));
