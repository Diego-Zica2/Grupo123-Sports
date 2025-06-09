
import { useEffect, useState } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
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
  sport?: Sport
}

export function GameManagement() {
  const [sports, setSports] = useState<Sport[]>([])
  const [games, setGames] = useState<Game[]>([])
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
      // Buscar esportes
      const { data: sportsData, error: sportsError } = await supabase
        .from('sports')
        .select('*')
        .order('name')

      if (sportsError) throw sportsError
      setSports(sportsData || [])

      // Buscar jogos
      const { data: gamesData, error: gamesError } = await supabase
        .from('games')
        .select(`
          *,
          sport:sports(*)
        `)
        .order('date', { ascending: false })

      if (gamesError) throw gamesError
      setGames(gamesData || [])

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
      const { error } = await supabase
        .from('games')
        .insert([{
          ...formData,
          created_by: (await supabase.auth.getUser()).data.user?.id
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

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p>Carregando...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Criar Novo Jogo</CardTitle>
          <CardDescription>
            Adicione um novo jogo para qualquer esporte cadastrado
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                <Label htmlFor="time">Horário *</Label>
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

            <Button type="submit" className="w-full">
              Criar Jogo
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Jogos Cadastrados</CardTitle>
          <CardDescription>
            Lista de todos os jogos criados
          </CardDescription>
        </CardHeader>
        <CardContent>
          {games.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              Nenhum jogo cadastrado ainda
            </p>
          ) : (
            <div className="space-y-4">
              {games.map((game) => (
                <div key={game.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold">
                        {game.sport?.icon} {game.sport?.name}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {new Date(game.date).toLocaleDateString('pt-BR')} às {game.time}
                      </p>
                      <p className="text-sm">{game.location}</p>
                      <p className="text-sm text-muted-foreground">
                        Máximo: {game.max_players} jogadores
                      </p>
                    </div>
                    {game.google_maps_link && (
                      <Button variant="outline" size="sm" asChild>
                        <a href={game.google_maps_link} target="_blank" rel="noopener noreferrer">
                          Ver no Mapa
                        </a>
                      </Button>
                    )}
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
