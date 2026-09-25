'use client'

import { useEffect, useState } from 'react'
import { Dialog } from './ui/dialog'
import { Button } from './ui/button'
import { Input } from './ui/input'
import type { Category } from '@/lib/types'
import { toast } from 'sonner'

const PRESET_COLORS = [
  '#6366f1', '#8b5cf6', '#ec4899', '#ef4444',
  '#f59e0b', '#10b981', '#06b6d4', '#3b82f6',
  '#64748b', '#84cc16',
]

const PRESET_ICONS = [
  'BookOpen', 'Eye', 'Home', 'Layers', 'FolderKanban',
  'Hash', 'Star', 'Zap', 'Target', 'Briefcase',
]

interface CategoryModalProps {
  open: boolean
  onClose: () => void
  onSave: (input: Omit<Category, 'id' | 'created_at'>) => Promise<void>
  category?: Category | null
  defaultIsProject?: boolean
}

export function CategoryModal({ open, onClose, onSave, category, defaultIsProject = false }: CategoryModalProps) {
  const [name, setName] = useState('')
  const [color, setColor] = useState(PRESET_COLORS[0])
  const [icon, setIcon] = useState(PRESET_ICONS[0])
  const [isProject, setIsProject] = useState(defaultIsProject)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (open) {
      if (category) {
        setName(category.name)
        setColor(category.color)
        setIcon(category.icon ?? PRESET_ICONS[0])
        setIsProject(category.is_project)
      } else {
        setName('')
        setColor(PRESET_COLORS[0])
        setIcon(PRESET_ICONS[0])
        setIsProject(defaultIsProject)
      }
    }
  }, [open, category, defaultIsProject])

  const handleSave = async () => {
    if (!name.trim()) return
    setSaving(true)
    try {
      await onSave({ name: name.trim(), color, icon, order: 0, is_project: isProject })
      onClose()
    } catch {
      toast.error('Error al guardar')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onClose={onClose} title={category ? 'Editar categoría' : 'Nueva categoría'}>
      <div className="space-y-4">
        <div>
          <label className="text-xs font-medium text-[--muted-foreground] mb-1.5 block">Nombre *</label>
          <Input
            autoFocus
            placeholder="Nombre de la categoría..."
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSave()}
          />
        </div>

        <div>
          <label className="text-xs font-medium text-[--muted-foreground] mb-2 block">Color</label>
          <div className="flex flex-wrap gap-2">
            {PRESET_COLORS.map((c) => (
              <button
                key={c}
                onClick={() => setColor(c)}
                className={`h-6 w-6 rounded-full transition-transform ${color === c ? 'scale-125 ring-2 ring-offset-2 ring-[--ring]' : ''}`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <label className="text-xs font-medium text-[--muted-foreground]">Es un proyecto</label>
          <button
            onClick={() => setIsProject((v) => !v)}
            className={`relative h-5 w-9 rounded-full transition-colors ${isProject ? 'bg-[--primary]' : 'bg-[--muted]'}`}
          >
            <span
              className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${isProject ? 'translate-x-4' : 'translate-x-0.5'}`}
            />
          </button>
        </div>

        <div className="flex justify-end gap-2 pt-2 border-t border-[--border]">
          <Button variant="ghost" onClick={onClose}>Cancelar</Button>
          <Button onClick={handleSave} disabled={!name.trim() || saving}>
            {saving ? 'Guardando...' : category ? 'Guardar cambios' : 'Crear'}
          </Button>
        </div>
      </div>
    </Dialog>
  )
}
