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
      <p className="animated-pulse rounded-2xl bg-accent-soft p-5 text-center text-accent-strong" role="status">
        Pronto! Preparando a leitura de hoje…
      </p>
    )
  }

  return (
    <form action={action} className="flex flex-col gap-4">
      <h2 className="font-display text-2xl">Escolha um plano</h2>
      <p className="-mt-2 text-sm text-muted">
        Nenhum é melhor que outro. Vocês podem trocar depois, sem drama.
      </p>

      <fieldset className="flex flex-col gap-2">
        <legend className="sr-only">Plano de leitura</legend>
        {PLANOS.map((p) => (
          <label
            key={p.key}
            className={`flex cursor-pointer items-start gap-3 rounded-2xl border p-4 transition-colors ${
              plano === p.key ? 'border-accent bg-accent-soft/60' : 'border-line bg-surface'
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
              className="mt-1 size-4 accent-[var(--color-accent)]"
            />
            <span>
              <span className="font-medium">{p.nome}</span>
              <span className="block text-sm text-muted">{p.descricao}</span>
            </span>
          </label>
        ))}
      </fieldset>

      <label className="text-sm">
        <span className="text-muted">capítulos por dia (pode trocar sempre que quiser)</span>
        <select
          name="meta_diaria"
          value={meta}
          onChange={(e) => setMeta(Number(e.target.value))}
          className="touch-target mt-1.5 w-full rounded-xl border border-line bg-surface px-4"
        >
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <option key={n} value={n}>
              {n} {n === 1 ? 'capítulo' : 'capítulos'} por dia
            </option>
          ))}
        </select>
      </label>

      {state.error ? (
        <p role="alert" className="text-sm text-alert">{state.error}</p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="touch-target presiona rounded-full bg-accent px-6 py-3 font-semibold text-white shadow-[0_10px_24px_-10px_rgb(99_102_241_0.55)] disabled:opacity-50"
      >
        {pending ? 'Preparando…' : 'Começar'}
      </button>
    </form>
  )
}