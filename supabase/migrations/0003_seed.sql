-- Datos de catálogo: los 3 socios (con su contraseña actual, hasheada con
-- bcrypt vía scripts/hash-password.mjs) y las categorías/áreas del evento.
-- No se siembran eventos de ejemplo: el equipo crea su primer evento real
-- desde la app.

insert into members (id, name, role, color, bg_color, password_hash) values
  ('luis', 'Luis', 'Sector técnico: sonido, equipo DJ, montaje, cartelería y archivo de contenido', '#3d5566', '#e6ebee', '$2b$12$hxnfiZxF68wf8EQ79zB1a.AL9fsz7YfAgs6nmLY6C0wIWrhizJOH.'),
  ('oliver', 'Oliver', 'Supervisión y control: coordinación de seguridad, DJs y camareros; pagos al staff y control del dinero de barra', '#8a6520', '#f7ecd6', '$2b$12$bUHSCtxxlNi826zJIdKtZOKCF.ublWSB3YECzDANDTTUJDWo51mBe'),
  ('guille', 'Guille', 'Sector comercial y RRPP: contenido, redes, ticketing y coordinación de accesos', '#4d6b3f', '#e9efe6', '$2b$12$k6/Hl4FUoUdfJdavOvm.f.rNQK02.tGtor6HxTXxeVLTcwSVpPyfS');

insert into categories (id, name, color) values
  ('booking', 'Booking y line-up', '#b8863b'),
  ('entradas', 'Entradas y tramos', '#6f8a5c'),
  ('seguridad', 'Seguridad', '#8c6f5c'),
  ('villa', 'Villa', '#9b7f5e'),
  ('sonido', 'Equipo de sonido', '#5f7a8c'),
  ('dj', 'Equipo DJ', '#5c6a94'),
  ('barra', 'Barra y personal', '#a2553f'),
  ('invitados', 'Invitados', '#9c6a60'),
  ('contenido', 'Contenido y grabación', '#7d7050'),
  ('decoracion', 'Decoración y temática', '#b07f5c'),
  ('carteleria', 'Cartelería y redes', '#84708a');
