
-- Criar tabela para lista de espera
CREATE TABLE public.waiting_list (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  game_id UUID REFERENCES public.games(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(game_id, user_id)
);

-- Habilitar RLS na tabela waiting_list
ALTER TABLE public.waiting_list ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para waiting_list
CREATE POLICY "Users can view waiting list" ON public.waiting_list
FOR SELECT TO authenticated
USING (true);

CREATE POLICY "Users can join waiting list" ON public.waiting_list
FOR INSERT TO authenticated
WITH CHECK (true);

CREATE POLICY "Users can leave waiting list" ON public.waiting_list
FOR DELETE TO authenticated
USING (true);

-- Função para remover usuário da lista de espera (admin)
CREATE OR REPLACE FUNCTION public.remove_user_from_waiting_list(game_id_param uuid, user_id_param uuid)
RETURNS boolean
LANGUAGE plpgsql
SET search_path = 'public'
AS $$
BEGIN
  DELETE FROM public.waiting_list 
  WHERE game_id = game_id_param AND user_id = user_id_param;
  
  RETURN true;
END;
$$;

-- Função para processar lista de espera e confirmar vagas
CREATE OR REPLACE FUNCTION public.process_waiting_list_and_confirm(game_id_param uuid)
RETURNS json
LANGUAGE plpgsql
SET search_path = 'public'
AS $$
DECLARE
  game_record RECORD;
  confirmed_count INTEGER;
  guests_count INTEGER;
  available_spots INTEGER;
  waiting_employees RECORD;
  waiting_guests RECORD;
  result JSON;
BEGIN
  -- Buscar dados do jogo
  SELECT max_players INTO game_record FROM public.games WHERE id = game_id_param;
  
  -- Contar confirmados e convidados atuais
  SELECT COUNT(*) INTO confirmed_count FROM public.game_confirmations WHERE game_id = game_id_param;
  SELECT COUNT(*) INTO guests_count FROM public.guests WHERE game_id = game_id_param;
  
  -- Calcular vagas disponíveis
  available_spots := game_record.max_players - confirmed_count - guests_count;
  
  -- Primeiro: confirmar colaboradores da lista de espera
  FOR waiting_employees IN 
    SELECT wl.user_id 
    FROM public.waiting_list wl
    JOIN public.users u ON wl.user_id = u.id
    WHERE wl.game_id = game_id_param 
    AND u.role = 'player'
    ORDER BY wl.created_at
    LIMIT available_spots
  LOOP
    -- Inserir na confirmação
    INSERT INTO public.game_confirmations (game_id, user_id)
    VALUES (game_id_param, waiting_employees.user_id);
    
    -- Remover da lista de espera
    DELETE FROM public.waiting_list 
    WHERE game_id = game_id_param AND user_id = waiting_employees.user_id;
    
    available_spots := available_spots - 1;
    
    EXIT WHEN available_spots <= 0;
  END LOOP;
  
  -- Recalcular vagas após confirmação dos colaboradores
  SELECT COUNT(*) INTO confirmed_count FROM public.game_confirmations WHERE game_id = game_id_param;
  SELECT COUNT(*) INTO guests_count FROM public.guests WHERE game_id = game_id_param;
  available_spots := game_record.max_players - confirmed_count - guests_count;
  
  result := json_build_object(
    'success', true,
    'confirmed_from_waiting', confirmed_count,
    'remaining_spots', available_spots
  );
  
  RETURN result;
END;
$$;
