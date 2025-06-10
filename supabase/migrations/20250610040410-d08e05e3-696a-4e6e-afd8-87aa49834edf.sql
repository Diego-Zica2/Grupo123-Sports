
-- Habilitar RLS e criar políticas para a tabela games
ALTER TABLE public.games ENABLE ROW LEVEL SECURITY;

-- Política para permitir leitura de jogos para usuários autenticados
CREATE POLICY "Users can view games" ON public.games
FOR SELECT TO authenticated
USING (true);

-- Política para permitir criação de jogos para usuários autenticados
CREATE POLICY "Users can create games" ON public.games
FOR INSERT TO authenticated
WITH CHECK (true);

-- Política para permitir atualização de jogos para usuários autenticados
CREATE POLICY "Users can update games" ON public.games
FOR UPDATE TO authenticated
USING (true);

-- Política para permitir exclusão de jogos para usuários autenticados
CREATE POLICY "Users can delete games" ON public.games
FOR DELETE TO authenticated
USING (true);

-- Corrigir as funções para definir o search_path corretamente
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, role)
  VALUES (new.id, new.email, COALESCE(new.raw_user_meta_data->>'full_name', ''), 'player');
  RETURN new;
END;
$$;

CREATE OR REPLACE FUNCTION public.disable_old_games()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = 'public'
AS $$
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
$$;

CREATE OR REPLACE FUNCTION public.remove_user_confirmation(game_id_param uuid, user_id_param uuid)
RETURNS boolean
LANGUAGE plpgsql
SET search_path = 'public'
AS $$
BEGIN
  -- Remover confirmação do usuário
  DELETE FROM public.game_confirmations 
  WHERE game_id = game_id_param AND user_id = user_id_param;
  
  -- Remover convidado do usuário se existir
  DELETE FROM public.guests 
  WHERE game_id = game_id_param AND user_id = user_id_param;
  
  RETURN true;
END;
$$;

CREATE OR REPLACE FUNCTION public.remove_guest(guest_id_param uuid)
RETURNS boolean
LANGUAGE plpgsql
SET search_path = 'public'
AS $$
BEGIN
  DELETE FROM public.guests WHERE id = guest_id_param;
  RETURN true;
END;
$$;
