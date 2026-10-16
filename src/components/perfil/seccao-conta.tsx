'use client'

import { useActionState, useRef } from 'react'
import { salvarAvatarAction, salvarNomeAction } from '@/app/actions/perfil'
import type { AuthActionState } from '@/lib/action-state'

const init: AuthActionState = {}

export function SeccaoConta({
  nome,
  avatarUrl,
}: {
  nome: string
  avatarUrl: string | null
}) {
  const fileRef = useRef<HTMLInputElement>(null)

  const [estadoNome, acaoNome, pendenteNome] = useActionState(salvarNomeAction, init)
  const [estadoFoto, acaoFoto, pendenteFoto] = useActionState(salvarAvatarAction, init)

  async function escolherImagem(arquivos: FileList | null) {
    const arquivo = arquivos?.[0]
    if (!arquivo) return

    if (!arquivo.type.startsWith('image/')) {
      alert('Escolha uma imagem.')
      return
    }
    if (arquivo.size > 8_000_000) {
      alert('Imagem muito grande (máx. 8MB).')
      return
    }

    // recorte quadrado central + compressão, direto no navegador
    const bitmap = await createImageBitmap(arquivo)
    const lado = Math.min(bitmap.width, bitmap.height)
    const sx = (bitmap.width - lado) / 2
    const sy = (bitmap.height - lado) / 2
    const canvas = document.createElement('canvas')
    canvas.width = 256
    canvas.height = 256
    const ctx = canvas.getContext('2d')!
    ctx.drawImage(bitmap, sx, sy, lado, lado, 0, 0, 256, 256)

    const blob = await new Promise<Blob | null>((r) =>
      canvas.toBlob(r, 'image/webp', 0.85),
    )
    if (!blob) return

    const fr = new FileReader()
    fr.onload = () => {
      const form = new FormData()
      form.set('base64', fr.result as string)
      acaoFoto(form)
    }
    fr.readAsDataURL(blob)
  }

  return (
    <div className="flex flex-col gap-6">
      {/* foto */}
      <div className="flex items-center gap-4">
        {avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={avatarUrl}
            alt="Sua foto"
            className="size-16 rounded-full border border-line object-cover"
          />
        ) : (
          <span className="flex size-16 items-center justify-center rounded-full bg-accent-soft font-display text-xl text-accent-strong">
            {inicial(nome)}
          </span>
        )}
        <div>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => void escolherImagem(e.target.files)}
          />
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={pendenteFoto}
            className="touch-target rounded-full border border-line px-4 text-sm text-muted"
          >
            {pendenteFoto ? 'Enviando…' : 'Trocar foto'}
          </button>
          {estadoFoto.error ? (
            <p role="alert" className="mt-1 text-xs text-alert">{estadoFoto.error}</p>
          ) : null}
        </div>
      </div>

      {/* nome */}
      <form action={acaoNome} className="flex items-end gap-2">
        <label className="flex-1 flex flex-col gap-1.5 text-sm">
          <span className="text-muted">Seu nome</span>
          <input
            name="name"
            defaultValue={nome}
            maxLength={40}
            required
            className="touch-target rounded-xl border border-line bg-surface px-4 text-base outline-none focus:border-accent"
          />
        </label>
        <button
          type="submit"
          disabled={pendenteNome}
          className="touch-target presiona rounded-full bg-accent px-5 py-2 text-sm font-semibold text-white shadow-[0_8px_18px_-8px_rgb(99_102_241_0.55)] disabled:opacity-40"
        >
          Salvar
        </button>
      </form>
      {estadoNome.error ? (
        <p role="alert" className="text-sm text-alert">{estadoNome.error}</p>
      ) : null}
      {estadoNome.message ? (
        <p role="status" className="text-sm text-accent-strong">{estadoNome.message}</p>
      ) : null}
    </div>
  )
}

function inicial(nome: string): string {
  return nome.trim().charAt(0).toUpperCase() || '?'
}