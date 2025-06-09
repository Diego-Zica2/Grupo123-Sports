
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://pnbgkjfzynbrnoeacjwu.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBuYmdramZ6eW5icm5vZWFjand1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk0OTczMzUsImV4cCI6MjA2NTA3MzMzNX0.7OvTCH6-kMVDGaJA_NINaKkylfS9VNdbuiC-e9LHSLI'

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
