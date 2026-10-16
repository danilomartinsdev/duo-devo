import Link from 'next/link'
import { LoginForm } from '@/components/auth/login-form'
import { authErrorMessages } from '@/lib/action-state'

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ erro?: string }>
}) {
  const { erro } = await searchParams
  const erroMensagem = erro ? authErrorMessages[erro] : undefined

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center px-6 py-12">
      <div className="w-full max-w-sm">
        <header className="mb-10 text-center">
          <p className="font-display text-4xl font-bold tracking-tight text-ink">DuoDevo</p>
          <p className="mt-2 text-sm text-muted">
            Leiam o Novo Testamento em dupla.
          </p>
        </header>

        {erroMensagem ? (
          <p
            role="alert"
            className="mb-6 rounded-xl bg-alert-soft px-4 py-3 text-center text-sm text-alert"
          >
            {erroMensagem}
          </p>
        ) : null}

        <LoginForm />

        <p className="mt-8 text-center text-xs text-muted">
          Entrou sem querer nesta tela? O app é por convite — só os dois.
        </p>
        <p className="mt-2 text-center text-xs">
          <Link href="/onboarding" className="underline underline-offset-2 hover:text-alert">
            Como instalar no iPhone
          </Link>
        </p>
      </div>
    </main>
  )
}