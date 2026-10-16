import { livrosDoNT, type Livro } from '@/lib/livros'
import { diasEntre } from '@/lib/datas'

export type PlanoKey = 'nt-90' | 'nt-180' | 'evangelhos-primeiro'

export type PlanoInfo = {
  key: PlanoKey
  nome: string
  descricao: string
  meta_default: number
}

export const PLANOS: PlanoInfo[] = [
  {
    key: 'nt-180',
    nome: 'Novo Testamento em 180 dias',
    descricao: 'Um ou dois capítulos por dia, calmo e constante.',
    meta_default: 1,
  },
  {
    key: 'nt-90',
    nome: 'Novo Testamento em 90 dias',
    descricao: 'Três capítulos por dia — para quem quer urgência leve.',
    meta_default: 3,
  },
  {
    key: 'evangelhos-primeiro',
    nome: 'Evangelhos primeiro',
    descricao: 'Começa por Mateus, Marcos, Lucas e João, depois segue o NT.',
    meta_default: 1,
  },
]

export type CapituloRef = { livro: string; nome: string; cap: number }

/** Lista plana de capítulos do plano, na ordem certa. */
export function listaDeCapitulos(plano: PlanoKey): CapituloRef[] {
  const ordem: Livro[] =
    plano === 'evangelhos-primeiro'
      ? [...livrosDoNT.slice(0, 4), ...livrosDoNT.slice(4)]
      : livrosDoNT

  return ordem.flatMap((l) =>
    Array.from({ length: l.caps }, (_, i) => ({
      livro: l.slug,
      nome: l.nome,
      cap: i + 1,
    })),
  )
}


/**
 * Capítulos "vencidos" para o dia de hoje, com base na data de início
 * e na meta diária. O índice do dia = dias corridos desde o início —
 * atrasar um dia não trava nada: o próximo dia simplesmente não está lido.
 */
export function capitulosDoDia(
  plano: PlanoKey,
  metaDiaria: number,
  startedOn: string,
  hoje: string,
): CapituloRef[] {
  const lista = listaDeCapitulos(plano)
  const dia = diasEntre(hoje, startedOn)
  if (dia < 0) return [] // começou no futuro? nada para hoje

  const inicio = dia * metaDiaria
  if (inicio >= lista.length) return [] // plano concluído

  return lista.slice(inicio, inicio + metaDiaria)
}

export type PlanoEstado = {
  concluido: boolean
  capituloMaisAntigoNaoLido: CapituloRef | null
  totalCapitulos: number
  lidos: number
  esperadosHoje: number // capítulos "vencidos" até hoje, pela meta (teto: total)
}

export function statusPlano(
  plano: PlanoKey,
  metaDiaria: number,
  startedOn: string,
  hoje: string,
  lidas: { livro: string; cap: number }[],
): PlanoEstado {
  const lista = listaDeCapitulos(plano)
  const lidasSet = new Set(lidas.map((r) => `${r.livro}/${r.cap}`))

  const pendente = lista.find((c) => !lidasSet.has(`${c.livro}/${c.cap}`)) ?? null
  const dia = Math.max(0, diasEntre(hoje, startedOn))
  const esperados = Math.min((dia + 1) * metaDiaria, lista.length)

  return {
    concluido: lidasSet.size >= lista.length,
    capituloMaisAntigoNaoLido: pendente,
    totalCapitulos: lista.length,
    lidos: lidasSet.size,
    esperadosHoje: esperados,
  }
}