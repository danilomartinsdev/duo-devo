-- OurDevo — schema da fase 2 (leitura + progresso)
-- Rodar no SQL Editor do Supabase depois do 01_schema.sql.

-- ============================================================
-- user_plans — o plano ativo de cada um
-- ============================================================
create table public.user_plans (
  user_id uuid primary key references auth.users (id) on delete cascade,
  plano text not null
    check (plano in ('nt-90', 'nt-180', 'evangelhos-primeiro')),
  meta_diaria int not null default 1 check (meta_diaria between 1 and 6),
  started_on date not null default current_date,
  created_at timestamptz not null default now()
);

alter table public.user_plans enable row level security;

create policy "user_plans: só o próprio lê"
  on public.user_plans for select to authenticated using (user_id = auth.uid());

create policy "user_plans: só o próprio cria"
  on public.user_plans for insert to authenticated
  with check (user_id = auth.uid());

create policy "user_plans: só o próprio atualiza"
  on public.user_plans for update to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- ============================================================
-- readings — capítulos lidos, quando lidos
-- ============================================================
create table public.readings (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  livro text not null,
  capitulo int not null check (capitulo >= 1),
  -- calculado na app no fuso do usuário (never trust current_date/UTC)
  lido_em date not null,
  created_at timestamptz not null default now(),
  unique (user_id, livro, capitulo)
);

create index readings_user_lido ON public.readings (user_id, lido_em desc);

alter table public.readings enable row level security;

-- helper: os dois pertencem à mesma dupla?
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

-- Progresso da dupla É compartilhado por design: quem está na mesma dupla
-- vê os capítulos lidos do outro (sem horário, este é o objetivo do app).
create policy "readings: o próprio ou a dupla leem"
  on public.readings for select to authenticated
  using (
    user_id = auth.uid()
    or public.same_duo(user_id, auth.uid())
  );

create policy "readings: marca o próprio"
  on public.readings for insert to authenticated
  with check (user_id = auth.uid());

create policy "readings: desmarca o próprio"
  on public.readings for delete to authenticated
  using (user_id = auth.uid());

-- ============================================================
-- moods — humor opcional pós-leitura (PRIVADO por default)
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

-- Só o próprio vê — a menos que aquele registro esteja compartilhado
-- (opção item por item) e pertençam à mesma dupla.
create policy "moods: privado, exceto o que compartilhou"
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
-- reminders — preferências de notificação de cada um
-- (a UI vem na fase 3; o schema já fica pronto para o push da fase 5)
-- ============================================================
create table public.reminders (
  user_id uuid not null references auth.users (id) on delete cascade,
  tipo text not null check (tipo in ('lembrete_diario', 'aviso_duo', 'frase_fe')),
  ativo boolean not null default true,
  hora_local time not null default '07:30',
  -- default: lembrete às 7:30; aviso_duo e frase_fe começam desligados
  primary key (user_id, tipo)
);

alter table public.reminders enable row level security;

create policy "reminders: só o próprio"
  on public.reminders for select to authenticated using (user_id = auth.uid());
create policy "reminders: só o próprio escreve"
  on public.reminders for insert to authenticated
  with check (user_id = auth.uid());
create policy "reminders: só o próprio atualiza"
  on public.reminders for update to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- Como testar (como postgres):
--   set request.jwt.claims = '{"sub":"<uid-1>","role":"authenticated"}';
--   select * from public.readings;                    -- os 2 veem (mesma dupla)
--   delete from public.readings where id = 1;         -- só apaga o próprio
--   select * from public.moods where shared_with_duo; -- só o que a dupla compartilhou
--   insert into public.reminders (user_id) values ('<uid-2>'); ← DEVE FALHAR (RLS)
-- ============================================================