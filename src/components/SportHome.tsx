import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/integrations/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { GuestForm } from '@/components/GuestForm'
import { toast } from '@/hooks/use-toast'
import { Calendar, Clock, MapPin, Users, X, Trash2, CheckCheck, ListChecks, SmilePlus, Clock10, UserRoundCheck, UsersRound } from 'lucide-react'
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from '@/components/ui/alert-dialog'
import { HeaderDropdown } from './HeaderDropdown'
import { Link } from 'react-router-dom'
import { ArrowLeft, Shield } from 'lucide-react'

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
  invited_by?: UserProfile
}

interface WaitingListEntry {
  id: string
  game_id: string
  user_id: string
  created_at: string
  user?: UserProfile
}

export function SportHome() {
  const { sportId } = useParams()
  const navigate = useNavigate()
  const { user, signOut } = useAuth()
  const [sport, setSport] = useState<Sport | null>(null)
  const [nextGame, setNextGame] = useState<Game | null>(null)
  const [confirmations, setConfirmations] = useState<GameConfirmation[]>([])
  const [guests, setGuests] = useState<Guest[]>([])
  const [waitingList, setWaitingList] = useState<WaitingListEntry[]>([])
  const [userConfirmed, setUserConfirmed] = useState(false)
  const [userInWaitingList, setUserInWaitingList] = useState(false)
  const [userGuest, setUserGuest] = useState<Guest | null>(null)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [showGuestForm, setShowGuestForm] = useState(false)
  const [showProcessedList, setShowProcessedList] = useState(false)
  const [processedList, setProcessedList] = useState<string>('')

  // Estados para AlertDialog
  const [alertDialog, setAlertDialog] = useState<null | {
    type: 'leave-waiting-list' | 'cancel-presence' | 'cancel-guest' | 'admin-remove-user' | 'admin-remove-guest' | 'admin-remove-waiting'
    payload?: any
  }>(null)

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
      const profileData: UserProfile = {
        id: data.id,
        email: data.email,
        full_name: data.full_name,
        role: data.role as 'admin' | 'player',
        created_at: data.created_at
      }
      setUserProfile(profileData)
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
      const { data: gameData, error: gameError } = await supabase
        .from('games')
        .select('*')
        .eq('sport_id', sportId)
        .eq('visible', true)
        .gte('date', new Date().toISOString().split('T')[0])
        .order('date', { ascending: true })
        .limit(1)
      if (gameError) throw gameError
      if (gameData && gameData.length > 0) {
        setNextGame(gameData[0])
        const { data: confirmData, error: confirmError } = await supabase
          .from('game_confirmations')
          .select('*')
          .eq('game_id', gameData[0].id)
        if (confirmError) throw confirmError
        if (confirmData && confirmData.length > 0) {
          const userIds = confirmData.map(c => c.user_id)
          const { data: usersData, error: usersError } = await supabase
            .from('users')
            .select('*')
            .in('id', userIds)
          if (usersError) throw usersError
          const confirmationsWithUsers: GameConfirmation[] = confirmData.map(confirmation => {
            const userData = usersData?.find(u => u.id === confirmation.user_id)
            return {
              id: confirmation.id,
              game_id: confirmation.game_id,
              user_id: confirmation.user_id,
              confirmed_at: confirmation.confirmed_at || '',
              user: userData ? {
                id: userData.id,
                email: userData.email,
                full_name: userData.full_name,
                role: userData.role as 'admin' | 'player',
                created_at: userData.created_at
              } : undefined
            }
          })
          setConfirmations(confirmationsWithUsers)
        } else {
          setConfirmations([])
        }
        const userConfirmation = confirmData?.find(c => c.user_id === user?.id)
        setUserConfirmed(!!userConfirmation)
        const { data: guestData, error: guestError } = await supabase
          .from('guests')
          .select('*')
          .eq('game_id', gameData[0].id)
        if (guestError) throw guestError
        if (guestData && guestData.length > 0) {
          const inviterIds = guestData.map(g => g.user_id)
          const { data: invitersData, error: invitersError } = await supabase
            .from('users')
            .select('*')
            .in('id', inviterIds)
          if (invitersError) throw invitersError
          const guestsWithInviters: Guest[] = guestData.map(guest => {
            const inviterData = invitersData?.find(u => u.id === guest.user_id)
            return {
              id: guest.id,
              game_id: guest.game_id,
              user_id: guest.user_id,
              name: guest.name,
              cpf: guest.cpf,
              created_at: guest.created_at,
              invited_by: inviterData ? {
                id: inviterData.id,
                email: inviterData.email,
                full_name: inviterData.full_name,
                role: inviterData.role as 'admin' | 'player',
                created_at: inviterData.created_at
              } : undefined
            }
          })
          setGuests(guestsWithInviters)
        } else {
          setGuests([])
        }
        const userGuestData = guestData?.find(g => g.user_id === user?.id)
        setUserGuest(userGuestData ? {
          id: userGuestData.id,
          game_id: userGuestData.game_id,
          user_id: userGuestData.user_id,
          name: userGuestData.name,
          cpf: userGuestData.cpf,
          created_at: userGuestData.created_at
        } : null)
        const { data: waitingData, error: waitingError } = await supabase
          .from('waiting_list')
          .select('*')
          .eq('game_id', gameData[0].id)
          .order('created_at', { ascending: true })
        if (waitingError) throw waitingError
        if (waitingData && waitingData.length > 0) {
          const waitingUserIds = waitingData.map(w => w.user_id)
          const { data: waitingUsersData, error: waitingUsersError } = await supabase
            .from('users')
            .select('*')
            .in('id', waitingUserIds)
          if (waitingUsersError) throw waitingUsersError
          const waitingListWithUsers: WaitingListEntry[] = waitingData.map(waiting => {
            const userData = waitingUsersData?.find(u => u.id === waiting.user_id)
            return {
              id: waiting.id,
              game_id: waiting.game_id,
              user_id: waiting.user_id,
              created_at: waiting.created_at,
              user: userData ? {
                id: userData.id,
                email: userData.email,
                full_name: userData.full_name,
                role: userData.role as 'admin' | 'player',
                created_at: userData.created_at
              } : undefined
            }
          })
          setWaitingList(waitingListWithUsers)
        } else {
          setWaitingList([])
        }
        const userInWaiting = waitingData?.find(w => w.user_id === user?.id)
        setUserInWaitingList(!!userInWaiting)
      } else {
        setNextGame(null)
        setConfirmations([])
        setGuests([])
        setWaitingList([])
        setUserConfirmed(false)
        setUserInWaitingList(false)
        setUserGuest(null)
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
      fetchNextGame()
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

  const handleJoinWaitingList = async () => {
    if (!nextGame || !user) return
    try {
      const { error } = await supabase
        .from('waiting_list')
        .insert([
          {
            game_id: nextGame.id,
            user_id: user.id,
          },
        ])
      if (error) throw error
      setUserInWaitingList(true)
      fetchNextGame()
      toast({
        title: 'Adicionado à lista de espera!',
        description: 'Você foi adicionado à lista de espera.',
      })
    } catch (error) {
      console.error('Error joining waiting list:', error)
      toast({
        title: 'Erro',
        description: 'Erro ao entrar na lista de espera. Tente novamente.',
        variant: 'destructive',
      })
    }
  }

  // Todas as funções de exclusão/remoção agora NÃO possuem confirm(), apenas executam
  const handleLeaveWaitingList = async () => {
    if (!nextGame || !user) return
    try {
      const { error } = await supabase
        .from('waiting_list')
        .delete()
        .eq('game_id', nextGame.id)
        .eq('user_id', user.id)
      if (error) throw error
      setUserInWaitingList(false)
      fetchNextGame()
      toast({
        title: 'Removido da lista de espera',
        description: 'Você foi removido da lista de espera.',
      })
    } catch (error) {
      console.error('Error leaving waiting list:', error)
      toast({
        title: 'Erro',
        description: 'Erro ao sair da lista de espera. Tente novamente.',
        variant: 'destructive',
      })
    }
  }

  const handleCancelPresence = async () => {
    if (!nextGame || !user) return
    try {
      const { error } = await supabase.rpc('remove_user_confirmation', {
        game_id_param: nextGame.id,
        user_id_param: user.id
      })
      if (error) throw error
      const { data: waitingData, error: waitingError } = await supabase
        .from('waiting_list')
        .select('*')
        .eq('game_id', nextGame.id)
        .order('created_at', { ascending: true })
        .limit(1)
      if (waitingError) throw waitingError
      if (waitingData && waitingData.length > 0) {
        const firstInLine = waitingData[0]
        const { error: confirmError } = await supabase
          .from('game_confirmations')
          .insert([
            {
              game_id: nextGame.id,
              user_id: firstInLine.user_id,
            },
          ])
        if (confirmError) throw confirmError
        const { error: removeWaitingError } = await supabase
          .from('waiting_list')
          .delete()
          .eq('id', firstInLine.id)
        if (removeWaitingError) throw removeWaitingError
      }
      setUserConfirmed(false)
      setUserGuest(null)
      fetchNextGame()
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
    try {
      const { error } = await supabase.rpc('remove_guest', {
        guest_id_param: userGuest.id
      })
      if (error) throw error
      setUserGuest(null)
      fetchNextGame()
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

  const handleAdminRemoveUser = async (confirmationUserId: string) => {
    if (!nextGame || !userProfile || userProfile.role !== 'admin') return
    try {
      const { error } = await supabase.rpc('remove_user_confirmation', {
        game_id_param: nextGame.id,
        user_id_param: confirmationUserId
      })
      if (error) throw error
      const { data: waitingData, error: waitingError } = await supabase
        .from('waiting_list')
        .select('*')
        .eq('game_id', nextGame.id)
        .order('created_at', { ascending: true })
        .limit(1)
      if (waitingError) throw waitingError
      if (waitingData && waitingData.length > 0) {
        const firstInLine = waitingData[0]
        const { error: confirmError } = await supabase
          .from('game_confirmations')
          .insert([
            {
              game_id: nextGame.id,
              user_id: firstInLine.user_id,
            },
          ])
        if (confirmError) throw confirmError
        const { error: removeWaitingError } = await supabase
          .from('waiting_list')
          .delete()
          .eq('id', firstInLine.id)
        if (removeWaitingError) throw removeWaitingError
      }
      fetchNextGame()
      toast({
        title: 'Usuário removido',
        description: 'O usuário foi removido do jogo.',
      })
    } catch (error) {
      console.error('Error removing user:', error)
      toast({
        title: 'Erro',
        description: 'Erro ao remover usuário. Tente novamente.',
        variant: 'destructive',
      })
    }
  }

  const handleAdminRemoveGuest = async (guestId: string) => {
    if (!userProfile || userProfile.role !== 'admin') return
    try {
      const { error } = await supabase.rpc('remove_guest', {
        guest_id_param: guestId
      })
      if (error) throw error
      fetchNextGame()
      toast({
        title: 'Convidado removido',
        description: 'O convidado foi removido do jogo.',
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

  const handleAdminRemoveFromWaitingList = async (waitingUserId: string) => {
    if (!nextGame || !userProfile || userProfile.role !== 'admin') return
    try {
      const { error } = await supabase.rpc('remove_user_from_waiting_list', {
        game_id_param: nextGame.id,
        user_id_param: waitingUserId
      })
      if (error) throw error
      fetchNextGame()
      toast({
        title: 'Usuário removido da lista de espera',
        description: 'O usuário foi removido da lista de espera.',
      })
    } catch (error) {
      console.error('Error removing user from waiting list:', error)
      toast({
        title: 'Erro',
        description: 'Erro ao remover usuário da lista de espera. Tente novamente.',
        variant: 'destructive',
      })
    }
  }

  const handleShowProcessedList = () => {
    if (!nextGame) return
    const sortedConfirmations = [...confirmations].sort((a, b) =>
      new Date(a.confirmed_at).getTime() - new Date(b.confirmed_at).getTime()
    )
    const sortedWaitingList = [...waitingList].sort((a, b) =>
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    )
    const sortedGuests = [...guests].sort((a, b) =>
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    )
    const maxPlayers = nextGame.max_players
    let vagasRestantes = maxPlayers
    const jogadores = sortedConfirmations.slice(0, maxPlayers)
    vagasRestantes -= jogadores.length
    let listaEspera: typeof waitingList = []
    if (vagasRestantes > 0) {
      listaEspera = sortedWaitingList.slice(0, vagasRestantes)
      vagasRestantes -= listaEspera.length
    }
    let listaConvidados: typeof guests = []
    if (vagasRestantes > 0) {
      listaConvidados = sortedGuests.slice(0, vagasRestantes)
    }
    let output = ''
    let count = 1
    output += 'Jogadores Confirmados:\n\n'
    jogadores.forEach(j => {
      output += `${count++}. ${j.user?.full_name || j.user?.email || 'Usuário'}\n`
    })
    if (listaEspera.length > 0) {
      output += '\nLista de Espera:\n\n'
      listaEspera.forEach(w => {
        output += `${count++}. ${w.user?.full_name || w.user?.email || 'Usuário'}\n`
      })
    }
    if (listaConvidados.length > 0) {
      output += '\nConvidados:\n\n'
      listaConvidados.forEach(g => {
        output += `${count++}. ${g.name}\n`
      })
    }
    setProcessedList(output)
    setShowProcessedList(true)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString + 'T00:00:00')
    return date.toLocaleDateString('pt-BR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      timeZone: 'America/Sao_Paulo'
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

  const getGameTimeRange = (sportName: string, startTime: string) => {
    const startDate = new Date(`2000-01-01T${startTime}:00`)
    let endDate = new Date(startDate)
    if (sportName.toLowerCase() === 'vôlei') {
      endDate.setHours(endDate.getHours() + 2)
    } else if (sportName.toLowerCase() === 'futebol') {
      endDate.setMinutes(endDate.getMinutes() + 90)
    }
    const start = startDate.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'America/Sao_Paulo'
    })
    const end = endDate.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'America/Sao_Paulo'
    })
    return `${start} às ${end}`
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

  const canAddGuest = guests.length < 10 && userConfirmed && !userGuest
  const isGameFull = confirmations.length >= (nextGame?.max_players || 0)

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
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" asChild>
              <Link to="/sports">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar
              </Link>
            </Button>
            <h1 className="text-2xl font-bold text-primary">Grupo123 Sports</h1>
          </div>
          <div className="flex items-center gap-4">
            {user?.role === 'admin' && (
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
              <Card className="border-2 border-secondary">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <span className="text-2xl">{getSportIcon(sport.name)}</span>
                    Próximo Jogo
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{formatDate(nextGame.date)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{getGameTimeRange(sport?.name, nextGame.time)}</span>
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
                    {!userConfirmed && !userInWaitingList ? (
                      <>
                        <Button 
                          onClick={handleConfirmPresence}
                          className="flex-1 text-black hover:text-white"
                          disabled={isGameFull}
                        >
                          <CheckCheck className="h-4 w-4" />
                          {isGameFull ? 'Jogo Lotado' : 'Confirmar Presença'}
                        </Button>
                        {isGameFull && (
                          <Button 
                            onClick={handleJoinWaitingList}                            
                            className="flex-1 bg-yellow-500 hover:bg-yellow-500 text-black hover:text-white"
                          >
                            <Clock10 className="h-4 w-4" />
                            Entrar na Lista de Espera
                          </Button>
                        )}
                      </>
                    ) : userConfirmed ? (
                      <>
                        <Badge className="flex-1 justify-center py-2 gap-2 hover:bg-transparent bg-transparent border-[#00ad46] text-[#00ad46]">
                          <CheckCheck className="h-4 w-4" />
                          Presença Confirmada
                        </Badge>
                        <AlertDialog open={alertDialog?.type === 'cancel-presence'} onOpenChange={open => !open && setAlertDialog(null)}>
                          <AlertDialogTrigger asChild>
                            <Button
                              className="flex-1 bg-primary text-black hover:text-white"
                              onClick={() => setAlertDialog({ type: 'cancel-presence' })}
                            >
                              <X className="h-4 w-4" />
                              Cancelar Presença
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Cancelar presença?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Tem certeza que deseja cancelar sua presença neste jogo? Esta ação pode liberar sua vaga para outro participante.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel onClick={() => setAlertDialog(null)}>Cancelar</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => {
                                  setAlertDialog(null)
                                  handleCancelPresence()
                                }}
                              >
                                Confirmar
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </>
                    ) : userInWaitingList ? (
                      <>
                        <Badge className="flex-1 justify-center py-2 gap-2 hover:bg-transparent bg-transparent border-orange-500 text-orange-500">
                          <Clock10 className="h-4 w-4" />
                          Na Lista de Espera
                        </Badge>
                        <AlertDialog open={alertDialog?.type === 'leave-waiting-list'} onOpenChange={open => !open && setAlertDialog(null)}>
                          <AlertDialogTrigger asChild>
                            <Button
                              className="flex-1 text-black hover:text-white"
                              onClick={() => setAlertDialog({ type: 'leave-waiting-list' })}
                            >
                              <X className="h-4 w-4" />
                              Sair da Lista de Espera
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Sair da lista de espera?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Tem certeza que deseja sair da lista de espera deste jogo? Você perderá sua posição na fila.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel onClick={() => setAlertDialog(null)}>Cancelar</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => {
                                  setAlertDialog(null)
                                  handleLeaveWaitingList()
                                }}
                              >
                                Confirmar
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </>
                    ) : null}
                  </div>

                  {canAddGuest && (
                    <Button 
                      variant="secondary" 
                      onClick={() => setShowGuestForm(true)}
                      className="w-full"
                    >
                      Adicionar Convidado ({guests.length}/10)
                    </Button>
                  )}

                  {guests.length >= 10 && (
                    <div className="text-center p-2 bg-orange-100 text-orange-800 rounded-lg text-sm">
                      Limite de convidados atingido (10/10)
                    </div>
                  )}

                  {/* BOX DO CONVIDADO DO USUÁRIO LOGO ABAIXO DO CARD */}
                  {userGuest && (
                    <div className="flex items-center justify-between p-3 mt-4 bg-muted rounded-lg">
                      <div>
                        <p className="text-sm font-medium">Convidado: {userGuest.name}</p>
                        <p className="text-xs text-muted-foreground">CPF: {userGuest.cpf}</p>
                      </div>
                      <AlertDialog open={alertDialog?.type === 'cancel-guest'} onOpenChange={open => !open && setAlertDialog(null)}>
                        <AlertDialogTrigger asChild>
                          <Button 
                            className="bg-primary text-black hover:text-white"
                            size="sm"
                            onClick={() => setAlertDialog({ type: 'cancel-guest' })}
                          >
                            <Trash2 className="h-4 w-4" />                        
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Remover convidado?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Tem certeza que deseja remover seu convidado deste jogo? Esta ação não pode ser desfeita.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel onClick={() => setAlertDialog(null)}>Cancelar</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => {
                                setAlertDialog(null)
                                handleCancelGuest()
                              }}
                            >
                              Confirmar
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                </div>
              )}              
                </CardContent>                
              </Card>

              {userProfile?.role === 'admin' && (
                <Button
                  onClick={handleShowProcessedList}
                  variant="outline"
                  className="w-full bg-transparent border-primary text-primary hover:bg-primary hover:text-black mt-4"
                >
                  Processar Lista de Confirmados
                </Button>
              )}
              

              {showProcessedList && (
                <Card className="mt-6 border-2 border">
                  <CardHeader>
                    <CardTitle>Lista Processada para Copiar</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <textarea
                      className="w-full h-48 p-2 border rounded bg-muted text-white"
                      value={processedList}
                      readOnly
                      onFocus={e => e.target.select()}
                    />
                    <Button
                      className="mt-2"
                      onClick={() => setShowProcessedList(false)}
                      variant="secondary"
                    >
                      Fechar
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>            

            {/* Jogadores Confirmados e Lista de Espera */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <ListChecks className="h-6 w-6" /> 
                    Jogadores Confirmados
                  </CardTitle>
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
                          <span className="flex justify-center text-sm font-medium gap-2">
                            <UserRoundCheck className="h-4 w-4 text-muted-foreground" />
                            {confirmation.user?.full_name || confirmation.user?.email || 'Usuário Desconhecido'}
                          </span>
                          <div className="flex items-center gap-2">
                            {confirmation.user_id === user?.id && (
                              <Badge variant="secondary" className="text-xs">
                                Você
                              </Badge>
                            )}
                            {userProfile?.role === 'admin' && confirmation.user_id !== user?.id && (
                              <AlertDialog open={alertDialog?.type === 'admin-remove-user' && alertDialog.payload === confirmation.user_id} onOpenChange={open => !open && setAlertDialog(null)}>
                                <AlertDialogTrigger asChild>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => setAlertDialog({ type: 'admin-remove-user', payload: confirmation.user_id })}
                                    className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                                  >
                                    <X className="h-3 w-3" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Remover usuário?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Tem certeza que deseja remover este usuário do jogo? Esta ação não pode ser desfeita.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel onClick={() => setAlertDialog(null)}>Cancelar</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => {
                                        setAlertDialog(null)
                                        handleAdminRemoveUser(confirmation.user_id)
                                      }}
                                    >
                                      Confirmar
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
              {waitingList.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Clock10 className="h-6 w-6" /> 
                      Lista de Espera
                    </CardTitle>
                    <CardDescription>
                      {waitingList.length} pessoa(s) na lista de espera
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {waitingList.map((waiting) => (
                        <div 
                          key={waiting.id}
                          className="flex items-center justify-between p-2 bg-muted rounded"
                        >
                          <span className="flex justify-center gap-2 text-sm font-medium">
                            <UserRoundCheck className="h-4 w-4 text-muted-foreground" />
                            {waiting.user?.full_name || waiting.user?.email || 'Usuário Desconhecido'}
                          </span>
                          <div className="flex items-center gap-2">
                            {waiting.user_id === user?.id && (
                              <Badge variant="secondary" className="text-xs">
                                Você
                              </Badge>
                            )}
                            {userProfile?.role === 'admin' && (
                              <AlertDialog open={alertDialog?.type === 'admin-remove-waiting' && alertDialog.payload === waiting.user_id} onOpenChange={open => !open && setAlertDialog(null)}>
                                <AlertDialogTrigger asChild>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => setAlertDialog({ type: 'admin-remove-waiting', payload: waiting.user_id })}
                                    className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                                  >
                                    <X className="h-3 w-3" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Remover da lista de espera?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Tem certeza que deseja remover este usuário da lista de espera? Esta ação não pode ser desfeita.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel onClick={() => setAlertDialog(null)}>Cancelar</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => {
                                        setAlertDialog(null)
                                        handleAdminRemoveFromWaitingList(waiting.user_id)
                                      }}
                                    >
                                      Confirmar
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
              {guests.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <SmilePlus className="h-6 w-6" /> 
                      Convidados
                    </CardTitle>
                    <CardDescription>
                      {guests.length} convidado(s) ({guests.length}/10)
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {guests.map((guest) => (
                        <div 
                          key={guest.id}
                          className="flex items-center justify-between p-2 bg-muted rounded"
                        >
                          <div>
                            <span className="flex justify-left gap-2 text-sm font-medium block">
                              <UsersRound className="h-4 w-4 text-muted-foreground" />
                              {guest.name}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              Convidado por: {guest.invited_by?.full_name || guest.invited_by?.email || 'Usuário Desconhecido'}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            {guest.user_id === user?.id && (
                              <Badge variant="secondary" className="text-xs">
                                Convidado
                              </Badge>
                            )}
                            {userProfile?.role === 'admin' && (
                              <AlertDialog open={alertDialog?.type === 'admin-remove-guest' && alertDialog.payload === guest.id} onOpenChange={open => !open && setAlertDialog(null)}>
                                <AlertDialogTrigger asChild>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => setAlertDialog({ type: 'admin-remove-guest', payload: guest.id })}
                                    className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                                  >
                                    <X className="h-3 w-3" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Remover convidado?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Tem certeza que deseja remover este convidado? Esta ação não pode ser desfeita.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel onClick={() => setAlertDialog(null)}>Cancelar</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => {
                                        setAlertDialog(null)
                                        handleAdminRemoveGuest(guest.id)
                                      }}
                                    >
                                      Confirmar
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            )}
                          </div>
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
