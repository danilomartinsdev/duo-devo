-- OurDevo — reparo único: reconstrói o trigger do signup e garante a lista.
-- Rodar INTEIRO no SQL Editor do Supabase. É seguro rodar de novo.
-- Contexto: login por USUÁRIO; o campo "email" do auth guarda
-- <usuario>@ourdevo.local (ver src/lib/usuarios.ts).

-- 1) garante a coluna certa (se ainda não foi renomeada)
do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'allowed_users' and column_name = 'email'
  ) then
    alter table public.allowed_users rename column email to usuario;
  end if;
end $$;

-- 2) lista de convites no formato certo — EDITE os dois usuários se preciso
truncate public.allowed_users;
insert into public.allowed_users (usuario)
values ('danilo'), ('jackeline')
on conflict (usuario) do nothing;

-- 3) função do signup, versão correta
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
  v_usuario := split_part(new.email, '@ourdevo.local', 1);

  if v_usuario is null or v_usuario = '' then
    raise exception 'OurDevo: e-mail % não é um usuário válido.', new.email;
  end if;

  select exists (select 1 from public.allowed_users au where au.usuario = v_usuario)
    into v_invited;

  if not v_invited then
    raise exception 'OurDevo: usuário % não está na lista de convites.', v_usuario;
  end if;

  insert into public.profiles (id, display_name)
  values (
    new.id,
    coalesce(nullif(new.raw_user_meta_data ->> 'display_name', ''), v_usuario)
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

-- 4) diagnóstico para conferir o resultado
select usuario from public.allowed_users;                       -- deve listar danilo, jackeline
select prosrc like '%ourdevo.local%' as trigger_atualizado
  from pg_proc
  where proname = 'handle_new_user' and pronamespace = 'public'::regnamespace; -- deve dar true