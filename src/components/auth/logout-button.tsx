'use client'

import { signOutAction } from '@/app/actions/auth'

export function LogoutButton({ nome }: { nome: string }) {
  return (
    <div className="flex items-center gap-3">
      <span
        aria-hidden
        className="flex size-8 items-center justify-center rounded-full bg-accent-soft font-display text-sm text-accent-strong"
      >
        {inicial(nome)}
      </span>
      <form action={signOutAction}>
        <button type="submit" className="text-sm text-muted underline underline-offset-2">
          sair
        </button>
      </form>
    </div>
  )
}

function inicial(nome: string): string {
  return nome.trim().charAt(0).toUpperCase() || '?'
}