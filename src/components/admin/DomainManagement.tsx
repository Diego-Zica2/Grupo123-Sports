
import { useEffect, useState } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { Trash2, FilePenLine, Plus } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface Domain {
  id: string
  domain: string
  created_at: string
}

export function DomainManagement() {
  const [domains, setDomains] = useState<Domain[]>([])
  const [loading, setLoading] = useState(true)
  const [newDomain, setNewDomain] = useState('')
  const [editingDomain, setEditingDomain] = useState<Domain | null>(null)
  const [editDomainValue, setEditDomainValue] = useState('')
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    fetchDomains()
  }, [])

  const fetchDomains = async () => {
    try {
      const { data, error } = await supabase
        .from('allowed_domains')
        .select('*')
        .order('domain')

      if (error) throw error
      setDomains(data || [])
    } catch (error) {
      console.error('Error fetching domains:', error)
      toast({
        title: "Erro",
        description: "Não foi possível carregar os domínios",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleAddDomain = async () => {
    if (!newDomain.trim()) {
      toast({
        title: "Erro",
        description: "Por favor, insira um domínio válido",
        variant: "destructive"
      })
      return
    }

    try {
      const { error } = await supabase
        .from('allowed_domains')
        .insert([{ domain: newDomain.trim() }])

      if (error) throw error

      toast({
        title: "Sucesso",
        description: "Domínio adicionado com sucesso"
      })

      setNewDomain('')
      setAddDialogOpen(false)
      fetchDomains()
    } catch (error) {
      console.error('Error adding domain:', error)
      toast({
        title: "Erro",
        description: "Não foi possível adicionar o domínio",
        variant: "destructive"
      })
    }
  }

  const handleEditDomain = async () => {
    if (!editingDomain || !editDomainValue.trim()) {
      toast({
        title: "Erro",
        description: "Por favor, insira um domínio válido",
        variant: "destructive"
      })
      return
    }

    try {
      const { error } = await supabase
        .from('allowed_domains')
        .update({ domain: editDomainValue.trim() })
        .eq('id', editingDomain.id)

      if (error) throw error

      toast({
        title: "Sucesso",
        description: "Domínio atualizado com sucesso"
      })

      setEditingDomain(null)
      setEditDomainValue('')
      setEditDialogOpen(false)
      fetchDomains()
    } catch (error) {
      console.error('Error updating domain:', error)
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o domínio",
        variant: "destructive"
      })
    }
  }

  const handleDeleteDomain = async (domainId: string) => {
    try {
      const { error } = await supabase
        .from('allowed_domains')
        .delete()
        .eq('id', domainId)

      if (error) throw error

      toast({
        title: "Sucesso",
        description: "Domínio removido com sucesso"
      })

      fetchDomains()
    } catch (error) {
      console.error('Error deleting domain:', error)
      toast({
        title: "Erro",
        description: "Não foi possível remover o domínio",
        variant: "destructive"
      })
    }
  }

  const openEditDialog = (domain: Domain) => {
    setEditingDomain(domain)
    setEditDomainValue(domain.domain)
    setEditDialogOpen(true)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Gestão de Domínios</h2>
          <p className="text-muted-foreground">
            Gerencie os domínios autorizados para login no sistema
          </p>
        </div>
        
        <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
          <DialogTrigger asChild className='text-black hover:text-white'>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Domínio
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Adicionar Novo Domínio</DialogTitle>
              <DialogDescription>
                Insira o domínio que será autorizado para login (ex: empresa.com)
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="domain">Domínio</Label>
                <Input
                  id="domain"
                  value={newDomain}
                  onChange={(e) => setNewDomain(e.target.value)}
                  placeholder="exemplo.com"
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setAddDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleAddDomain}>
                  Adicionar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {domains.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-muted-foreground">Nenhum domínio cadastrado</p>
            </CardContent>
          </Card>
        ) : (
          domains.map((domain) => (
            <Card key={domain.id}>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="text-lg">{domain.domain}</CardTitle>
                    <CardDescription>
                      Criado em {new Date(domain.created_at).toLocaleDateString('pt-BR')}
                    </CardDescription>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      className="bg-green-500 hover:bg-green-600 text-black w-10 h-9"
                      size="sm"
                      onClick={() => openEditDialog(domain)}
                    >
                      <FilePenLine className="h-4 w-4" />
                    </Button>
                    
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button className="bg-red-500 hover:bg-red-600 text-black w-10 h-9">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
                          <AlertDialogDescription>
                            Tem certeza que deseja remover o domínio "{domain.domain}"? 
                            Esta ação não pode ser desfeita.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDeleteDomain(domain.id)}                            
                          >
                            Excluir
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardHeader>
            </Card>
          ))
        )}
      </div>

      {/* Dialog para editar domínio */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Domínio</DialogTitle>
            <DialogDescription>
              Modifique o domínio autorizado para login
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="editDomain">Domínio</Label>
              <Input
                id="editDomain"
                value={editDomainValue}
                onChange={(e) => setEditDomainValue(e.target.value)}
                placeholder="exemplo.com"
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleEditDomain}>
                Salvar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
