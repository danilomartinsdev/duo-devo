-- ============================================================
-- DuoDevo — RESET: derruba o schema public e recria tudo do zero
-- (schema final, com login por USUÁRIO).
-- Rodar uma vez, INTEIRO, no SQL Editor do Supabase.
-- ⚠ Apaga tabelas/funções do schema public (auth.users NÃO é tocado).
-- ============================================================

-- 1) demolir e reconstruir o schema
drop schema public cascade;

create schema public;

grant usage on schema public to anon, authenticated, service_role;
alter default privileges in schema public grant all on tables to anon, authenticated, service_role;
alter default privileges in schema public grant all on functions to anon, authenticated, service_role;
alter default privileges in schema public grant all on sequences to anon, authenticated, service_role;

create extension if not exists citext;

-- ============================================================
-- allowed_users — lista de convites (RLS sem policies: só service_role)
-- ============================================================
create table public.allowed_users (
  usuario citext primary key,
  invited_at timestamptz not null default now()
);

alter table public.allowed_users enable row level security;

-- >>> EDITE AQUI os dois usuários (só daqui para baixo, se quiser):
insert into public.allowed_users (usuario)
values ('danilo'), ('jackeline')
on conflict (usuario) do nothing;

-- ============================================================
-- profiles
-- ============================================================
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null default '',
  avatar_url text,
  theme_color text not null default 'indigo'
    check (theme_color in ('indigo', 'oceano', 'floresta', 'mel', 'grafeno', 'magenta')),
  theme_mode text not null default 'sistema'
    check (theme_mode in ('claro', 'escuro', 'sistema')),
  timezone text not null default 'America/Sao_Paulo',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "profiles: membros leem qualquer perfil"
  on public.profiles for select to authenticated using (true);

create policy "profiles: atualiza só o próprio"
  on public.profiles for update to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

-- ============================================================
-- duos + duo_members
-- ============================================================
create table public.duos (
  id uuid primary key default gen_random_uuid(),
  name text not null default 'Nossa dupla',
  created_at timestamptz not null default now()
);

create table public.duo_members (
  duo_id uuid not null references public.duos (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  joined_at timestamptz not null default now(),
  primary key (duo_id, user_id)
);

alter table public.duos enable row level security;
alter table public.duo_members enable row level security;

create or replace function public.is_duo_user(p_duo uuid, p_user uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.duo_members
    where duo_id = p_duo and user_id = p_user
  );
$$;

create policy "duos: só membros leem"
  on public.duos for select to authenticated
  using (public.is_duo_user(id, auth.uid()));

create policy "duos: só membros renomeiam"
  on public.duos for update to authenticated
  using (public.is_duo_user(id, auth.uid()))
  with check (public.is_duo_user(id, auth.uid()));

create policy "duo_members: só membros do duo leem"
  on public.duo_members for select to authenticated
  using (public.is_duo_user(duo_id, auth.uid()));

-- ============================================================
-- user_plans (fase 2)
-- ============================================================
create table public.user_plans (
  user_id uuid primary key references auth.users (id) on delete cascade,
  plano text not null check (plano in ('nt-90', 'nt-180', 'evangelhos-primeiro')),
  meta_diaria int not null default 1 check (meta_diaria between 1 and 6),
  started_on date not null default current_date,
  created_at timestamptz not null default now()
);

alter table public.user_plans enable row level security;

create policy "user_plans: só o próprio" on public.user_plans for select to authenticated using (user_id = auth.uid());
create policy "user_plans: só o próprio escreve" on public.user_plans for insert to authenticated with check (user_id = auth.uid());
create policy "user_plans: só o próprio atualiza" on public.user_plans for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

-- ============================================================
-- readings (fase 2) — progresso compartilhado na dupla
-- ============================================================
create table public.readings (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  livro text not null,
  capitulo int not null check (capitulo >= 1),
  lido_em date not null,
  created_at timestamptz not null default now(),
  unique (user_id, livro, capitulo)
);

create index readings_user_lido on public.readings (user_id, lido_em desc);

alter table public.readings enable row level security;

create or replace function public.same_duo(a uuid, b uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.duo_members m1
    join public.duo_members m2 on m1.duo_id = m2.duo_id
    where m1.user_id = a and m2.user_id = b
  );
$$;

create policy "readings: o próprio ou a dupla leem"
  on public.readings for select to authenticated
  using (user_id = auth.uid() or public.same_duo(user_id, auth.uid()));

create policy "readings: marca o próprio"
  on public.readings for insert to authenticated
  with check (user_id = auth.uid());

create policy "readings: desmarca o próprio"
  on public.readings for delete to authenticated
  using (user_id = auth.uid());

-- ============================================================
-- moods (fase 2) — privado, compartilhável item a item
-- ============================================================
create table public.moods (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  emoji text not null check (char_length(emoji) between 1 and 8),
  nota text check (char_length(nota) <= 280),
  shared_with_duo boolean not null default false,
  lido_em date not null,
  created_at timestamptz not null default now()
);

alter table public.moods enable row level security;

create policy "moods: privado, exceto o compartilhado"
  on public.moods for select to authenticated
  using (
    user_id = auth.uid()
    or (shared_with_duo and public.same_duo(user_id, auth.uid()))
  );

create policy "moods: registra o próprio"
  on public.moods for insert to authenticated
  with check (user_id = auth.uid());

create policy "moods: edita o próprio"
  on public.moods for update to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "moods: apaga o próprio"
  on public.moods for delete to authenticated
  using (user_id = auth.uid());

-- ============================================================
-- reminders (fase 5 usa; schema pronto desde já)
-- ============================================================
create table public.reminders (
  user_id uuid not null references auth.users (id) on delete cascade,
  tipo text not null check (tipo in ('lembrete_diario', 'aviso_duo', 'frase_fe')),
  ativo boolean not null default true,
  hora_local time not null default '07:30',
  primary key (user_id, tipo)
);

alter table public.reminders enable row level security;

create policy "reminders: só o próprio leem"
  on public.reminders for select to authenticated using (user_id = auth.uid());
create policy "reminders: só o próprio cria"
  on public.reminders for insert to authenticated with check (user_id = auth.uid());
create policy "reminders: só o próprio atualiza"
  on public.reminders for update to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- ============================================================
-- triggers e funções
-- ============================================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_usuario text;
  v_invited boolean;
begin
  -- O campo "email" do auth guarda <usuario>@ourdevo.local
  v_usuario := split_part(new.email, '@ourdevo.local', 1);

  if v_usuario is null or v_usuario = '' then
    raise exception 'DuoDevo: e-mail % não é um usuário válido.', new.email;
  end if;

  select exists (select 1 from public.allowed_users au where au.usuario = v_usuario)
    into v_invited;

  if not v_invited then
    raise exception 'DuoDevo: usuário % não está na lista de convites.', v_usuario;
  end if;

  insert into public.profiles (id, display_name)
  values (
    new.id,
    coalesce(nullif(new.raw_user_meta_data ->> 'display_name', ''), v_usuario)
  );

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- ============================================================
-- Criar a dupla — rode DEPOIS de os dois criarem a conta (uma vez):
-- ============================================================
-- with new_duo as (
--   insert into public.duos (name) values ('Nossa dupla') returning id
-- )
-- insert into public.duo_members (duo_id, user_id)
-- select new_duo.id, p.id
-- from new_duo
-- cross join public.profiles p
-- where p.id = (select id from auth.users where email = 'danilo@ourdevo.local')
--    or p.id = (select id from auth.users where email = 'jackeline@ourdevo.local');

-- Diagnóstico final:
--   select usuario from public.allowed_users;   -- danilo, jackeline
--   \dt          (não existe no painel; usar: )
--   select tablename from pg_tables where schemaname = 'public';  -- 8 tabelas