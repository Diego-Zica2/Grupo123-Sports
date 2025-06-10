import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/integrations/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ThemeToggle } from '@/components/ThemeToggle'
import { CheckCircle, Users, CheckCheck } from 'lucide-react'

interface Sport {
  id: string
  name: string
  icon: string
  visible: boolean
  day_of_week: number
  time: string
  created_at: string
}

interface UserProfile {
  id: string
  email: string
  full_name: string
  role: 'admin' | 'player'
  created_at: string
}

interface UserConfirmation {
  sport_id: string
  confirmed: boolean
  has_guest: boolean
  guest_name?: string
}

export function SportSelection() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const [sports, setSports] = useState<Sport[]>([])
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [userConfirmations, setUserConfirmations] = useState<UserConfirmation[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSports()
    if (user) {
      fetchUserProfile()
      fetchUserConfirmations()
    }
  }, [user])

  useEffect(() => {
    const handleFocus = () => user && fetchUserConfirmations()
    window.addEventListener('focus', handleFocus)
    return () => window.removeEventListener('focus', handleFocus)
  }, [user])

  const fetchUserProfile = async () => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single()

      if (!error) {
        setUserProfile({ ...data, role: data.role as 'admin' | 'player' })
      }
    } catch (error) {
      console.error('Error fetching user profile:', error)
    }
  }

  const fetchUserConfirmations = async () => {
    if (!user) return

    try {
      const { data: userGames } = await supabase
        .from('games')
        .select(`
          id,
          sport_id,
          date,
          visible,
          game_confirmations!inner(user_id)
        `)
        .eq('game_confirmations.user_id', user.id)
        .eq('visible', true)
        .gte('date', new Date().toISOString().split('T')[0])
        .order('date', { ascending: true })

      const { data: userGuests } = await supabase
        .from('guests')
        .select(`
          name,
          games!inner(id, sport_id, date, visible)
        `)
        .eq('user_id', user.id)
        .eq('games.visible', true)
        .gte('games.date', new Date().toISOString().split('T')[0])

      const confirmationMap = new Map<string, UserConfirmation>()
      const sportGames = new Map<string, any>()

      userGames?.forEach(game => {
        const existing = sportGames.get(game.sport_id)
        if (!existing || new Date(game.date) < new Date(existing.date)) {
          sportGames.set(game.sport_id, game)
        }
      })

      sportGames.forEach((game, sport_id) => {
        confirmationMap.set(sport_id, {
          sport_id,
          confirmed: true,
          has_guest: false
        })
      })

      userGuests?.forEach(guest => {
        const game = guest.games as any
        const existing = confirmationMap.get(game.sport_id)
        if (existing) {
          existing.has_guest = true
          existing.guest_name = guest.name
        }
      })

      setUserConfirmations(Array.from(confirmationMap.values()))
    } catch (error) {
      console.error('Error fetching confirmations:', error)
      setUserConfirmations([])
    }
  }

  const fetchSports = async () => {
    try {
      const { data } = await supabase
        .from('sports')
        .select('*')
        .eq('visible', true)
        .order('name')

      setSports(data || [])
    } catch (error) {
      console.error('Error fetching sports:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSportSelect = (sportId: string) => {
    navigate(`/sport/${sportId}`)
    setTimeout(() => user && fetchUserConfirmations(), 1000)
  }

  const getSportIcon = (sportName: string) => {
    switch (sportName.toLowerCase()) {
      case 'vôlei': return '🏐'
      case 'futebol': return '⚽'
      default: return '🏃'
    }
  }

  const getSportSchedule = (sport: Sport) => {
    const days = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado']
    const brazilTime = new Date(`2000-01-01T${sport.time}:00-03:00`).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    })
    return `${days[sport.day_of_week]} às ${brazilTime}`
  }

  const getUserConfirmationForSport = (sportId: string) => 
    userConfirmations.find(conf => conf.sport_id === sportId)

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Carregando esportes...</p>
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
          <div className="flex items-center space-x-2">
            {userProfile?.role === 'admin' && (
              <Button variant="outline" onClick={() => navigate('/admin')} className="mr-2">
                Admin
              </Button>
            )}
            <ThemeToggle />
            <Button variant="outline" onClick={signOut}>Sair</Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <div className="flex justify-center space-x-4 mb-4">
            <h1 className="text-lg font-semibold">Bem-vindo, {userProfile?.full_name || user?.email}</h1>        
          </div>
          <h2 className="text-3xl font-bold mb-2">Escolha seu Esporte</h2>
          <p className="text-muted-foreground">
            Selecione o esporte que deseja participar nesta semana
          </p>
        </div>

        {sports.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🏃</div>
            <h3 className="text-xl font-semibold mb-2">Nenhum Jogo Agendado!</h3>
            <p className="text-muted-foreground">
              Os Jogos serão Agendados em breve!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {sports.map((sport) => {
              const userConfirmation = getUserConfirmationForSport(sport.id)
              return (
                <Card 
                  key={sport.id} 
                  className={`hover:shadow-lg transition-shadow cursor-pointer border-2 relative ${
                    userConfirmation ? 'border-[#00ad46] bg-green-50 dark:bg-[#00ad46] dark:hover:bg-[#009a3e]' : 'hover:border-primary hover:bg-[#081021]'
                  }`}
                  onClick={() => handleSportSelect(sport.id)}
                >
                  {userConfirmation && (
                    <div className="absolute top-2 right-2 z-10">
                      <Badge className="dark:bg-[#00ad46] text-white flex items-center gap-1 px-3 py-2 text-base shadow-lg border-2 border-green-400">
                        <CheckCheck className="h-4 w-4" />
                        Confirmado
                      </Badge>
                    </div>
                  )}
                  
                  <CardHeader className="text-center">
                    <div className="text-7xl mb-4">{getSportIcon(sport.name)}</div>
                    <CardTitle className="text-4xl">{sport.name}</CardTitle>
                    <CardDescription className="text-white text-md">
                      {getSportSchedule(sport)}
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent className="text-center">
                    {userConfirmation?.has_guest && (
                      <div className="mb-3 p-3 bg-green-400 rounded-lg">
                        <div className="flex items-center justify-center gap-1 text-sm text-gray-800">
                          <Users className="h-4 w-4" />
                          <span>Convidado: {userConfirmation.guest_name}</span>
                        </div>
                      </div>
                    )}
                    
                    <Button className="w-full">
                      {userConfirmation ? 'Ver Detalhes' : 'Entrar'}
                    </Button>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}
