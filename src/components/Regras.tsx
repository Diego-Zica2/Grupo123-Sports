
import React from 'react'
import { HeaderDropdown } from './HeaderDropdown'
import { Footer } from './Footer'

export function Regras() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-primary">Grupo123 Sports</h1>
          <HeaderDropdown />
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-center mb-8">Regras de Participação do Projeto Grupo123 Sports</h1>
          
          <div className="space-y-8 text-foreground">
            <section>
              <h2 className="text-xl font-semibold mb-4 text-primary">1. Exclusividade para Colaboradores</h2>
              <div className="space-y-2 leading-relaxed">
                <p>O sistema é exclusivo para colaboradores da empresa.</p>
                <p>Apenas usuários com e-mails de domínios autorizados podem se cadastrar e acessar o sistema.</p>
                <p>Convidados só podem ser adicionados por colaboradores já confirmados em um evento.</p>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-4 text-primary">2. Adição de Convidados</h2>
              <div className="space-y-2 leading-relaxed">
                <p>Cada colaborador pode adicionar apenas 1 convidado por evento.</p>
                <p>O convidado só será incluído na lista de participantes caso haja vagas remanescentes após o prazo de confirmação dos colaboradores.</p>
                <p>O colaborador deve estar presente para que seu convidado possa entrar nos jogos.</p>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-4 text-primary">3. Prioridade e Preenchimento de Vagas</h2>
              <div className="space-y-4 leading-relaxed">
                <div>
                  <h3 className="font-semibold mb-2">Prioridade dos Colaboradores:</h3>
                  <p>Todas as vagas são inicialmente reservadas para colaboradores.</p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Confirmação de Presença:</h3>
                  <p>As confirmações de presença seguem rigorosamente a ordem de data/hora em que foram feitas no sistema.</p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Inclusão de Convidados:</h3>
                  <p>Se, após o período de confirmação, ainda houver vagas disponíveis, os convidados serão incluídos na ordem em que foram adicionados.</p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Lista de Espera:</h3>
                  <p>Caso todas as vagas estejam preenchidas, colaboradores podem entrar em uma lista de espera, respeitando a ordem de inscrição.</p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-4 text-primary">4. Cancelamentos e Lista de Espera</h2>
              <p className="leading-relaxed">Se um colaborador ou convidado confirmado cancelar sua presença, a vaga será automaticamente preenchida pelo primeiro da lista de espera, seguindo a ordem de inscrição.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-4 text-primary">5. Comunicação e Transparência</h2>
              <div className="space-y-2 leading-relaxed">
                <p>As listas de presença de cada jogo, bem como todas as comunicações importantes sobre os eventos (confirmações, vagas, lista de espera, cancelamentos etc.), serão exibidas no Slack da empresa.</p>
                <p>O Slack será o canal oficial para avisos, atualizações e interações sobre os eventos esportivos.</p>
              </div>
            </section>

            <div className="mt-12 p-6 bg-muted rounded-lg">
              <p className="text-center font-medium">
                Essas regras garantem a transparência, a prioridade para colaboradores, a organização das vagas e a comunicação eficiente entre todos os participantes do Grupo123 Sports.
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
