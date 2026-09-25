import { supabase } from './supabase'
import type { Category, Task, Subtask, CreateTaskInput, UpdateTaskInput } from './types'

// ─── Categories ───────────────────────────────────────────────

export async function getCategories(): Promise<Category[]> {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('order')
  if (error) throw error
  return data ?? []
}

export async function createCategory(input: Omit<Category, 'id' | 'created_at'>): Promise<Category> {
  const { data, error } = await supabase
    .from('categories')
    .insert(input)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateCategory(id: string, input: Partial<Omit<Category, 'id' | 'created_at'>>): Promise<Category> {
  const { data, error } = await supabase
    .from('categories')
    .update(input)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteCategory(id: string): Promise<void> {
  const { error } = await supabase.from('categories').delete().eq('id', id)
  if (error) throw error
}

// ─── Tasks ────────────────────────────────────────────────────

export async function getTasks(categoryId?: string): Promise<Task[]> {
  let query = supabase
    .from('tasks')
    .select('*, category:categories(*), subtasks(*)')
    .order('order')

  if (categoryId) {
    query = query.eq('category_id', categoryId)
  }

  const { data, error } = await query
  if (error) throw error
  return data ?? []
}

export async function createTask(input: CreateTaskInput): Promise<Task> {
  const { data: maxData } = await supabase
    .from('tasks')
    .select('order')
    .eq('status', input.status ?? 'todo')
    .order('order', { ascending: false })
    .limit(1)
    .single()

  const nextOrder = maxData ? (maxData.order as number) + 1 : 0

  const { data, error } = await supabase
    .from('tasks')
    .insert({ ...input, order: nextOrder })
    .select('*, category:categories(*), subtasks(*)')
    .single()
  if (error) throw error
  return data
}

export async function updateTask({ id, ...input }: UpdateTaskInput): Promise<Task> {
  const { data, error } = await supabase
    .from('tasks')
    .update(input)
    .eq('id', id)
    .select('*, category:categories(*), subtasks(*)')
    .single()
  if (error) throw error
  return data
}

export async function deleteTask(id: string): Promise<void> {
  const { error } = await supabase.from('tasks').delete().eq('id', id)
  if (error) throw error
}

export async function duplicateTask(task: Task): Promise<Task> {
  const { id, created_at, updated_at, subtasks, category, ...rest } = task
  const newTask = await createTask({ ...rest, title: `${rest.title} (copia)` })

  if (subtasks && subtasks.length > 0) {
    const { error } = await supabase.from('subtasks').insert(
      subtasks.map(({ id: _, task_id: __, ...s }) => ({ ...s, task_id: newTask.id }))
    )
    if (error) throw error
  }

  return newTask
}

// ─── Subtasks ─────────────────────────────────────────────────

export async function createSubtask(taskId: string, title: string): Promise<Subtask> {
  const { data: maxData } = await supabase
    .from('subtasks')
    .select('order')
    .eq('task_id', taskId)
    .order('order', { ascending: false })
    .limit(1)
    .single()

  const nextOrder = maxData ? (maxData.order as number) + 1 : 0

  const { data, error } = await supabase
    .from('subtasks')
    .insert({ task_id: taskId, title, order: nextOrder })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateSubtask(id: string, input: Partial<Pick<Subtask, 'title' | 'completed'>>): Promise<Subtask> {
  const { data, error } = await supabase
    .from('subtasks')
    .update(input)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteSubtask(id: string): Promise<void> {
  const { error } = await supabase.from('subtasks').delete().eq('id', id)
  if (error) throw error
}
