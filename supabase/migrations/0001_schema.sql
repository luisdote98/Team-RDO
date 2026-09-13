-- Esquema inicial: socios, categorías, eventos, tareas, normas, cadenas,
-- gastos y plantillas de tarea. Todos los ids son `text` generados por la
-- app (crypto.randomUUID() del lado del cliente, o slugs legibles para
-- catálogos como socios/categorías) — no hay generación de id en Postgres,
-- para que el store de React pueda seguir haciendo updates optimistas con
-- el mismo id que luego persiste.

create type task_status as enum (
  'pending', 'in_progress', 'waiting', 'blocked', 'completed', 'cancelled'
);

create type task_priority as enum ('critical', 'high', 'normal', 'low');

create table members (
  id text primary key,
  name text not null,
  role text not null,
  color text not null,
  bg_color text not null,
  password_hash text not null,
  created_at timestamptz not null default now()
);

create table categories (
  id text primary key,
  name text not null,
  color text not null
);

create table events (
  id text primary key,
  name text not null,
  date date not null,
  venue text not null,
  city text not null,
  capacity integer not null,
  format text not null,
  archived boolean not null default false,
  created_at timestamptz not null default now()
);

create table tasks (
  id text primary key,
  event_id text not null references events (id) on delete cascade,
  title text not null,
  category_id text not null references categories (id),
  assignee_id text not null references members (id),
  priority task_priority not null,
  status task_status not null default 'pending',
  offset_days integer not null,
  due_date date not null,
  is_milestone boolean not null default false,
  notes text,
  created_at timestamptz not null default now()
);
create index tasks_event_id_idx on tasks (event_id);

-- Dependencias entre tareas del mismo evento ("blockedBy" en TaskLike).
create table task_blockers (
  task_id text not null references tasks (id) on delete cascade,
  blocks_on text not null references tasks (id) on delete cascade,
  primary key (task_id, blocks_on)
);

create table event_rules (
  id text primary key,
  event_id text not null references events (id) on delete cascade,
  category_id text not null references categories (id),
  title text not null,
  detail text not null,
  pending boolean not null default false
);
create index event_rules_event_id_idx on event_rules (event_id);

-- Cadenas de dependencias destacadas para el dashboard del evento. Hoy no
-- hay UI para crear/editar cadenas (son contenido curado a mano), pero la
-- tabla existe para que el dashboard pueda leerlas igual que lee el resto.
create table event_chains (
  id text primary key,
  event_id text not null references events (id) on delete cascade,
  note text not null
);
create index event_chains_event_id_idx on event_chains (event_id);

create table chain_tasks (
  chain_id text not null references event_chains (id) on delete cascade,
  task_id text not null references tasks (id) on delete cascade,
  position integer not null,
  primary key (chain_id, task_id)
);

create table expenses (
  id text primary key,
  event_id text not null references events (id) on delete cascade,
  person_id text not null references members (id),
  amount numeric(10, 2) not null,
  concept text not null,
  category_id text references categories (id),
  date date not null
);
create index expenses_event_id_idx on expenses (event_id);

-- Tareas predefinidas globales que el socio marca como "repetir en eventos
-- nuevos" desde el diálogo de nueva tarea.
create table task_templates (
  id text primary key,
  title text not null,
  category_id text not null references categories (id),
  assignee_id text not null references members (id),
  priority task_priority not null,
  offset_days integer not null,
  is_milestone boolean not null default false
);
