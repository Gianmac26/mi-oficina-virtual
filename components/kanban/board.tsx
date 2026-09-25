'use client'

import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  closestCorners,
} from '@dnd-kit/core'
import { arrayMove } from '@dnd-kit/sortable'
import { useState } from 'react'
import { KanbanColumn } from './column'
import { TaskCard } from './task-card'
import type { Task, TaskStatus } from '@/lib/types'
import { updateTask } from '@/lib/db'
import { toast } from 'sonner'

const STATUSES: TaskStatus[] = ['todo', 'in_progress', 'blocked', 'done']

interface KanbanBoardProps {
  tasks: Task[]
  onTasksChange: (tasks: Task[]) => void
  onNewTask: (status?: TaskStatus) => void
  onEditTask: (task: Task) => void
  onDeleteTask: (id: string) => void
  onDuplicateTask: (task: Task) => void
}

export function KanbanBoard({
  tasks,
  onTasksChange,
  onNewTask,
  onEditTask,
  onDeleteTask,
  onDuplicateTask,
}: KanbanBoardProps) {
  const [activeTask, setActiveTask] = useState<Task | null>(null)

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 5 } })
  )

  const tasksByStatus = (status: TaskStatus) =>
    tasks.filter((t) => t.status === status).sort((a, b) => a.order - b.order)

  const handleDragStart = ({ active }: DragStartEvent) => {
    setActiveTask(tasks.find((t) => t.id === active.id) ?? null)
  }

  const handleDragOver = ({ active, over }: DragOverEvent) => {
    if (!over) return
    const activeId = active.id as string
    const overId = over.id as string

    const activeTask = tasks.find((t) => t.id === activeId)
    if (!activeTask) return

    // Dropped over a column
    if (STATUSES.includes(overId as TaskStatus)) {
      if (activeTask.status !== overId) {
        onTasksChange(
          tasks.map((t) => (t.id === activeId ? { ...t, status: overId as TaskStatus } : t))
        )
      }
      return
    }

    // Dropped over another task
    const overTask = tasks.find((t) => t.id === overId)
    if (!overTask || activeTask.status === overTask.status) return

    onTasksChange(
      tasks.map((t) => (t.id === activeId ? { ...t, status: overTask.status } : t))
    )
  }

  const handleDragEnd = async ({ active, over }: DragEndEvent) => {
    setActiveTask(null)
    if (!over) return

    const activeId = active.id as string
    const overId = over.id as string
    const activeTask = tasks.find((t) => t.id === activeId)
    if (!activeTask) return

    // Determine final status
    let newStatus = activeTask.status
    if (STATUSES.includes(overId as TaskStatus)) {
      newStatus = overId as TaskStatus
    } else {
      const overTask = tasks.find((t) => t.id === overId)
      if (overTask) newStatus = overTask.status
    }

    // Reorder within column
    const colTasks = tasks.filter((t) => t.status === newStatus).sort((a, b) => a.order - b.order)
    const oldIndex = colTasks.findIndex((t) => t.id === activeId)
    const newIndex = colTasks.findIndex((t) => t.id === overId)

    let reordered = colTasks
    if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
      reordered = arrayMove(colTasks, oldIndex, newIndex)
    }

    const updatedTasks = tasks.map((t) => {
      if (t.id === activeId) return { ...t, status: newStatus }
      const reorderedTask = reordered.find((r) => r.id === t.id)
      return reorderedTask ?? t
    })

    onTasksChange(updatedTasks)

    // Persist to Supabase
    try {
      await updateTask({ id: activeId, status: newStatus, order: reordered.findIndex((t) => t.id === activeId) })
    } catch {
      toast.error('Error al guardar el cambio')
    }
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-5 h-full overflow-x-auto pb-4">
        {STATUSES.map((status) => (
          <KanbanColumn
            key={status}
            status={status}
            tasks={tasksByStatus(status)}
            onNewTask={onNewTask}
            onEditTask={onEditTask}
            onDeleteTask={onDeleteTask}
            onDuplicateTask={onDuplicateTask}
          />
        ))}
      </div>

      <DragOverlay>
        {activeTask && (
          <TaskCard
            task={activeTask}
            overlay
            onEdit={() => {}}
            onDelete={() => {}}
            onDuplicate={() => {}}
          />
        )}
      </DragOverlay>
    </DndContext>
  )
}
