import 'server-only'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { livroPorSlug } from '@/lib/livros'

const cacheCapitulos = new Map<string, string[]>()

/** Texto dos versículos do capítulo (lê de public/biblia — só no servidor). */
export function capitulo(slug: string, num: number): { livroNome: string; versos: string[] } | null {
  const livro = livroPorSlug(slug)
  if (!livro || num < 1 || num > livro.caps) return null

  const chave = `${slug}/${num}`
  let versos = cacheCapitulos.get(chave)
  if (!versos) {
    const arquivo = join(
      process.cwd(),
      'public',
      'biblia',
      slug,
      `${String(num).padStart(3, '0')}.json`,
    )
    try {
      versos = JSON.parse(readFileSync(arquivo, 'utf-8')) as string[]
    } catch {
      return null
    }
    cacheCapitulos.set(chave, versos)
  }
  return { livroNome: livro.nome, versos }
}