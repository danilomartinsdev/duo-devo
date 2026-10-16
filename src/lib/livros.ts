import livrosJson from '../../public/biblia/livros.json'

/** Índice dos 27 livros do NT — seguro no cliente (JSON estático). */
export type Livro = {
  slug: string
  nome: string
  caps: number
}

export const livrosDoNT: Livro[] = livrosJson

export function livroPorSlug(slug: string): Livro | null {
  return livrosDoNT.find((l) => l.slug === slug) ?? null
}

/** Capítulo seguinte na ordem canônica do NT. */
export function proximoCapitulo(slug: string, num: number): { livro: string; cap: number } | null {
  const i = livrosDoNT.findIndex((l) => l.slug === slug)
  if (i === -1) return null
  const livro = livrosDoNT[i]!
  if (num < livro.caps) return { livro: slug, cap: num + 1 }
  const proximo = livrosDoNT[i + 1]
  if (!proximo) return null // Apocalipse 22: fim do NT
  return { livro: proximo.slug, cap: 1 }
}