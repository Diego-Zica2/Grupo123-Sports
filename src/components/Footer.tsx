import React, { useState } from 'react'
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
  const [imgLoaded, setImgLoaded] = useState(false);

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
                <AlertDialogTitle className="text-center mb-4">
                  Sobre os Desenvolvedores
                </AlertDialogTitle>
                <AlertDialogDescription>
                  <div className="relative min-h-[200px] flex items-center justify-center">
                    {!imgLoaded && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        {/* Spinner SVG */}
                        <svg className="animate-spin h-8 w-8 text-orange-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                        </svg>
                        <span className="ml-2 text-muted-foreground">Carregando imagem...</span>
                      </div>
                    )}
                    <img
                      src="/lovable-uploads/DiegoZica&Ai.png"
                      alt="Imagem do desenvolvedor"
                      className={`max-w-full max-h-[50vh] rounded mx-auto transition-opacity duration-300 ${imgLoaded ? 'opacity-100' : 'opacity-0'}`}
                      onLoad={() => setImgLoaded(true)}
                    />
                  </div>
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
