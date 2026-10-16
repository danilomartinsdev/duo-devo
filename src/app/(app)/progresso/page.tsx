import { getCurrentProfile } from '@/lib/profile'
import { leiturasDaDupla } from '@/lib/leituras'
import { livrosDoNT } from '@/lib/livros'

export const metadata = { title: 'Progresso' }

export default async function ProgressoPage() {
  const perfil = await getCurrentProfile()
  if (!perfil) return null

  const { leituras } = await leiturasDaDupla(perfil)
  const minhas = leituras.filter((r) => r.user_id === perfil.id)
  const doParceiro = leituras.filter((r) => r.user_id !== perfil.id)
  const totalNT = livrosDoNT.reduce((n, l) => n + l.caps, 0)

  const diasVoce = new Set(minhas.map((r) => r.lido_em))
  const diasParceiro = new Set(doParceiro.map((r) => r.lido_em))
  const diasEmComum = [...diasVoce].filter((d) => diasParceiro.has(d)).length

  return (
    <section className="pt-4 pb-8">
      <h1 className="font-serif text-3xl">Progresso</h1>
      <p className="mt-1 text-sm text-ink-soft">
        Sem ranking, sem corrida. Cada livro é um passo do caminho.
      </p>

      <div className="mt-6 grid grid-cols-3 gap-2 text-center">
        <Dado valor={`${minhas.length}/${totalNT}`} rotulo="você" />
        <Dado valor={`${minhas.length + doParceiro.length}/${totalNT * 2}`} rotulo="a dupla" />
        <Dado valor={String(diasEmComum)} rotulo="dias juntos" />
      </div>

      <div className="mt-8 flex flex-col gap-2.5">
        {livrosDoNT.map((livro) => {
          const meus = minhas.filter((r) => r.livro === livro.slug).length
          const dele = doParceiro.filter((r) => r.livro === livro.slug).length
          return (
            <div key={livro.slug} className="flex items-center gap-3">
              <span className="w-28 shrink-0 text-sm">{livro.nome}</span>
              <div className="relative h-3 flex-1 overflow-hidden rounded-full bg-paper-soft">
                <div
                  className="h-full rounded-full bg-sage-400"
                  style={{ width: `${(meus / livro.caps) * 100}%` }}
                />
              </div>
              <span className="w-12 text-right text-xs text-ink-soft tabular-nums">
                {meus}/{livro.caps}
              </span>
              <span
                title={`o outro: ${dele}/${livro.caps}`}
                className={`size-2 shrink-0 rounded-full ${dele > 0 ? 'bg-clay-400' : 'bg-transparent border border-line'}`}
              />
            </div>
          )
        })}
      </div>

      <p className="mt-6 text-center text-xs text-ink-soft">
        <span className="inline-block size-2 rounded-full bg-sage-400 align-middle" /> você ·{' '}
        <span className="inline-block size-2 rounded-full bg-clay-400 align-middle" /> o outro
      </p>
    </section>
  )
}

function Dado({ valor, rotulo }: { valor: string; rotulo: string }) {
  return (
    <div className="rounded-2xl border border-line bg-paper-soft p-3">
      <p className="font-serif text-lg">{valor}</p>
      <p className="text-xs text-ink-soft">{rotulo}</p>
    </div>
  )
}