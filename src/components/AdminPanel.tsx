
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/integrations/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ThemeToggle } from '@/components/ThemeToggle'
import { GameManagement } from '@/components/admin/GameManagement'
import { UserManagement } from '@/components/admin/UserManagement'
import { DomainManagement } from '@/components/admin/DomainManagement'
import { AtSign, Gamepad2, UsersRound } from 'lucide-react'

interface UserProfile {
  id: string
  email: string
  full_name: string
  role: 'admin' | 'player' | 'moderador_volei' | 'moderador_futebol'
  created_at: string
}

export function AdminPanel() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
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
      
      const profileData: UserProfile = {
        ...data,
        role: data.role as 'admin' | 'player' | 'moderador_volei' | 'moderador_futebol'
      }
      setUserProfile(profileData)

      // Verificar se o usuário tem permissão
      if (!['admin', 'moderador_volei', 'moderador_futebol'].includes(profileData.role)) {
        navigate('/')
        return
      }

    } catch (error) {
      console.error('Error fetching user profile:', error)
      navigate('/')
    } finally {
      setLoading(false)
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

  if (!userProfile || !['admin', 'moderador_volei', 'moderador_futebol'].includes(userProfile.role)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-96">
          <CardHeader>
            <CardTitle>Acesso Negado</CardTitle>
            <CardDescription>
              Você não tem permissão para acessar esta página.
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

  const isAdmin = userProfile.role === 'admin'
  const isModeradorVolei = userProfile.role === 'moderador_volei'
  const isModeradorFutebol = userProfile.role === 'moderador_futebol'

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
            <Button 
              variant="outline" 
              onClick={() => navigate('/')}
              className="mr-2"
            >
              Voltar aos Esportes
            </Button>
            <Button variant="outline" onClick={signOut}>
              Sair
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-center space-x-4 mb-4">
          <h1 className="text-lg font-semibold">Painel Administrativo</h1>
          <h1 className="text-lg font-semibold">Bem-vindo, {userProfile?.full_name || user?.email}</h1>        
        </div>
        
        {isAdmin ? (
          <Tabs defaultValue="games" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="games"><Gamepad2 className="h-5 w-5" /></TabsTrigger>
              <TabsTrigger value="users"><UsersRound className="h-5 w-5" /></TabsTrigger>
              <TabsTrigger value="domains"><AtSign className="h-5 w-5" /></TabsTrigger>
            </TabsList>
            
            <TabsContent value="games" className="mt-6">
              <GameManagement userRole={userProfile.role} />
            </TabsContent>
            
            <TabsContent value="users" className="mt-6">
              <UserManagement />
            </TabsContent>

            <TabsContent value="domains" className="mt-6">
              <DomainManagement />
            </TabsContent>
          </Tabs>
        ) : (
          <div className="w-full">
            <Card>
              <CardHeader>
                <CardTitle>Gerenciar Jogos</CardTitle>
                <CardDescription>
                  {isModeradorVolei && 'Gerencie os jogos de Vôlei'}
                  {isModeradorFutebol && 'Gerencie os jogos de Futebol'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <GameManagement userRole={userProfile.role} />
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  )
}
