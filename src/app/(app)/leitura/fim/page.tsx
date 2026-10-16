import { capitulo } from '@/lib/biblia'
import { hojeISO } from '@/lib/datas'
import { getCurrentProfile } from '@/lib/profile'
import { FormHumor } from '@/components/leitura/form-humor'

export const metadata = { title: 'Encerrando a leitura' }

export default async function FimPage({
  searchParams,
}: {
  searchParams: Promise<{ livro?: string; cap?: string }>
}) {
  const { livro = 'mateus', cap = '1' } = await searchParams
  const dados = capitulo(livro, Number(cap))
  const perfil = await getCurrentProfile()
  const hoje = perfil ? hojeISO(perfil.timezone) : hojeISO()

  return (
    <section className="pt-10">
      <div className="text-center">
        <span aria-hidden className="text-4xl">🕊</span>
        <h1 className="mt-3 font-display text-3xl">
          {dados ? `${dados.livroNome} ${cap}` : 'Capítulo lido'}
        </h1>
        <p className="mt-2 text-sm text-muted">
          Semeado hoje. Que continue germinando no resto do dia.
        </p>
      </div>

      <div className="mt-10">
        <FormHumor lidoEm={hoje} />
      </div>
    </section>
  )
}