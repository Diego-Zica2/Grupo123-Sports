
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
- **Tema dark/light** (dark como padrão)

### Para Administradores:
- **Gestão de jogos** (criar, editar, excluir)
- **Gestão de esportes** (ativar/desativar visibilidade)
- **Gestão de domínios** permitidos para cadastro
- **Controle de confirmações** e convidados

## 🚀 Configuração

### 1. Configurar Supabase

1. Crie um projeto no [Supabase](https://supabase.com)
2. Execute o seguinte SQL para criar as tabelas:

```sql
-- Extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabela de usuários
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  role VARCHAR(20) DEFAULT 'player' CHECK (role IN ('admin', 'player')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de domínios permitidos
CREATE TABLE allowed_domains (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  domain VARCHAR(255) UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Inserir domínios padrão
INSERT INTO allowed_domains (domain) VALUES 
('maxmilhas.com.br'),
('123milhas.com.br');

-- Tabela de esportes
CREATE TABLE sports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  icon VARCHAR(10) DEFAULT '🏃',
  visible BOOLEAN DEFAULT true,
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  time VARCHAR(10) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Inserir esportes padrão
INSERT INTO sports (name, icon, visible, day_of_week, time) VALUES 
('Vôlei', '🏐', true, 6, '12:00'),  -- Sábado 12:00
('Futebol', '⚽', false, 2, '20:00'); -- Terça 20:00

-- Tabela de jogos
CREATE TABLE games (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sport_id UUID NOT NULL REFERENCES sports(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  time VARCHAR(10) NOT NULL,
  location VARCHAR(255) NOT NULL,
  google_maps_link VARCHAR(500),
  max_players INTEGER DEFAULT 20,
  created_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de confirmações de jogos
CREATE TABLE game_confirmations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  confirmed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(game_id, user_id)
);

-- Tabela de convidados
CREATE TABLE guests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  cpf VARCHAR(11) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(game_id, user_id)
);

-- Políticas RLS (Row Level Security)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE sports ENABLE ROW LEVEL SECURITY;
ALTER TABLE games ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_confirmations ENABLE ROW LEVEL SECURITY;
ALTER TABLE guests ENABLE ROW LEVEL SECURITY;
ALTER TABLE allowed_domains ENABLE ROW LEVEL SECURITY;

-- Políticas para users
CREATE POLICY "Users can view their own profile" ON users FOR SELECT USING (auth.uid()::text = id::text);
CREATE POLICY "Users can update their own profile" ON users FOR UPDATE USING (auth.uid()::text = id::text);

-- Políticas para sports (todos podem ver)
CREATE POLICY "Anyone can view sports" ON sports FOR SELECT USING (true);

-- Políticas para games (todos podem ver)
CREATE POLICY "Anyone can view games" ON games FOR SELECT USING (true);

-- Políticas para confirmações
CREATE POLICY "Users can view all confirmations" ON game_confirmations FOR SELECT USING (true);
CREATE POLICY "Users can insert their own confirmations" ON game_confirmations FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);
CREATE POLICY "Users can delete their own confirmations" ON game_confirmations FOR DELETE USING (auth.uid()::text = user_id::text);

-- Políticas para convidados
CREATE POLICY "Users can view all guests" ON guests FOR SELECT USING (true);
CREATE POLICY "Users can insert their own guests" ON guests FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);
CREATE POLICY "Users can delete their own guests" ON guests FOR DELETE USING (auth.uid()::text = user_id::text);

-- Políticas para domínios permitidos
CREATE POLICY "Anyone can view allowed domains" ON allowed_domains FOR SELECT USING (true);

-- Função para criar usuário automaticamente
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, role)
  VALUES (new.id, new.email, COALESCE(new.raw_user_meta_data->>'full_name', ''), 'player');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para criar usuário automaticamente
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
```

### 2. Configurar variáveis de ambiente

No arquivo `src/lib/supabase.ts`, substitua as variáveis:

```typescript
const supabaseUrl = 'SUA_URL_DO_SUPABASE'
const supabaseAnonKey = 'SUA_CHAVE_ANONIMA_DO_SUPABASE'
```

### 3. Executar o projeto

```bash
npm install
npm run dev
```

## 📱 Como usar

1. **Cadastro**: Use um email @maxmilhas.com.br ou @123milhas.com.br
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

## 📋 Próximos passos

Para implementar funcionalidades administrativas, será necessário criar:

1. **Dashboard Admin** - Gestão completa do sistema
2. **CRUD de Jogos** - Criar, editar e excluir jogos
3. **Gestão de Usuários** - Promover usuários a admin
4. **Relatórios** - Estatísticas de participação
5. **Notificações** - Sistema de avisos sobre jogos

## 🎨 Design System

O projeto utiliza um sistema de design baseado no logo da MaxMilhas:
- **Cor Primária**: Laranja (#FF7B00)
- **Cor Secundária**: Azul escuro
- **Tema**: Dark mode como padrão
- **Tipografia**: Sistema padrão otimizado
- **Componentes**: Baseados em shadcn/ui

## 📈 Funcionalidades Implementadas

✅ Sistema de autenticação completo  
✅ Validação de domínios de email  
✅ Recuperação de senha  
✅ Gestão de esportes  
✅ Confirmação de presença  
✅ Sistema de convidados  
✅ Interface responsiva  
✅ Tema dark/light  
✅ Validação de formulários  
✅ Notificações toast  

## 🔒 Segurança

- **RLS (Row Level Security)** ativado em todas as tabelas
- **Validação de domínios** no cadastro
- **Autenticação segura** via Supabase
- **Sanitização de dados** em formulários
- **Políticas de acesso** granulares

---

**Desenvolvido para MaxMilhas** 🧡💙
