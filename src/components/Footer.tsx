import React from 'react'
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
} from '@/components/ui/alert-dialog'

export function Footer() {
  return (
    <footer className="bg-card border-t mt-auto">
      <div className="container mx-auto px-4 py-6">
        <div className="text-center">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <button
                className="text-sm text-muted-foreground cursor-pointer bg-transparent border-none p-0 hover:text-orange-500 focus:outline-none"
              >
                Developed by DiegoZica & A.I • 2025
              </button>
            </AlertDialogTrigger>
            <AlertDialogContent className="max-w-md">
              <AlertDialogHeader>
                <AlertDialogTitle>Sobre o Desenvolvedor</AlertDialogTitle>
                <AlertDialogDescription>
                  <img
                    src="/lovable-uploads/DiegoZica&Ai.png"
                    alt="Imagem do desenvolvedor"
                    className="max-w-full max-h-[50vh] rounded mx-auto"
                  />
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Fechar</AlertDialogCancel>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </footer>
  )
}
