'use client'

import { useState } from 'react'
import { marcarRespondidoAction } from '@/app/actions/oracao'

export function BotaoRespondido({ id, respondido }: { id: number; respondido: boolean }) {
  const [estado, setEstado] = useState(respondido)

  async function alternar() {
    const proximo = !estado
    setEstado(proximo)
    const ok = await marcarRespondidoAction(id, proximo)
    if (!ok) setEstado(!proximo) // desfaz se o banco recusar
  }

  return (
    <button
      type="button"
      role="switch"
      aria-checked={estado}
      onClick={() => void alternar()}
      className={`touch-target presiona rounded-full border px-4 py-2 text-sm transition-colors ${
        estado
          ? 'border-transparent bg-accent-soft font-medium text-accent-strong'
          : 'border-line text-muted'
      }`}
    >
      {estado ? '✓ respondido — desfaço?' : 'marcar como respondido'}
    </button>
  )
}