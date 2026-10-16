'use server'

import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getCurrentProfile } from '@/lib/profile'
import { hojeISO } from '@/lib/datas'
import type { AuthActionState } from '@/lib/action-state'

const esquemaIniciar = z.object({
  plano: z.enum(['nt-90', 'nt-180', 'evangelhos-primeiro']),
  meta_diaria: z.coerce.number().int().min(1).max(6),
})

export async function iniciarPlanoAction(
  _prev: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const perfil = await getCurrentProfile()
  if (!perfil) return { error: 'Sessão expirada. Entre de novo.' }

  const parsed = esquemaIniciar.safeParse({
    plano: formData.get('plano'),
    meta_diaria: formData.get('meta_diaria'),
  })
  if (!parsed.success) return { error: 'Escolha um plano e uma meta válidos.' }

  const supabase = await createClient()
  const { error } = await supabase.from('user_plans').upsert({
    user_id: perfil.id,
    plano: parsed.data.plano,
    meta_diaria: parsed.data.meta_diaria,
    started_on: hojeISO(perfil.timezone),
  })
  if (error) return { error: 'Não deu para salvar o plano. Tente de novo.' }

  redirect('/hoje')
}

export async function ajustarMetaAction(formData: FormData): Promise<void> {
  const perfil = await getCurrentProfile()
  if (!perfil) return

  const parsed = z.coerce.number().int().min(1).max(6).safeParse(formData.get('meta_diaria'))
  if (!parsed.success) return

  const supabase = await createClient()
  await supabase
    .from('user_plans')
    .update({ meta_diaria: parsed.data })
    .eq('user_id', perfil.id)

  revalidatePath('/hoje')
  revalidatePath('/progresso')
}

const esquemaMarcar = z.object({
  livro: z.string().trim().min(1).max(20),
  capitulo: z.coerce.number().int().min(1).max(150),
})

export async function marcarLidoAction(livro: string, capitulo: number): Promise<boolean> {
  const perfil = await getCurrentProfile()
  if (!perfil) return false

  const parsed = esquemaMarcar.safeParse({ livro, capitulo })
  if (!parsed.success) return false

  const supabase = await createClient()
  const { error } = await supabase.from('readings').upsert(
    {
      user_id: perfil.id,
      livro: parsed.data.livro,
      capitulo: parsed.data.capitulo,
      lido_em: hojeISO(perfil.timezone),
    },
    { onConflict: 'user_id,livro,capitulo' },
  )

  if (!error) {
    revalidatePath('/hoje')
    revalidatePath('/progresso')
  }
  return !error
}

export async function salvarHumorAction(
  _prev: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const perfil = await getCurrentProfile()
  if (!perfil) return { error: 'Sessão expirada. Entre de novo.' }

  const parsed = z
    .object({
      emoji: z.string().trim().min(1).max(8),
      nota: z.string().trim().max(280).optional(),
      compartilhar: z.optional(z.string()),
      lido_em: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    })
    .safeParse({
      emoji: formData.get('emoji'),
      nota: formData.get('nota') || undefined,
      compartilhar: formData.get('compartilhar') ? '1' : undefined,
      lido_em: formData.get('lido_em'),
    })
  if (!parsed.success) return { error: 'Confira o humor e tente de novo.' }

  const supabase = await createClient()
  const { error } = await supabase.from('moods').insert({
    user_id: perfil.id,
    emoji: parsed.data.emoji,
    nota: parsed.data.nota ?? null,
    shared_with_duo: Boolean(parsed.data.compartilhar),
    lido_em: parsed.data.lido_em,
  })
  if (error) return { error: 'Não deu para salvar. Sem pressa — pode tentar de novo.' }

  revalidatePath('/hoje')
  // o próprio fluxo vai para /hoje quando der bom
  return { message: 'ok' }
}