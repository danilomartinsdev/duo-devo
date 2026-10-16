'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

type Tab = { href: string; label: string; icone: string; ativo: boolean; futuro?: boolean }

export function TabBar() {
  const pathname = usePathname()

  const tabs: Tab[] = [
    { href: '/hoje', label: 'Hoje', icone: '☀', ativo: pathname.startsWith('/hoje') },
    { href: '/progresso', label: 'Progresso', icone: '▦', ativo: pathname.startsWith('/progresso') },
    { href: '/oracao', label: 'Oração', icone: '✋', ativo: false, futuro: true },
    { href: '/configuracoes', label: 'Ajustes', icone: '⚙', ativo: false, futuro: true },
  ]

  return (
    <nav
      aria-label="Navegação principal"
      className="fixed inset-x-0 bottom-0 z-10 bg-paper/95 backdrop-blur-sm border-t border-line pb-[env(safe-area-inset-bottom)]"
    >
      <ul className="mx-auto flex max-w-md">
        {tabs.map((tab) =>
          tab.futuro ? (
            <li key={tab.href} className="flex-1">
              <span
                aria-disabled
                title="Em breve"
                className="flex w-full flex-col items-center gap-0.5 py-2 text-[11px] text-ink-soft/50"
              >
                <span aria-hidden className="text-lg">{tab.icone}</span>
                {tab.label}
                <span className="text-[9px]">em breve</span>
              </span>
            </li>
          ) : (
            <li key={tab.href} className="flex-1">
              <Link
                href={tab.href}
                aria-current={tab.ativo ? 'page' : undefined}
                className={`flex w-full flex-col items-center gap-0.5 py-2 text-[11px] transition-colors ${
                  tab.ativo ? 'text-sage-700 font-medium' : 'text-ink-soft'
                }`}
              >
                <span aria-hidden className="text-lg">{tab.icone}</span>
                {tab.label}
              </Link>
            </li>
          ),
        )}
      </ul>
    </nav>
  )
}