import Link from 'next/link'
import { getCurrentProfile } from '@/lib/profile'
import { leiturasDaDupla } from '@/lib/leituras'
import { livrosDaBiblia, livrosDoNT } from '@/lib/livros'

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
      <h1 className="font-display text-3xl">Progresso</h1>
      <p className="mt-1 text-sm text-muted">
        Sem ranking, sem corrida. Cada livro é um passo do caminho.
      </p>

      <div className="mt-6 grid grid-cols-3 gap-2 text-center">
        <Dado valor={`${minhas.length}/${totalNT}`} rotulo="você (NT)" />
        <Dado valor={`${minhas.length + doParceiro.length}/${totalNT * 2}`} rotulo="a dupla" />
        <Dado valor={String(diasEmComum)} rotulo="dias juntos" />
      </div>

      <p className="mt-8 mb-3 text-xs font-medium uppercase tracking-widest text-muted">
        Devocional · Novo Testamento
      </p>
      <div className="flex flex-col gap-2.5">
        {livrosDoNT.map((livro) => (
          <LinhaLivro
            key={livro.slug}
            livro={livro}
            meus={minhas}
            doParceiro={doParceiro}
          />
        ))}
      </div>

      <details className="mt-8 group">
        <summary className="cursor-pointer list-none text-sm text-muted touch-target flex items-center gap-2">
          <span className="text-accent group-open:rotate-90 transition-transform">▸</span>
          Antigo Testamento completo (leitura livre)
        </summary>
        <div className="mt-3 flex flex-col gap-2.5">
          {livrosDaBiblia
            .filter((l) => l.testamento === 'antigo')
            .map((livro) => (
              <LinhaLivro
                key={livro.slug}
                livro={livro}
                meus={minhas}
                doParceiro={doParceiro}
              />
            ))}
        </div>
      </details>

      <p className="mt-6 text-center text-xs text-muted">
        <span className="inline-block size-2 rounded-full bg-accent align-middle" /> você ·{' '}
        <span className="inline-block size-2 rounded-full bg-amber-400 align-middle" /> o outro
      </p>
    </section>
  )
}

function LinhaLivro({
  livro,
  meus,
  doParceiro,
}: {
  livro: { slug: string; nome: string; caps: number }
  meus: { livro: string; capitulo: number }[]
  doParceiro: { livro: string; capitulo: number }[]
}) {
  const meusCaps = meus.filter((r) => r.livro === livro.slug).length
  const deleCaps = doParceiro.filter((r) => r.livro === livro.slug).length

  return (
    <Link
      href={`/leitura/${livro.slug}/1`}
      className="flex items-center gap-3 active:opacity-70"
    >
      <span className="w-28 shrink-0 text-sm">{livro.nome}</span>
      <div className="relative h-3 flex-1 overflow-hidden rounded-full bg-card border border-line">
        <div
          className="h-full rounded-full bg-accent"
          style={{ width: `${(meusCaps / livro.caps) * 100}%` }}
        />
      </div>
      <span className="w-12 text-right text-xs text-muted tabular-nums">
        {meusCaps}/{livro.caps}
      </span>
      <span
        title={`o outro: ${deleCaps}/${livro.caps}`}
        className={`size-2 shrink-0 rounded-full ${deleCaps > 0 ? 'bg-amber-400' : 'bg-transparent border border-line'}`}
      />
    </Link>
  )
}

function Dado({ valor, rotulo }: { valor: string; rotulo: string }) {
  return (
    <div className="rounded-2xl border border-line bg-surface p-3">
      <p className="font-display text-lg">{valor}</p>
      <p className="text-xs text-muted">{rotulo}</p>
    </div>
  )
}