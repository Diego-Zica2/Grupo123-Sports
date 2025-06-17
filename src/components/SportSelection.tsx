import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useQuery } from "@tanstack/react-query";
import { getSports } from '@/services/sportService';
import { ArrowRight, Shield } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { HeaderDropdown } from './HeaderDropdown'

export function SportSelection() {
  const { user } = useAuth();
  const [sports, setSports] = useState<any[]>([]);
  const { data, isLoading, isError } = useQuery({
    queryKey: ['sports'],
    queryFn: getSports,
  })

  useEffect(() => {
    if (data) {
      setSports(data);
    }
  }, [data]);

  if (isLoading) {
    return <div>Loading sports...</div>;
  }

  if (isError) {
    return <div>Error loading sports.</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-primary">Grupo123 Sports</h1>
          <div className="flex items-center gap-4">
            {user?.role === 'admin' && (
              <Button variant="outline" size="sm" asChild>
                <Link to="/admin">
                  <Shield className="h-4 w-4 mr-2" />
                  Admin
                </Link>
              </Button>
            )}
            <HeaderDropdown />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {sports.map((sport) => (
            <Card key={sport.id} className="bg-card text-card-foreground shadow-md hover:shadow-lg transition-shadow duration-300">
              <CardHeader>
                <CardTitle className="text-lg font-semibold">{sport.name}</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <p>
                  <strong>Próximo Jogo:</strong> {new Date(sport.next_game).toLocaleDateString()}
                </p>
                <p>
                  <strong>Horário:</strong> {new Date(sport.next_game).toLocaleTimeString()}
                </p>
                <p>
                  <strong>Vagas:</strong> {sport.available_slots}
                </p>
                <Button asChild>
                  <Link to={`/sport/${sport.id}`} className="flex items-center justify-center gap-2">
                    Ver Detalhes <ArrowRight className="w-4 h-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
