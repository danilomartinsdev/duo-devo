import { createClient, type SupabaseClient } from '@supabase/supabase-js'

/**
 * Cliente com a service_role key — use APENAS em códigos que rodam
 * no servidor (server actions, route handlers) e somente quando for
 * necessário (ex.: ler `allowed_users` antes do login, ignorando a RLS).
 */
export function createAdminClient(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !serviceKey) {
    throw new Error(
      'Supabase não configurado: defina NEXT_PUBLIC_SUPABASE_URL e ' +
        'SUPABASE_SERVICE_ROLE_KEY em .env.local (veja .env.example).',
    )
  }
  return createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}