-- OurDevo — ajuste p/ quem JÁ rodou o 01_schema.sql antigo:
-- a lista de convites passa de e-mail para USUÁRIO, e o trigger
-- passa a validar o usuário extraído de <usuario>@ourdevo.local.

-- 1) Reinicia a lista (remova os e-mails de teste, entram os usuários):
truncate public.allowed_users;
alter table public.allowed_users rename column email to usuario;

-- >>> EDITE AQUI os usuários dos dois convidados:
insert into public.allowed_users (usuario)
values
  ('danilo'),
  ('jackeline')
on conflict (usuario) do nothing;

-- 2) Trigger atualizado: extrai o usuário do campo sintético
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  usuario citext;
  invited boolean;
begin
  usuario := split_part(new.email, '@ourdevo.local', 1);

  if usuario is null or usuario = '' then
    raise exception 'OurDevo: e-mail % não é um usuário válido.', new.email;
  end if;

  select exists (select 1 from public.allowed_users where allowed_users.usuario = usuario)
    into invited;

  if not invited then
    raise exception 'OurDevo: usuário % não está na lista de convites.', usuario;
  end if;

  -- Se por acaso o perfil já existir (conta antiga), não recria.
  insert into public.profiles (id, display_name)
  values (
    new.id,
    coalesce(nullif(new.raw_user_meta_data ->> 'display_name', ''), usuario::text)
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

-- 3) Se você criou alguma conta ANTES com e-mail de verdade, apague-a
--    (Authentication → Users → … → Delete) e recrie na aba "1º acesso".