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
    <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col px-5 pt-[max(0.5rem,env(safe-area-inset-top))]">
      <header className="sticky top-0 z-20 -mx-5 px-5 py-3 bg-page/80 backdrop-blur-md border-b border-line/60 flex items-center justify-between">
        <span className="font-display text-[22px] font-semibold tracking-tight">
          Duo<span className="text-accent">Devo</span>
        </span>
        <LogoutButton nome={perfil.display_name} avatarUrl={perfil.avatar_url} />
      </header>
      <main className="flex-1 pb-24">
        {children}
      </main>
      <TabBar />
    </div>
  )
}