'use server'

import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { getCurrentProfile } from '@/lib/profile'
import type { AuthActionState } from '@/lib/action-state'

const esquemaPedido = z.object({
  pedido: z.string().trim().min(2, 'Escreva o pedido em poucas palavras.').max(500),
  compartilhar: z.optional(z.string()),
})

export async function criarOracaoAction(
  _prev: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const perfil = await getCurrentProfile()
  if (!perfil) return { error: 'Sessão expirada.' }

  const parsed = esquemaPedido.safeParse({
    pedido: formData.get('pedido'),
    compartilhar: formData.get('compartilhar') ? '1' : undefined,
  })
  if (!parsed.success) return { error: parsed.error.issues[0]!.message }

  const supabase = await createClient()
  const { error } = await supabase.from('prayers').insert({
    user_id: perfil.id,
    pedido: parsed.data.pedido,
    compartilhar: Boolean(parsed.data.compartilhar),
  })
  if (error) return { error: 'Não deu para guardar o pedido.' }

  revalidatePath('/oracao')
  return { message: 'ok' }
}

export async function marcarRespondidoAction(id: number, respondido: boolean): Promise<boolean> {
  const perfil = await getCurrentProfile()
  if (!perfil) return false

  const supabase = await createClient()
  const { error } = await supabase
    .from('prayers')
    .update({
      respondido,
      ...(respondido ? { respondido_em: new Date().toISOString() } : {}),
    })
    .eq('id', id)
    .eq('user_id', perfil.id)
  if (!error) revalidatePath('/oracao')
  return !error
}

export async function comentarOracaoAction(
  _prev: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const perfil = await getCurrentProfile()
  if (!perfil) return { error: 'Sessão expirada.' }

  const parsed = z
    .object({
      prayer_id: z.coerce.number().int().positive(),
      comentario: z.string().trim().min(1, 'Escreva algo.').max(280),
    })
    .safeParse({
      prayer_id: formData.get('prayer_id'),
      comentario: formData.get('comentario'),
    })
  if (!parsed.success) return { error: 'Escreva com pelo menos 1 caractere.' }

  const supabase = await createClient()
  const { error } = await supabase.from('prayer_comments').insert({
    prayer_id: parsed.data.prayer_id,
    user_id: perfil.id,
    comentario: parsed.data.comentario,
  })
  if (error) {
    return { error: 'Não deu para comentar — o pedido pode estar privado.' }
  }

  revalidatePath(`/oracao/${parsed.data.prayer_id}`)
  return { message: 'ok' }
}