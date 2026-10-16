'use client'

import { useActionState, useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { salvarHumorAction } from '@/app/actions/leitura'
import type { AuthActionState } from '@/lib/action-state'

const EMOTES = [
  { emoji: '😌', label: 'em paz' },
  { emoji: '🌼', label: 'leve' },
  { emoji: '🤲', label: 'grato(a)' },
  { emoji: '🌩', label: 'difícil' },
  { emoji: '🤔', label: 'pensando' },
]
const init: AuthActionState = {}

export function FormHumor({ lidoEm }: { lidoEm: string }) {
  const router = useRouter()
  const [emoji, setEmoji] = useState<string | null>(null)
  const [compartilhar, setCompartilhar] = useState(false)
  const [state, action, pending] = useActionState(salvarHumorAction, init)

  useEffect(() => {
    if (state.message === 'ok') router.push('/hoje')
  }, [state, router])

  if (state.message === 'ok') return null

  return (
    <form action={action} className="flex flex-col gap-5">
      <input type="hidden" name="lido_em" value={lidoEm} />

      <fieldset>
        <legend className="mb-2 text-sm text-ink-soft">
          Como o capítulo te deixou? (opcional)
        </legend>
        <div className="flex flex-wrap justify-center gap-2">
          {EMOTES.map((e) => (
            <button
              key={e.emoji}
              type="button"
              aria-pressed={emoji === e.emoji}
              onClick={() => setEmoji(e.emoji)}
              className={`flex h-14 w-14 items-center justify-center rounded-full text-2xl border transition-all ${
                emoji === e.emoji
                  ? 'border-sage-600 bg-sage-100 scale-105'
                  : 'border-line bg-paper'
              }`}
            >
              <span aria-hidden>{e.emoji}</span>
              <span className="sr-only">{e.label}</span>
            </button>
          ))}
        </div>
        <input type="hidden" name="emoji" value={emoji ?? ''} />
      </fieldset>

      <label className="flex flex-col gap-1.5 text-sm">
        <span className="text-ink-soft">uma nota curta (opcional)</span>
        <textarea
          name="nota"
          rows={3}
          maxLength={280}
          className="rounded-xl border border-line bg-paper px-4 py-3 text-base outline-none focus:border-sage-400"
        />
      </label>

      <label className="flex items-center justify-between rounded-2xl border border-line px-4 py-3">
        <span className="text-sm">Compartilhar este registro com o outro</span>
        <input
          type="checkbox"
          name="compartilhar"
          checked={compartilhar}
          onChange={(e) => setCompartilhar(e.target.checked)}
          className="size-5 accent-[var(--color-sage-600)]"
        />
      </label>

      {state.error ? (
        <p role="alert" className="text-sm text-clay-600">{state.error}</p>
      ) : null}

      <button
        type="submit"
        disabled={pending || !emoji}
        className="touch-target rounded-full bg-sage-600 px-6 font-medium text-white disabled:opacity-40"
      >
        {pending ? 'Salvando…' : 'Guardar'}
      </button>
      <Link href="/hoje" className="touch-target rounded-full border border-line px-6 text-center text-ink-soft">
        Pular — só fechar e ir viver
      </Link>
    </form>
  )
}