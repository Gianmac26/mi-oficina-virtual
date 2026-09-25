'use client'

import { Sun, Moon, Monitor, Plus, Search, Command } from 'lucide-react'
import { useTheme } from './theme-provider'
import { Button } from './ui/button'
import { cn } from '@/lib/utils'

interface HeaderProps {
  onNewTask: () => void
  onOpenSearch: () => void
}

export function Header({ onNewTask, onOpenSearch }: HeaderProps) {
  const { resolvedTheme, setTheme, theme } = useTheme()

  const themeIcons = [
    { value: 'light' as const, icon: Sun },
    { value: 'dark' as const, icon: Moon },
    { value: 'system' as const, icon: Monitor },
  ]

  return (
    <header className="flex items-center justify-between h-14 px-6 border-b border-[--border] bg-[--background] shrink-0">
      {/* Search trigger */}
      <button
        onClick={onOpenSearch}
        className="flex items-center gap-2 h-8 px-3 rounded-md border border-[--border] bg-[--muted] text-sm text-[--muted-foreground] hover:bg-[--accent] transition-colors w-56"
      >
        <Search size={14} />
        <span>Buscar tareas...</span>
        <span className="ml-auto flex items-center gap-0.5 text-xs">
          <Command size={11} />K
        </span>
      </button>

      <div className="flex items-center gap-2">
        {/* Theme toggle */}
        <div className="flex items-center gap-0.5 rounded-lg border border-[--border] p-0.5">
          {themeIcons.map(({ value, icon: Icon }) => (
            <button
              key={value}
              onClick={() => setTheme(value)}
              className={cn(
                'flex h-7 w-7 items-center justify-center rounded-md transition-colors',
                theme === value
                  ? 'bg-[--accent] text-[--accent-foreground]'
                  : 'text-[--muted-foreground] hover:text-[--foreground]'
              )}
              title={value}
            >
              <Icon size={14} />
            </button>
          ))}
        </div>

        {/* Nueva tarea */}
        <Button size="sm" onClick={onNewTask} className="gap-1.5">
          <Plus size={15} />
          Nueva tarea
        </Button>
      </div>
    </header>
  )
}
