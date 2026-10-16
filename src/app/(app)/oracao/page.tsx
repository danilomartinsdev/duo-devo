import Link from 'next/link'
import { getCurrentProfile } from '@/lib/profile'
import { createClient } from '@/lib/supabase/server'
import { FormPedido } from '@/components/oracao/form-pedido'
import { BotaoRespondido } from '@/components/oracao/botao-respondido'

export const metadata = { title: 'Oração' }

type Pedido = {
  id: number
  pedido: string
  respondido: boolean
  compartilhar: boolean
  user_id: string
  created_at: string
}

export default async function OracaoPage() {
  const perfil = await getCurrentProfile()
  if (!perfil) return null

  const supabase = await createClient()
  const { data: pedidos } = await supabase
    .from('prayers')
    .select('id, pedido, respondido, compartilhar, user_id, created_at')
    .order('created_at', { ascending: false })

  const lista = (pedidos ?? []) as Pedido[]
  const nomes = new Map<string, string>()
  // perfis são legíveis entre membros da app
  { const { data } = await supabase.from('profiles').select('id, display_name')
    for (const p of data ?? []) nomes.set(p.id, p.display_name)
  }

  return (
    <section className="pt-4 pb-8">
      <h1 className="font-display text-[34px] leading-[1.12]">Oração</h1>
      <p className="mt-1 text-sm text-muted">
        Pedidos guardados com você. Só vão ao par os que você compartilhar.
      </p>

      <div className="mt-6 rounded-3xl border border-line bg-surface p-5 sombra">
        <p className="mb-3 text-xs font-medium uppercase tracking-widest text-muted">novo pedido</p>
        <FormPedido />
      </div>

      <div className="mt-8 flex flex-col gap-3">
        {lista.length === 0 ? (
          <p className="rounded-3xl border border-dashed border-line p-6 text-center text-sm text-muted">
            Ainda não há pedidos guardados.
          </p>
        ) : lista.map((p) => (
          <Link
            key={p.id}
            href={`/oracao/${p.id}`}
            className="block rounded-3xl border border-line bg-surface p-5 sombra presiona"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs text-muted">
                {p.user_id === perfil.id ? 'seu pedido' : (nomes.get(p.user_id) ?? 'do par')}
                {p.compartilhar ? ' · com o par' : ' · privado'}
              </span>
              {p.respondido ? (
                <span className="rounded-full bg-accent-soft px-2 py-0.5 text-[10px] font-medium text-accent-strong">
                  respondido ✓
                </span>
              ) : null}
            </div>
            <p className="mt-2 text-[15px] leading-relaxed">{p.pedido}</p>
            {p.user_id === perfil.id ? (
              <div className="mt-3" onClick={(e) => e.preventDefault()}>
                <BotaoRespondido id={p.id} respondido={p.respondido} />
              </div>
            ) : null}
          </Link>
        ))}
      </div>
    </section>
  )
}