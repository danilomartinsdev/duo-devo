import { notFound } from 'next/navigation'
import { capitulo } from '@/lib/biblia'
import { proximoCapitulo } from '@/lib/livros'
import { getCurrentProfile } from '@/lib/profile'
import { createClient } from '@/lib/supabase/server'
import { Leitor } from '@/components/leitura/leitor'

export default async function LeitorPage({
  params,
}: {
  params: Promise<{ livro: string; num: string }>
}) {
  const { livro: slug, num } = await params
  const dados = capitulo(slug, Number(num))
  if (!dados) notFound()

  const perfil = await getCurrentProfile()
  let jaLido = false
  if (perfil) {
    const supabase = await createClient()
    const { data } = await supabase
      .from('readings')
      .select('id')
      .eq('user_id', perfil.id)
      .eq('livro', slug)
      .eq('capitulo', Number(num))
      .maybeSingle()
    jaLido = data !== null
  }

  return (
    <Leitor
      livroSlug={slug}
      livroNome={dados.livroNome}
      cap={Number(num)}
      versos={dados.versos}
      proximo={proximoCapitulo(slug, Number(num))}
      jaLido={jaLido}
    />
  )
}