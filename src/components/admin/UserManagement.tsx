
import { useEffect, useState } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { Trash2 } from 'lucide-react'

interface User {
  id: string
  email: string
  full_name: string
  role: 'admin' | 'player'
  created_at: string
}

export function UserManagement() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [updatingUser, setUpdatingUser] = useState<string | null>(null)
  const [deletingUser, setDeletingUser] = useState<string | null>(null)

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      
      const typedUsers: User[] = (data || []).map(user => ({
        ...user,
        role: user.role as 'admin' | 'player'
      }))
      
      setUsers(typedUsers)
    } catch (error) {
      console.error('Error fetching users:', error)
      toast.error('Erro ao carregar usuários')
    } finally {
      setLoading(false)
    }
  }

  const updateUserRole = async (userId: string, newRole: 'admin' | 'player') => {
    setUpdatingUser(userId)
    
    try {
      const { error } = await supabase
        .from('users')
        .update({ role: newRole })
        .eq('id', userId)

      if (error) throw error

      toast.success(`Usuário ${newRole === 'admin' ? 'promovido a administrador' : 'definido como jogador'}`)
      
      // Atualizar o estado local imediatamente
      setUsers(prevUsers => 
        prevUsers.map(user => 
          user.id === userId ? { ...user, role: newRole } : user
        )
      )
    } catch (error) {
      console.error('Error updating user role:', error)
      toast.error('Erro ao atualizar usuário')
    } finally {
      setUpdatingUser(null)
    }
  }

  const deleteUser = async (userId: string) => {
    setDeletingUser(userId)
    
    try {
      // Primeiro deletar todas as dependências do usuário
      await supabase.from('game_confirmations').delete().eq('user_id', userId)
      await supabase.from('waiting_list').delete().eq('user_id', userId)
      await supabase.from('guests').delete().eq('user_id', userId)
      
      // Depois deletar o usuário da tabela users
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', userId)

      if (error) throw error

      toast.success('Usuário deletado com sucesso')
      
      // Atualizar o estado local removendo o usuário
      setUsers(prevUsers => prevUsers.filter(user => user.id !== userId))
    } catch (error) {
      console.error('Error deleting user:', error)
      toast.error('Erro ao deletar usuário')
    } finally {
      setDeletingUser(null)
    }
  }

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p>Carregando usuários...</p>
      </div>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gerenciar Usuários</CardTitle>
        <CardDescription>
          Gerencie os usuários do sistema, altere permissões e modere o acesso
        </CardDescription>
      </CardHeader>
      <CardContent>
        {users.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            Nenhum usuário encontrado
          </p>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Data de Cadastro</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">
                      {user.full_name}
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        user.role === 'admin' 
                          ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' 
                          : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                      }`}>
                        {user.role === 'admin' ? 'Administrador' : 'Jogador'}
                      </span>
                    </TableCell>
                    <TableCell>
                      {new Date(user.created_at).toLocaleDateString('pt-BR')}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Select
                          value={user.role}
                          onValueChange={(value: 'admin' | 'player') => 
                            updateUserRole(user.id, value)
                          }
                          disabled={updatingUser === user.id}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="player">Jogador</SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                          </SelectContent>
                        </Select>
                        
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => deleteUser(user.id)}
                          disabled={deletingUser === user.id}
                        >
                          {deletingUser === user.id ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
