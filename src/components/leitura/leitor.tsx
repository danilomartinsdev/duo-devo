'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { marcarLidoAction } from '@/app/actions/leitura'

export function Leitor({
  livroSlug,
  livroNome,
  cap,
  versos,
  proximo,
  jaLido,
}: {
  livroSlug: string
  livroNome: string
  cap: number
  versos: string[]
  proximo: { livro: string; cap: number } | null
  jaLido: boolean
}) {
  const router = useRouter()
  const [tamanho, setTamanho] = useState(20)
  const [lido, setLido] = useState(jaLido)
  const [salvando, setSalvando] = useState(false)

  useEffect(() => {
    try {
      const salvo = localStorage.getItem('ourdevo:fonte')
      if (salvo) setTamanho(Number(salvo))
    } catch {
      // sem localStorage: usa o padrão
    }
  }, [])

  function trocarTamanho(delta: number) {
    const novo = Math.min(28, Math.max(16, tamanho + delta))
    setTamanho(novo)
    try {
      localStorage.setItem('ourdevo:fonte', String(novo))
    } catch {}
  }

  async function terminar() {
    if (lido && salvando) return
    setSalvando(true)
    const ok = await marcarLidoAction(livroSlug, cap)
    setLido(ok)
    setSalvando(false)
    router.push(`/leitura/fim?livro=${livroSlug}&cap=${cap}`)
  }

  return (
    <article className="flex flex-col">
      <header className="mb-6 flex items-center justify-between">
        <button
          type="button"
          onClick={() => router.back()}
          aria-label="Voltar"
          className="touch-target text-ink-soft"
        >
          ←
        </button>
        <h1 className="font-serif text-xl">
          {livroNome} <span className="text-ink-soft">{cap}</span>
        </h1>
        {/* controle de fonte */}
        <div className="flex gap-1">
          <button
            type="button"
            onClick={() => trocarTamanho(-2)}
            aria-label="Diminuir letra"
            className="touch-target rounded-lg px-2 text-sm text-ink-soft"
          >
            A−
          </button>
          <button
            type="button"
            onClick={() => trocarTamanho(2)}
            aria-label="Aumentar letra"
            className="touch-target rounded-lg px-2 text-base text-ink-soft"
          >
            A+
          </button>
        </div>
      </header>

      {lido ? (
        <p className="mb-4 rounded-xl bg-sage-100 px-4 py-2 text-center text-sm text-sage-700">
          ✓ capítulo lido — pode reler com calma
        </p>
      ) : null}

      <div
        className="font-serif leading-relaxed"
        style={{ fontSize: `${tamanho}px` }}
      >
        {versos.map((texto, i) => (
          <p key={i} className="mb-3 indent-8">
            <span
              aria-hidden
              className="mr-1 align-super font-sans text-[10px] text-ink-soft/60"
            >
              {i + 1}
            </span>
            {texto}
          </p>
        ))}
      </div>

      <footer className="sticky bottom-[calc(env(safe-area-inset-bottom)+56px)] mt-8 flex flex-col gap-2 border-t border-line pt-4 bg-paper">
        <button
          type="button"
          onClick={terminar}
          disabled={salvando}
          className="touch-target rounded-full bg-sage-600 px-6 font-medium text-white disabled:opacity-50"
        >
          {salvando ? 'Salvando…' : lido ? 'Fiquei por aqui' : 'Terminei este capítulo'}
        </button>
        {proximo && lido ? (
          <button
            type="button"
            onClick={() =>
              router.push(`/leitura/${proximo.livro}/${proximo.cap}`)
            }
            className="touch-target rounded-full border border-line px-6 text-ink-soft"
          >
            Continuar lendo → {capituloCurto(proximo)}
          </button>
        ) : null}
      </footer>
    </article>
  )
}

function capituloCurto(p: { livro: string; cap: number }) {
  const nomes: Record<string, string> = {
    mateus: 'Mateus', marcos: 'Marcos', lucas: 'Lucas', joao: 'João',
    atos: 'Atos', romanos: 'Romanos', '1corintios': '1ª Coríntios',
    '2corintios': '2ª Coríntios', galatas: 'Gálatas', efesios: 'Efésios',
    filipenses: 'Filipenses', colossenses: 'Colossenses',
    '1tessalonicenses': '1ª Tess.', '2tessalonicenses': '2ª Tess.',
    '1timoteo': '1ª Tim.', '2timoteo': '2ª Tim.', tito: 'Tito',
    filemon: 'Filémon', hebreus: 'Hebreus', tiago: 'Tiago',
    '1pedro': '1ª Pedro', '2pedro': '2ª Pedro', '1joao': '1ª João',
    '2joao': '2ª João', '3joao': '3ª João', judas: 'Judas',
    apocalipse: 'Apocalipse',
  }
  return `${nomes[p.livro] ?? p.livro} ${p.cap}`
}