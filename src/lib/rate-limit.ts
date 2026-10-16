/**
 * Rate limit simples, em memória, para as rotas sensíveis (login/cadastro).
 * No serverless cada instância tem o próprio mapa — serve como trava de
 * primeira linha; quem quiser limite global pode trocar por Upstash depois.
 */
type Bucket = { count: number; resetAt: number }

const buckets = new Map<string, Bucket>()

export function rateLimit(
  key: string,
  limit = 5,
  windowMs = 10 * 60 * 1_000,
): { ok: boolean; retryAfterSec: number } {
  const now = Date.now()
  const bucket = buckets.get(key)

  if (!bucket || bucket.resetAt < now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs })
    return { ok: true, retryAfterSec: 0 }
  }

  bucket.count += 1
  if (bucket.count > limit) {
    return { ok: false, retryAfterSec: Math.ceil((bucket.resetAt - now) / 1_000) }
  }
  return { ok: true, retryAfterSec: 0 }
}

export function clientIpFrom(headers: Headers): string {
  const fwd = headers.get('x-forwarded-for')
  if (fwd) return fwd.split(',')[0]!.trim()
  return headers.get('x-real-ip') ?? 'desconhecido'
}