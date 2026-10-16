/** Estado compartilhado pelos server actions de autenticação. */
export type AuthActionState = {
  error?: string
  message?: string
}

export const authErrorMessages: Record<string, string> = {
  link: 'Link inválido ou expirado. Peça um novo link ou entre com senha.',
  convite:
    'Este e-mail não está na lista de convites do OurDevo. Peça para quem cuida do app adicionar seu e-mail.',
  conta_existe: 'Já existe uma conta com este e-mail. Use "entrar".',
}