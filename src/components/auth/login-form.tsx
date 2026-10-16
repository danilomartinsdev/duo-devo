'use client'

import { useActionState, useState } from 'react'
import { signInAction, signUpAction } from '@/app/actions/auth'
import type { AuthActionState } from '@/lib/action-state'

type Modo = 'entrar' | 'primeiro'

const initialState: AuthActionState = {}

export function LoginForm() {
  const [modo, setModo] = useState<Modo>('entrar')

  return (
    <div>
      <div
        role="tablist"
        aria-label="Como entrar"
        className="mb-8 flex gap-1 rounded-full bg-paper-soft p-1 text-sm"
      >
        <TabButton ativo={modo === 'entrar'} onClick={() => setModo('entrar')}>
          Entrar
        </TabButton>
        <TabButton ativo={modo === 'primeiro'} onClick={() => setModo('primeiro')}>
          1º acesso
        </TabButton>
      </div>

      {modo === 'entrar' ? <FormaEntrar /> : <FormaPrimeira />}
    </div>
  )
}

function FormaEntrar() {
  const [state, action, pending] = useActionState(signInAction, initialState)
  return (
    <form action={action} className="flex flex-col gap-4">
      <Campo label="E-mail" name="email" type="email" autoComplete="username" />
      <Campo label="Senha" name="password" type="password" autoComplete="current-password" />
      <Mensagens state={state} />
      <Botao pending={pending}>Entrar</Botao>
    </form>
  )
}

function FormaPrimeira() {
  const [state, action, pending] = useActionState(signUpAction, initialState)
  return (
    <form action={action} className="flex flex-col gap-4">
      <Campo label="Como te chamamos" name="name" type="text" autoComplete="name" />
      <Campo label="E-mail" name="email" type="email" autoComplete="email" />
      <Campo label="Senha" name="password" type="password" autoComplete="new-password" />
      <Mensagens state={state} />
      <Botao pending={pending}>Criar minha conta</Botao>
      <p className="text-center text-xs text-ink-soft">
        Só o seu e-mail e o da sua amiga criam conta — a lista é nossa.
      </p>
    </form>
  )
}

function Mensagens({ state }: { state: AuthActionState }) {
  if (state.error) {
    return (
      <p role="alert" className="text-sm text-clay-600">
        {state.error}
      </p>
    )
  }
  if (state.message) {
    return (
      <p role="status" className="text-sm text-sage-700">
        {state.message}
      </p>
    )
  }
  return null
}

function Botao({ pending, children }: { pending: boolean; children: React.ReactNode }) {
  return (
    <button
      type="submit"
      disabled={pending}
      className="touch-target mt-2 rounded-full bg-sage-600 px-6 font-medium text-white transition-opacity disabled:opacity-50"
    >
      {pending ? 'Um instante…' : children}
    </button>
  )
}

function TabButton({
  ativo,
  onClick,
  children,
}: {
  ativo: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={ativo}
      onClick={onClick}
      className={`touch-target flex-1 rounded-full px-3 py-2 transition-colors ${
        ativo ? 'bg-paper font-medium text-ink shadow-sm' : 'text-ink-soft'
      }`}
    >
      {children}
    </button>
  )
}

function Campo({
  label,
  ...props
}: {
  label: string
  name: string
  type: string
  autoComplete: string
}) {
  return (
    <label className="flex flex-col gap-1.5 text-sm">
      <span className="text-ink-soft">{label}</span>
      <input
        {...props}
        required
        className="touch-target rounded-xl border border-line bg-paper px-4 text-base outline-none focus:border-sage-400"
      />
    </label>
  )
}