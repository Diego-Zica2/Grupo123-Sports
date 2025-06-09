import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/integrations/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ThemeToggle } from '@/components/ThemeToggle'
import { GuestForm } from '@/components/GuestForm'
import { toast } from '@/hooks/use-toast'
import { Calendar, Clock, MapPin, Users } from 'lucide-react'

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
  sport?: Sport
}

interface UserProfile {
  id: string
  email: string
  full_name: string
  role: 'admin' | 'player'
  created_at: string
}

interface GameConfirmation {
  id: string
  game_id: string
  user_id: string
  confirmed_at: string
  user?: UserProfile
}

interface Guest {
  id: string
  game_id: string
  user_id: string
  name: string
  cpf: string
  created_at: string
}

export function SportHome() {
  const { sportId } = useParams()
  const navigate = useNavigate()
  const { user, signOut } = useAuth()
  const [sport, setSport] = useState<Sport | null>(null)
  const [nextGame, setNextGame] = useState<Game | null>(null)
  const [confirmations, setConfirmations] = useState<GameConfirmation[]>([])
  const [guests, setGuests] = useState<Guest[]>([])
  const [userConfirmed, setUserConfirmed] = useState(false)
  const [userGuest, setUserGuest] = useState<Guest | null>(null)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [showGuestForm, setShowGuestForm] = useState(false)

  useEffect(() => {
    if (sportId) {
      fetchSportData()
      fetchNextGame()
    }
    if (user) {
      fetchUserProfile()
    }
  }, [sportId, user])

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

  const fetchSportData = async () => {
    try {
      const { data, error } = await supabase
        .from('sports')
        .select('*')
        .eq('id', sportId)
        .single()

      if (error) throw error
      setSport(data)
    } catch (error) {
      console.error('Error fetching sport:', error)
      navigate('/sports')
    }
  }

  const fetchNextGame = async () => {
    try {
      // Buscar próximo jogo
      const { data: gameData, error: gameError } = await supabase
        .from('games')
        .select('*')
        .eq('sport_id', sportId)
        .gte('date', new Date().toISOString().split('T')[0])
        .order('date', { ascending: true })
        .limit(1)

      if (gameError) throw gameError

      if (gameData && gameData.length > 0) {
        setNextGame(gameData[0])
        
        // Buscar confirmações
        const { data: confirmData, error: confirmError } = await supabase
          .from('game_confirmations')
          .select(`
            *,
            user:users(*)
          `)
          .eq('game_id', gameData[0].id)

        if (confirmError) throw confirmError
        setConfirmations(confirmData || [])

        // Verificar se usuário atual confirmou
        const userConfirmation = confirmData?.find(c => c.user_id === user?.id)
        setUserConfirmed(!!userConfirmation)

        // Buscar convidados
        const { data: guestData, error: guestError } = await supabase
          .from('guests')
          .select('*')
          .eq('game_id', gameData[0].id)

        if (guestError) throw guestError
        setGuests(guestData || [])

        // Verificar se usuário tem convidado
        const userGuestData = guestData?.find(g => g.user_id === user?.id)
        setUserGuest(userGuestData || null)
      }
    } catch (error) {
      console.error('Error fetching game data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleConfirmPresence = async () => {
    if (!nextGame || !user) return

    try {
      const { error } = await supabase
        .from('game_confirmations')
        .insert([
          {
            game_id: nextGame.id,
            user_id: user.id,
          },
        ])

      if (error) throw error

      setUserConfirmed(true)
      fetchNextGame() // Refresh data
      toast({
        title: 'Presença confirmada!',
        description: 'Sua presença foi confirmada com sucesso.',
      })
    } catch (error) {
      console.error('Error confirming presence:', error)
      toast({
        title: 'Erro',
        description: 'Erro ao confirmar presença. Tente novamente.',
        variant: 'destructive',
      })
    }
  }

  const handleCancelPresence = async () => {
    if (!nextGame || !user) return

    if (!confirm('Tem certeza que deseja cancelar sua presença?')) return

    try {
      const { error } = await supabase
        .from('game_confirmations')
        .delete()
        .eq('game_id', nextGame.id)
        .eq('user_id', user.id)

      if (error) throw error

      // Se tinha convidado, remover também
      if (userGuest) {
        await supabase
          .from('guests')
          .delete()
          .eq('id', userGuest.id)
      }

      setUserConfirmed(false)
      setUserGuest(null)
      fetchNextGame() // Refresh data
      toast({
        title: 'Presença cancelada',
        description: 'Sua presença foi cancelada.',
      })
    } catch (error) {
      console.error('Error canceling presence:', error)
      toast({
        title: 'Erro',
        description: 'Erro ao cancelar presença. Tente novamente.',
        variant: 'destructive',
      })
    }
  }

  const handleCancelGuest = async () => {
    if (!userGuest) return

    if (!confirm('Tem certeza que deseja cancelar seu convidado?')) return

    try {
      const { error } = await supabase
        .from('guests')
        .delete()
        .eq('id', userGuest.id)

      if (error) throw error

      setUserGuest(null)
      fetchNextGame() // Refresh data
      toast({
        title: 'Convidado removido',
        description: 'Seu convidado foi removido.',
      })
    } catch (error) {
      console.error('Error removing guest:', error)
      toast({
        title: 'Erro',
        description: 'Erro ao remover convidado. Tente novamente.',
        variant: 'destructive',
      })
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('pt-BR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const getSportIcon = (sportName: string) => {
    switch (sportName?.toLowerCase()) {
      case 'vôlei':
        return '🏐'
      case 'futebol':
        return '⚽'
      default:
        return '🏃'
    }
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

  if (!sport) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Esporte não encontrado</h2>
          <Button onClick={() => navigate('/sports')}>
            Voltar aos Esportes
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <Button 
              variant="ghost" 
              onClick={() => navigate('/sports')}
              className="text-sm"
            >
              ← Voltar
            </Button>
            <div className="flex items-center space-x-2">
              <span className="text-2xl">{getSportIcon(sport.name)}</span>
              <div>
                <h1 className="text-lg font-semibold">{sport.name}</h1>
                <p className="text-sm text-muted-foreground">
                  {userProfile?.full_name || user?.email}
                </p>
              </div>
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
        {!nextGame ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📅</div>
            <h3 className="text-xl font-semibold mb-2">Nenhum jogo agendado</h3>
            <p className="text-muted-foreground">
              Não há jogos agendados para este esporte no momento.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Próximo Jogo */}
            <div className="lg:col-span-2">
              <Card className="border-2 border-primary">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <span className="text-2xl">{getSportIcon(sport.name)}</span>
                    Próximo Jogo
                  </CardTitle>
                  <CardDescription>
                    {formatDate(nextGame.date)}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{formatDate(nextGame.date)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{nextGame.time}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">
                        {confirmations.length}/{nextGame.max_players} jogadores
                      </span>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground mt-1" />
                    <div>
                      <p className="text-sm">{nextGame.location}</p>
                      {nextGame.google_maps_link && (
                        <a 
                          href={nextGame.google_maps_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-primary hover:underline"
                        >
                          Ver no Google Maps
                        </a>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2">
                    {!userConfirmed ? (
                      <Button 
                        onClick={handleConfirmPresence}
                        className="flex-1"
                        disabled={confirmations.length >= nextGame.max_players}
                      >
                        {confirmations.length >= nextGame.max_players 
                          ? 'Jogo Lotado' 
                          : 'Confirmar Presença'
                        }
                      </Button>
                    ) : (
                      <>
                        <Badge variant="secondary" className="flex-1 justify-center py-2">
                          ✓ Presença Confirmada
                        </Badge>
                        <Button 
                          variant="outline" 
                          onClick={handleCancelPresence}
                          className="flex-1"
                        >
                          Cancelar Presença
                        </Button>
                      </>
                    )}
                  </div>

                  {userConfirmed && !userGuest && (
                    <Button 
                      variant="secondary" 
                      onClick={() => setShowGuestForm(true)}
                      className="w-full"
                    >
                      Adicionar Convidado
                    </Button>
                  )}

                  {userGuest && (
                    <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <div>
                        <p className="text-sm font-medium">Convidado: {userGuest.name}</p>
                        <p className="text-xs text-muted-foreground">CPF: {userGuest.cpf}</p>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={handleCancelGuest}
                      >
                        Remover
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Jogadores Confirmados */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Jogadores Confirmados</CardTitle>
                  <CardDescription>
                    {confirmations.length} de {nextGame.max_players} vagas preenchidas
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {confirmations.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      Nenhum jogador confirmado ainda
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {confirmations.map((confirmation) => (
                        <div 
                          key={confirmation.id}
                          className="flex items-center justify-between p-2 bg-muted rounded"
                        >
                          <span className="text-sm font-medium">
                            {confirmation.user?.full_name || 'Usuário'}
                          </span>
                          {confirmation.user_id === user?.id && (
                            <Badge variant="secondary" className="text-xs">
                              Você
                            </Badge>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {guests.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Convidados</CardTitle>
                    <CardDescription>
                      {guests.length} convidado(s)
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {guests.map((guest) => (
                        <div 
                          key={guest.id}
                          className="flex items-center justify-between p-2 bg-muted rounded"
                        >
                          <span className="text-sm font-medium">
                            {guest.name}
                          </span>
                          {guest.user_id === user?.id && (
                            <Badge variant="secondary" className="text-xs">
                              Seu convidado
                            </Badge>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        )}

        {showGuestForm && (
          <GuestForm
            gameId={nextGame?.id || ''}
            onClose={() => setShowGuestForm(false)}
            onSuccess={() => {
              setShowGuestForm(false)
              fetchNextGame()
            }}
          />
        )}
      </main>
    </div>
  )
}
