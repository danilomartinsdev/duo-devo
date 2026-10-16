'use server'

import { z } from 'zod'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { isEmailInvited } from '@/lib/invites'
import { rateLimit, clientIpFrom } from '@/lib/rate-limit'
import { signInSchema, signUpSchema, emailSchema } from '@/lib/validation'
import type { AuthActionState } from '@/lib/action-state'

const erroGenerico =
  'Algo deu errado. Tente de novo — se persistir, me avise.'

export async function signInAction(
  _prev: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const parsed = signInSchema.safeParse({
    email: formData.get('email'),
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
    email: parsed.data.email,
    password: parsed.data.password,
  })
  if (error) {
    return { error: 'E-mail ou senha incorretos.' }
  }

  redirect('/hoje')
}

export async function signUpAction(
  _prev: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const parsed = signUpSchema.safeParse({
    email: formData.get('email'),
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

  // Primeiro filtro: só e-mails convidados criam conta.
  if (!(await isEmailInvited(parsed.data.email))) {
    return { error: 'Este e-mail não está na lista de convites do OurDevo.' }
  }

  const supabase = await createClient()
  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: { display_name: parsed.data.name },
      emailRedirectTo: origin() + '/auth/confirm',
    },
  })

  if (error) {
    if (error.message.includes('already registered')) {
      return { error: 'Já existe uma conta com este e-mail. Use "Entrar".' }
    }
    return { error: erroGenerico }
  }
  if (data.session) {
    // e-mail autoconfirmado (comum em ambiente dev) → já está logado; o
    // trigger do banco garante que o perfil saiu da lista de convites.
    redirect('/hoje')
  }

  return {
    message: 'Conta criada! Confira seu e-mail para confirmar o acesso.',
  }
}

export async function magicLinkAction(
  _prev: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const parsed = emailSchema.safeParse(formData.get('email'))
  if (!parsed.success) {
    return { error: parsed.error.issues[0]!.message }
  }

  const rl = rateLimit(
    `magic:${clientIpFrom(await headers())}`,
    5,
    10 * 60_000,
  )
  if (!rl.ok) {
    return {
      error: `Muitos pedidos de link. Tente novamente em ${Math.ceil(rl.retryAfterSec / 60)} min.`,
    }
  }

  if (!(await isEmailInvited(parsed.data))) {
    return { error: 'Este e-mail não está na lista de convites do OurDevo.' }
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithOtp({
    email: parsed.data,
    options: { emailRedirectTo: origin() + '/auth/confirm' },
  })
  if (error) {
    return { error: erroGenerico }
  }
  return { message: 'Enviado! Abra o link no seu e-mail para entrar.' }
}

export async function signOutAction(): Promise<void> {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}

async function origin(): Promise<string> {
  const h = await headers()
  const local = h.get('x-forwarded-host') ?? h.get('host') ?? 'localhost:3000'
  const proto = h.get('x-forwarded-proto') ?? 'http'
  return `${proto}://${local}`
}