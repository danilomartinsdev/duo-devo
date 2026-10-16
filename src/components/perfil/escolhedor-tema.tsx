'use client'

import { useState } from 'react'
import { PALETAS, MODOS, aplicarTema } from '@/lib/temas'
import { salvarTemaAction } from '@/app/actions/perfil'
import type { TemaPaleta, TemaModo } from '@/lib/types'

export function EscolhedorTema({
  paleteInicial,
  modoInicial,
}: {
  paleteInicial: string
  modoInicial: string
}) {
  const [paleta, setPaleta] = useState(paleteInicial)
  const [modo, setModo] = useState(modoInicial)

  function trocar(proximaPaleta: TemaPaleta, proximoModo: TemaModo) {
    // aplica na tela na hora — a persistência acontece em seguida
    aplicarTema(proximaPaleta, proximoModo)
    setPaleta(proximaPaleta)
    setModo(proximoModo)
    void salvarTemaAction(proximaPaleta, proximoModo)
  }

  return (
    <div className="flex flex-col gap-6">
      <fieldset>
        <legend className="text-sm text-muted">Cor</legend>
        <div className="mt-3 grid grid-cols-3 gap-2">
          {PALETAS.map((p) => (
            <button
              key={p.key}
              type="button"
              aria-pressed={paleta === p.key}
              onClick={() => trocar(p.key, modo as TemaModo)}
              className={`touch-target flex items-center gap-2 rounded-2xl border px-3 py-2 text-sm transition-colors ${
                paleta === p.key
                  ? 'border-accent bg-accent-soft font-medium'
                  : 'border-line bg-surface'
              }`}
            >
              <span
                aria-hidden
                className="size-4 shrink-0 rounded-full"
                style={{ backgroundColor: p.cor }}
              />
              {p.nome}
            </button>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend className="text-sm text-muted">Modo</legend>
        <div className="mt-3 flex gap-1 rounded-full bg-surface border border-line p-1 text-sm">
          {MODOS.map((m) => (
            <button
              key={m.key}
              type="button"
              aria-pressed={modo === m.key}
              onClick={() => trocar(paleta as TemaPaleta, m.key)}
              className={`touch-target flex-1 rounded-full py-2 transition-colors ${
                modo === m.key ? 'bg-accent-soft font-medium text-accent-strong' : 'text-muted'
              }`}
            >
              {m.nome}
            </button>
          ))}
        </div>
      </fieldset>
    </div>
  )
}