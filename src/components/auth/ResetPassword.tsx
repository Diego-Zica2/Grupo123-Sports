
import { useState } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from '@/hooks/use-toast'

interface ResetPasswordProps {
  onBackToLogin: () => void
}

export function ResetPassword({ onBackToLogin }: ResetPasswordProps) {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      })

      if (error) throw error

      setSent(true)
      toast({
        title: 'Email enviado!',
        description: 'Verifique sua caixa de entrada para resetar sua senha.',
      })
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao enviar email de reset.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  if (sent) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <CardTitle>Email Enviado</CardTitle>
          <CardDescription>
            Verifique sua caixa de entrada e clique no link para resetar sua senha.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={onBackToLogin} variant="outline" className="w-full">
            Voltar ao Login
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 h-20 w-20 rounded-lg flex items-center justify-center">
          <img
            src="/lovable-uploads/dark-logogrupo123.png"
            alt="Logo Grupo123 Sports"
            className="h-full w-auto object-contain dark:block hidden"
          />
          <img
            src="/lovable-uploads/light-logogrupo123.png"
            alt="Logo Grupo123 Sports"
            className="h-full w-auto object-contain dark:hidden block"
          />
        </div>
        <CardTitle>Resetar Senha</CardTitle>
        <CardDescription>
          Digite seu email para receber o link de reset de senha
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleResetPassword} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Enviando...' : 'Enviar Link de Reset'}
          </Button>
          
          <Button 
            type="button" 
            variant="outline" 
            className="w-full"
            onClick={onBackToLogin}
          >
            Voltar ao Login
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
