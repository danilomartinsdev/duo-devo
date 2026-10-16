/** Jardim e sequência da dupla — tudo derivado das leituras (fase 4). */

export type Jardim = {
  estagio: number // 0..5
  nome: string
  sequencia: number // dias consecutivos em que os DOIS leram (com tolerância)
}

const NOME_ESTAGIOS = ['Semente', 'Broto', 'Muda', 'Copa nova', 'Árvore forte', 'Bosque']

/** Cada 5 dias lidos em comum, o jardim muda de estágio (sem teto). */
export function calculeJardim(
  diasVoce: Set<string>,
  diasParceiro: Set<string>,
  hoje: string,
): Jardim {
  const diasEmComum = [...diasVoce].filter((d) => diasParceiro.has(d))
  const estagio = Math.min(5, Math.floor(diasEmComum.length / 5))

  // sequência da dupla: quantos dias consecutivos terminando hoje (ou ontem,
  // para não punir "ainda não li hoje") em que os DOIS leram
  let sequencia = 0
  const limite = new Date(Date.parse(`${hoje}T12:00:00Z`) - 1000 * 86_400_000)
  let dia = limite.toISOString().slice(0, 10)
  for (let i = 0; i < 400; i++) {
    const osDoisLeram = diasVoce.has(dia) && diasParceiro.has(dia)
    if (osDoisLeram) {
      sequencia += 1
    } else {
      break
    }
    dia = new Date(Date.parse(`${dia}T12:00:00Z`) - 86_400_000).toISOString().slice(0, 10)
  }

  return { estagio, nome: NOME_ESTAGIOS[estagio]!, sequencia }
}