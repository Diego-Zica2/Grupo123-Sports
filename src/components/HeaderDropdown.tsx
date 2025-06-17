
import { LogOut, FileText, BookOpen, Menu } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useAuth } from '@/contexts/AuthContext'

export function HeaderDropdown() {
  const { signOut } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await signOut()
  }

  const handleRegras = () => {
    navigate('/regras')
  }

  const handleDocumentacao = () => {
    navigate('/documentacao')
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          <Menu className="h-4 w-4" />
          Menu
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={handleRegras}>
          <BookOpen className="mr-2 h-4 w-4" />
          Regras
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleDocumentacao}>
          <FileText className="mr-2 h-4 w-4" />
          Documentação
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          Sair
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
