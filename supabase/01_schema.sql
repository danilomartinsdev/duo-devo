-- OurDevo — schema da fase 1 (setup + auth + RLS)
-- Rodar como usuário postgres no SQL Editor do Supabase (ou via CLI).
-- Tabelas das fases seguintes (readings, prayers, etc.) entram nos schemas
-- das respectivas fases, com a mesma disciplina de RLS.

-- ============================================================
-- Extensões
-- ============================================================
create extension if not exists citext;

-- ============================================================
-- allowed_users — lista de convites (só vocês dois entram)
-- ============================================================
create table public.allowed_users (
  email citext primary key,
  invited_at timestamptz not null default now()
);

-- Nenhuma política de RLS: nem anon, nem authenticated podem ler.
-- Somente a service_role key (que ignora RLS) acessa.
alter table public.allowed_users enable row level security;

-- >>> EDITE AQUI os e-mails dos dois convidados:
insert into public.allowed_users (email)
values
  ('seu-email@exemplo.com'),
  ('amiga-email@exemplo.com')
on conflict (email) do nothing;

-- ============================================================
-- profiles — perfil de cada um (nome, foto, tema, fuso)
-- ============================================================
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null default '',
  avatar_url text,
  theme_color text not null default 'salvia'
    check (theme_color in ('salvia', 'terracota', 'lavanda', 'oceano', 'mel', 'floresta')),
  theme_mode text not null default 'sistema'
    check (theme_mode in ('claro', 'escuro', 'sistema')),
  timezone text not null default 'America/Sao_Paulo',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- Lê qualquer perfil do app: é por convite, então qualquer usuário
-- autenticado é uma das duas pessoas (necessário p/ progresso compartilhado).
create policy "profiles: membros leem qualquer perfil"
  on public.profiles for select
  to authenticated
  using (true);

-- Só atualiza o próprio perfil.
create policy "profiles: atualiza só o próprio"
  on public.profiles for update
  to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

-- ============================================================
-- duos + duo_members — a dupla (uma só, por design do app)
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

-- helper: o usuário p é membro do duo d? (security definer = atravessa a RLS
-- das próprias tabelas de membros de forma controlada)
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

-- Lê o duo se for membro dele (nada de enumerar duos alheios).
create policy "duos: só membros leem"
  on public.duos for select
  to authenticated
  using (public.is_duo_user(id, auth.uid()));

create policy "duos: só membros renomeiam"
  on public.duos for update
  to authenticated
  using (public.is_duo_user(id, auth.uid()))
  with check (public.is_duo_user(id, auth.uid()));

-- Lê a lista de membros apenas se pertencer ao duo.
create policy "duo_members: só membros do duo leem"
  on public.duo_members for select
  to authenticated
  using (public.is_duo_user(duo_id, auth.uid()));

-- Inserção/remoção de membros é feita só pela service_role (SQL manual
-- abaixo) — sem policy, anon/auth não alteram a composição da dupla.

-- ============================================================
-- handle_new_user — cria perfil na hora do signup e valida o convite
-- ============================================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  invited boolean;
begin
  select exists (select 1 from public.allowed_users where email = new.email)
    into invited;

  if not invited then
    raise exception 'OurDevo: e-mail % não está na lista de convites.', new.email;
  end if;

  insert into public.profiles (id, display_name)
  values (
    new.id,
    coalesce(nullif(new.raw_user_meta_data ->> 'display_name', ''), split_part(new.email, '@', 1))
  );

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();

-- ============================================================
-- updated_at automático
-- ============================================================
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
-- Criar a dupla — rode DEPOIS que os dois confirmarem o cadastro,
-- trocando os e-mails pelos seus. Só uma vez!
-- ============================================================
-- with new_duo as (
--   insert into public.duos (name) values ('Nossa dupla') returning id
-- )
-- insert into public.duo_members (duo_id, user_id)
-- select new_duo.id, p.id
-- from new_duo
-- cross join public.profiles p
-- join public.allowed_users au on true
-- where p.id = (select id from auth.users where email = 'seu-email@exemplo.com')
--    or p.id = (select id from auth.users where email = 'amiga-email@exemplo.com');

-- ============================================================
-- Como testar as políticas (SQL Editor, como postgres):
--   set request.jwt.claims = '{"sub":"<id-do-usuário-1>","role":"authenticated"}';
--   select * from public.profiles;              -- vê os 2
--   update public.profiles set display_name='x' where id = '<id-do-usuário-2>';  -- 0 linhas
--   select * from public.allowed_users;         -- vazio (RLS sem policy)
--   select * from public.duos;                  -- só vê a sua dupla
-- ============================================================