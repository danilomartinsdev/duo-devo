/** Datas em strings ISO "YYYY-MM-DD", sempre no fuso do usuário. */

export const FUSO_PADRAO = 'America/Sao_Paulo'

export function hojeISO(fuso: string = FUSO_PADRAO): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: fuso }).format(new Date())
}

/** Diferença em dias inteiros entre duas datas ISO (b = a - b, em dias). */
export function diasEntre(a: string, b: string): number {
  const da = Date.parse(`${a}T12:00:00Z`)
  const db = Date.parse(`${b}T12:00:00Z`)
  return Math.round((da - db) / 86_400_000)
}

export function formatarDia(iso: string, fuso: string = FUSO_PADRAO): string {
  return new Intl.DateTimeFormat('pt-BR', {
    timeZone: fuso,
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(Date.parse(`${iso}T12:00:00Z`))
}

export function diaCurto(iso: string): string {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    timeZone: 'UTC',
  }).format(Date.parse(`${iso}T12:00:00Z`))
}

export function somarDias(iso: string, dias: number): string {
  const d = new Date(Date.parse(`${iso}T12:00:00Z`) + dias * 86_400_000)
  return d.toISOString().slice(0, 10)
}