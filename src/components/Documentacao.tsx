
import React from 'react'
import { HeaderDropdown } from './HeaderDropdown'
import { Footer } from './Footer'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export function Documentacao() {
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
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold text-center mb-8">Documentação</h1>
          
          <Tabs defaultValue="jogador" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="jogador">Guia do Jogador</TabsTrigger>
              <TabsTrigger value="administrador">Guia do Administrador</TabsTrigger>
            </TabsList>
            
            <TabsContent value="jogador" className="mt-8">
              <div className="space-y-12">
                <div className="text-center">
                  <h2 className="text-2xl font-bold mb-4">Documentação de Uso do Projeto Grupo123 Sports</h2>
                  <p className="text-muted-foreground max-w-4xl mx-auto">
                    Este guia apresenta o passo a passo para utilização do sistema de confirmação de presença em jogos esportivos do Grupo123 Sports. Cada etapa é ilustrada para facilitar o entendimento do usuário.
                  </p>
                </div>

                {/* Passo 1 */}
                <section className="space-y-4">
                  <h3 className="text-xl font-semibold text-primary">1. Tela Inicial (Home)</h3>
                  <div className="bg-gray-200 h-64 rounded-lg flex items-center justify-center mb-4">
                    <span className="text-gray-500">Imagem Demo - Tela Inicial</span>
                  </div>
                  <p>Após realizar o login, você será direcionado para a tela inicial do sistema. Nesta tela, é possível visualizar os esportes disponíveis para participação na semana, juntamente com o número de vagas restantes para cada modalidade.</p>
                  <div className="bg-muted p-4 rounded-lg">
                    <h4 className="font-semibold mb-2">Como proceder:</h4>
                    <p>Escolha o esporte desejado clicando no respectivo box (por exemplo, Futebol ou Vôlei).</p>
                    <p>O box exibe o dia e horário do jogo e o número de vagas disponíveis.</p>
                  </div>
                </section>

                {/* Passo 2 */}
                <section className="space-y-4">
                  <h3 className="text-xl font-semibold text-primary">2. Seleção do Esporte e Confirmação de Presença</h3>
                  <div className="bg-gray-200 h-64 rounded-lg flex items-center justify-center mb-4">
                    <span className="text-gray-500">Imagem Demo - Seleção do Esporte</span>
                  </div>
                  <p>Ao clicar no box do esporte escolhido, você será direcionado para a página de detalhes daquele esporte.</p>
                  <div className="bg-muted p-4 rounded-lg">
                    <h4 className="font-semibold mb-2">Como proceder:</h4>
                    <p>Verifique as informações do próximo jogo: data, horário, local e quantidade de vagas.</p>
                    <p>Clique no botão "Confirmar Presença" para garantir sua vaga na lista de jogadores confirmados.</p>
                  </div>
                </section>

                {/* Passo 3 */}
                <section className="space-y-4">
                  <h3 className="text-xl font-semibold text-primary">3. Adição de Convidados</h3>
                  <div className="bg-gray-200 h-64 rounded-lg flex items-center justify-center mb-4">
                    <span className="text-gray-500">Imagem Demo - Adição de Convidados</span>
                  </div>
                  <p>Após confirmar sua presença, a tela será atualizada mostrando que sua presença está confirmada. Agora, você terá a opção de adicionar convidados (caso deseje levar alguém para o jogo).</p>
                  <div className="bg-muted p-4 rounded-lg">
                    <h4 className="font-semibold mb-2">Como proceder:</h4>
                    <p>Utilize o botão "Adicionar Convidado" para incluir até 1 convidado.</p>
                    <p>Sua confirmação estará visível na lista de jogadores confirmados.</p>
                  </div>
                </section>

                {/* Passo 4 */}
                <section className="space-y-4">
                  <h3 className="text-xl font-semibold text-primary">4. Visualização de Confirmação na Tela Inicial</h3>
                  <div className="bg-gray-200 h-64 rounded-lg flex items-center justify-center mb-4">
                    <span className="text-gray-500">Imagem Demo - Confirmação na Tela Inicial</span>
                  </div>
                  <p>Depois de confirmar presença (com ou sem convidados), ao retornar para a tela inicial, o box do esporte selecionado ficará destacado e exibirá o status de "Confirmado".</p>
                  <div className="bg-muted p-4 rounded-lg">
                    <h4 className="font-semibold mb-2">Como proceder:</h4>
                    <p>Você pode clicar em "Ver Detalhes" para acessar novamente as informações do seu jogo confirmado.</p>
                    <p>O sistema mantém o registro da sua confirmação, facilitando o acompanhamento e organização dos jogos.</p>
                  </div>
                </section>

                {/* Passo 5 */}
                <section className="space-y-4">
                  <h3 className="text-xl font-semibold text-primary">5. Modal de Adição de Convidado</h3>
                  <div className="bg-gray-200 h-64 rounded-lg flex items-center justify-center mb-4">
                    <span className="text-gray-500">Imagem Demo - Modal de Convidado</span>
                  </div>
                  <p>Após confirmar sua presença em um jogo, você pode adicionar convidados clicando no botão correspondente. Ao fazer isso, será exibido um modal para preenchimento dos dados do convidado.</p>
                  <div className="bg-muted p-4 rounded-lg">
                    <h4 className="font-semibold mb-2">Como proceder:</h4>
                    <p>Preencha o nome completo do convidado.</p>
                    <p>Insira o CPF do convidado no formato solicitado.</p>
                    <p>Clique em "Adicionar" para incluir o convidado na lista daquele jogo.</p>
                    <p>Caso desista, clique em "Cancelar" para fechar o modal sem adicionar o convidado.</p>
                  </div>
                </section>

                {/* Passo 6 */}
                <section className="space-y-4">
                  <h3 className="text-xl font-semibold text-primary">6. Página do Esporte Selecionado com Convidado Confirmado</h3>
                  <div className="bg-gray-200 h-64 rounded-lg flex items-center justify-center mb-4">
                    <span className="text-gray-500">Imagem Demo - Página com Convidado</span>
                  </div>
                  <p>Depois de adicionar um convidado, a página do esporte selecionado exibirá:</p>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>Sua confirmação de presença.</li>
                    <li>A lista de jogadores confirmados, incluindo você.</li>
                    <li>A lista de convidados, mostrando o nome e o status de cada convidado.</li>
                    <li>Opção para cancelar a presença ou remover convidados, se necessário.</li>
                  </ul>
                  <div className="bg-muted p-4 rounded-lg">
                    <h4 className="font-semibold mb-2">Destaques:</h4>
                    <p>O convidado será exibido com o nome e o CPF cadastrados.</p>
                    <p>O status de cada convidado pode ser visualizado facilmente.</p>
                  </div>
                </section>

                {/* Passo 7 */}
                <section className="space-y-4">
                  <h3 className="text-xl font-semibold text-primary">7. Tela Inicial com Confirmação e Convidados</h3>
                  <div className="bg-gray-200 h-64 rounded-lg flex items-center justify-center mb-4">
                    <span className="text-gray-500">Imagem Demo - Tela com Confirmações</span>
                  </div>
                  <p>Após confirmar sua presença e adicionar convidados, ao retornar para a tela inicial, o box do esporte escolhido continuará destacado como "Confirmado". Além disso:</p>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>O status de confirmação permanece visível, indicando que você e seus convidados estão registrados para o jogo.</li>
                    <li>O botão "Ver Detalhes" permite acessar rapidamente a página do esporte para gerenciar sua presença e convidados.</li>
                  </ul>
                </section>

                {/* Passo 8 */}
                <section className="space-y-4">
                  <h3 className="text-xl font-semibold text-primary">8. Tela Inicial com Esporte Lotado</h3>
                  <div className="bg-gray-200 h-64 rounded-lg flex items-center justify-center mb-4">
                    <span className="text-gray-500">Imagem Demo - Esporte Lotado</span>
                  </div>
                  <p>Quando todas as vagas de um determinado esporte estiverem preenchidas, o box correspondente na tela inicial será exibido com destaque em vermelho e o status "Lotado". Ainda assim, o usuário pode clicar no box para tentar uma vaga através da lista de espera.</p>
                  <div className="bg-muted p-4 rounded-lg">
                    <h4 className="font-semibold mb-2">Como proceder:</h4>
                    <p>Identifique o esporte lotado pelo destaque visual e o aviso "Lotado".</p>
                    <p>Clique no box do esporte desejado para mais opções.</p>
                  </div>
                </section>

                {/* Passo 9 */}
                <section className="space-y-4">
                  <h3 className="text-xl font-semibold text-primary">9. Entrando na Lista de Espera</h3>
                  <div className="bg-gray-200 h-64 rounded-lg flex items-center justify-center mb-4">
                    <span className="text-gray-500">Imagem Demo - Lista de Espera</span>
                  </div>
                  <p>Ao acessar a página do esporte lotado, será exibida a mensagem "Jogo Lotado" e o botão "Entrar na Lista de Espera".</p>
                  <div className="bg-muted p-4 rounded-lg">
                    <h4 className="font-semibold mb-2">Como proceder:</h4>
                    <p>Clique no botão "Entrar na Lista de Espera" para registrar seu interesse em participar caso surja uma vaga.</p>
                    <p>O sistema confirmará sua entrada na lista de espera.</p>
                  </div>
                </section>

                {/* Passo 10 */}
                <section className="space-y-4">
                  <h3 className="text-xl font-semibold text-primary">10. Página do Esporte com Lista de Espera</h3>
                  <div className="bg-gray-200 h-64 rounded-lg flex items-center justify-center mb-4">
                    <span className="text-gray-500">Imagem Demo - Página com Lista de Espera</span>
                  </div>
                  <p>Após entrar na lista de espera, a página do esporte exibirá:</p>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>Sua posição na lista de espera.</li>
                    <li>A lista dos jogadores confirmados e dos que aguardam vaga.</li>
                    <li>Opção para sair da lista de espera, caso mude de ideia.</li>
                  </ul>
                  <div className="bg-muted p-4 rounded-lg">
                    <h4 className="font-semibold mb-2">Destaques:</h4>
                    <p>O usuário pode acompanhar seu status e visualizar quem está confirmado ou aguardando vaga.</p>
                    <p>Transparência no gerenciamento das vagas e da lista de espera.</p>
                  </div>
                </section>

                {/* Passo 11 */}
                <section className="space-y-4">
                  <h3 className="text-xl font-semibold text-primary">11. Tela Inicial com Status de Espera</h3>
                  <div className="bg-gray-200 h-64 rounded-lg flex items-center justify-center mb-4">
                    <span className="text-gray-500">Imagem Demo - Status de Espera</span>
                  </div>
                  <p>Depois de entrar na lista de espera, ao retornar para a tela inicial, o box do esporte aparecerá com o status "Aguardando Vaga". Isso facilita o acompanhamento do seu interesse e posição na fila.</p>
                  <div className="bg-muted p-4 rounded-lg">
                    <h4 className="font-semibold mb-2">Como proceder:</h4>
                    <p>O status "Aguardando Vaga" indica que você está na lista de espera para aquele esporte.</p>
                    <p>Você pode clicar em "Ver Detalhes" para acompanhar sua posição ou sair da lista de espera, se desejar.</p>
                  </div>
                </section>

                <div className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded-lg">
                  <h4 className="font-semibold text-blue-900 mb-2">Observações Importantes</h4>
                  <ul className="list-disc pl-6 space-y-1 text-blue-800">
                    <li>O fluxo de lista de espera garante que todos tenham chance de participar, mesmo quando as vagas principais já foram preenchidas.</li>
                    <li>Caso uma vaga seja liberada, o primeiro da fila na lista de espera entrará automaticamente na lista de confirmados.</li>
                    <li>O usuário tem autonomia para sair da lista de espera a qualquer momento.</li>
                  </ul>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="administrador" className="mt-8">
              <div className="space-y-12">
                <div className="text-center">
                  <h2 className="text-2xl font-bold mb-4">Documentação das Telas de ADMIN do Projeto Grupo123 Sports</h2>
                  <p className="text-muted-foreground max-w-4xl mx-auto">
                    Esta seção detalha as funcionalidades e o fluxo das telas administrativas do sistema, voltadas para a gestão de jogos, usuários e domínios autorizados.
                  </p>
                </div>

                {/* Passo 1 */}
                <section className="space-y-4">
                  <h3 className="text-xl font-semibold text-primary">1. Tela de Criação e Gerenciamento de Jogos</h3>
                  <div className="bg-gray-200 h-64 rounded-lg flex items-center justify-center mb-4">
                    <span className="text-gray-500">Imagem Demo - Gerenciamento de Jogos</span>
                  </div>
                  <p>Nesta tela, o administrador pode criar, editar e deletar jogos para qualquer esporte cadastrado.</p>
                  
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold">Funcionalidades Principais</h4>
                    
                    <div className="bg-muted p-4 rounded-lg">
                      <h5 className="font-semibold mb-2">Criação de Novo Jogo:</h5>
                      <ul className="list-disc pl-6 space-y-1">
                        <li>Clique no botão "Criar Jogo Padrão" (Vôlei ou Futebol) para preencher automaticamente os campos com dados padrões do respectivo esporte.</li>
                        <li>Preencha ou ajuste os campos obrigatórios: Esporte, Data, Horário, Local, Link do Google Maps e Máximo de Jogadores.</li>
                        <li>Clique em "Criar Jogo" para salvar o novo evento.</li>
                      </ul>
                    </div>

                    <div className="bg-muted p-4 rounded-lg">
                      <h5 className="font-semibold mb-2">Substituição de Jogos Vigentes:</h5>
                      <ul className="list-disc pl-6 space-y-1">
                        <li>Ao criar um novo jogo, ele substituirá automaticamente o jogo vigente daquele esporte.</li>
                        <li>Apenas o último jogo criado para cada esporte será exibido na lista de jogos ativos.</li>
                      </ul>
                    </div>

                    <div className="bg-muted p-4 rounded-lg">
                      <h5 className="font-semibold mb-2">Edição e Exclusão de Jogos:</h5>
                      <ul className="list-disc pl-6 space-y-1">
                        <li>Os jogos ativos são listados na parte inferior da tela, com opções para editar (ícone de lápis) ou deletar (ícone de lixeira) cada jogo.</li>
                        <li>A edição permite modificar os dados do evento, enquanto a exclusão remove o jogo do sistema.</li>
                      </ul>
                    </div>
                  </div>
                </section>

                {/* Passo 2 */}
                <section className="space-y-4">
                  <h3 className="text-xl font-semibold text-primary">2. Tela de Gestão de Usuários</h3>
                  <div className="bg-gray-200 h-64 rounded-lg flex items-center justify-center mb-4">
                    <span className="text-gray-500">Imagem Demo - Gestão de Usuários</span>
                  </div>
                  <p>Esta tela permite ao administrador visualizar, editar e gerenciar todos os usuários cadastrados no sistema.</p>
                  
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold">Funcionalidades Principais</h4>
                    
                    <div className="bg-muted p-4 rounded-lg">
                      <h5 className="font-semibold mb-2">Visualização de Informações:</h5>
                      <p>Exibe uma tabela com nome, e-mail, função (role), data de cadastro e ações disponíveis para cada usuário.</p>
                    </div>

                    <div className="bg-muted p-4 rounded-lg">
                      <h5 className="font-semibold mb-2">Definição de Role:</h5>
                      <p>O administrador pode alterar o tipo de acesso do usuário, selecionando entre "Jogador" e "Administrador" diretamente na tabela.</p>
                    </div>

                    <div className="bg-muted p-4 rounded-lg">
                      <h5 className="font-semibold mb-2">Exclusão de Usuários:</h5>
                      <p>Através do botão de lixeira, é possível deletar a conta de qualquer usuário, removendo-o do sistema.</p>
                    </div>
                  </div>
                </section>

                {/* Passo 3 */}
                <section className="space-y-4">
                  <h3 className="text-xl font-semibold text-primary">3. Tela de Gestão de Domínios</h3>
                  <div className="bg-gray-200 h-64 rounded-lg flex items-center justify-center mb-4">
                    <span className="text-gray-500">Imagem Demo - Gestão de Domínios</span>
                  </div>
                  <p>Esta tela é destinada à administração dos domínios autorizados para cadastro e login no sistema.</p>
                  
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold">Funcionalidades Principais</h4>
                    
                    <div className="bg-muted p-4 rounded-lg">
                      <h5 className="font-semibold mb-2">Adição de Domínio:</h5>
                      <ul className="list-disc pl-6 space-y-1">
                        <li>Clique em "Adicionar Domínio" para cadastrar um novo domínio válido.</li>
                        <li>Informe o domínio desejado e salve para que novos usuários possam se registrar utilizando e-mails desse domínio.</li>
                      </ul>
                    </div>

                    <div className="bg-muted p-4 rounded-lg">
                      <h5 className="font-semibold mb-2">Edição e Exclusão de Domínios:</h5>
                      <ul className="list-disc pl-6 space-y-1">
                        <li>Cada domínio listado possui opções para edição (ícone de lápis) ou exclusão (ícone de lixeira).</li>
                        <li>A edição permite corrigir ou atualizar o domínio cadastrado.</li>
                        <li>A exclusão remove o domínio da lista de autorizados, impedindo novos cadastros com ele.</li>
                      </ul>
                    </div>
                  </div>
                </section>

                <div className="bg-green-50 border-l-4 border-green-500 p-6 rounded-lg">
                  <h4 className="font-semibold text-green-900 mb-2">Observações Gerais</h4>
                  <ul className="list-disc pl-6 space-y-1 text-green-800">
                    <li>Todas as ações administrativas são restritas a usuários com perfil de "Administrador".</li>
                    <li>O sistema garante que apenas o último jogo criado de cada esporte esteja ativo, evitando conflitos de agenda.</li>
                    <li>A gestão de usuários e domínios é simples e direta, proporcionando controle total sobre o acesso e a organização dos eventos esportivos.</li>
                  </ul>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <Footer />
    </div>
  )
}
