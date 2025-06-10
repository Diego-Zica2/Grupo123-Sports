
-- Função para desabilitar jogos antigos quando um novo jogo é criado
CREATE OR REPLACE FUNCTION public.disable_old_games()
RETURNS TRIGGER AS $$
BEGIN
  -- Desabilitar todos os jogos anteriores do mesmo esporte
  UPDATE public.games 
  SET visible = false 
  WHERE sport_id = NEW.sport_id 
  AND id != NEW.id 
  AND date >= CURRENT_DATE;
  
  -- Garantir que o novo jogo esteja visível
  UPDATE public.games 
  SET visible = true 
  WHERE id = NEW.id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Adicionar coluna visible na tabela games
ALTER TABLE public.games ADD COLUMN IF NOT EXISTS visible boolean DEFAULT true;

-- Criar trigger para executar a função quando um novo jogo é inserido
DROP TRIGGER IF EXISTS trigger_disable_old_games ON public.games;
CREATE TRIGGER trigger_disable_old_games
  AFTER INSERT ON public.games
  FOR EACH ROW
  EXECUTE FUNCTION public.disable_old_games();

-- Função para remover confirmação de usuário (para admin)
CREATE OR REPLACE FUNCTION public.remove_user_confirmation(game_id_param uuid, user_id_param uuid)
RETURNS boolean AS $$
BEGIN
  -- Remover confirmação do usuário
  DELETE FROM public.game_confirmations 
  WHERE game_id = game_id_param AND user_id = user_id_param;
  
  -- Remover convidado do usuário se existir
  DELETE FROM public.guests 
  WHERE game_id = game_id_param AND user_id = user_id_param;
  
  RETURN true;
END;
$$ LANGUAGE plpgsql;

-- Função para remover convidado específico (para admin)
CREATE OR REPLACE FUNCTION public.remove_guest(guest_id_param uuid)
RETURNS boolean AS $$
BEGIN
  DELETE FROM public.guests WHERE id = guest_id_param;
  RETURN true;
END;
$$ LANGUAGE plpgsql;
