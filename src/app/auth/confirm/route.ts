import { NextResponse } from 'next/server'
import type { EmailOtpType } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/server'
import { isUsuarioInvitado } from '@/lib/invites'
import { emailParaUsuario } from '@/lib/usuarios'

/**
 * Confirma o link mágico / e-mail de confirmação (usado pela template
 * {{ .TokenHash }} — ver README). É a segunda camada da trava de convite:
 * mesmo que algo crie um usuário fora da lista, o gate aqui derruba a sessão.
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const tokenHash = searchParams.get('token_hash')
  const type = searchParams.get('type') as EmailOtpType | null
  const next = searchParams.get('next') ?? '/hoje'

  if (!tokenHash || !type) {
    return redirectTo(origin, '/login?erro=link')
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash })
  if (error) {
    return redirectTo(origin, '/login?erro=link')
  }

  const { data } = await supabase.auth.getUser()
  const usuario = emailParaUsuario(data.user?.email)
  if (!data.user || !usuario || !(await isUsuarioInvitado(usuario))) {
    await supabase.auth.signOut()
    return redirectTo(origin, '/login?erro=convite')
  }

  return redirectTo(origin, next)
}

function redirectTo(origin: string, path: string): NextResponse {
  return NextResponse.redirect(new URL(path, origin))
}