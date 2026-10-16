'use client'

import { useState } from 'react'
import { salvarLembreteAction } from '@/app/actions/perfil'

export type Config = { ativo: boolean; hora: string | null }

export function SeccaoNotificacoes({
  lembreteDiario,
  avisoDuo,
  fraseFe,
}: {
  lembreteDiario: Config
  avisoDuo: Config
  fraseFe: Config
}) {
  // estado local otimista; cada troca grava no banco
  const [diario, setDiario] = useState(lembreteDiario)
  const [duo, setDuo] = useState(avisoDuo)
  const [frase, setFrase] = useState(fraseFe)
  const [salvo, setSalvo] = useState<NodeJS.Timeout | null>(null)

  async function gravar(tipo: string, config: Config) {
    const ok = await salvarLembreteAction(tipo, config.ativo, config.hora)
    if (ok) {
      clearTimeout(salvo!)
      setSalvo(setTimeout(() => setSalvo(null), 2_000))
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <Linha
        titulo="lembrete diário"
        descricao="Uma cutucada no horário que você escolher"
        config={diario}
        onChangeHora={(hora) => {
          const config = { ...diario, hora }
          setDiario(config)
          void gravar('lembrete_diario', config)
        }}
        onToggle={() => {
          const config = { ...diario, ativo: !diario.ativo }
          setDiario(config)
          void gravar('lembrete_diario', config)
        }}
      />

      <Linha
        titulo="aviso do par"
        descricao="Enter que o outro terminou a leitura"
        config={duo}
        onToggle={() => {
          const config = { ...duo, ativo: !duo.ativo }
          setDuo(config)
          void gravar('aviso_duo', config)
        }}
      />

      <Linha
        titulo="palavra de fé"
        descricao="Um versículo curto durante o dia"
        config={frase}
        onToggle={() => {
          const config = { ...frase, ativo: !frase.ativo }
          setFrase(config)
          void gravar('frase_fe', config)
        }}
      />

      {salvo ? (
        <p role="status" className="text-xs text-accent-strong">salvo ✓</p>
      ) : null}
      <p className="text-xs text-muted">
        Os avisos chegam quando vocês instalarem o app na Tela de Início (fase de push).
      </p>
    </div>
  )
}

function Linha({
  titulo,
  descricao,
  config,
  onToggle,
  onChangeHora,
}: {
  titulo: string
  descricao: string
  config: Config
  onToggle: () => void
  onChangeHora?: (hora: string) => void
}) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-line bg-surface px-4 py-3">
      <div className="flex-1">
        <p className="text-sm font-medium">{titulo}</p>
        <p className="text-xs text-muted">{descricao}</p>
      </div>
      {onChangeHora && config.ativo ? (
        <input
          type="time"
          value={config.hora ?? '07:30'}
          onChange={(e) => onChangeHora(e.target.value)}
          className="touch-target rounded-lg border border-line bg-surface px-2 text-sm"
          aria-label={`horário do ${titulo}`}
        />
      ) : null}
      <button
        type="button"
        role="switch"
        aria-checked={config.ativo}
        aria-label={titulo}
        onClick={onToggle}
        className={`relative h-7 w-12 shrink-0 rounded-full transition-colors ${
          config.ativo ? 'bg-accent' : 'bg-line'
        }`}
      >
        <span
          aria-hidden
          className={`absolute top-0.5 size-6 rounded-full bg-surface shadow transition-all ${
            config.ativo ? 'left-[22px]' : 'left-0.5'
          }`}
        />
      </button>
    </div>
  )
}