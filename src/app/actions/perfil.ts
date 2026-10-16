'use server'

import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getCurrentProfile } from '@/lib/profile'
import type { AuthActionState } from '@/lib/action-state'

const esquemaNome = z.object({
  name: z.string().trim().min(2).max(40),
})

export async function salvarNomeAction(
  _prev: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const perfil = await getCurrentProfile()
  if (!perfil) return { error: 'Sessão expirada. Entre de novo.' }

  const parsed = esquemaNome.safeParse({ name: formData.get('name') })
  if (!parsed.success) {
    return { error: 'O nome precisa de 2–40 caracteres.' }
  }

  const supabase = await createClient()
  const { error } = await supabase
    .from('profiles')
    .update({ display_name: parsed.data.name })
    .eq('id', perfil.id)
  if (error) return { error: 'Não deu para salvar o nome.' }

  revalidatePath('/configuracoes')
  revalidatePath('/hoje')
  return { message: 'Nome salvo.' }
}

/**
 * Avatar: recebe o quadrado comprimido do cliente (canvas → webp, base64)
 * e sobe para o Storage em avatares/<uid>/<timestamp>.webp. Validação de
 * tamanho e tipo aqui, no servidor (o cliente valida também, mas o servidor
 * decide).
 */
const imagemAvatar = z.object({
  base64: z
    .string()
    .regex(/^data:image\/(webp|png|jpeg);base64,[A-Za-z0-9+/=]+$/),
})

export async function salvarAvatarAction(
  _prev: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const perfil = await getCurrentProfile()
  if (!perfil) return { error: 'Sessão expirada. Entre de novo.' }

  const parsed = imagemAvatar.safeParse({ base64: formData.get('base64') })
  if (!parsed.success) return { error: 'Formato de imagem inválido.' }

  const prefixo = parsed.data.base64.slice(0, 30)
  const mimetype =
    prefixo.includes('webp') ? 'image/webp'
      : prefixo.includes('png') ? 'image/png'
        : 'image/jpeg'
  const base64 = parsed.data.base64.split(',')[1]!
  if (Buffer.from(base64, 'base64').length > 512_000) {
    return { error: 'Imagem muito grande — tente outra mais levinha.' }
  }

  const admin = createAdminClient()
  const caminho = `${perfil.id}/${Date.now()}.webp`

  const { error } = await admin.storage.from('avatares').upload(caminho, Buffer.from(base64, 'base64'), {
    contentType: mimetype === 'image/webp' ? 'image/webp' : mimetype,
    cacheControl: '31536000',
    upsert: false,
  })
  if (error) {
    console.error('[avatar] upload:', error.message)
    return { error: 'Não deu para subir a foto. Tente de novo.' }
  }

  const { data } = await admin.storage.from('avatares').getPublicUrl(caminho)
  const supabase = await createClient()
  const { error: erroPerfil } = await supabase
    .from('profiles')
    .update({ avatar_url: data.publicUrl })
    .eq('id', perfil.id)
  if (erroPerfil) return { error: 'Foto subiu, mas não se ligou ao perfil.' }

  revalidatePath('/configuracoes')
  revalidatePath('/hoje')
  return { message: 'Foto atualizada.' }
}

const esquemaTema = z.object({
  theme_color: z.enum(['indigo', 'oceano', 'floresta', 'mel', 'grafeno', 'magenta']),
  theme_mode: z.enum(['claro', 'escuro', 'sistema']),
})

export async function salvarTemaAction(themeColor: string, themeMode: string): Promise<boolean> {
  const perfil = await getCurrentProfile()
  if (!perfil) return false

  const parsed = esquemaTema.safeParse({
    theme_color: themeColor,
    theme_mode: themeMode,
  })
  if (!parsed.success) return false

  const supabase = await createClient()
  const { error } = await supabase
    .from('profiles')
    .update(parsed.data)
    .eq('id', perfil.id)
  return !error
}

const esquemaLembrete = z.object({
  tipo: z.enum(['lembrete_diario', 'aviso_duo', 'frase_fe']),
  ativo: z.boolean(),
  hora: z.nullable(z.string().regex(/^\d{2}:\d{2}(:00)?$/)),
})

export async function salvarLembreteAction(
  tipo: string,
  ativo: boolean,
  hora: string | null,
): Promise<boolean> {
  const perfil = await getCurrentProfile()
  if (!perfil) return false

  const parsed = esquemaLembrete.safeParse({ tipo, ativo, hora })
  if (!parsed.success) return false

  const supabase = await createClient()
  // lembrete_diario exige hora; aviso_duo/frase_fe podem ignorar
  if (parsed.data.tipo === 'lembrete_diario' && !parsed.data.hora) return false

  const { error } = await supabase.from('reminders').upsert(
    {
      user_id: perfil.id,
      tipo: parsed.data.tipo,
      ativo: parsed.data.ativo,
      // aviso_duo e frase_fe ignoram hora — fica o padrão do banco
      ...(parsed.data.hora ? { hora_local: parsed.data.hora } : {}),
    },
    { onConflict: 'user_id,tipo' },
  )
  if (!error) revalidatePath('/configuracoes')
  return !error
}