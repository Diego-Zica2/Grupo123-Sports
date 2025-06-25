
-- Atualizar a tabela users para incluir os novos tipos de moderador
-- Primeiro, vamos alterar a constraint da coluna role para incluir os novos valores
ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_role_check;

-- Adicionar constraint atualizada com os novos roles
ALTER TABLE public.users ADD CONSTRAINT users_role_check 
CHECK (role IN ('player', 'admin', 'moderador_volei', 'moderador_futebol'));

-- Atualizar o valor padrão se necessário
ALTER TABLE public.users ALTER COLUMN role SET DEFAULT 'player';
