import 'server-only'
import { createClient } from '@/lib/supabase/server'
import { hojeISO } from '@/lib/datas'
import { capitulosDoDia, type CapituloRef, type PlanoKey } from '@/lib/plano'
import type { Profile } from '@/lib/types'

export type Leitura = { user_id: string; livro: string; capitulo: number; lido_em: string }

export type EstadoHoje = {
  hoje: string
  plano: { plano: PlanoKey; meta_diaria: number; started_on: string } | null
  capitulosHoje: CapituloRef[]
  lidosSet: Set<string> // "livro/cap" já lidos (qualquer dia)
  lidosHoje: Set<string> // lidos hoje de fato
  diasMeus: Set<string>
  diasParceiro: Set<string>
  parceiro: { id: string; nome: string } | null
  lidosParceiroHoje: number
  diasEmComum: number
  totais: { voce: number; parceiro: number }
}

async function parceiroIdDo(perfil: Profile): Promise<string | null> {
  const supabase = await createClient()
  const { data } = await supabase.from('duo_members').select('user_id')
  return data?.find((m) => m.user_id !== perfil.id)?.user_id ?? null
}

/** Tudo que a tela "Hoje" precisa, em poucas queries. */
export async function estadoHoje(perfil: Profile): Promise<EstadoHoje> {
  const supabase = await createClient()
  const hoje = hojeISO(perfil.timezone)

  const planoRow = await supabase
    .from('user_plans')
    .select('plano, meta_diaria, started_on')
    .eq('user_id', perfil.id)
    .maybeSingle()

  const parceiroId = await parceiroIdDo(perfil)
  const ids = [perfil.id, ...(parceiroId ? [parceiroId] : [])]

  const [parceiroPerfilRow, leiturasRows] = await Promise.all([
    parceiroId
      ? supabase.from('profiles').select('display_name').eq('id', parceiroId).single()
      : Promise.resolve(null),
    supabase
      .from('readings')
      .select('user_id, livro, capitulo, lido_em')
      .in('user_id', ids),
  ])

  const leituras = (leiturasRows.data ?? []) as Leitura[]
  const minhas = leituras.filter((r) => r.user_id === perfil.id)
  const doParceiro = leituras.filter((r) => r.user_id !== perfil.id)

  const plano = planoRow.data
    ? {
        plano: planoRow.data.plano as PlanoKey,
        meta_diaria: planoRow.data.meta_diaria as number,
        started_on: planoRow.data.started_on as string,
      }
    : null

  const diasVoce = new Set(minhas.map((r) => r.lido_em))
  const diasParceiro = new Set(doParceiro.map((r) => r.lido_em))
  const diasEmComum = [...diasVoce].filter((d) => diasParceiro.has(d)).length

  return {
    hoje,
    plano,
    capitulosHoje: plano
      ? capitulosDoDia(plano.plano, plano.meta_diaria, plano.started_on, hoje)
      : [],
    lidosSet: new Set(minhas.map((r) => `${r.livro}/${r.capitulo}`)),
    lidosHoje: new Set(
      minhas.filter((r) => r.lido_em === hoje).map((r) => `${r.livro}/${r.capitulo}`),
    ),
    diasMeus: diasVoce,
    diasParceiro,
    parceiro: parceiroId
      ? { id: parceiroId, nome: ((parceiroPerfilRow?.data as { display_name?: string } | null)?.display_name ?? '?') }
      : null,
    lidosParceiroHoje: doParceiro.filter((r) => r.lido_em === hoje).length,
    diasEmComum,
    totais: { voce: minhas.length, parceiro: doParceiro.length },
  }
}

/** Leituras dos dois (para a tela de progresso). */
export async function leiturasDaDupla(perfil: Profile) {
  const supabase = await createClient()
  const parceiroId = await parceiroIdDo(perfil)
  const ids = [perfil.id, ...(parceiroId ? [parceiroId] : [])]

  const { data } = await supabase
    .from('readings')
    .select('user_id, livro, capitulo, lido_em')
    .in('user_id', ids)

  return {
    parceiroId,
    leituras: (data ?? []) as Leitura[],
  }
}