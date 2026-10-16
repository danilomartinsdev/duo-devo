import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getCurrentProfile } from '@/lib/profile'
import { createClient } from '@/lib/supabase/server'
import { FormComentario } from '@/components/oracao/form-comentario'
import { BotaoRespondido } from '@/components/oracao/botao-respondido'

type Pedido = {
  id: number
  pedido: string
  respondido: boolean
  compartilhar: boolean
  user_id: string
  created_at: string
}

type Comentario = {
  id: number
  user_id: string
  comentario: string
  created_at: string
}

export default async function OracaoDetalhe({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const perfil = await getCurrentProfile()
  if (!perfil) return null

  const supabase = await createClient()
  const { data: pedidoRow } = await supabase
    .from('prayers')
    .select('id, pedido, respondido, compartilhar, user_id, created_at')
    .eq('id', Number(id))
    .maybeSingle()
  if (!pedidoRow) notFound()
  const pedido = pedidoRow as Pedido

  const { data: comentariosRows } = await supabase
    .from('prayer_comments')
    .select('id, user_id, comentario, created_at')
    .eq('prayer_id', pedido.id)
    .order('created_at')
  const comentarios = (comentariosRows ?? []) as Comentario[]

  const { data: nomesRows } = await supabase.from('profiles').select('id, display_name')
  const nomes = new Map((nomesRows ?? []).map((n) => [n.id, n.display_name as string]))

  return (
    <section className="pt-4 pb-8">
      <Link href="/oracao" className="text-sm text-muted">← oração</Link>

      <div className="mt-4 rounded-3xl border border-line bg-surface p-5 sombra">
        <p className="text-xs text-muted">
          {pedido.user_id === perfil.id ? 'seu pedido' : (nomes.get(pedido.user_id) ?? 'do par')}
          {' · '}
          {new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short' })
            .format(new Date(pedido.created_at))}
        </p>
        <p className="mt-2 text-[17px] leading-relaxed">{pedido.pedido}</p>

        {pedido.user_id === perfil.id && (
          <div className="mt-3">
            <BotaoRespondido id={pedido.id} respondido={pedido.respondido} />
          </div>
        )}
      </div>

      <h2 className="mt-8 mb-3 text-xs font-medium uppercase tracking-widest text-muted">
        conversa ({comentarios.length})
      </h2>
      <div className="flex flex-col gap-3">
        {comentarios.length === 0 ? (
          <p className="text-sm text-muted">Ninguém comentou ainda.</p>
        ) : comentarios.map((c) => (
          <div key={c.id} className="rounded-3xl border border-line bg-surface p-4">
            <p className="text-xs text-muted">
              {c.user_id === perfil.id ? 'você' : (nomes.get(c.user_id) ?? '?')}
              {' · '}
              {new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short' })
                .format(new Date(c.created_at))}
            </p>
            <p className="mt-1 text-sm leading-relaxed">{c.comentario}</p>
          </div>
        ))}
        <FormComentario prayerId={pedido.id} />
      </div>
    </section>
  )
}