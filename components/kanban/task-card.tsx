'use client'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { motion } from 'framer-motion'
import {
  Calendar, AlertTriangle, Flame, ArrowUp, ArrowDown,
  MoreHorizontal, Copy, Trash2, Pencil, CheckSquare,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Task } from '@/lib/types'
import { Badge } from '../ui/badge'
import { useState } from 'react'

const PRIORITY_CONFIG = {
  low: { label: 'Baja', icon: ArrowDown, color: 'text-slate-400' },
  medium: { label: 'Media', icon: ArrowUp, color: 'text-blue-500' },
  high: { label: 'Alta', icon: Flame, color: 'text-orange-500' },
  urgent: { label: 'Urgente', icon: AlertTriangle, color: 'text-red-500' },
}

interface TaskCardProps {
  task: Task
  onEdit: (task: Task) => void
  onDelete: (id: string) => void
  onDuplicate: (task: Task) => void
  overlay?: boolean
}

export function TaskCard({ task, onEdit, onDelete, onDuplicate, overlay }: TaskCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: task.id })

  const [menuOpen, setMenuOpen] = useState(false)

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  }

  const PriorityIcon = PRIORITY_CONFIG[task.priority].icon
  const subtasksDone = task.subtasks?.filter((s) => s.completed).length ?? 0
  const subtasksTotal = task.subtasks?.length ?? 0
  const isOverdue = task.due_date && new Date(task.due_date) < new Date()

  const formattedDate = task.due_date
    ? new Date(task.due_date).toLocaleDateString('es', { day: 'numeric', month: 'short' })
    : null

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={cn(
        'group relative rounded-xl border border-[--border] bg-[--card] p-3.5 shadow-sm cursor-grab active:cursor-grabbing transition-shadow hover:shadow-md',
        overlay && 'shadow-xl rotate-2 cursor-grabbing',
        isDragging && 'pointer-events-none'
      )}
    >
      {/* Color accent de categoría */}
      {task.category && (
        <div
          className="absolute left-0 top-3 bottom-3 w-0.5 rounded-full"
          style={{ backgroundColor: task.category.color }}
        />
      )}

      <div className="pl-2">
        {/* Header de la tarjeta */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <p className="text-sm font-medium text-[--foreground] leading-snug flex-1 break-words">
            {task.title}
          </p>

          {/* Menú */}
          <div className="relative shrink-0">
            <button
              onClick={(e) => { e.stopPropagation(); setMenuOpen((v) => !v) }}
              onPointerDown={(e) => e.stopPropagation()}
              className="opacity-0 group-hover:opacity-100 flex h-6 w-6 items-center justify-center rounded text-[--muted-foreground] hover:text-[--foreground] hover:bg-[--accent] transition-all"
            >
              <MoreHorizontal size={14} />
            </button>

            {menuOpen && (
              <div
                className="absolute right-0 top-7 z-50 w-36 rounded-lg border border-[--border] bg-[--card] shadow-lg py-1"
                onPointerDown={(e) => e.stopPropagation()}
              >
                {[
                  { label: 'Editar', icon: Pencil, action: () => { onEdit(task); setMenuOpen(false) } },
                  { label: 'Duplicar', icon: Copy, action: () => { onDuplicate(task); setMenuOpen(false) } },
                  { label: 'Eliminar', icon: Trash2, action: () => { onDelete(task.id); setMenuOpen(false) }, danger: true },
                ].map(({ label, icon: Icon, action, danger }) => (
                  <button
                    key={label}
                    onClick={action}
                    className={cn(
                      'flex items-center gap-2 w-full px-3 py-1.5 text-xs transition-colors',
                      danger
                        ? 'text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20'
                        : 'text-[--foreground] hover:bg-[--accent]'
                    )}
                  >
                    <Icon size={12} />
                    {label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Descripción */}
        {task.description && (
          <p className="text-xs text-[--muted-foreground] mb-2 line-clamp-2">
            {task.description}
          </p>
        )}

        {/* Tags */}
        {task.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2">
            {task.tags.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="secondary" className="text-[10px] px-1.5 py-0">
                {tag}
              </Badge>
            ))}
          </div>
        )}

        {/* Footer de la tarjeta */}
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center gap-2">
            {/* Prioridad */}
            <span className={cn('flex items-center gap-0.5 text-xs', PRIORITY_CONFIG[task.priority].color)}>
              <PriorityIcon size={12} />
            </span>

            {/* Subtareas */}
            {subtasksTotal > 0 && (
              <span className="flex items-center gap-1 text-xs text-[--muted-foreground]">
                <CheckSquare size={11} />
                {subtasksDone}/{subtasksTotal}
              </span>
            )}
          </div>

          {/* Fecha */}
          {formattedDate && (
            <span
              className={cn(
                'flex items-center gap-1 text-xs',
                isOverdue ? 'text-red-500' : 'text-[--muted-foreground]'
              )}
            >
              <Calendar size={11} />
              {formattedDate}
            </span>
          )}
        </div>

        {/* Categoría chip (solo si hay) */}
        {task.category && (
          <div className="mt-2">
            <span
              className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium"
              style={{
                backgroundColor: `${task.category.color}20`,
                color: task.category.color,
              }}
            >
              {task.category.name}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
