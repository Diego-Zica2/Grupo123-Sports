
import React from 'react'
import { ArrowLeft, BookOpen, Users, Shield } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export function Documentation() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Link to="/" className="text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-6 w-6" />
            </Link>
            <h1 className="text-3xl font-bold text-foreground">Documentação</h1>
          </div>
          <p className="text-muted-foreground">
            Encontre todas as informações necessárias sobre regras, guias e funcionalidades do sistema.
          </p>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="regras" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="regras" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Regras
            </TabsTrigger>
            <TabsTrigger value="jogador" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Guia do Jogador
            </TabsTrigger>
            <TabsTrigger value="admin" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Guia do Administrador
            </TabsTrigger>
          </TabsList>

          {/* Regras Tab */}
          <TabsContent value="regras" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Regras do Sistema
                </CardTitle>
                <CardDescription>
                  Diretrizes e regulamentos para uso da plataforma
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold mb-4">Regras Gerais</h3>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-2">1. Confirmação de Presença</h4>
                      <p className="text-muted-foreground">
                        • Todos os jogadores devem confirmar sua presença até 2 horas antes do jogo<br/>
                        • Cancelamentos devem ser feitos com antecedência mínima de 1 hora<br/>
                        • Faltas não justificadas podem resultar em penalidades
                      </p>
                    </div>
                    
                    <div>
                      <h4 className="font-medium mb-2">2. Lista de Espera</h4>
                      <p className="text-muted-foreground">
                        • Quando o jogo estiver lotado, é possível entrar na lista de espera<br/>
                        • A ordem da lista é por chegada (primeiro a entrar, primeiro a ser chamado)<br/>
                        • Notificações automáticas serão enviadas quando houver vagas
                      </p>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2">3. Convidados</h4>
                      <p className="text-muted-foreground">
                        • Cada jogador pode convidar até 1 pessoa por jogo<br/>
                        • Convidados devem ser cadastrados com nome completo<br/>
                        • O responsável pelo convite deve acompanhar o convidado
                      </p>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2">4. Comportamento</h4>
                      <p className="text-muted-foreground">
                        • Respeito mútuo entre todos os participantes<br/>
                        • Proibido uso de linguagem ofensiva ou discriminatória<br/>
                        • Cumprimento das regras de segurança do local
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-muted/30 p-4 rounded-lg">
                  <h4 className="font-medium mb-2">⚠️ Penalidades</h4>
                  <p className="text-sm text-muted-foreground">
                    O não cumprimento das regras pode resultar em advertências, suspensão temporária ou banimento permanente da plataforma, conforme a gravidade da infração.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Guia do Jogador Tab */}
          <TabsContent value="jogador" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Guia do Jogador
                </CardTitle>
                <CardDescription>
                  Como usar a plataforma como jogador
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold mb-4">Como Começar</h3>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-2">1. Primeiro Acesso</h4>
                      <p className="text-muted-foreground mb-2">
                        Após fazer login, você verá a tela de seleção de esportes:
                      </p>
                      <div className="bg-muted/20 p-4 rounded-lg">
                        <img 
                          src="https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=600&h=400&fit=crop" 
                          alt="Tela de seleção de esportes" 
                          className="w-full max-w-md mx-auto rounded-lg shadow-sm"
                        />
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2">2. Confirmando Presença</h4>
                      <p className="text-muted-foreground mb-2">
                        Para confirmar sua presença em um jogo:
                      </p>
                      <ul className="text-muted-foreground space-y-1 ml-4">
                        <li>• Clique no card do esporte desejado</li>
                        <li>• Verifique data, horário e local do próximo jogo</li>
                        <li>• Clique em "Confirmar Presença"</li>
                        <li>• Você receberá uma confirmação visual</li>
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2">3. Convidando Alguém</h4>
                      <p className="text-muted-foreground mb-2">
                        Para convidar uma pessoa:
                      </p>
                      <ul className="text-muted-foreground space-y-1 ml-4">
                        <li>• Acesse a página do jogo</li>
                        <li>• Clique em "Adicionar Convidado"</li>
                        <li>• Preencha o nome completo do convidado</li>
                        <li>• Confirme o convite</li>
                      </ul>
                      <div className="bg-muted/20 p-4 rounded-lg mt-2">
                        <img 
                          src="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=600&h=400&fit=crop" 
                          alt="Formulário de convite" 
                          className="w-full max-w-md mx-auto rounded-lg shadow-sm"
                        />
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2">4. Lista de Espera</h4>
                      <p className="text-muted-foreground">
                        Quando o jogo estiver lotado, você pode entrar na lista de espera. 
                        O sistema notificará automaticamente quando houver vagas disponíveis.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg">
                  <h4 className="font-medium mb-2 text-blue-700 dark:text-blue-300">💡 Dicas Importantes</h4>
                  <ul className="text-sm text-blue-600 dark:text-blue-400 space-y-1">
                    <li>• Confirme sua presença o quanto antes para garantir sua vaga</li>
                    <li>• Mantenha seus dados atualizados no perfil</li>
                    <li>• Respeite os horários e regras estabelecidas</li>
                    <li>• Em caso de dúvidas, entre em contato com a administração</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Guia do Administrador Tab */}
          <TabsContent value="admin" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Guia do Administrador
                </CardTitle>
                <CardDescription>
                  Funcionalidades e responsabilidades administrativas
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold mb-4">Painel Administrativo</h3>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-2">1. Gerenciamento de Jogos</h4>
                      <p className="text-muted-foreground mb-2">
                        No painel administrativo, você pode:
                      </p>
                      <ul className="text-muted-foreground space-y-1 ml-4">
                        <li>• Criar novos jogos com data, horário e local</li>
                        <li>• Definir número máximo de participantes</li>
                        <li>• Editar informações de jogos existentes</li>
                        <li>• Visualizar lista de confirmados e lista de espera</li>
                      </ul>
                      <div className="bg-muted/20 p-4 rounded-lg mt-2">
                        <img 
                          src="https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=600&h=400&fit=crop" 
                          alt="Painel de gerenciamento de jogos" 
                          className="w-full max-w-md mx-auto rounded-lg shadow-sm"
                        />
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2">2. Gerenciamento de Usuários</h4>
                      <p className="text-muted-foreground mb-2">
                        Controle total sobre os usuários da plataforma:
                      </p>
                      <ul className="text-muted-foreground space-y-1 ml-4">
                        <li>• Visualizar lista completa de usuários</li>
                        <li>• Alterar permissões (jogador/administrador)</li>
                        <li>• Remover usuários quando necessário</li>
                        <li>• Acompanhar histórico de participações</li>
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2">3. Gerenciamento de Domínios</h4>
                      <p className="text-muted-foreground mb-2">
                        Controle de acesso por domínio de email:
                      </p>
                      <ul className="text-muted-foreground space-y-1 ml-4">
                        <li>• Adicionar domínios autorizados</li>
                        <li>• Remover domínios quando necessário</li>
                        <li>• Apenas emails dos domínios cadastrados podem se registrar</li>
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2">4. Processamento da Lista de Espera</h4>
                      <p className="text-muted-foreground mb-2">
                        Quando houver cancelamentos:
                      </p>
                      <ul className="text-muted-foreground space-y-1 ml-4">
                        <li>• O sistema processa automaticamente a lista de espera</li>
                        <li>• Usuários são confirmados por ordem de chegada</li>
                        <li>• Notificações são enviadas automaticamente</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="bg-red-50 dark:bg-red-950/20 p-4 rounded-lg">
                  <h4 className="font-medium mb-2 text-red-700 dark:text-red-300">⚠️ Responsabilidades do Administrador</h4>
                  <ul className="text-sm text-red-600 dark:text-red-400 space-y-1">
                    <li>• Manter informações dos jogos sempre atualizadas</li>
                    <li>• Responder dúvidas e solicitações dos usuários</li>
                    <li>• Garantir cumprimento das regras estabelecidas</li>
                    <li>• Fazer backup regular dos dados importantes</li>
                    <li>• Reportar problemas técnicos quando necessário</li>
                  </ul>
                </div>

                <div className="bg-green-50 dark:bg-green-950/20 p-4 rounded-lg">
                  <h4 className="font-medium mb-2 text-green-700 dark:text-green-300">✅ Boas Práticas</h4>
                  <ul className="text-sm text-green-600 dark:text-green-400 space-y-1">
                    <li>• Criar jogos com antecedência adequada</li>
                    <li>• Comunicar mudanças com antecedência</li>
                    <li>• Manter histórico de ações administrativas</li>
                    <li>• Ser imparcial na aplicação das regras</li>
                    <li>• Promover ambiente respeitoso e inclusivo</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
