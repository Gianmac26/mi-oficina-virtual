export type TaskStatus = 'todo' | 'in_progress' | 'blocked' | 'done'
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent'
export type RecurrenceType = 'none' | 'daily' | 'weekly' | 'monthly'

export interface Category {
  id: string
  name: string
  color: string
  icon?: string
  order: number
  is_project: boolean
  created_at: string
}

export interface Subtask {
  id: string
  task_id: string
  title: string
  completed: boolean
  order: number
}

export interface Task {
  id: string
  title: string
  description?: string
  category_id?: string
  status: TaskStatus
  priority: TaskPriority
  due_date?: string
  recurrence: RecurrenceType
  tags: string[]
  order: number
  created_at: string
  updated_at: string
  subtasks?: Subtask[]
  category?: Category
}

export interface CreateTaskInput {
  title: string
  description?: string
  category_id?: string
  status?: TaskStatus
  priority?: TaskPriority
  due_date?: string
  recurrence?: RecurrenceType
  tags?: string[]
}

export interface UpdateTaskInput extends Partial<CreateTaskInput> {
  id: string
  order?: number
}
