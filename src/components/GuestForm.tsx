
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { toast } from '@/hooks/use-toast'

const guestSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  cpf: z.string()
    .min(11, 'CPF deve ter 11 dígitos')
    .max(14, 'CPF inválido')
    .regex(/^\d{3}\.?\d{3}\.?\d{3}-?\d{2}$/, 'CPF inválido'),
})

type GuestFormData = z.infer<typeof guestSchema>

interface GuestFormProps {
  gameId: string
  onClose: () => void
  onSuccess: () => void
}

export function GuestForm({ gameId, onClose, onSuccess }: GuestFormProps) {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)

  const form = useForm<GuestFormData>({
    resolver: zodResolver(guestSchema),
  })

  const formatCPF = (value: string) => {
    const numbers = value.replace(/\D/g, '')
    if (numbers.length <= 11) {
      return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
    }
    return value
  }

  const handleSubmit = async (data: GuestFormData) => {
    if (!user) return

    try {
      setLoading(true)
      
      // Limpar formatação do CPF
      const cleanCPF = data.cpf.replace(/\D/g, '')

      const { error } = await supabase
        .from('guests')
        .insert([
          {
            game_id: gameId,
            user_id: user.id,
            name: data.name,
            cpf: cleanCPF,
          },
        ])

      if (error) throw error

      toast({
        title: 'Convidado adicionado!',
        description: `${data.name} foi adicionado como seu convidado.`,
      })

      onSuccess()
    } catch (error: any) {
      console.error('Error adding guest:', error)
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao adicionar convidado. Tente novamente.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Adicionar Convidado</DialogTitle>
          <DialogDescription>
            Você pode adicionar 1 convidado para este jogo. Os dados são obrigatórios.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome Completo</Label>
            <Input
              id="name"
              {...form.register('name')}
              placeholder="Nome do convidado"
            />
            {form.formState.errors.name && (
              <p className="text-sm text-destructive">
                {form.formState.errors.name.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="cpf">CPF</Label>
            <Input
              id="cpf"
              {...form.register('cpf')}
              placeholder="000.000.000-00"
              onChange={(e) => {
                const formatted = formatCPF(e.target.value)
                e.target.value = formatted
                form.setValue('cpf', formatted)
              }}
            />
            {form.formState.errors.cpf && (
              <p className="text-sm text-destructive">
                {form.formState.errors.cpf.message}
              </p>
            )}
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancelar
            </Button>
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? 'Adicionando...' : 'Adicionar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
