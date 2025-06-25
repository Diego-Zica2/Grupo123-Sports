
import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { toast } from 'sonner'
import { MapPin, Calendar, Clock, Users, UserPlus, ArrowLeft, Trash2, UserCheck, Settings } from 'lucide-react'
import { GuestForm } from './GuestForm'
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
  user?: {
    id: string
    email: string
    full_name: string
    role: string
    created_at: string
  }
}

interface Guest {
  id: string
  game_id: string
  user_id: string
  name: string
  cpf: string
  created_at: string
}

interface WaitingListEntry {
  id: string
  game_id: string
  user_id: string
  created_at: string
  user?: {
    id: string
    email: string
    full_name: string
    role: string
    created_at: string
  }
}

interface UserProfile {
  id: string
  email: string
  full_name: string
  role: 'admin' | 'player' | 'moderador_volei' | 'moderador_futebol'
  created_at: string
}

export function SportHome() {
  const { sportId } = useParams<{ sportId: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  
  const [sport, setSport] = useState<Sport | null>(null)
  const [game, setGame] = useState<Game | null>(null)
  const [confirmations, setConfirmations] = useState<GameConfirmation[]>([])
  const [guests, setGuests] = useState<Guest[]>([])
  const [waitingList, setWaitingList] = useState<WaitingListEntry[]>([])
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [showGuestForm, setShowGuestForm] = useState(false)
  const [processingWaitingList, setProcessingWaitingList] = useState(false)

  useEffect(() => {
    if (sportId && user) {
      fetchUserProfile()
      fetchData()
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

  const fetchData = async () => {
    if (!sportId) return

    try {
      // Fetch sport
      const { data: sportData, error: sportError } = await supabase
        .from('sports')
        .select('*')
        .eq('id', sportId)
        .single()

      if (sportError) throw sportError
      setSport(sportData)

      // Fetch active game for this sport
      const { data: gameData, error: gameError } = await supabase
        .from('games')
        .select(`
          *,
          sport:sports(*)
        `)
        .eq('sport_id', sportId)
        .eq('visible', true)
        .gte('date', new Date().toISOString().split('T')[0])
        .order('date', { ascending: true })
        .limit(1)

      if (gameError) throw gameError

      const activeGame = gameData && gameData.length > 0 ? gameData[0] : null
      setGame(activeGame)

      if (activeGame) {
        // Fetch confirmations
        const { data: confirmationsData, error: confirmationsError } = await supabase
          .from('game_confirmations')
          .select(`
            *,
            user:users(*)
          `)
          .eq('game_id', activeGame.id)
          .order('confirmed_at', { ascending: true })

        if (confirmationsError) throw confirmationsError
        setConfirmations(confirmationsData || [])

        // Fetch guests
        const { data: guestsData, error: guestsError } = await supabase
          .from('guests')
          .select('*')
          .eq('game_id', activeGame.id)
          .order('created_at', { ascending: true })

        if (guestsError) throw guestsError
        setGuests(guestsData || [])

        // Fetch waiting list
        const { data: waitingData, error: waitingError } = await supabase
          .from('waiting_list')
          .select(`
            *,
            user:users(*)
          `)
          .eq('game_id', activeGame.id)
          .order('created_at', { ascending: true })

        if (waitingError) throw waitingError
        setWaitingList(waitingData || [])
      }

    } catch (error) {
      console.error('Error fetching data:', error)
      toast.error('Erro ao carregar dados')
    } finally {
      setLoading(false)
    }
  }

  const canModerateSport = () => {
    if (!userProfile || !sport) return false
    if (userProfile.role === 'admin') return true
    if (userProfile.role === 'moderador_volei' && sport.name === 'Vôlei') return true
    if (userProfile.role === 'moderador_futebol' && sport.name === 'Futebol') return true
    return false
  }

  const isUserConfirmed = confirmations.some(c => c.user_id === user?.id)
  const isUserWaiting = waitingList.some(w => w.user_id === user?.id)
  const userGuest = guests.find(g => g.user_id === user?.id)
  
  const totalConfirmed = confirmations.length + guests.length
  const availableSpots = game ? game.max_players - totalConfirmed : 0
  const isGameFull = availableSpots <= 0

  const handleConfirmPresence = async () => {
    if (!game || !user) return

    try {
      if (isGameFull) {
        // Add to waiting list
        const { error } = await supabase
          .from('waiting_list')
          .insert([{
            game_id: game.id,
            user_id: user.id
          }])

        if (error) throw error
        toast.success('Você foi adicionado à lista de espera!')
      } else {
        // Confirm presence
        const { error } = await supabase
          .from('game_confirmations')
          .insert([{
            game_id: game.id,
            user_id: user.id
          }])

        if (error) throw error
        toast.success('Presença confirmada!')
      }

      fetchData()
    } catch (error) {
      console.error('Error confirming presence:', error)
      toast.error('Erro ao confirmar presença')
    }
  }

  const handleCancelPresence = async () => {
    if (!game || !user) return

    try {
      const { error } = await supabase.rpc('remove_user_confirmation', {
        game_id_param: game.id,
        user_id_param: user.id
      })

      if (error) throw error
      toast.success('Presença cancelada!')
      fetchData()
    } catch (error) {
      console.error('Error canceling presence:', error)
      toast.error('Erro ao cancelar presença')
    }
  }

  const handleLeaveWaitingList = async () => {
    if (!game || !user) return

    try {
      const { error } = await supabase.rpc('remove_user_from_waiting_list', {
        game_id_param: game.id,
        user_id_param: user.id
      })

      if (error) throw error
      toast.success('Removido da lista de espera!')
      fetchData()
    } catch (error) {
      console.error('Error leaving waiting list:', error)
      toast.error('Erro ao sair da lista de espera')
    }
  }

  const handleRemoveGuest = async (guestId: string) => {
    try {
      const { error } = await supabase.rpc('remove_guest', {
        guest_id_param: guestId
      })

      if (error) throw error
      toast.success('Convidado removido!')
      fetchData()
    } catch (error) {
      console.error('Error removing guest:', error)
      toast.error('Erro ao remover convidado')
    }
  }

  const handleRemoveConfirmation = async (userId: string) => {
    if (!game) return

    try {
      const { error } = await supabase.rpc('remove_user_confirmation', {
        game_id_param: game.id,
        user_id_param: userId
      })

      if (error) throw error
      toast.success('Confirmação removida!')
      fetchData()
    } catch (error) {
      console.error('Error removing confirmation:', error)
      toast.error('Erro ao remover confirmação')
    }
  }

  const handleProcessWaitingList = async () => {
    if (!game) return

    setProcessingWaitingList(true)
    try {
      const { error } = await supabase.rpc('process_waiting_list_and_confirm', {
        game_id_param: game.id
      })

      if (error) throw error
      toast.success('Lista de espera processada!')
      fetchData()
    } catch (error) {
      console.error('Error processing waiting list:', error)
      toast.error('Erro ao processar lista de espera')
    } finally {
      setProcessingWaitingList(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString + 'T00:00:00')
    return date.toLocaleDateString('pt-BR', {
      timeZone: 'America/Sao_Paulo',
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatTime = (timeString: string) => {
    const time = new Date(`2000-01-01T${timeString}:00`)
    return time.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'America/Sao_Paulo'
    })
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
        <Card className="w-96">
          <CardHeader>
            <CardTitle>Esporte não encontrado</CardTitle>
            <CardDescription>
              O esporte solicitado não foi encontrado.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate('/')} className="w-full">
              Voltar
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" onClick={() => navigate('/')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
            <div className="flex items-center space-x-2">
              <span className="text-2xl">{sport.icon}</span>
              <h1 className="text-xl font-semibold">{sport.name}</h1>
            </div>
          </div>
          <HeaderDropdown />
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {!game ? (
          <Card className="max-w-2xl mx-auto">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Nenhum jogo ativo</CardTitle>
              <CardDescription>
                Não há jogos de {sport.name} programados no momento.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Button onClick={() => navigate('/')} variant="outline">
                Voltar aos Esportes
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* Game Info Card */}
            <Card className="max-w-4xl mx-auto">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-2xl flex items-center gap-2">
                    <span className="text-3xl">{sport.icon}</span>
                    Próximo Jogo - {sport.name}
                  </CardTitle>
                  {canModerateSport() && waitingList.length > 0 && (
                    <Button
                      onClick={handleProcessWaitingList}
                      disabled={processingWaitingList}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      {processingWaitingList ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                      ) : (
                        <Settings className="h-4 w-4 mr-2" />
                      )}
                      Processar Lista de Espera
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-5 w-5 text-muted-foreground" />
                    <span>{formatDate(game.date)}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="h-5 w-5 text-muted-foreground" />
                    <span>{formatTime(game.time)}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Users className="h-5 w-5 text-muted-foreground" />
                    <span>{totalConfirmed}/{game.max_players} jogadores</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-5 w-5 text-muted-foreground" />
                    <div className="flex-1">
                      <span className="break-words">{game.location}</span>
                      {game.google_maps_link && (
                        <a
                          href={game.google_maps_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="ml-2 text-primary hover:underline text-sm"
                        >
                          Ver no mapa
                        </a>
                      )}
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-3 pt-4">
                  {!isUserConfirmed && !isUserWaiting && (
                    <Button onClick={handleConfirmPresence} className="flex-1 min-w-[200px]">
                      {isGameFull ? 'Entrar na Lista de Espera' : 'Confirmar Presença'}
                    </Button>
                  )}

                  {isUserConfirmed && (
                    <>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" className="flex-1 min-w-[200px]">
                            Cancelar Presença
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Cancelar Presença</AlertDialogTitle>
                            <AlertDialogDescription>
                              Tem certeza que deseja cancelar sua presença neste jogo? Esta ação não pode ser desfeita.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction onClick={handleCancelPresence}>
                              Confirmar Cancelamento
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>

                      {!userGuest && (
                        <Button
                          onClick={() => setShowGuestForm(true)}
                          variant="outline"
                          className="flex-1 min-w-[200px]"
                        >
                          <UserPlus className="h-4 w-4 mr-2" />
                          Adicionar Convidado
                        </Button>
                      )}
                    </>
                  )}

                  {isUserWaiting && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" className="flex-1 min-w-[200px]">
                          Sair da Lista de Espera
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Sair da Lista de Espera</AlertDialogTitle>
                          <AlertDialogDescription>
                            Tem certeza que deseja sair da lista de espera? Você perderá sua posição na fila.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction onClick={handleLeaveWaitingList}>
                            Sair da Lista
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Status Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {/* Confirmed Players */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <UserCheck className="h-5 w-5" />
                    Confirmados ({confirmations.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {confirmations.length === 0 ? (
                    <p className="text-muted-foreground text-center py-4">
                      Nenhum jogador confirmado
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {confirmations.map((confirmation, index) => (
                        <div key={confirmation.id} className="flex items-center justify-between p-2 bg-muted rounded">
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary">{index + 1}</Badge>
                            <span className="font-medium">
                              {confirmation.user?.full_name || confirmation.user?.email || 'Usuário'}
                            </span>
                          </div>
                          {canModerateSport() && (
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button size="sm" variant="ghost" className="text-red-500 hover:text-red-700">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Remover Confirmação</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Tem certeza que deseja remover a confirmação de {confirmation.user?.full_name}?
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleRemoveConfirmation(confirmation.user_id)}>
                                    Remover
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Guests */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <UserPlus className="h-5 w-5" />
                    Convidados ({guests.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {guests.length === 0 ? (
                    <p className="text-muted-foreground text-center py-4">
                      Nenhum convidado
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {guests.map((guest, index) => (
                        <div key={guest.id} className="flex items-center justify-between p-2 bg-muted rounded">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">{confirmations.length + index + 1}</Badge>
                            <div>
                              <div className="font-medium">{guest.name}</div>
                              <div className="text-sm text-muted-foreground">CPF: {guest.cpf}</div>
                            </div>
                          </div>
                          {(canModerateSport() || guest.user_id === user?.id) && (
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button size="sm" variant="ghost" className="text-red-500 hover:text-red-700">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Remover Convidado</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Tem certeza que deseja remover o convidado {guest.name}?
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleRemoveGuest(guest.id)}>
                                    Remover
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Waiting List */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Lista de Espera ({waitingList.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {waitingList.length === 0 ? (
                    <p className="text-muted-foreground text-center py-4">
                      Lista de espera vazia
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {waitingList.map((entry, index) => (
                        <div key={entry.id} className="flex items-center justify-between p-2 bg-muted rounded">
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary">{index + 1}</Badge>
                            <span className="font-medium">
                              {entry.user?.full_name || entry.user?.email || 'Usuário'}
                            </span>
                          </div>
                          {canModerateSport() && (
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button size="sm" variant="ghost" className="text-red-500 hover:text-red-700">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Remover da Lista de Espera</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Tem certeza que deseja remover {entry.user?.full_name} da lista de espera?
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleLeaveWaitingList()}>
                                    Remover
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Guest Form Modal */}
        {showGuestForm && game && (
          <GuestForm
            gameId={game.id}
            onClose={() => setShowGuestForm(false)}
            onSuccess={() => {
              setShowGuestForm(false)
              fetchData()
            }}
          />
        )}
      </main>
    </div>
  )
}
