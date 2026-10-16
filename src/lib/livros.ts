import livrosJson from '../../public/biblia/livros.json'

/** Índice dos 66 livros da Bíblia — seguro no cliente (JSON estático). */
export type Livro = {
  slug: string
  nome: string
  caps: number
  testamento: 'antigo' | 'novo'
}

export const livrosDaBiblia: Livro[] = livrosJson as Livro[]
export const livrosDoNT: Livro[] = livrosDaBiblia.filter((l) => l.testamento === 'novo')

export function livroPorSlug(slug: string): Livro | null {
  return livrosDaBiblia.find((l) => l.slug === slug) ?? null
}

/** Capítulo seguinte na ordem canônica da Bíblia toda. */
export function proximoCapitulo(slug: string, num: number): { livro: string; cap: number } | null {
  const i = livrosDaBiblia.findIndex((l) => l.slug === slug)
  if (i === -1) return null
  const livro = livrosDaBiblia[i]!
  if (num < livro.caps) return { livro: slug, cap: num + 1 }
  const proximo = livrosDaBiblia[i + 1]
  if (!proximo) return null // fim da Biblia
  return { livro: proximo.slug, cap: 1 }
}

/** Nomes curtos para mostrar em listas (ex.: "1ª Coríntios" → "1ª Cor."). */
export function nomeCurtoLivro(slug: string): string {
  const nome = livroPorSlug(slug)?.nome ?? slug
  return nome
    .replace('Atos dos Apóstolos', 'Atos')
    .replace('Apocalipse', 'Apocalipse')
    .replace('tessalonicenses', 'Tess.')
    .replace('timoteo', 'Tim.')
    .replace('corintios', 'Cor.')
    .replace('cronicas', 'Crô.')
    .replace('samuel', 'Sam.')
    .replace('reis', 'Reis')
    .replace('deuteronomio', 'Deut.')
    .replace('eclesiastes', 'Ecl.')
    .replace('proverbios', 'Pv.')
}