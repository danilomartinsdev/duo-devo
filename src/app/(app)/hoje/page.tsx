import Link from 'next/link'
import { getCurrentProfile } from '@/lib/profile'
import { estadoHoje } from '@/lib/leituras'
import { formatarDia } from '@/lib/datas'
import { EscolherPlano } from '@/components/leitura/escolher-plano'

export const metadata = { title: 'Hoje' }

export default async function HojePage() {
  const perfil = await getCurrentProfile()
  if (!perfil) return null

  const estado = await estadoHoje(perfil)

  return (
    <section className="pt-4">
      <p className="text-xs uppercase tracking-widest text-muted">
        {formatarDia(estado.hoje, perfil.timezone)}
      </p>
      <h1 className="mt-1 font-display text-3xl">
        {saudacao()}, {inicial(perfil.display_name)}
      </h1>

      {!estado.plano ? (
        <div className="mt-10">
          <EscolherPlano />
        </div>
      ) : (
        <CartaoHoje estado={estado} perfilId={perfil.id} />
      )}
    </section>
  )
}

function CartaoHoje({ estado, perfilId }: { estado: Awaited<ReturnType<typeof estadoHoje>>; perfilId: string }) {
  const lidosDeHoje = estado.capitulosHoje.filter((c) =>
    estado.lidosSet.has(`${c.livro}/${c.cap}`),
  )
  const faltam = estado.capitulosHoje.filter(
    (c) => !estado.lidosSet.has(`${c.livro}/${c.cap}`),
  )
  const proximo = faltam[0] ?? lidosDeHoje[0] ?? null

  return (
    <div className="mt-8 flex flex-col gap-5">
      {estado.capitulosHoje.length === 0 ? (
        <div className="rounded-3xl border border-line bg-card p-6 text-center">
          <span aria-hidden className="text-4xl">🌿</span>
          <p className="mt-2 font-display text-xl">Plano concluído</p>
          <p className="mt-1 text-sm text-muted">
            O NT inteiro no seu ritmo. Escolha um plano novo ou só releia o que
            te marcou.
          </p>
        </div>
      ) : (
        <Link
          href={proximo ? `/leitura/${proximo.livro}/${proximo.cap}` : '/'}
          className="rounded-3xl border border-line bg-card p-6 transition-transform active:scale-[0.99]"
        >
          <p className="text-xs tracking-widest text-muted">
            {lidosDeHoje.length === 0
              ? 'LEITURA DE HOJE'
              : faltam.length === 0
                ? 'HOJE ESTÁ FEITO 🌱'
                : 'CONTINUA HOJE'}
          </p>
          <p className="mt-2 font-display text-2xl leading-snug">
            {estado.capitulosHoje.map((c, i) => (
              <span key={`${c.livro}/${c.cap}`}>
                {i > 0 ? ' · ' : ''}
                {c.nome} {c.cap}
              </span>
            ))}
          </p>
          <p className="mt-3 text-sm text-accent-strong">
            {faltam.length > 0
              ? `Abrir ${faltam.length > 1 ? `${faltam[0]!.nome} ${faltam[0]!.cap}` : 'capítulo'} →`
              : 'Ler de novo, ou guardar pro dia'}
          </p>
        </Link>
      )}

      {estado.parceiro ? (
        <CartaoParceiro estado={estado} />
      ) : (
        <p className="rounded-2xl border border-dashed border-line px-4 py-3 text-center text-sm text-muted">
          A dupla ainda não foi formada no banco — rode o SQL "Criar a dupla"
          quando os dois estiverem cadastrados.
        </p>
      )}

      <MetaHoje total={estado.totais.voce + estado.totais.parceiro} />
    </div>
  )
}

function CartaoParceiro({ estado }: { estado: Awaited<ReturnType<typeof estadoHoje>> }) {
  const nome = estado.parceiro?.nome ?? 'seu par'
  const leu = estado.lidosParceiroHoje > 0

  return (
    <div className="rounded-3xl bg-accent-soft/70 p-5">
      {leu ? (
        <p className="text-sm">
          🌱 <strong>{nome}</strong> já semeou hoje — {estado.lidosParceiroHoje}{' '}
          {estado.lidosParceiroHoje === 1 ? 'capítulo' : 'capítulos'}. Fica bonito ver.
        </p>
      ) : (
        <p className="text-sm">
          🕊 <strong>{nome}</strong> ainda não leu hoje. Nada de pressa — a
          mensagem de incentivo chega na fase de notificações.
        </p>
      )}
      {estado.diasEmComum > 0 ? (
        <p className="mt-2 text-xs text-muted">
          Vocês já leram no mesmo dia {estado.diasEmComum}{' '}
          {estado.diasEmComum === 1 ? 'vez' : 'vezes'}.
        </p>
      ) : null}
    </div>
  )
}

function MetaHoje({ total }: { total: number }) {
  return (
    <p className="text-center text-xs text-muted">
      {total === 0
        ? 'O primeiro capítulo é o mais difícil — depois flui.'
        : `${total} ${total === 1 ? 'capítulo semeado' : 'capítulos semeados'} pela dupla até agora.`}
    </p>
  )
}

function saudacao(): string {
  const hora = new Date().getHours()
  if (hora < 5) return 'Boa madrugada'
  if (hora < 12) return 'Bom dia'
  if (hora < 18) return 'Boa tarde'
  return 'Boa noite'
}

function inicial(nome: string): string {
  return nome.trim() || 'você'
}