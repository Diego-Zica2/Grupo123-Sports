
import { useTheme } from '@/hooks/useTheme'
import { Button } from '@/components/ui/button'

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
      className="h-8 w-8 px-0"
    >
      <span className="sr-only">Toggle theme</span>
      {theme === 'dark' ? '🌞' : '🌙'}
    </Button>
  )
}
