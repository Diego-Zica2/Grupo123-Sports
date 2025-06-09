
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'YOUR_SUPABASE_URL'
const supabaseAnonKey = 'YOUR_SUPABASE_ANON_KEY'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Types para o banco de dados
export interface User {
  id: string
  email: string
  full_name: string
  role: 'admin' | 'player'
  created_at: string
}

export interface Sport {
  id: string
  name: string
  icon: string
  visible: boolean
  day_of_week: number // 0 = domingo, 6 = sábado
  time: string
  created_at: string
}

export interface Game {
  id: string
  sport_id: string
  date: string
  time: string
  location: string
  google_maps_link: string
  max_players: number
  created_by: string
  created_at: string
  sport?: Sport
}

export interface GameConfirmation {
  id: string
  game_id: string
  user_id: string
  confirmed_at: string
  user?: User
}

export interface Guest {
  id: string
  game_id: string
  user_id: string
  name: string
  cpf: string
  created_at: string
}

export interface AllowedDomain {
  id: string
  domain: string
  created_at: string
}
