
import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { supabase } from '@/lib/supabase'
import { ArrowRight, Shield } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { HeaderDropdown } from './HeaderDropdown'

interface Sport {
  id: string
  name: string
  icon: string
  visible: boolean
  day_of_week: number
  time: string
  created_at: string
}

interface Game {
  id: string
  sport_id: string
  date: string
  time: string
  location: string
  google_maps_link: string
  max_players: number
  created_by: string
  created_at: string
  visible: boolean
  sport?: Sport
}

interface GameConfirmation {
  id: string
  game_id: string
  user_id: string
  confirmed_at: string
}

interface UserProfile {
  id: string
  email: string
  full_name: string
  role: 'admin' | 'player' | 'moderador_volei' | 'moderador_futebol'
  created_at: string
}

export function SportSelection() {
  const { user } = useAuth()
  const [sports, setSports] = useState<Sport[]>([])
  const [games, setGames] = useState<Game[]>([])
  const [confirmations, setConfirmations] = useState<GameConfirmation[]>([])
  const [guests, setGuests] = useState<any[]>([])
  const [waitingList, setWaitingList] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)

  useEffect(() => {
    if (user) {
      fetchUserProfile()
      fetchData()
    }
  }, [user])

  const fetchUserProfile = async () => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single()

      if (error) throw error
      setUserProfile(data)
    } catch (error) {
      console.error('Error fetching user profile:', error)
    }
  }

  const fetchData = async () => {
    try {
      const { data: sportsData, error: sportsError } = await supabase
        .from('sports')
        .select('*')
        .eq('visible', true)
        .order('name')

      if (sportsError) throw sportsError
      setSports(sportsData || [])

      const { data: gamesData, error: gamesError } = await supabase
        .from('games')
        .select(`
          *,
          sport:sports(*)
        `)
        .eq('visible', true)
        .gte('date', new Date().toISOString().split('T')[0])
        .order('date', { ascending: true })

      if (gamesError) throw gamesError
      setGames(gamesData || [])

      const { data: confirmationsData, error: confirmationsError } = await supabase
        .from('game_confirmations')
        .select('*')

      if (confirmationsError) throw confirmationsError
      setConfirmations(confirmationsData || [])

      const { data: guestsData, error: guestsError } = await supabase
        .from('guests')
        .select('*')

      if (guestsError) throw guestsError
      setGuests(guestsData || [])

      const { data: waitingData, error: waitingError } = await supabase
        .from('waiting_list')
        .select('*')

      if (waitingError) throw waitingError
      setWaitingList(waitingData || [])

    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getSportData = (sport: Sport) => {
    const sportGames = games.filter(game => game.sport_id === sport.id)
    const activeGame = sportGames.length > 0 ? sportGames[0] : null
    
    if (!activeGame) {
      return {
        status: 'no-game',
        availableSpots: 0,
        totalSpots: 0,
        isUserConfirmed: false,
        isUserWaiting: false
      }
    }

    const gameConfirmations = confirmations.filter(c => c.game_id === activeGame.id)
    const gameGuests = guests.filter(g => g.game_id === activeGame.id)
    const gameWaiting = waitingList.filter(w => w.game_id === activeGame.id)
    
    const totalConfirmed = gameConfirmations.length + gameGuests.length
    const availableSpots = activeGame.max_players - totalConfirmed
    
    const isUserConfirmed = gameConfirmations.some(c => c.user_id === user?.id)
    const isUserWaiting = gameWaiting.some(w => w.user_id === user?.id)
    
    let status = 'available'
    if (availableSpots <= 0) {
      status = 'full'
    }
    if (isUserConfirmed) {
      status = 'confirmed'
    }
    if (isUserWaiting) {
      status = 'waiting'
    }

    return {
      status,
      availableSpots,
      totalSpots: activeGame.max_players,
      isUserConfirmed,
      isUserWaiting,
      game: activeGame
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'border-green-500 bg-green-50 dark:bg-green-950'
      case 'waiting':
        return 'border-yellow-500 bg-yellow-50 dark:bg-yellow-950'
      case 'full':
        return 'border-red-500 bg-red-50 dark:bg-red-950'
      default:
        return 'border-gray-200 dark:border-gray-700'
    }
  }

  const getStatusText = (status: string, availableSpots: number) => {
    switch (status) {
      case 'confirmed':
        return 'Confirmado'
      case 'waiting':
        return 'Aguardando Vaga'
      case 'full':
        return 'Lotado'
      case 'no-game':
        return 'Sem jogo ativo'
      default:
        return `${availableSpots} vagas`
    }
  }

  const canAccessAdmin = () => {
    if (!userProfile) return false
    return userProfile.role === 'admin' || 
           userProfile.role === 'moderador_volei' || 
           userProfile.role === 'moderador_futebol'
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Carregando...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <div className="mx-auto mb-1 h-full w-full rounded-lg flex items-center justify-center">
              <a href="/" aria-label="Home">
                <img
                  src="/lovable-uploads/dark-logogrupo123.png"
                  alt="Logo"
                  className="cursor-pointer h-full w-auto object-contain dark:block hidden"
                />
                <img
                  src="/lovable-uploads/light-logogrupo123.png"
                  alt="Logo"
                  className="cursor-pointer h-full w-auto object-contain dark:hidden block"
                />
              </a>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            {canAccessAdmin() && (
              <Button variant="outline" size="sm" asChild>
                <Link to="/admin">
                  <Shield className="h-4 w-4 mr-2" />
                  Admin
                </Link>
              </Button>
            )}
            <HeaderDropdown />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Escolha seu Esporte
          </h1>
          <p className="text-muted-foreground">
            Confirme sua presença nos jogos da semana
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {sports.map((sport) => {
            const sportData = getSportData(sport)
            
            return (
              <Card key={sport.id} className={`transition-all duration-200 hover:shadow-lg ${getStatusColor(sportData.status)}`}>
                <CardHeader className="text-center pb-4">
                  <div className="text-4xl mb-2">{sport.icon}</div>
                  <CardTitle className="text-xl">{sport.name}</CardTitle>
                </CardHeader>
                <CardContent className="text-center space-y-3">
                  {sportData.game && (
                    <>
                      <div className="text-sm text-muted-foreground">
                        <p>{new Date(sportData.game.date + 'T00:00:00').toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' })}</p>
                        <p>{sportData.game.time}</p>
                      </div>
                      <div className="flex items-center justify-center space-x-2">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          sportData.status === 'confirmed' ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100' :
                          sportData.status === 'waiting' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100' :
                          sportData.status === 'full' ? 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100' :
                          'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100'
                        }`}>
                          {getStatusText(sportData.status, sportData.availableSpots)}
                        </span>
                      </div>
                    </>
                  )}
                  
                  <Button asChild className="w-full">
                    <Link to={`/sport/${sport.id}`}>
                      {sportData.status === 'no-game' ? 'Ver Detalhes' : 
                       sportData.status === 'confirmed' ? 'Ver Detalhes' : 
                       sportData.status === 'waiting' ? 'Ver Detalhes' :
                       sportData.status === 'full' ? 'Lista de Espera' : 'Confirmar Presença'}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </main>
    </div>
  )
}
