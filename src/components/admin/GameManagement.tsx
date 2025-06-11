import { useEffect, useState } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Trash2, CalendarPlus2 } from 'lucide-react'
import { toast } from 'sonner'

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

export function GameManagement() {
  const [sports, setSports] = useState<Sport[]>([])
  const [activeGames, setActiveGames] = useState<Game[]>([])
  const [loading, setLoading] = useState(true)
  const [formData, setFormData] = useState({
    sport_id: '',
    date: '',
    time: '',
    location: '',
    google_maps_link: '',
    max_players: 20
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const { data: sportsData, error: sportsError } = await supabase
        .from('sports')
        .select('*')
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
        .order('date', { ascending: false })

      if (gamesError) throw gamesError

      const gamesBySport = new Map()
      gamesData?.forEach(game => {
        if (!gamesBySport.has(game.sport_id)) {
          gamesBySport.set(game.sport_id, game)
        }
      })

      setActiveGames(Array.from(gamesBySport.values()))

    } catch (error) {
      console.error('Error fetching data:', error)
      toast.error('Erro ao carregar dados')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.sport_id || !formData.date || !formData.time || !formData.location) {
      toast.error('Preencha todos os campos obrigatórios')
      return
    }

    try {
      const dateString = formData.date
      const timeString = formData.time

      const { error } = await supabase
        .from('games')
        .insert([{
          sport_id: formData.sport_id,
          date: dateString,
          time: timeString,
          location: formData.location,
          google_maps_link: formData.google_maps_link,
          max_players: formData.max_players,
          created_by: (await supabase.auth.getUser()).data.user?.id,
          visible: true
        }])

      if (error) throw error

      toast.success('Jogo criado com sucesso!')
      setFormData({
        sport_id: '',
        date: '',
        time: '',
        location: '',
        google_maps_link: '',
        max_players: 20
      })
      fetchData()

    } catch (error) {
      console.error('Error creating game:', error)
      toast.error('Erro ao criar jogo')
    }
  }

  const handleDeleteGame = async (gameId: string) => {
    if (!confirm('Tem certeza que deseja deletar este jogo? Esta ação não pode ser desfeita.')) {
      return
    }

    try {
      await supabase.from('game_confirmations').delete().eq('game_id', gameId)
      await supabase.from('guests').delete().eq('game_id', gameId)

      const { error } = await supabase
        .from('games')
        .delete()
        .eq('id', gameId)

      if (error) throw error

      toast.success('Jogo deletado com sucesso!')
      fetchData()

    } catch (error) {
      console.error('Error deleting game:', error)
      toast.error('Erro ao deletar jogo')
    }
  }

  function getNextWeekdayDate(targetDay: number) {
    const today = new Date();
    const day = today.getDay();
    let daysAhead = targetDay - day;
    if (daysAhead <= 0) daysAhead += 7;
    const nextDate = new Date(today);
    nextDate.setDate(today.getDate() + daysAhead);
    return nextDate.toISOString().split('T')[0];
  }

  function getSportIdByName(name: string) {
    const sport = sports.find(s => s.name.toLowerCase() === name.toLowerCase());
    return sport ? sport.id : '';
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString + 'T00:00:00');
    return date.toLocaleDateString('pt-BR', {
      timeZone: 'America/Sao_Paulo'
    });
  };

  const formatTime = (timeString: string) => {
    const time = new Date(`2000-01-01T${timeString}:00`);
    return time.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'America/Sao_Paulo'
    });
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p>Carregando...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6 px-2 sm:px-0 mx-auto">
      <Card>
        <CardHeader className='text-center'>
          <CardTitle>Criar Novo Jogo</CardTitle>
          <CardDescription>
            <p>Adicione um novo jogo para qualquer esporte cadastrado.</p> 
            <p>O jogo anterior será automaticamente desabilitado.</p>
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Botões de preenchimento rápido */}
          <div className="flex flex-col gap-2 mb-6 sm:flex-row sm:gap-4 justify-center">
            <Button
              type="button"
              onClick={() => {
                setFormData({
                  sport_id: getSportIdByName('Vôlei'),
                  date: getNextWeekdayDate(6),
                  time: '12:00',
                  location: 'Arena Túnel - Quadra 01 | Entrada pela Rua Itaguara 55',
                  google_maps_link: 'https://maps.app.goo.gl/Gzh9c2FREp2dGzCB6',
                  max_players: 30
                });
              }}              
              className="flex items-center gap-2 w-full sm:w-auto bg-green-600 hover:bg-primary text-black"
            >
              🏐 Criar Jogo Padrão Vôlei
            </Button>
            <Button
              type="button"
              onClick={() => {
                setFormData({
                  sport_id: getSportIdByName('Futebol'),
                  date: getNextWeekdayDate(4),
                  time: '19:00',
                  location: 'Arena Túnel - Quadra 01 | Entrada pela Rua Itaguara 55',
                  google_maps_link: 'https://maps.app.goo.gl/Gzh9c2FREp2dGzCB6',
                  max_players: 16
                });
              }}              
              className="flex items-center gap-2 w-full sm:w-auto bg-green-600 hover:bg-primary text-black"
            >
              ⚽ Criar Jogo Padrão Futebol
            </Button>
          </div>
          <p className="border-b w-full mx-auto mb-6"></p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="sport">Esporte *</Label>
                <Select
                  value={formData.sport_id}
                  onValueChange={(value) => setFormData({ ...formData, sport_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um esporte" />
                  </SelectTrigger>
                  <SelectContent>
                    {sports.map((sport) => (
                      <SelectItem key={sport.id} value={sport.id}>
                        {sport.icon} {sport.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="date">Data *</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="time">
                  Horário *
                  
                </Label>
                <Input
                  id="time"
                  type="time"
                  value={formData.time}
                  onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="max_players">Máximo de Jogadores</Label>
                <Input
                  id="max_players"
                  type="number"
                  min="1"
                  value={formData.max_players}
                  onChange={(e) => setFormData({ ...formData, max_players: parseInt(e.target.value) })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Local *</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="Ex: Quadra do Clube, Campo do Parque..."
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="google_maps_link">Link do Google Maps</Label>
              <Input
                id="google_maps_link"
                value={formData.google_maps_link}
                onChange={(e) => setFormData({ ...formData, google_maps_link: e.target.value })}
                placeholder="https://maps.google.com/..."
              />
            </div>

            <Button type="submit" className="w-full text-black hover:text-white">
              <CalendarPlus2 className="h-4 w-4" />
              Criar Jogo
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Jogos Ativos</CardTitle>
          <CardDescription>
            Lista dos jogos atualmente ativos para confirmação (um por esporte)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {activeGames.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              Nenhum jogo ativo no momento
            </p>
          ) : (
            <div className="space-y-4">
              {activeGames.map((game) => (
                <div key={game.id} className="border rounded-lg p-4">
                  <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-start">
                    <div className="flex-1">
                      <h3 className="font-semibold">
                        {game.sport?.icon} {game.sport?.name}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(game.date)} às {formatTime(game.time)}
                      </p>
                      <p className="text-sm">{game.location}</p>
                      <p className="text-sm text-muted-foreground">
                        Máximo: {game.max_players} jogadores
                      </p>
                    </div>
                    <div className="flex gap-2 mt-2 sm:mt-0">
                      {game.google_maps_link && (
                        <Button variant="outline" size="sm" asChild>
                          <a href={game.google_maps_link} target="_blank" rel="noopener noreferrer">
                            Ver no Mapa
                          </a>
                        </Button>
                      )}
                      <Button 
                        className="bg-red-500 hover:bg-red-600 text-white"
                        size="sm"
                        onClick={() => handleDeleteGame(game.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                        Deletar
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
