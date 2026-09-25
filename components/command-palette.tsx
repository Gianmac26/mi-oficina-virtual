'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Plus, Home, Calendar, CalendarDays, Hash, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Category, Task } from '@/lib/types'

interface CommandPaletteProps {
  open: boolean
  onClose: () => void
  tasks: Task[]
  categories: Category[]
  onNewTask: () => void
  onEditTask: (task: Task) => void
  onSelectCategory: (id: string | null) => void
}

interface CommandItem {
  id: string
  label: string
  sublabel?: string
  icon: React.ReactNode
  action: () => void
  keywords: string[]
}

export function CommandPalette({
  open,
  onClose,
  tasks,
  categories,
  onNewTask,
  onEditTask,
  onSelectCategory,
}: CommandPaletteProps) {
  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)

  useEffect(() => {
    if (open) { setQuery(''); setSelectedIndex(0) }
  }, [open])

  const items: CommandItem[] = [
    {
      id: 'new-task',
      label: 'Nueva tarea',
      icon: <Plus size={15} />,
      action: () => { onNewTask(); onClose() },
      keywords: ['nueva', 'crear', 'agregar', 'new', 'add'],
    },
    {
      id: 'view-all',
      label: 'Todas las tareas',
      icon: <Home size={15} />,
      action: () => { onSelectCategory(null); onClose() },
      keywords: ['inicio', 'home', 'todas', 'all'],
    },
    {
      id: 'view-today',
      label: 'Hoy',
      icon: <Calendar size={15} />,
      action: () => { onSelectCategory(null); onClose() },
      keywords: ['hoy', 'today', 'dia'],
    },
    {
      id: 'view-week',
      label: 'Esta semana',
      icon: <CalendarDays size={15} />,
      action: () => { onSelectCategory(null); onClose() },
      keywords: ['semana', 'week'],
    },
    ...categories.map((c) => ({
      id: `cat-${c.id}`,
      label: c.name,
      sublabel: c.is_project ? 'Proyecto' : 'Categoría',
      icon: <Hash size={15} style={{ color: c.color }} />,
      action: () => { onSelectCategory(c.id); onClose() },
      keywords: [c.name.toLowerCase()],
    })),
    ...tasks.map((t) => ({
      id: `task-${t.id}`,
      label: t.title,
      sublabel: t.category?.name,
      icon: <Search size={15} />,
      action: () => { onEditTask(t); onClose() },
      keywords: [t.title.toLowerCase(), ...(t.tags ?? [])],
    })),
  ]

  const q = query.toLowerCase()
  const filtered = q
    ? items.filter((i) => i.label.toLowerCase().includes(q) || i.keywords.some((k) => k.includes(q)))
    : items.slice(0, 8)

  useEffect(() => setSelectedIndex(0), [query])

  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setSelectedIndex((i) => Math.min(i + 1, filtered.length - 1))
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setSelectedIndex((i) => Math.max(i - 1, 0))
      } else if (e.key === 'Enter') {
        filtered[selectedIndex]?.action()
      } else if (e.key === 'Escape') {
        onClose()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, filtered, selectedIndex, onClose])

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh]">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.15 }}
            className="relative z-10 w-full max-w-lg rounded-xl border border-[--border] bg-[--card] shadow-2xl overflow-hidden"
          >
            {/* Input */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-[--border]">
              <Search size={16} className="text-[--muted-foreground] shrink-0" />
              <input
                autoFocus
                className="flex-1 bg-transparent text-sm text-[--foreground] placeholder:text-[--muted-foreground] outline-none"
                placeholder="Buscar tareas, categorías, proyectos..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              {query && (
                <button onClick={() => setQuery('')} className="text-[--muted-foreground] hover:text-[--foreground]">
                  <X size={14} />
                </button>
              )}
              <kbd className="hidden sm:inline-flex text-[10px] text-[--muted-foreground] border border-[--border] rounded px-1.5 py-0.5">
                ESC
              </kbd>
            </div>

            {/* Resultados */}
            <div className="max-h-72 overflow-y-auto py-2">
              {filtered.length === 0 ? (
                <p className="text-sm text-[--muted-foreground] text-center py-6">
                  Sin resultados para "{query}"
                </p>
              ) : (
                filtered.map((item, idx) => (
                  <button
                    key={item.id}
                    onClick={item.action}
                    onMouseEnter={() => setSelectedIndex(idx)}
                    className={cn(
                      'flex items-center gap-3 w-full px-4 py-2.5 text-left transition-colors',
                      idx === selectedIndex
                        ? 'bg-[--accent] text-[--accent-foreground]'
                        : 'text-[--foreground] hover:bg-[--accent]/50'
                    )}
                  >
                    <span className="text-[--muted-foreground] shrink-0">{item.icon}</span>
                    <span className="flex-1 text-sm truncate">{item.label}</span>
                    {item.sublabel && (
                      <span className="text-xs text-[--muted-foreground] shrink-0">{item.sublabel}</span>
                    )}
                  </button>
                ))
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center gap-4 px-4 py-2 border-t border-[--border] text-[10px] text-[--muted-foreground]">
              <span>↑↓ navegar</span>
              <span>↵ seleccionar</span>
              <span>ESC cerrar</span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
