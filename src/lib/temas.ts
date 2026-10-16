import type { TemaPaleta, TemaModo } from '@/lib/types'

export const PALETAS: { key: TemaPaleta; nome: string; cor: string }[] = [
  { key: 'indigo', nome: 'Índigo', cor: '#6366f1' },
  { key: 'oceano', nome: 'Oceano', cor: '#0ea5e9' },
  { key: 'floresta', nome: 'Floresta', cor: '#16a34a' },
  { key: 'mel', nome: 'Mel', cor: '#d97706' },
  { key: 'grafeno', nome: 'Grafeno', cor: '#64748b' },
  { key: 'magenta', nome: 'Magenta', cor: '#db2777' },
]

export const MODOS: { key: TemaModo; nome: string }[] = [
  { key: 'claro', nome: 'Claro' },
  { key: 'escuro', nome: 'Escuro' },
  { key: 'sistema', nome: 'Sistema' },
]

export function aplicarTema(palete: string, modo: string) {
  const html = document.documentElement
  html.dataset.tema = palete
  html.dataset.modo = modo
}