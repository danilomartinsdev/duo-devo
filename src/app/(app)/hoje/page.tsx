import { getCurrentProfile } from '@/lib/profile'

export const metadata = { title: 'Hoje' }

export default async function HojePage() {
  const perfil = await getCurrentProfile()

  return (
    <section className="pt-6">
      <h1 className="font-serif text-3xl">
        {saudacao()}, {perfil?.display_name || 'você'}
      </h1>
      <p className="mt-3 text-ink-soft">
        Tudo pronto do nosso lado. A leitura do dia chega na fase 2 — capítulo
        1 de Mateus, logo, logo.
      </p>

      <div className="mt-10 rounded-2xl border border-line bg-paper-soft p-5">
        <p className="font-serif text-lg">Nossa dupla</p>
        <p className="mt-1 text-sm text-ink-soft">
          Depois da fase 1: criamos a dupla no Supabase e aqui vai aparecer o
          progresso dos dois.
        </p>
      </div>
    </section>
  )
}

function saudacao(): string {
  const hora = new Date().getHours()
  if (hora < 5) return 'Boa madrugada'
  if (hora < 12) return 'Bom dia'
  if (hora < 18) return 'Boa tarde'
  return 'Boa noite'
}