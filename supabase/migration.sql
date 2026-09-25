-- ============================================================
-- Mi Oficina Virtual — Schema inicial
-- Ejecutar en Supabase SQL Editor
-- ============================================================

-- Tabla de categorías (incluye proyectos)
create table if not exists categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  color text not null default '#6366f1',
  icon text,
  "order" int not null default 0,
  is_project boolean not null default false,
  created_at timestamptz not null default now()
);

-- Tabla de tareas
create table if not exists tasks (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  category_id uuid references categories(id) on delete set null,
  status text not null default 'todo' check (status in ('todo', 'in_progress', 'blocked', 'done')),
  priority text not null default 'medium' check (priority in ('low', 'medium', 'high', 'urgent')),
  due_date timestamptz,
  recurrence text not null default 'none' check (recurrence in ('none', 'daily', 'weekly', 'monthly')),
  tags text[] not null default '{}',
  "order" int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Tabla de subtareas
create table if not exists subtasks (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references tasks(id) on delete cascade,
  title text not null,
  completed boolean not null default false,
  "order" int not null default 0
);

-- Trigger para updated_at
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger tasks_updated_at
  before update on tasks
  for each row execute function update_updated_at();

-- ============================================================
-- SEED — Categorías iniciales
-- ============================================================
insert into categories (name, color, icon, "order", is_project) values
  ('Estudiar',      '#8b5cf6', 'BookOpen',   0, false),
  ('Revisar',       '#f59e0b', 'Eye',        1, false),
  ('Casa',          '#10b981', 'Home',       2, false),
  ('Transversales', '#6366f1', 'Layers',     3, false);
