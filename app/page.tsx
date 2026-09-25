'use client'

export const dynamic = 'force-dynamic'

import { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Sidebar } from '@/components/sidebar'
import { Header } from '@/components/header'
import { KanbanBoard } from '@/components/kanban/board'
import { TaskModal } from '@/components/task-modal'
import { CategoryModal } from '@/components/category-modal'
import { CommandPalette } from '@/components/command-palette'
import {
  getCategories, getTasks, createTask, updateTask, deleteTask, duplicateTask,
  createCategory, updateCategory, deleteCategory,
} from '@/lib/db'
import type { Category, CreateTaskInput, Task, TaskStatus } from '@/lib/types'

type FilterView = 'all' | 'today' | 'week'

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  // UI state
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [filterView, setFilterView] = useState<FilterView>('all')

  // Modals
  const [taskModalOpen, setTaskModalOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [defaultStatus, setDefaultStatus] = useState<TaskStatus>('todo')
  const [categoryModalOpen, setCategoryModalOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [commandOpen, setCommandOpen] = useState(false)

  // ─── Load data ─────────────────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      try {
        const [cats, tks] = await Promise.all([getCategories(), getTasks()])
        setCategories(cats)
        setTasks(tks)
      } catch (e) {
        toast.error('Error al cargar los datos. Verifica la conexión con Supabase.')
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  // ─── Keyboard shortcuts ─────────────────────────────────────────
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName.toLowerCase()
      const isEditing = ['input', 'textarea', 'select'].includes(tag)

      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setCommandOpen(true)
        return
      }
      if (isEditing) return

      if (e.key === 'n' || e.key === 'N') {
        e.preventDefault()
        openNewTask()
      } else if (e.key === '/') {
        e.preventDefault()
        setCommandOpen(true)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  // ─── Filtered tasks ─────────────────────────────────────────────
  const filteredTasks = tasks.filter((t) => {
    if (selectedCategory && t.category_id !== selectedCategory) return false

    if (filterView === 'today') {
      if (!t.due_date) return false
      const today = new Date()
      const due = new Date(t.due_date)
      return (
        due.getFullYear() === today.getFullYear() &&
        due.getMonth() === today.getMonth() &&
        due.getDate() === today.getDate()
      )
    }

    if (filterView === 'week') {
      if (!t.due_date) return false
      const now = new Date()
      const weekEnd = new Date(now)
      weekEnd.setDate(now.getDate() + 7)
      const due = new Date(t.due_date)
      return due >= now && due <= weekEnd
    }

    return true
  })

  // ─── Task handlers ──────────────────────────────────────────────
  const openNewTask = (status?: TaskStatus) => {
    setEditingTask(null)
    setDefaultStatus(status ?? 'todo')
    setTaskModalOpen(true)
  }

  const handleSaveTask = async (input: CreateTaskInput) => {
    if (editingTask) {
      const updated = await updateTask({ id: editingTask.id, ...input })
      setTasks((prev) => prev.map((t) => (t.id === editingTask.id ? updated : t)))
      toast.success('Tarea actualizada')
    } else {
      const created = await createTask({
        ...input,
        category_id: input.category_id || selectedCategory || undefined,
      })
      setTasks((prev) => [...prev, created])
      toast.success('Tarea creada')
    }
  }

  const handleEditTask = (task: Task) => {
    setEditingTask(task)
    setTaskModalOpen(true)
  }

  const handleDeleteTask = async (id: string) => {
    try {
      await deleteTask(id)
      setTasks((prev) => prev.filter((t) => t.id !== id))
      toast.success('Tarea eliminada')
    } catch {
      toast.error('Error al eliminar la tarea')
    }
  }

  const handleDuplicateTask = async (task: Task) => {
    try {
      const dup = await duplicateTask(task)
      setTasks((prev) => [...prev, dup])
      toast.success('Tarea duplicada')
    } catch {
      toast.error('Error al duplicar la tarea')
    }
  }

  // ─── Category handlers ──────────────────────────────────────────
  const handleSaveCategory = async (input: Omit<Category, 'id' | 'created_at'>) => {
    if (editingCategory) {
      const updated = await updateCategory(editingCategory.id, input)
      setCategories((prev) => prev.map((c) => (c.id === editingCategory.id ? updated : c)))
      toast.success('Categoría actualizada')
    } else {
      const created = await createCategory(input)
      setCategories((prev) => [...prev, created])
      toast.success('Categoría creada')
    }
  }

  const handleDeleteCategory = async (id: string) => {
    try {
      await deleteCategory(id)
      setCategories((prev) => prev.filter((c) => c.id !== id))
      if (selectedCategory === id) setSelectedCategory(null)
      toast.success('Categoría eliminada')
    } catch {
      toast.error('Error al eliminar la categoría')
    }
  }

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-[--primary] border-t-transparent" />
          <p className="text-sm text-[--muted-foreground]">Cargando...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-full overflow-hidden">
      <Sidebar
        categories={categories}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
        onCreateCategory={() => { setEditingCategory(null); setCategoryModalOpen(true) }}
        onEditCategory={(c) => { setEditingCategory(c); setCategoryModalOpen(true) }}
        onDeleteCategory={handleDeleteCategory}
        filterView={filterView}
        onFilterView={setFilterView}
      />

      <div className="flex flex-1 flex-col overflow-hidden">
        <Header
          onNewTask={() => openNewTask()}
          onOpenSearch={() => setCommandOpen(true)}
        />

        <main className="flex-1 overflow-auto p-6">
          {/* Título de vista */}
          <div className="mb-6">
            <h1 className="text-xl font-bold text-[--foreground]">
              {selectedCategory
                ? categories.find((c) => c.id === selectedCategory)?.name ?? 'Categoría'
                : filterView === 'today'
                  ? 'Hoy'
                  : filterView === 'week'
                    ? 'Esta semana'
                    : 'Todas las tareas'}
            </h1>
            <p className="text-sm text-[--muted-foreground] mt-0.5">
              {filteredTasks.filter((t) => t.status !== 'done').length} tareas pendientes
            </p>
          </div>

          <KanbanBoard
            tasks={filteredTasks}
            onTasksChange={setTasks}
            onNewTask={openNewTask}
            onEditTask={handleEditTask}
            onDeleteTask={handleDeleteTask}
            onDuplicateTask={handleDuplicateTask}
          />
        </main>
      </div>

      <TaskModal
        open={taskModalOpen}
        onClose={() => setTaskModalOpen(false)}
        onSave={handleSaveTask}
        categories={categories}
        task={editingTask}
        defaultStatus={defaultStatus}
      />

      <CategoryModal
        open={categoryModalOpen}
        onClose={() => setCategoryModalOpen(false)}
        onSave={handleSaveCategory}
        category={editingCategory}
      />

      <CommandPalette
        open={commandOpen}
        onClose={() => setCommandOpen(false)}
        tasks={tasks}
        categories={categories}
        onNewTask={() => openNewTask()}
        onEditTask={handleEditTask}
        onSelectCategory={setSelectedCategory}
      />
    </div>
  )
}
