/**
 * O Supabase Auth exige um campo em formato de e-mail. Como por enquanto o
 * login é usuário + senha, guardamos `<nome>@ourdevo.local` nele — invisível
 * para os usuários. Quando quiser e-mail de verdade (futuro), troque o valor
 * do campo e nada de auth muda.
 */
export const DOMINIO_LOCAL = '@ourdevo.local'

export function usuarioParaEmail(usuario: string): string {
  return `${usuario}${DOMINIO_LOCAL}`
}

/** Extrai o usuário de um "email" sintético; null se o formato não bater. */
export function emailParaUsuario(email: string | null | undefined): string | null {
  if (!email) return null
  if (!email.endsWith(DOMINIO_LOCAL)) return null
  const usuario = email.slice(0, -DOMINIO_LOCAL.length)
  return usuario.length > 0 ? usuario : null
}