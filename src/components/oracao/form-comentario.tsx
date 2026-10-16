'use client'

import { useActionState } from 'react'
import { comentarOracaoAction } from '@/app/actions/oracao'
import type { AuthActionState } from '@/lib/action-state'

const init: AuthActionState = {}

export function FormComentario({ prayerId }: { prayerId: number }) {
  const [state, action, pending] = useActionState(comentarOracaoAction, init)

  return (
    <form action={action} className="mt-4 flex flex-col gap-2">
      <input type="hidden" name="prayer_id" value={prayerId} />
      <textarea
        name="comentario"
        rows={2}
        maxLength={280}
        placeholder="Escreva algo do coração..."
        required
        className="rounded-2xl border border-line bg-surface px-4 py-3 text-sm outline-none focus:border-accent"
      />
      {state.error ? (
        <p role="alert" className="text-sm text-alert">{state.error}</p>
      ) : null}
      <button
        type="submit"
        disabled={pending}
        className="touch-target presiona self-end rounded-full bg-accent px-5 py-2 text-sm font-semibold text-white disabled:opacity-40"
      >
        {pending ? 'Enviando…' : 'Comentar'}
      </button>
    </form>
  )
}