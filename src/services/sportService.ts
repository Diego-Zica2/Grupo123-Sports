
// Mock service for sports data
export interface Sport {
  id: string;
  name: string;
  next_game: string;
  available_slots: number;
}

// Mock data for sports
const mockSports: Sport[] = [
  {
    id: '1',
    name: 'Futebol',
    next_game: '2024-01-15T18:00:00Z',
    available_slots: 15
  },
  {
    id: '2',
    name: 'Vôlei',
    next_game: '2024-01-16T19:00:00Z',
    available_slots: 8
  }
];

export const getSports = async (): Promise<Sport[]> => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 500));
  return mockSports;
};
