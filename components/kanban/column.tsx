'use client'

import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Task, TaskStatus } from '@/lib/types'
import { TaskCard } from './task-card'

const COLUMN_CONFIG: Record<TaskStatus, { label: string; color: string; bg: string }> = {
  todo: {
    label: 'Por hacer',
    color: 'text-slate-600 dark:text-slate-400',
    bg: 'bg-slate-100 dark:bg-slate-800/40',
  },
  in_progress: {
    label: 'En progreso',
    color: 'text-blue-600 dark:text-blue-400',
    bg: 'bg-blue-50 dark:bg-blue-900/20',
  },
  blocked: {
    label: 'Bloqueado',
    color: 'text-red-600 dark:text-red-400',
    bg: 'bg-red-50 dark:bg-red-900/20',
  },
  done: {
    label: 'Hecho',
    color: 'text-green-600 dark:text-green-400',
    bg: 'bg-green-50 dark:bg-green-900/20',
  },
}

interface KanbanColumnProps {
  status: TaskStatus
  tasks: Task[]
  onNewTask: (status: TaskStatus) => void
  onEditTask: (task: Task) => void
  onDeleteTask: (id: string) => void
  onDuplicateTask: (task: Task) => void
}

export function KanbanColumn({
  status,
  tasks,
  onNewTask,
  onEditTask,
  onDeleteTask,
  onDuplicateTask,
}: KanbanColumnProps) {
  const config = COLUMN_CONFIG[status]
  const { setNodeRef, isOver } = useDroppable({ id: status })

  return (
    <div className="flex flex-col w-72 shrink-0">
      {/* Encabezado de columna */}
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2">
          <span
            className={cn(
              'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold',
              config.color,
              config.bg
            )}
          >
            {config.label}
          </span>
          <span className="text-xs text-[--muted-foreground] font-medium">
            {tasks.length}
          </span>
        </div>
        <button
          onClick={() => onNewTask(status)}
          className="flex h-6 w-6 items-center justify-center rounded-md text-[--muted-foreground] hover:text-[--foreground] hover:bg-[--accent] transition-colors"
        >
          <Plus size={14} />
        </button>
      </div>

      {/* Zona droppable */}
      <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
        <div
          ref={setNodeRef}
          className={cn(
            'flex flex-col gap-2.5 rounded-xl p-2 min-h-[200px] transition-colors',
            isOver ? 'bg-[--accent]/50' : 'bg-[--muted]/40'
          )}
        >
          <AnimatePresence initial={false}>
            {tasks.map((task) => (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.15 }}
              >
                <TaskCard
                  task={task}
                  onEdit={onEditTask}
                  onDelete={onDeleteTask}
                  onDuplicate={onDuplicateTask}
                />
              </motion.div>
            ))}
          </AnimatePresence>

          {tasks.length === 0 && (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <p className="text-xs text-[--muted-foreground]">Sin tareas</p>
            </div>
          )}
        </div>
      </SortableContext>
    </div>
  )
}
