
# MaxMilhas - Sistema de Agendamento de Jogos

Sistema completo de agendamento de jogos esportivos para funcionários da MaxMilhas e 123Milhas.

## 🏐 Funcionalidades

### Para Jogadores:
- **Login/Cadastro** com validação de domínio de email (@maxmilhas.com.br, @123milhas.com.br)
- **Recuperação de senha** via email
- **Seleção de esporte** (Vôlei e Futebol - apenas Vôlei visível inicialmente)
- **Confirmação de presença** em jogos
- **Sistema de convidados** (1 por usuário)
- **Visualização do próximo jogo** com detalhes completos

### Para Administradores:
- **Gestão de jogos** (criar, editar, excluir)
- **Gestão de esportes** (ativar/desativar visibilidade)
- **Gestão de domínios** permitidos para cadastro
- **Controle de confirmações** e convidados


## 📱 Como usar

1. **Cadastro**: Use um email corporativo, ex: @maxmilhas.com.br ou @123milhas.com.br
2. **Login**: Acesse com suas credenciais
3. **Escolher esporte**: Selecione o Vôlei na tela inicial
4. **Confirmar presença**: Clique no botão para participar do próximo jogo
5. **Adicionar convidado**: Após confirmar presença, você pode adicionar 1 convidado

## 🔧 Tecnologias

- **Frontend**: React, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL)
- **Autenticação**: Supabase Auth
- **UI**: shadcn/ui components
- **Formulários**: React Hook Form + Zod
- **Roteamento**: React Router DOM

- **RLS (Row Level Security)** ativado em todas as tabelas
- **Validação de domínios** no cadastro
- **Autenticação segura** via Supabase
- **Sanitização de dados** em formulários
- **Políticas de acesso** granulares

---

**Desenvolvido para Grupo123** 🧡💙
