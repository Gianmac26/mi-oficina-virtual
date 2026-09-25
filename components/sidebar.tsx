'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Home, Calendar, CalendarDays, Settings, ChevronLeft,
  ChevronRight, FolderKanban, Plus, Layers, BookOpen, Eye,
  Hash, MoreHorizontal, Pencil, Trash2,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Category } from '@/lib/types'

interface SidebarProps {
  categories: Category[]
  selectedCategory: string | null
  onSelectCategory: (id: string | null) => void
  onCreateCategory: () => void
  onEditCategory: (c: Category) => void
  onDeleteCategory: (id: string) => void
  filterView: 'all' | 'today' | 'week'
  onFilterView: (v: 'all' | 'today' | 'week') => void
}

const ICON_MAP: Record<string, React.ElementType> = {
  BookOpen, Eye, Home, Layers, FolderKanban, Hash,
}

export function Sidebar({
  categories,
  selectedCategory,
  onSelectCategory,
  onCreateCategory,
  onEditCategory,
  onDeleteCategory,
  filterView,
  onFilterView,
}: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false)
  const [hoveredCat, setHoveredCat] = useState<string | null>(null)

  const regularCats = categories.filter((c) => !c.is_project)
  const projects = categories.filter((c) => c.is_project)

  return (
    <motion.aside
      animate={{ width: collapsed ? 60 : 240 }}
      transition={{ duration: 0.2 }}
      className="relative flex flex-col h-full border-r border-[--border] bg-[--sidebar] overflow-hidden shrink-0"
    >
      {/* Logo */}
      <div className="flex items-center h-14 px-4 border-b border-[--border] shrink-0">
        <AnimatePresence initial={false}>
          {!collapsed && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="font-bold text-[--foreground] text-sm whitespace-nowrap"
            >
              Mi Oficina Virtual
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      {/* Nav principal */}
      <nav className="flex flex-col gap-0.5 p-2 border-b border-[--border]">
        {[
          { label: 'Inicio', icon: Home, view: 'all' as const },
          { label: 'Hoy', icon: Calendar, view: 'today' as const },
          { label: 'Esta semana', icon: CalendarDays, view: 'week' as const },
        ].map(({ label, icon: Icon, view }) => (
          <NavItem
            key={view}
            icon={<Icon size={16} />}
            label={label}
            collapsed={collapsed}
            active={filterView === view && !selectedCategory}
            onClick={() => { onFilterView(view); onSelectCategory(null) }}
          />
        ))}
      </nav>

      {/* Categorías */}
      <div className="flex-1 overflow-y-auto p-2 space-y-4">
        <SectionGroup
          title="Categorías"
          collapsed={collapsed}
          onAdd={onCreateCategory}
        >
          {regularCats.map((cat) => (
            <CategoryItem
              key={cat.id}
              cat={cat}
              collapsed={collapsed}
              active={selectedCategory === cat.id}
              hovered={hoveredCat === cat.id}
              onHover={setHoveredCat}
              onClick={() => { onSelectCategory(cat.id); onFilterView('all') }}
              onEdit={() => onEditCategory(cat)}
              onDelete={() => onDeleteCategory(cat.id)}
            />
          ))}
        </SectionGroup>

        {projects.length > 0 && (
          <SectionGroup
            title="Proyectos"
            collapsed={collapsed}
            onAdd={onCreateCategory}
          >
            {projects.map((cat) => (
              <CategoryItem
                key={cat.id}
                cat={cat}
                collapsed={collapsed}
                active={selectedCategory === cat.id}
                hovered={hoveredCat === cat.id}
                onHover={setHoveredCat}
                onClick={() => { onSelectCategory(cat.id); onFilterView('all') }}
                onEdit={() => onEditCategory(cat)}
                onDelete={() => onDeleteCategory(cat.id)}
              />
            ))}
          </SectionGroup>
        )}
      </div>

      {/* Footer */}
      <div className="p-2 border-t border-[--border]">
        <NavItem
          icon={<Settings size={16} />}
          label="Ajustes"
          collapsed={collapsed}
          active={false}
          onClick={() => {}}
        />
      </div>

      {/* Toggle collapse */}
      <button
        onClick={() => setCollapsed((v) => !v)}
        className="absolute -right-3 top-16 z-10 flex h-6 w-6 items-center justify-center rounded-full border border-[--border] bg-[--card] text-[--muted-foreground] shadow-sm hover:text-[--foreground] transition-colors"
      >
        {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
      </button>
    </motion.aside>
  )
}

function NavItem({
  icon, label, collapsed, active, onClick,
}: {
  icon: React.ReactNode
  label: string
  collapsed: boolean
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      title={collapsed ? label : undefined}
      className={cn(
        'flex items-center gap-2.5 w-full rounded-md px-2 py-1.5 text-sm transition-colors text-left',
        active
          ? 'bg-[--accent] text-[--accent-foreground] font-medium'
          : 'text-[--muted-foreground] hover:bg-[--accent] hover:text-[--accent-foreground]'
      )}
    >
      <span className="shrink-0">{icon}</span>
      <AnimatePresence initial={false}>
        {!collapsed && (
          <motion.span
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: 'auto' }}
            exit={{ opacity: 0, width: 0 }}
            className="truncate overflow-hidden whitespace-nowrap"
          >
            {label}
          </motion.span>
        )}
      </AnimatePresence>
    </button>
  )
}

function SectionGroup({
  title, collapsed, onAdd, children,
}: {
  title: string
  collapsed: boolean
  onAdd: () => void
  children: React.ReactNode
}) {
  return (
    <div>
      {!collapsed && (
        <div className="flex items-center justify-between px-2 mb-1">
          <span className="text-xs font-semibold uppercase tracking-wider text-[--muted-foreground]">
            {title}
          </span>
          <button
            onClick={onAdd}
            className="text-[--muted-foreground] hover:text-[--foreground] transition-colors"
          >
            <Plus size={14} />
          </button>
        </div>
      )}
      <div className="space-y-0.5">{children}</div>
    </div>
  )
}

function CategoryItem({
  cat, collapsed, active, hovered, onHover, onClick, onEdit, onDelete,
}: {
  cat: Category
  collapsed: boolean
  active: boolean
  hovered: boolean
  onHover: (id: string | null) => void
  onClick: () => void
  onEdit: () => void
  onDelete: () => void
}) {
  const Icon = ICON_MAP[cat.icon ?? ''] ?? Hash
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <div
      className="relative"
      onMouseEnter={() => onHover(cat.id)}
      onMouseLeave={() => { onHover(null); setMenuOpen(false) }}
    >
      <button
        onClick={onClick}
        title={collapsed ? cat.name : undefined}
        className={cn(
          'flex items-center gap-2.5 w-full rounded-md px-2 py-1.5 text-sm transition-colors text-left',
          active
            ? 'bg-[--accent] text-[--accent-foreground] font-medium'
            : 'text-[--muted-foreground] hover:bg-[--accent] hover:text-[--accent-foreground]'
        )}
      >
        <span className="shrink-0" style={{ color: cat.color }}>
          <Icon size={15} />
        </span>
        <AnimatePresence initial={false}>
          {!collapsed && (
            <motion.span
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: 'auto' }}
              exit={{ opacity: 0, width: 0 }}
              className="truncate overflow-hidden whitespace-nowrap flex-1"
            >
              {cat.name}
            </motion.span>
          )}
        </AnimatePresence>
      </button>

      {/* Menú acciones */}
      {!collapsed && hovered && (
        <div className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center gap-0.5">
          <button
            onClick={(e) => { e.stopPropagation(); setMenuOpen((v) => !v) }}
            className="rounded p-0.5 text-[--muted-foreground] hover:text-[--foreground] hover:bg-[--accent]"
          >
            <MoreHorizontal size={13} />
          </button>
        </div>
      )}

      {menuOpen && (
        <div className="absolute right-0 top-full mt-1 z-50 w-32 rounded-md border border-[--border] bg-[--card] shadow-lg py-1">
          <button
            onClick={(e) => { e.stopPropagation(); onEdit(); setMenuOpen(false) }}
            className="flex items-center gap-2 w-full px-3 py-1.5 text-xs text-[--foreground] hover:bg-[--accent]"
          >
            <Pencil size={12} /> Editar
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(); setMenuOpen(false) }}
            className="flex items-center gap-2 w-full px-3 py-1.5 text-xs text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
          >
            <Trash2 size={12} /> Eliminar
          </button>
        </div>
      )}
    </div>
  )
}
