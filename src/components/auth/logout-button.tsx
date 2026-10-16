'use client'

import Link from 'next/link'
import { signOutAction } from '@/app/actions/auth'

export function LogoutButton({
  nome,
  avatarUrl,
}: {
  nome: string
  avatarUrl: string | null
}) {
  return (
    <div className="flex items-center gap-3">
      <Link
        href="/configuracoes"
        aria-label="Seu perfil"
        className="touch-target flex items-center"
      >
        {avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={avatarUrl}
            alt=""
            className="size-8 rounded-full border border-line object-cover"
          />
        ) : (
          <span
            aria-hidden
            className="flex size-8 items-center justify-center rounded-full bg-accent-soft font-display text-sm text-accent-strong"
          >
            {inicial(nome)}
          </span>
        )}
      </Link>
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