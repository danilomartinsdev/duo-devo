import { createAdminClient } from '@/lib/supabase/admin'

/**
 * Verifica se o e-mail está na lista de convites. Roda sempre no servidor
 * e usa a service_role key, porque `allowed_users` tem RLS sem políticas
 * (anon/auth não podem ler) e a lista não é pública.
 */
export async function isEmailInvited(email: string): Promise<boolean> {
  const admin = createAdminClient()
  const emailNormalizado = email.trim().toLowerCase()
  const { data } = await admin
    .from('allowed_users')
    .select('email')
    .eq('email', emailNormalizado)
    .maybeSingle()
  return data !== null
}