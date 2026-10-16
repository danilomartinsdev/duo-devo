'use client'

import { useActionState } from 'react'
import { criarOracaoAction } from '@/app/actions/oracao'
import type { AuthActionState } from '@/lib/action-state'

const init: AuthActionState = {}

export function FormPedido() {
  const [state, action, pending] = useActionState(criarOracaoAction, init)
  return (
    <form action={action} className="flex flex-col gap-3">
      <textarea
        name="pedido"
        rows={3}
        maxLength={500}
        placeholder="Escreva o pedido do jeito que sair..."
        required
        className="rounded-2xl border border-line bg-surface px-4 py-3 text-base outline-none focus:border-accent"
      />
      <label className="flex items-center justify-between text-sm">
        <span className="text-muted">Compartilhar com o par</span>
        <input
          type="checkbox"
          name="compartilhar"
          className="size-5 accent-[var(--c-accent)]"
        />
      </label>
      {state.error ? (
        <p role="alert" className="text-sm text-alert">{state.error}</p>
      ) : null}
      <button
        type="submit"
        disabled={pending}
        className="touch-target presiona rounded-full bg-accent px-6 py-3 font-semibold text-white disabled:opacity-40"
      >
        {pending ? 'Guardando…' : 'Levar ao altar'}
      </button>
    </form>
  )
}