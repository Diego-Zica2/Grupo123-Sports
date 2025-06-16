
import React from 'react'
import { Link } from 'react-router-dom'

export function Footer() {
  return (
    <footer className="bg-card border-t mt-auto">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
          <p className="text-sm text-muted-foreground">
            Desenvolvido por: DiegoZica • 2025
          </p>
          <Link 
            to="/documentacao" 
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Documentação
          </Link>
        </div>
      </div>
    </footer>
  )
}
