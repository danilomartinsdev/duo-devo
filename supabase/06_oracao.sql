-- DuoDevo — fase "Oração": pedidos + comentários
-- Privado por padrão; compartilhável item a item (igual ao humor).

create table public.prayers (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  pedido text not null check (char_length(pedido) between 2 and 500),
  respondido boolean not null default false,
  respondido_em timestamptz,
  compartilhar boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index prayers_user_criado on public.prayers (user_id, created_at desc);

alter table public.prayers enable row level security;

create policy "prayers: próprio ou compartilhado com a dupla"
  on public.prayers for select to authenticated
  using (
    user_id = auth.uid()
    or (compartilhar and public.same_duo(user_id, auth.uid()))
  );

create policy "prayers: cria o próprio"
  on public.prayers for insert to authenticated
  with check (user_id = auth.uid());

create policy "prayers: edita o próprio"
  on public.prayers for update to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "prayers: apaga o próprio"
  on public.prayers for delete to authenticated
  using (user_id = auth.uid());

-- comentários: só dentro de pedidos que quem comenta pode ver
create table public.prayer_comments (
  id bigint generated always as identity primary key,
  prayer_id bigint not null references public.prayers (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  comentario text not null check (char_length(comentario) between 1 and 280),
  created_at timestamptz not null default now()
);

alter table public.prayer_comments enable row level security;

create policy "comentários: quem vê o pedido comenta"
  on public.prayer_comments for select to authenticated
  using (user_id = auth.uid() or exists (
    select 1 from public.prayers p
    where p.id = prayer_id
      and (p.user_id = auth.uid() or (p.compartilhar and public.same_duo(p.user_id, auth.uid())))
  ));

create policy "comentários: quem vê o pedido escreve"
  on public.prayer_comments for insert to authenticated
  with check (
    user_id = auth.uid()
    and exists (
      select 1 from public.prayers p
      where p.id = prayer_id
        and (p.user_id = auth.uid() or (p.compartilhar and public.same_duo(p.user_id, auth.uid())))
    ));

create policy "comentários: apaga o próprio"
  on public.prayer_comments for delete to authenticated
  using (user_id = auth.uid());

-- diagnóstico:
--   select * from public.prayers;           -- só os seus + os compartilhados
--   insert into public.prayers (user_id, pedido) values ('<uuid-do-outro>', 'x');  ← DEVE FALHAR
-- ============================================================