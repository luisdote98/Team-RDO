-- Este proyecto no traía los privilegios por defecto que Supabase suele
-- conceder a `service_role` sobre las tablas nuevas del schema `public`
-- (independiente de RLS: RLS decide qué filas, esto decide si el rol puede
-- tocar la tabla en absoluto). Sin esto, la service-role key da
-- "permission denied" aunque RLS esté bien configurado.
grant usage on schema public to service_role;
grant select, insert, update, delete on all tables in schema public to service_role;
alter default privileges in schema public
  grant select, insert, update, delete on tables to service_role;
