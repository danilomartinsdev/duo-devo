import { getCurrentProfile } from '@/lib/profile'
import { createClient } from '@/lib/supabase/server'
import { SeccaoConta } from '@/components/perfil/seccao-conta'
import { EscolhedorTema } from '@/components/perfil/escolhedor-tema'
import { SeccaoNotificacoes } from '@/components/perfil/seccao-notificacoes'
import type { Config } from '@/components/perfil/seccao-notificacoes'

export const metadata = { title: 'Ajustes' }


export default async function ConfiguracoesPage() {
  const perfil = await getCurrentProfile()
  if (!perfil) return null

  const supabase = await createClient()
  const { data: lembretes } = await supabase
    .from('reminders')
    .select('tipo, ativo, hora_local')
    .eq('user_id', perfil.id)

  const porTipo = new Map<string, { ativo: boolean; hora_local: string | null }>()
  for (const l of lembretes ?? []) {
    porTipo.set(l.tipo, { ativo: l.ativo, hora_local: l.hora_local })
  }
  const horaDe = (tipo: string): string | null => {
    const r = porTipo.get(tipo)
    if (!r) return tipo === 'lembrete_diario' ? '07:30' : null
    return r.hora_local ? r.hora_local.slice(0, 5) : null
  }
  const ativoDe = (tipo: string, padrao: boolean): boolean => {
    const r = porTipo.get(tipo)
    return r ? r.ativo : padrao
  }

  return (
    <section className="pt-4 pb-8">
      <h1 className="font-display text-[34px] leading-[1.12]">Ajustes</h1>

      <Bloco titulo="Sua conta">
        <SeccaoConta nome={perfil.display_name} avatarUrl={perfil.avatar_url} />
      </Bloco>

      <Bloco titulo="Aparência">
        <EscolhedorTema paleteInicial={perfil.theme_color} modoInicial={perfil.theme_mode} />
      </Bloco>

      <Bloco titulo="Notificações">
        <SeccaoNotificacoes
          lembreteDiario={{ ativo: ativoDe('lembrete_diario', true), hora: horaDe('lembrete_diario') }}
          avisoDuo={{ ativo: ativoDe('aviso_duo', false), hora: horaDe('aviso_duo') }}
          fraseFe={{ ativo: ativoDe('frase_fe', false), hora: horaDe('frase_fe') }}
        />
      </Bloco>

      <p className="mt-10 text-center text-xs text-muted">
        DuoDevo · fase 3 · feito com carinho para vocês dois
      </p>
    </section>
  )
}

function Bloco({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <div className="mt-8">
      <h2 className="mb-3 text-xs font-medium uppercase tracking-widest text-muted">{titulo}</h2>
      <div className="rounded-3xl border border-line bg-surface sombra p-5">{children}</div>
    </div>
  )
}