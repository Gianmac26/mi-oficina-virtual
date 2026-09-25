'use client'

import { useEffect, useState } from 'react'
import { Plus, X, Trash2 } from 'lucide-react'
import { Dialog } from './ui/dialog'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Textarea } from './ui/textarea'
import { Select } from './ui/select'
import type { Category, CreateTaskInput, Subtask, Task, TaskPriority, TaskStatus } from '@/lib/types'
import { createSubtask, deleteSubtask, updateSubtask } from '@/lib/db'
import { toast } from 'sonner'

interface TaskModalProps {
  open: boolean
  onClose: () => void
  onSave: (input: CreateTaskInput) => Promise<void>
  categories: Category[]
  task?: Task | null
  defaultStatus?: TaskStatus
}

const PRIORITIES: { value: TaskPriority; label: string }[] = [
  { value: 'low', label: 'Baja' },
  { value: 'medium', label: 'Media' },
  { value: 'high', label: 'Alta' },
  { value: 'urgent', label: 'Urgente' },
]

const STATUSES: { value: TaskStatus; label: string }[] = [
  { value: 'todo', label: 'Por hacer' },
  { value: 'in_progress', label: 'En progreso' },
  { value: 'blocked', label: 'Bloqueado' },
  { value: 'done', label: 'Hecho' },
]

export function TaskModal({
  open,
  onClose,
  onSave,
  categories,
  task,
  defaultStatus = 'todo',
}: TaskModalProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [status, setStatus] = useState<TaskStatus>(defaultStatus)
  const [priority, setPriority] = useState<TaskPriority>('medium')
  const [dueDate, setDueDate] = useState('')
  const [tagsInput, setTagsInput] = useState('')
  const [subtasks, setSubtasks] = useState<Subtask[]>([])
  const [newSubtask, setNewSubtask] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (open) {
      if (task) {
        setTitle(task.title)
        setDescription(task.description ?? '')
        setCategoryId(task.category_id ?? '')
        setStatus(task.status)
        setPriority(task.priority)
        setDueDate(task.due_date ? task.due_date.split('T')[0] : '')
        setTagsInput(task.tags.join(', '))
        setSubtasks(task.subtasks ?? [])
      } else {
        setTitle('')
        setDescription('')
        setCategoryId('')
        setStatus(defaultStatus)
        setPriority('medium')
        setDueDate('')
        setTagsInput('')
        setSubtasks([])
      }
      setNewSubtask('')
    }
  }, [open, task, defaultStatus])

  const handleSave = async () => {
    if (!title.trim()) return
    setSaving(true)
    try {
      const tags = tagsInput
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean)
      await onSave({
        title: title.trim(),
        description: description.trim() || undefined,
        category_id: categoryId || undefined,
        status,
        priority,
        due_date: dueDate || undefined,
        tags,
      })
      onClose()
    } catch {
      toast.error('Error al guardar la tarea')
    } finally {
      setSaving(false)
    }
  }

  const handleAddSubtask = async () => {
    if (!newSubtask.trim() || !task) return
    try {
      const created = await createSubtask(task.id, newSubtask.trim())
      setSubtasks((prev) => [...prev, created])
      setNewSubtask('')
    } catch {
      toast.error('Error al crear subtarea')
    }
  }

  const handleToggleSubtask = async (subtask: Subtask) => {
    try {
      const updated = await updateSubtask(subtask.id, { completed: !subtask.completed })
      setSubtasks((prev) => prev.map((s) => (s.id === subtask.id ? updated : s)))
    } catch {
      toast.error('Error al actualizar subtarea')
    }
  }

  const handleDeleteSubtask = async (id: string) => {
    try {
      await deleteSubtask(id)
      setSubtasks((prev) => prev.filter((s) => s.id !== id))
    } catch {
      toast.error('Error al eliminar subtarea')
    }
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={task ? 'Editar tarea' : 'Nueva tarea'}
      className="max-w-xl"
    >
      <div className="space-y-4">
        {/* Título */}
        <div>
          <label className="text-xs font-medium text-[--muted-foreground] mb-1.5 block">
            Título *
          </label>
          <Input
            autoFocus
            placeholder="¿Qué hay que hacer?"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSave()}
          />
        </div>

        {/* Descripción */}
        <div>
          <label className="text-xs font-medium text-[--muted-foreground] mb-1.5 block">
            Descripción
          </label>
          <Textarea
            placeholder="Más detalles..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
          />
        </div>

        {/* Fila: Categoría + Estado */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-medium text-[--muted-foreground] mb-1.5 block">
              Categoría
            </label>
            <Select value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
              <option value="">Sin categoría</option>
              {categories.filter((c) => !c.is_project).map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
              {categories.some((c) => c.is_project) && (
                <optgroup label="Proyectos">
                  {categories.filter((c) => c.is_project).map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </optgroup>
              )}
            </Select>
          </div>

          <div>
            <label className="text-xs font-medium text-[--muted-foreground] mb-1.5 block">
              Estado
            </label>
            <Select value={status} onChange={(e) => setStatus(e.target.value as TaskStatus)}>
              {STATUSES.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </Select>
          </div>
        </div>

        {/* Fila: Prioridad + Fecha */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-medium text-[--muted-foreground] mb-1.5 block">
              Prioridad
            </label>
            <Select value={priority} onChange={(e) => setPriority(e.target.value as TaskPriority)}>
              {PRIORITIES.map((p) => (
                <option key={p.value} value={p.value}>{p.label}</option>
              ))}
            </Select>
          </div>

          <div>
            <label className="text-xs font-medium text-[--muted-foreground] mb-1.5 block">
              Fecha límite
            </label>
            <Input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>
        </div>

        {/* Tags */}
        <div>
          <label className="text-xs font-medium text-[--muted-foreground] mb-1.5 block">
            Tags (separados por coma)
          </label>
          <Input
            placeholder="diseño, urgente, revisión..."
            value={tagsInput}
            onChange={(e) => setTagsInput(e.target.value)}
          />
        </div>

        {/* Subtareas (solo al editar) */}
        {task && (
          <div>
            <label className="text-xs font-medium text-[--muted-foreground] mb-1.5 block">
              Subtareas
            </label>
            <div className="space-y-1.5 mb-2">
              {subtasks.map((s) => (
                <div key={s.id} className="flex items-center gap-2 group/sub">
                  <input
                    type="checkbox"
                    checked={s.completed}
                    onChange={() => handleToggleSubtask(s)}
                    className="h-3.5 w-3.5 rounded accent-[--primary]"
                  />
                  <span className={`flex-1 text-sm ${s.completed ? 'line-through text-[--muted-foreground]' : 'text-[--foreground]'}`}>
                    {s.title}
                  </span>
                  <button
                    onClick={() => handleDeleteSubtask(s.id)}
                    className="opacity-0 group-hover/sub:opacity-100 text-[--muted-foreground] hover:text-red-500 transition-all"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="Nueva subtarea..."
                value={newSubtask}
                onChange={(e) => setNewSubtask(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddSubtask()}
                className="text-sm"
              />
              <Button size="icon" variant="outline" onClick={handleAddSubtask}>
                <Plus size={14} />
              </Button>
            </div>
          </div>
        )}

        {/* Acciones */}
        <div className="flex justify-end gap-2 pt-2 border-t border-[--border]">
          <Button variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={!title.trim() || saving}>
            {saving ? 'Guardando...' : task ? 'Guardar cambios' : 'Crear tarea'}
          </Button>
        </div>
      </div>
    </Dialog>
  )
}
