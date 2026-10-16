'use server'

import { z } from 'zod'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { isUsuarioInvitado } from '@/lib/invites'
import { rateLimit, clientIpFrom } from '@/lib/rate-limit'
import { signInSchema, signUpSchema } from '@/lib/validation'
import { usuarioParaEmail } from '@/lib/usuarios'
import { headers } from 'next/headers'
import type { AuthActionState } from '@/lib/action-state'

const erroGenerico =
  'Algo deu errado. Tente de novo — se persistir, me avise.'

export async function signInAction(
  _prev: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const parsed = signInSchema.safeParse({
    usuario: formData.get('usuario'),
    password: formData.get('password'),
  })
  if (!parsed.success) {
    return { error: parsed.error.issues[0]!.message }
  }

  const rl = rateLimit(
    `login:${clientIpFrom(await headers())}`,
    8,
    10 * 60_000,
  )
  if (!rl.ok) {
    return {
      error: `Muitas tentativas. Tente novamente em ${Math.ceil(rl.retryAfterSec / 60)} min.`,
    }
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword({
    email: usuarioParaEmail(parsed.data.usuario),
    password: parsed.data.password,
  })
  if (error) {
    return { error: 'Usuário ou senha incorretos.' }
  }

  redirect('/hoje')
}

export async function signUpAction(
  _prev: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const parsed = signUpSchema.safeParse({
    usuario: formData.get('usuario'),
    password: formData.get('password'),
    name: formData.get('name'),
  })
  if (!parsed.success) {
    return { error: parsed.error.issues[0]!.message }
  }

  const rl = rateLimit(
    `signup:${clientIpFrom(await headers())}`,
    5,
    10 * 60_000,
  )
  if (!rl.ok) {
    return {
      error: `Muitas tentativas. Tente novamente em ${Math.ceil(rl.retryAfterSec / 60)} min.`,
    }
  }

  // Só quem está na lista de convites cria conta.
  if (!(await isUsuarioInvitado(parsed.data.usuario))) {
    return { error: 'Este usuário não está na lista de convites do DuoDevo.' }
  }

  const supabase = await createClient()
  const { data, error } = await supabase.auth.signUp({
    email: usuarioParaEmail(parsed.data.usuario),
    password: parsed.data.password,
    options: {
      data: { display_name: parsed.data.name },
    },
  })

  if (error) {
    console.error('[signup] erro do Supabase:', error.status, error.message)
    if (error.message.includes('already registered')) {
      return { error: 'Já existe uma conta com este usuário. Use "Entrar".' }
    }
    return { error: erroGenerico }
  }

  if (data.session) {
    // "Confirmar e-mail" desligado no Supabase → cadastro já loga direto.
    redirect('/hoje')
  }

  return { error: erroGenerico }
}

export async function signOutAction(): Promise<void> {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}