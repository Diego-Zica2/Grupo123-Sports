
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Eye, EyeOff } from 'lucide-react'

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
})

const signUpSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
  fullName: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
})

const resetSchema = z.object({
  email: z.string().email('Email inválido'),
})

type LoginFormData = z.infer<typeof loginSchema>
type SignUpFormData = z.infer<typeof signUpSchema>
type ResetFormData = z.infer<typeof resetSchema>

export function LoginForm() {
  const { signIn, signUp, resetPassword } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [activeTab, setActiveTab] = useState('login')

  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  const signUpForm = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
  })

  const resetForm = useForm<ResetFormData>({
    resolver: zodResolver(resetSchema),
  })

  const handleLogin = async (data: LoginFormData) => {
    try {
      setLoading(true)
      setError('')
      await signIn(data.email, data.password)
    } catch (err: any) {
      setError(err.message || 'Erro ao fazer login')
    } finally {
      setLoading(false)
    }
  }

  const handleSignUp = async (data: SignUpFormData) => {
    try {
      setLoading(true)
      setError('')
      await signUp(data.email, data.password, data.fullName)
      setSuccess('Conta criada com sucesso! Verifique seu email.')
    } catch (err: any) {
      setError(err.message || 'Erro ao criar conta')
    } finally {
      setLoading(false)
    }
  }

  const handleReset = async (data: ResetFormData) => {
    try {
      setLoading(true)
      setError('')
      await resetPassword(data.email)
      setSuccess('Email de recuperação enviado!')
    } catch (err: any) {
      setError(err.message || 'Erro ao enviar email de recuperação')
    } finally {
      setLoading(false)
    }
  }

  if (activeTab === 'reset') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 h-full w-full rounded-lg flex items-center justify-center">
              <img
                src="public/lovable-uploads/dark-logogrupo123.png"
                alt="Descrição da imagem"
              />
            </div>
            <CardTitle>Recuperar Senha</CardTitle>
            <CardDescription>
              Digite seu email para receber o link de recuperação
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={resetForm.handleSubmit(handleReset)} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              {success && (
                <Alert>
                  <AlertDescription>{success}</AlertDescription>
                </Alert>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="reset-email">Email</Label>
                <Input
                  id="reset-email"
                  type="email"
                  {...resetForm.register('email')}
                  placeholder="seu.email@maxmilhas.com.br"
                />
                {resetForm.formState.errors.email && (
                  <p className="text-sm text-destructive">
                    {resetForm.formState.errors.email.message}
                  </p>
                )}
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Enviando...' : 'Enviar Email'}
              </Button>

              <Button
                type="button"
                variant="ghost"
                className="w-full"
                onClick={() => setActiveTab('login')}
              >
                Voltar ao Login
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-1 h-full w-full rounded-lg flex items-center justify-center">
              <a
                href="https://grupo123-sports.lovable.app/"
                rel="noopener noreferrer"
                aria-label="Ir para Grupo123 Sports"
              >
                <img
                  src="/lovable-uploads/dark-logogrupo123.png"
                  alt="Logo Grupo123 Sports"
                  className="cursor-pointer h-full w-auto object-contain"
                />
              </a>
            </div>
          <CardTitle>Sports</CardTitle>
          <CardDescription>
            Sistema de Agendamento e Confirmação de  de Jogos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="signup">Criar Conta</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login">
              <form onSubmit={loginForm.handleSubmit(handleLogin)} className="space-y-4">
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                
                <div className="space-y-2">
                  <Label htmlFor="login-email">Email</Label>
                  <Input
                    id="login-email"
                    type="email"
                    {...loginForm.register('email')}
                    placeholder="seu.email@maxmilhas.com.br"
                  />
                  {loginForm.formState.errors.email && (
                    <p className="text-sm text-destructive">
                      {loginForm.formState.errors.email.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="login-password">Senha</Label>
                  <div className="relative">
                    <Input
                      id="login-password"
                      type={showPassword ? 'text' : 'password'}
                      {...loginForm.register('password')}
                      placeholder="Sua senha"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  {loginForm.formState.errors.password && (
                    <p className="text-sm text-destructive">
                      {loginForm.formState.errors.password.message}
                    </p>
                  )}
                </div>

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? 'Entrando...' : 'Entrar'}
                </Button>

                <Button
                  type="button"
                  variant="ghost"
                  className="w-full"
                  onClick={() => setActiveTab('reset')}
                >
                  Esqueci minha senha
                </Button>
              </form>
            </TabsContent>
            
            <TabsContent value="signup">
              <form onSubmit={signUpForm.handleSubmit(handleSignUp)} className="space-y-4">
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                {success && (
                  <Alert>
                    <AlertDescription>{success}</AlertDescription>
                  </Alert>
                )}
                
                <div className="space-y-2">
                  <Label htmlFor="signup-name">Nome Completo</Label>
                  <Input
                    id="signup-name"
                    type="text"
                    {...signUpForm.register('fullName')}
                    placeholder="Seu nome completo"
                  />
                  {signUpForm.formState.errors.fullName && (
                    <p className="text-sm text-destructive">
                      {signUpForm.formState.errors.fullName.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    {...signUpForm.register('email')}
                    placeholder="seu.email@maxmilhas.com.br"
                  />
                  {signUpForm.formState.errors.email && (
                    <p className="text-sm text-destructive">
                      {signUpForm.formState.errors.email.message}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Apenas emails com domínio de colaboradores são permitidos.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signup-password">Senha</Label>
                  <div className="relative">
                    <Input
                      id="signup-password"
                      type={showPassword ? 'text' : 'password'}
                      {...signUpForm.register('password')}
                      placeholder="Mínimo 6 caracteres"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  {signUpForm.formState.errors.password && (
                    <p className="text-sm text-destructive">
                      {signUpForm.formState.errors.password.message}
                    </p>
                  )}
                </div>

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? 'Criando conta...' : 'Criar Conta'}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
