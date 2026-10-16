'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export function TabBar() {
  const pathname = usePathname()

  const tabs: { href: string; label: string; icone: (p: { ativo: boolean }) => React.ReactNode; ativo: boolean; futuro?: boolean }[] = [
    { href: '/hoje', label: 'Hoje', icone: IconeSol, ativo: pathname.startsWith('/hoje') },
    { href: '/progresso', label: 'Progresso', icone: IconeGrafico, ativo: pathname.startsWith('/progresso') },
    { href: '/oracao', label: 'Oração', icone: IconeCoracao, ativo: pathname.startsWith('/oracao') },
    { href: '/configuracoes', label: 'Ajustes', icone: IconeSliders, ativo: pathname.startsWith('/configuracoes') },
  ]

  return (
    <nav
      aria-label="Navegação principal"
      className="fixed inset-x-0 bottom-0 z-10 border-t border-line bg-surface/90 backdrop-blur-md pb-[env(safe-area-inset-bottom)]"
    >
      <ul className="mx-auto flex max-w-md">
        {tabs.map((tab) => {
          const Icone = tab.icone
          const conteudo = (
            <>
              <Icone ativo={tab.ativo && !tab.futuro} />
              <span>{tab.label}</span>
              {tab.futuro ? <span className="text-[9px] leading-none text-muted">em breve</span> : null}
            </>
          )
          const estilo = `flex w-full flex-col items-center gap-0.5 py-2 text-[11px] transition-colors ${
            tab.ativo && !tab.futuro ? 'font-medium text-accent-strong' : 'text-muted'
          }`

          return (
            <li key={tab.href} className="flex-1">
              {tab.futuro ? (
                <span aria-disabled title="Em breve" className={estilo + ' opacity-50'}>
                  {conteudo}
                </span>
              ) : (
                <Link href={tab.href} aria-current={tab.ativo ? 'page' : undefined} className={estilo}>
                  {conteudo}
                </Link>
              )}
            </li>
          )
        })}
      </ul>
    </nav>
  )
}

/* ícones próprios: stroke 1.8, cantos arredondados */
const base = 'size-5'
const traco = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
} as const

function IconeSol({ ativo }: { ativo: boolean }) {
  return ativo ? (
    <svg viewBox="0 0 24 24" className={base} {...traco} fill="currentColor" stroke="none">
      <circle cx="12" cy="12" r="4.5" />
      <g stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
        <path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M18.7 5.3l-1.4 1.4M6.7 17.3l-1.4 1.4" />
      </g>
    </svg>
  ) : (
    <svg viewBox="0 0 24 24" className={base} {...traco}>
      <circle cx="12" cy="12" r="4.5" />
      <path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M18.7 5.3l-1.4 1.4M6.7 17.3l-1.4 1.4" />
    </svg>
  )
}

function IconeGrafico({ ativo }: { ativo: boolean }) {
  return (
    <svg viewBox="0 0 24 24" className={base} {...traco} fill={ativo ? 'currentColor' : 'none'} stroke="currentColor">
      <rect x="4.5" y="13" width="4" height="7" rx="1.5" />
      <rect x="10" y="8" width="4" height="12" rx="1.5" />
      <rect x="15.5" y="4" width="4" height="16" rx="1.5" opacity={ativo ? 1 : 1} />
    </svg>
  )
}

function IconeCoracao({ ativo }: { ativo: boolean }) {
  return (
    <svg viewBox="0 0 24 24" className={base} {...traco} fill={ativo ? 'currentColor' : 'none'} stroke="currentColor">
      <path d="M12 20.5s-7.5-4.6-7.5-9.8c0-2.6 2-4.7 4.5-4.7 1.3 0 2.4.6 3 1.5.6-.9 1.7-1.5 3-1.5 2.5 0 4.5 2.1 4.5 4.7 0 5.2-7.5 9.8-7.5 9.8z" />
    </svg>
  )
}

function IconeSliders({ ativo }: { ativo: boolean }) {
  return (
    <svg viewBox="0 0 24 24" className={base} {...traco} fill={ativo ? 'currentColor' : 'none'} stroke="currentColor">
      <line x1="5" y1="7" x2="19" y2="7" />
      <circle cx="15" cy="7" r="2" />
      <line x1="5" y1="17" x2="19" y2="17" />
      <circle cx="9" cy="17" r="2" />
    </svg>
  )
}