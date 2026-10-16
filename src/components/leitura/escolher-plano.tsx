'use client'

import { useActionState, useState } from 'react'
import { iniciarPlanoAction } from '@/app/actions/leitura'
import { PLANOS, type PlanoKey } from '@/lib/plano'
import type { AuthActionState } from '@/lib/action-state'

const init: AuthActionState = {}

export function EscolherPlano() {
  const [plano, setPlano] = useState<PlanoKey>('nt-180')
  const [meta, setMeta] = useState(1)
  const [state, action, pending] = useActionState(iniciarPlanoAction, init)

  if (state.message === 'ok') {
    return (
      <p className="animated-pulse rounded-2xl bg-sage-100 p-5 text-center text-sage-700" role="status">
        Pronto! Preparando a leitura de hoje…
      </p>
    )
  }

  return (
    <form action={action} className="flex flex-col gap-4">
      <h2 className="font-serif text-2xl">Escolha um plano</h2>
      <p className="-mt-2 text-sm text-ink-soft">
        Nenhum é melhor que outro. Vocês podem trocar depois, sem drama.
      </p>

      <fieldset className="flex flex-col gap-2">
        <legend className="sr-only">Plano de leitura</legend>
        {PLANOS.map((p) => (
          <label
            key={p.key}
            className={`flex cursor-pointer items-start gap-3 rounded-2xl border p-4 transition-colors ${
              plano === p.key ? 'border-sage-600 bg-sage-100/60' : 'border-line bg-paper'
            }`}
          >
            <input
              type="radio"
              name="plano"
              value={p.key}
              checked={plano === p.key}
              onChange={() => {
                setPlano(p.key)
                setMeta(p.meta_default)
              }}
              className="mt-1 size-4 accent-[var(--color-sage-600)]"
            />
            <span>
              <span className="font-medium">{p.nome}</span>
              <span className="block text-sm text-ink-soft">{p.descricao}</span>
            </span>
          </label>
        ))}
      </fieldset>

      <label className="text-sm">
        <span className="text-ink-soft">capítulos por dia (pode trocar sempre que quiser)</span>
        <select
          name="meta_diaria"
          value={meta}
          onChange={(e) => setMeta(Number(e.target.value))}
          className="touch-target mt-1.5 w-full rounded-xl border border-line bg-paper px-4"
        >
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <option key={n} value={n}>
              {n} {n === 1 ? 'capítulo' : 'capítulos'} por dia
            </option>
          ))}
        </select>
      </label>

      {state.error ? (
        <p role="alert" className="text-sm text-clay-600">{state.error}</p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="touch-target rounded-full bg-sage-600 px-6 font-medium text-white disabled:opacity-50"
      >
        {pending ? 'Preparando…' : 'Começar'}
      </button>
    </form>
  )
}