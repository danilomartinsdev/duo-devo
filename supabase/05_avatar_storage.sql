-- OurDevo / DuoDevo — fase 3: bucket de avatares + policies
-- Rodar no SQL Editor do Supabase.

-- bucket público de avatares (uma pasta por usuário)
insert into storage.buckets (id, name, public)
values ('avatares', 'avatares', true)
on conflict (id) do nothing;

-- leitura pública das imagens (são fotos de perfil)
create policy "avatares: leitura pública"
  on storage.objects for select
  to public
  using (bucket_id = 'avatares');

-- cada usuário só escreve dentro da própria pasta avatares/<uid>/...
create policy "avatares: upload na própria pasta"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'avatares'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "avatares: atualizar o próprio"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'avatares'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "avatares: apagar o próprio"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'avatares'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- diagnóstico:
--   select id from storage.buckets;                          -- avatares
--   select policyname from pg_policies where tablename = 'objects';