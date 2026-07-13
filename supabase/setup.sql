-- =============================================================
-- Configuración de Supabase para la galería (plan gratuito)
-- Pega este archivo completo en: tu proyecto → SQL Editor → Run
-- =============================================================

-- ---- Muro de dedicatorias -----------------------------------
create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 40),
  text text not null check (char_length(text) between 1 and 500),
  created_at timestamptz not null default now()
);

alter table public.messages enable row level security;

-- Cualquiera con el enlace puede leer y añadir dedicatorias,
-- pero nadie puede editarlas ni borrarlas desde la web.
drop policy if exists "leer dedicatorias" on public.messages;
create policy "leer dedicatorias"
  on public.messages for select
  to anon using (true);

drop policy if exists "escribir dedicatorias" on public.messages;
create policy "escribir dedicatorias"
  on public.messages for insert
  to anon with check (true);

-- ---- Reacciones emoji por foto ------------------------------
create table if not exists public.reactions (
  photo_id text not null,
  emoji text not null check (char_length(emoji) <= 8),
  count integer not null default 0,
  primary key (photo_id, emoji)
);

alter table public.reactions enable row level security;

drop policy if exists "leer reacciones" on public.reactions;
create policy "leer reacciones"
  on public.reactions for select
  to anon using (true);

-- Sin políticas de insert/update directas: los cambios solo
-- entran por la función de abajo, que suma de uno en uno.
create or replace function public.increment_reaction(p_photo_id text, p_emoji text)
returns void
language sql
security definer
set search_path = public
as $$
  insert into public.reactions (photo_id, emoji, count)
  values (p_photo_id, p_emoji, 1)
  on conflict (photo_id, emoji)
  do update set count = public.reactions.count + 1;
$$;

grant execute on function public.increment_reaction(text, text) to anon;
