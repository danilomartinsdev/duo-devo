import { z } from 'zod'

export const usuarioSchema = z
  .string()
  .toLowerCase()
  .min(3, 'Usuário precisa de pelo menos 3 letras.')
  .max(20, 'Usuário de até 20 letras.')
  .regex(/^[a-z0-9._-]+$/, 'Só letras, números, ponto, hífen ou sublinhado.')

// Mantido para o futuro: quando voltar a usar e-mail de verdade.
export const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .email('Digite um e-mail válido.')

export const passwordSchema = z
  .string()
  .min(8, 'A senha precisa de pelo menos 8 caracteres.')
  .max(72, 'Senha muito longa.')

export const signInSchema = z.object({
  usuario: usuarioSchema,
  password: passwordSchema,
})

export const signUpSchema = z.object({
  usuario: usuarioSchema,
  password: passwordSchema,
  name: z
    .string()
    .trim()
    .min(2, 'Diga como quer ser chamada(o).')
    .max(40, 'Nome muito longo.'),
})

export type SignInInput = z.infer<typeof signInSchema>
export type SignUpInput = z.infer<typeof signUpSchema>