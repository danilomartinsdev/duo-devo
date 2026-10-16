import { redirect } from 'next/navigation'
import { getCurrentProfile } from '@/lib/profile'
import { LogoutButton } from '@/components/auth/logout-button'
import { TabBar } from '@/components/tab-bar'

/**
 * Layout das telas autenticadas. O gate fica aqui (e na RLS do banco) —
 * sem sessão, volta para o login.
 */
export default async function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const perfil = await getCurrentProfile()
  if (!perfil) redirect('/login')

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col px-5 pt-[max(1rem,env(safe-area-inset-top))]">
      <header className="flex items-center justify-between py-4">
        <span className="font-display text-xl font-semibold tracking-tight">DuoDevo</span>
        <LogoutButton nome={perfil.display_name} />
      </header>
      <main className="flex-1 pb-24">
        {children}
      </main>
      <TabBar />
    </div>
  )
}