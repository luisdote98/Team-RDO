-- Row Level Security en todas las tablas, SIN políticas (default-deny).
--
-- Esta app no usa Supabase Auth: el login es un usuario/contraseña propio
-- (tabla `members`, hash bcrypt) verificado desde Server Actions. Como no
-- hay sesión de Supabase con `auth.uid()`, no existe una condición real
-- contra la que escribir políticas de RLS por fila.
--
-- Todo el acceso de la app pasa por Server Actions que usan la
-- service-role key (definida solo en el servidor, nunca en el navegador),
-- que ignora RLS por diseño. RLS aquí es defensa en profundidad: si algún
-- día la anon key pública se usara sin querer para leer/escribir directo
-- desde el cliente, no podría tocar ninguna fila.

alter table members enable row level security;
alter table categories enable row level security;
alter table events enable row level security;
alter table tasks enable row level security;
alter table task_blockers enable row level security;
alter table event_rules enable row level security;
alter table event_chains enable row level security;
alter table chain_tasks enable row level security;
alter table expenses enable row level security;
alter table task_templates enable row level security;
