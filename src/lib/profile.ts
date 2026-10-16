import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { type Profile } from '@/lib/types'

export async function getCurrentProfile(): Promise<Profile | null> {
  const supabase = await createClient()
  const { data } = await supabase.auth.getUser()
  if (!data.user) return null

  const { data: perfil } = await supabase
    .from('profiles')
    .select('id, display_name, avatar_url, theme_color, theme_mode, timezone')
    .eq('id', data.user.id)
    .single()
    .returns<Profile>()

  // perfil pode ainda não existir (usuário criado antes do trigger) — tratado
  // como "sem perfil"; a página de hoje exibe o fallback com o e-mail.
  return perfil ?? null
}