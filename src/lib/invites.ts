import { createAdminClient } from '@/lib/supabase/admin'

/**
 * Verifica se o usuário está na lista de convites. Roda sempre no servidor
 * e usa a service_role key, porque `allowed_users` tem RLS sem políticas
 * (anon/auth não podem ler) e a lista não é pública.
 */
export async function isUsuarioInvitado(usuario: string): Promise<boolean> {
  const admin = createAdminClient()
  const nome = usuario.trim().toLowerCase()
  const { data } = await admin
    .from('allowed_users')
    .select('usuario')
    .eq('usuario', nome)
    .maybeSingle()
  return data !== null
}