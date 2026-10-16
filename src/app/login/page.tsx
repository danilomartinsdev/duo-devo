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
          <p className="font-serif text-4xl italic text-ink">OurDevo</p>
          <p className="mt-2 text-sm text-ink-soft">
            Devocional a dois — uma leitura só para vocês.
          </p>
        </header>

        {erroMensagem ? (
          <p
            role="alert"
            className="mb-6 rounded-xl bg-clay-100 px-4 py-3 text-center text-sm text-clay-600"
          >
            {erroMensagem}
          </p>
        ) : null}

        <LoginForm />

        <p className="mt-8 text-center text-xs text-ink-soft">
          Entrou sem querer nesta tela? O app é por convite — só os dois.
        </p>
        <p className="mt-2 text-center text-xs">
          <Link href="/onboarding" className="underline underline-offset-2 hover:text-clay-600">
            Como instalar no iPhone
          </Link>
        </p>
      </div>
    </main>
  )
}