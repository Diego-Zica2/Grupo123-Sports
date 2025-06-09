import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/integrations/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ThemeToggle } from '@/components/ThemeToggle'

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

export function SportSelection() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const [sports, setSports] = useState<Sport[]>([])
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSports()
    if (user) {
      fetchUserProfile()
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
      
      // Type assertion to ensure role is the correct type
      const profileData: UserProfile = {
        ...data,
        role: data.role as 'admin' | 'player'
      }
      setUserProfile(profileData)
    } catch (error) {
      console.error('Error fetching user profile:', error)
    }
  }

  const fetchSports = async () => {
    try {
      const { data, error } = await supabase
        .from('sports')
        .select('*')
        .eq('visible', true)
        .order('name')

      if (error) throw error
      setSports(data || [])
    } catch (error) {
      console.error('Error fetching sports:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSportSelect = (sportId: string) => {
    navigate(`/sport/${sportId}`)
  }

  const getSportIcon = (sportName: string) => {
    switch (sportName.toLowerCase()) {
      case 'vôlei':
        return '🏐'
      case 'futebol':
        return '⚽'
      default:
        return '🏃'
    }
  }

  const getSportSchedule = (sport: Sport) => {
    const days = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado']
    return `${days[sport.day_of_week]} às ${sport.time}`
  }

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
            <div className="h-10 w-20 bg-gradient-to-r from-maxmilhas-orange to-maxmilhas-blue rounded flex items-center justify-center">
              <span className="text-white font-bold text-sm">MaxMilhas</span>
            </div>
            <div>
              <h1 className="text-lg font-semibold">Bem-vindo, {userProfile?.full_name || user?.email}</h1>
              <p className="text-sm text-muted-foreground">Escolha um esporte para participar</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {userProfile?.role === 'admin' && (
              <Button 
                variant="outline" 
                onClick={() => navigate('/admin')}
                className="mr-2"
              >
                Admin
              </Button>
            )}
            <ThemeToggle />
            <Button variant="outline" onClick={signOut}>
              Sair
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-2">Escolha seu Esporte</h2>
          <p className="text-muted-foreground">
            Selecione o esporte que deseja participar e confirme sua presença
          </p>
        </div>

        {sports.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🏃</div>
            <h3 className="text-xl font-semibold mb-2">Nenhum esporte disponível</h3>
            <p className="text-muted-foreground">
              Os esportes serão disponibilizados em breve!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {sports.map((sport) => (
              <Card 
                key={sport.id} 
                className="hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-primary"
                onClick={() => handleSportSelect(sport.id)}
              >
                <CardHeader className="text-center">
                  <div className="text-6xl mb-2">{getSportIcon(sport.name)}</div>
                  <CardTitle className="text-xl">{sport.name}</CardTitle>
                  <CardDescription>
                    {getSportSchedule(sport)}
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                  <Button className="w-full">
                    Entrar
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
