export const metadata = {
  // sem (app) nem gate: precisa estar acessível antes de logar
  title: 'Como instalar',
}

const passos = [
  {
    titulo: 'Abrir no Safari',
    texto:
      'No iPhone, abra o DuoDevo sempre pelo Safari (o Chrome não instala apps). Dica: mande o link para você mesma(o) por mensagem.',
  },
  {
    titulo: 'Adicionar à Tela de Início',
    texto:
      'Toque no botão Compartilhar (quadrado com seta) e escolha “Adicionar à Tela de Início”. Confirme o nome e o ícone.',
  },
  {
    titulo: 'Abrir pelo ícone',
    texto:
      'A partir daí, o DuoDevo abre em tela cheia, como um app de verdade.',
  },
  {
    titulo: 'Ativar as notificações (a partir da fase 5)',
    texto:
      'No iOS 16.4+, apps instalados pela Tela de Início podem pedir permissão: toque no ícone em destaque quando aparecer, ou em Configurações → Safari → Notificações.',
  },
]

export default function OnboardingPage() {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col px-6 py-12">
      <p className="font-display text-3xl font-bold tracking-tight">DuoDevo</p>
      <h1 className="mt-8 font-display text-2xl">Instalar no iPhone</h1>
      <ol className="mt-6 flex flex-col gap-6">
        {passos.map((passo, i) => (
          <li key={passo.titulo} className="flex gap-4">
            <span
              aria-hidden
              className="flex size-8 shrink-0 items-center justify-center rounded-full bg-alert-soft font-display text-sm text-alert"
            >
              {i + 1}
            </span>
            <div>
              <p className="font-medium">{passo.titulo}</p>
              <p className="mt-1 text-sm text-muted">{passo.texto}</p>
            </div>
          </li>
        ))}
      </ol>
      <p className="mt-10 text-center text-xs text-muted">
        Esta página vai virar a tela de onboarding completa do app (fase 6).
      </p>
    </main>
  )
}