-- SustentaESG — esquema inicial (v0.2, ya con la auditoría de seguridad aplicada).
-- Se ejecuta UNA vez en un proyecto vacío de Supabase.
--
-- Qué hace, en simple:
--   · Crea las tablas: cuentas, empresas, miembros_empresa, evaluaciones, fotografias, acciones_plan.
--   · Activa la seguridad por filas (RLS) en TODAS: cada persona solo ve y toca lo de SUS empresas.
--   · Hace cumplir en la base de datos (no solo en la pantalla): el límite de empresas, los nombres
--     repetidos, el fin de la prueba (después solo se puede LEER y BORRAR), los topes de volumen y que
--     nadie pueda cambiar su plan, su estado de pago ni su fecha de prueba.
--
-- Diseño (docs/sistema/25-BASE-DE-DATOS.md): uuid, timestamptz, checks y FKs en la base, índice en cada FK,
-- políticas por comando con (select auth.uid()), funciones security definer en el esquema `private`
-- con search_path vacío. Sin acceso para `anon`: todo exige haber iniciado sesión.
--
-- DECISIONES (a revisar cuando exista el cobro real, ver ESTADO.md):
--   · `limite_empresas` y `estado` solo los escribe el SERVIDOR (webhook de Hotmart con service_role).
--     Durante la prueba cada cuenta tiene 3 empresas; al pagar, el servidor pone 1 (Empresa) o 10 (Consultor).
--     `perfil_plan` y `ciclo_plan` son solo la PREFERENCIA que la persona marcó en la pantalla de planes.
--   · La prueba dura 7 días (debe coincidir con TRIAL_DIAS de lib/site.ts: hay una prueba que lo verifica).
--   · Pasada la prueba sin pagar, la persona sigue pudiendo LEER y BORRAR sus datos, pero no crear ni editar.

create schema if not exists private;

-- ---------------------------------------------------------------------------------------------
-- Funciones auxiliares (esquema private: la API pública no lo expone)
-- ---------------------------------------------------------------------------------------------

create or replace function private.set_updated_at() returns trigger
language plpgsql set search_path = '' as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------------------------
-- cuentas: una fila por persona. La crea un disparador al registrarse (la fecha de inicio de la
-- prueba la pone el servidor, no la pantalla). Las columnas de pago son solo del servidor.
-- ---------------------------------------------------------------------------------------------

create table public.cuentas (
  user_id         uuid primary key references auth.users (id) on delete cascade,
  rol             text check (rol in ('propia', 'varias', 'otra')),
  rol_texto       text check (char_length(rol_texto) <= 120),
  motivo          text check (motivo in ('cliente', 'direccion', 'ordenar', 'cero', 'otra')),
  motivo_texto    text check (char_length(motivo_texto) <= 120),
  perfil_plan     text not null default 'empresa' check (perfil_plan in ('empresa', 'consultor')),
  ciclo_plan      text not null default 'anual' check (ciclo_plan in ('anual', 'mensual')),
  estado          text not null default 'prueba' check (estado in ('prueba', 'activa', 'vencida')),
  limite_empresas int  not null default 3 check (limite_empresas between 1 and 10),
  prueba_inicio   timestamptz not null default now(),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create trigger cuentas_set_updated_at before update on public.cuentas
  for each row execute function private.set_updated_at();

create or replace function private.crear_cuenta() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  insert into public.cuentas (user_id) values (new.id) on conflict do nothing;
  return new;
end;
$$;

create trigger crear_cuenta_al_registrarse after insert on auth.users
  for each row execute function private.crear_cuenta();

-- Personas que ya existieran antes de esta migración también reciben su cuenta.
insert into public.cuentas (user_id) select id from auth.users on conflict do nothing;

-- ¿La cuenta de esta persona puede ESCRIBIR? Con plan activo, sí; en prueba, durante 7 días (TRIAL_DIAS).
create or replace function private.cuenta_al_dia(p_user uuid) returns boolean
language sql security definer set search_path = '' stable as $$
  select exists (
    select 1 from public.cuentas c
    where c.user_id = p_user
      and (c.estado = 'activa' or (c.estado = 'prueba' and c.prueba_inicio > now() - interval '7 days'))
  );
$$;

-- ---------------------------------------------------------------------------------------------
-- empresas + miembros. El dato pertenece a la EMPRESA; las personas pertenecen a ella (membresía).
-- ---------------------------------------------------------------------------------------------

create table public.empresas (
  id             uuid primary key default gen_random_uuid(),
  creado_por     uuid not null default auth.uid() references auth.users (id) on delete cascade,
  nombre         text not null check (char_length(btrim(nombre)) between 2 and 80 and char_length(nombre) <= 120),
  actividad      text not null default '' check (char_length(actividad) <= 120),
  tamano         text not null default '' check (tamano in ('', '1-10', '11-50', '51-200', '200+')),
  lectura_rapida jsonb check (
    lectura_rapida is null
    or (jsonb_typeof(lectura_rapida) = 'object' and pg_column_size(lectura_rapida) < 2048)
  ),
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

-- Un mismo creador no puede repetir el nombre (sin distinguir mayúsculas ni espacios de más).
create unique index empresas_nombre_unico
  on public.empresas (creado_por, lower(regexp_replace(btrim(nombre), '\s+', ' ', 'g')));

create trigger empresas_set_updated_at before update on public.empresas
  for each row execute function private.set_updated_at();

create table public.miembros_empresa (
  empresa_id uuid not null references public.empresas (id) on delete cascade,
  user_id    uuid not null references auth.users (id) on delete cascade,
  rol        text not null default 'lector' check (rol in ('propietario', 'editor', 'lector')),
  created_at timestamptz not null default now(),
  primary key (empresa_id, user_id)
);
create index miembros_empresa_user_idx on public.miembros_empresa (user_id);

-- Funciones que usan las políticas (van DESPUÉS de la tabla de miembros porque la leen).
-- ¿La persona que hace la consulta es miembro de esta empresa?
create or replace function private.es_miembro(p_empresa uuid) returns boolean
language sql security definer set search_path = '' stable as $$
  select exists (
    select 1 from public.miembros_empresa m
    where m.empresa_id = p_empresa and m.user_id = (select auth.uid())
  );
$$;

-- ¿Puede editar? (propietario o editor; el lector solo mira) Y la cuenta de la empresa está al día.
create or replace function private.puede_editar(p_empresa uuid) returns boolean
language sql security definer set search_path = '' stable as $$
  select exists (
    select 1 from public.miembros_empresa m
    join public.empresas e on e.id = m.empresa_id
    where m.empresa_id = p_empresa and m.user_id = (select auth.uid())
      and m.rol in ('propietario', 'editor')
      and private.cuenta_al_dia(e.creado_por)
  );
$$;

-- Borrar la empresa: solo el propietario (se permite aunque la prueba haya terminado: derecho de supresión).
create or replace function private.es_propietario(p_empresa uuid) returns boolean
language sql security definer set search_path = '' stable as $$
  select exists (
    select 1 from public.miembros_empresa m
    where m.empresa_id = p_empresa and m.user_id = (select auth.uid())
      and m.rol = 'propietario'
  );
$$;

-- Límite de empresas, cumplido por la base de datos. Lee `cuentas.limite_empresas`, que SOLO escribe el servidor.
create or replace function private.verificar_limite_empresas() returns trigger
language plpgsql security definer set search_path = '' as $$
declare
  v_limite   int;
  v_actuales int;
begin
  -- Nadie puede crear una empresa a nombre de otra persona, y no se revela nada de la otra cuenta:
  -- el mensaje es el mismo que da la seguridad por filas.
  if (select auth.uid()) is not null and new.creado_por is distinct from (select auth.uid()) then
    raise exception 'new row violates row-level security policy for table "empresas"' using errcode = '42501';
  end if;
  perform pg_advisory_xact_lock(hashtextextended(new.creado_por::text, 0));
  select c.limite_empresas into v_limite from public.cuentas c where c.user_id = new.creado_por;
  v_limite := coalesce(v_limite, 1);
  select count(*) into v_actuales from public.empresas e where e.creado_por = new.creado_por;
  if v_actuales >= v_limite then
    raise exception 'limite_empresas' using errcode = 'P0001', hint = 'Tu plan no permite más empresas.';
  end if;
  return new;
end;
$$;

create trigger empresas_verificar_limite before insert on public.empresas
  for each row execute function private.verificar_limite_empresas();

-- Quien crea la empresa queda como propietario.
create or replace function private.nueva_empresa_miembro() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  insert into public.miembros_empresa (empresa_id, user_id, rol)
  values (new.id, new.creado_por, 'propietario');
  return new;
end;
$$;

create trigger empresas_crear_propietario after insert on public.empresas
  for each row execute function private.nueva_empresa_miembro();

-- ---------------------------------------------------------------------------------------------
-- Datos de cada empresa
-- ---------------------------------------------------------------------------------------------

-- La evaluación vigente (se edita y acumula). Una por empresa.
create table public.evaluaciones (
  empresa_id uuid primary key references public.empresas (id) on delete cascade,
  metodologia text not null check (char_length(metodologia) between 1 and 40),
  respuestas  jsonb not null default '{}'::jsonb check (
    jsonb_typeof(respuestas) = 'object' and pg_column_size(respuestas) < 65536
  ),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create trigger evaluaciones_set_updated_at before update on public.evaluaciones
  for each row execute function private.set_updated_at();

-- Fotografías del historial: copias fechadas que NO se editan (solo se crean y se quitan).
create table public.fotografias (
  id          uuid primary key default gen_random_uuid(),
  empresa_id  uuid not null references public.empresas (id) on delete cascade,
  etiqueta    text not null check (char_length(btrim(etiqueta)) between 1 and 60 and char_length(etiqueta) <= 100),
  metodologia text not null check (char_length(metodologia) between 1 and 40),
  respuestas  jsonb not null check (jsonb_typeof(respuestas) = 'object' and pg_column_size(respuestas) < 65536),
  resultado   jsonb not null check (jsonb_typeof(resultado) = 'object' and pg_column_size(resultado) < 32768),
  created_at  timestamptz not null default now()
);
create index fotografias_empresa_idx on public.fotografias (empresa_id, created_at desc);

create table public.acciones_plan (
  id          uuid primary key default gen_random_uuid(),
  empresa_id  uuid not null references public.empresas (id) on delete cascade,
  titulo      text not null check (char_length(btrim(titulo)) between 5 and 240 and char_length(titulo) <= 300),
  responsable text not null default '' check (char_length(responsable) <= 60),
  fecha       date,
  estado      text not null default 'pendiente' check (estado in ('pendiente', 'en_curso', 'hecha')),
  nota        text not null default '' check (char_length(nota) <= 300),
  origen      text check (char_length(origen) <= 40),
  indicador   text not null default '' check (char_length(indicador) <= 240),
  evidencia   text not null default '' check (char_length(evidencia) <= 240),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create index acciones_plan_empresa_idx on public.acciones_plan (empresa_id, estado, fecha);
create trigger acciones_plan_set_updated_at before update on public.acciones_plan
  for each row execute function private.set_updated_at();

-- Topes de volumen por empresa (protegen el almacenamiento): 50 fotografías y 500 acciones.
create or replace function private.verificar_tope_filas() returns trigger
language plpgsql security definer set search_path = '' as $$
declare
  v_max int := tg_argv[0]::int;
  v_actuales int;
begin
  perform pg_advisory_xact_lock(hashtextextended(tg_table_name || new.empresa_id::text, 0));
  execute format('select count(*) from public.%I where empresa_id = $1', tg_table_name)
    into v_actuales using new.empresa_id;
  if v_actuales >= v_max then
    raise exception 'tope_filas' using errcode = 'P0001', hint = 'Llegaste al máximo permitido para esta empresa.';
  end if;
  return new;
end;
$$;

create trigger fotografias_tope before insert on public.fotografias
  for each row execute function private.verificar_tope_filas(50);
create trigger acciones_plan_tope before insert on public.acciones_plan
  for each row execute function private.verificar_tope_filas(500);

-- ---------------------------------------------------------------------------------------------
-- Seguridad por filas (RLS) en TODAS las tablas. Sin política = nadie ve nada (denegado por defecto).
-- ---------------------------------------------------------------------------------------------

alter table public.cuentas          enable row level security;
alter table public.empresas         enable row level security;
alter table public.miembros_empresa enable row level security;
alter table public.evaluaciones     enable row level security;
alter table public.fotografias      enable row level security;
alter table public.acciones_plan    enable row level security;

-- cuentas: cada persona ve y edita solo SU cuenta (y solo las columnas de preferencias).
create policy cuentas_select on public.cuentas for select to authenticated
  using ((select auth.uid()) = user_id);
create policy cuentas_update on public.cuentas for update to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

-- empresas: ve las suyas (la propia creación también, para que `insert ... returning` funcione).
-- Crear exige tener la cuenta al día; editar, poder editar (que también exige cuenta al día).
create policy empresas_select on public.empresas for select to authenticated
  using (creado_por = (select auth.uid()) or private.es_miembro(id));
create policy empresas_insert on public.empresas for insert to authenticated
  with check (creado_por = (select auth.uid()) and private.cuenta_al_dia((select auth.uid())));
create policy empresas_update on public.empresas for update to authenticated
  using (private.puede_editar(id)) with check (private.puede_editar(id));
create policy empresas_delete on public.empresas for delete to authenticated
  using (private.es_propietario(id));

-- miembros: solo se leen (invitar a más personas llega en una versión posterior).
create policy miembros_select on public.miembros_empresa for select to authenticated
  using (user_id = (select auth.uid()) or private.es_miembro(empresa_id));

-- datos de la empresa: leer = ser miembro; escribir = poder editar (y cuenta al día); borrar = poder editar
-- pero SIN exigir cuenta al día para quitar fotografías y acciones (siempre se puede borrar lo propio).
create policy evaluaciones_select on public.evaluaciones for select to authenticated
  using (private.es_miembro(empresa_id));
create policy evaluaciones_insert on public.evaluaciones for insert to authenticated
  with check (private.puede_editar(empresa_id));
create policy evaluaciones_update on public.evaluaciones for update to authenticated
  using (private.puede_editar(empresa_id)) with check (private.puede_editar(empresa_id));

create policy fotografias_select on public.fotografias for select to authenticated
  using (private.es_miembro(empresa_id));
create policy fotografias_insert on public.fotografias for insert to authenticated
  with check (private.puede_editar(empresa_id));
create policy fotografias_delete on public.fotografias for delete to authenticated
  using (private.es_propietario(empresa_id) or private.puede_editar(empresa_id));

create policy acciones_select on public.acciones_plan for select to authenticated
  using (private.es_miembro(empresa_id));
create policy acciones_insert on public.acciones_plan for insert to authenticated
  with check (private.puede_editar(empresa_id));
create policy acciones_update on public.acciones_plan for update to authenticated
  using (private.puede_editar(empresa_id)) with check (private.puede_editar(empresa_id));
create policy acciones_delete on public.acciones_plan for delete to authenticated
  using (private.es_propietario(empresa_id) or private.puede_editar(empresa_id));

-- ---------------------------------------------------------------------------------------------
-- Permisos (GRANT) por COLUMNA: lista blanca exacta de lo que la app puede escribir. `anon` (sin sesión)
-- no recibe NADA. Quedan fuera, a propósito: ids, empresa_id (no se mueve un dato a otra empresa),
-- creado_por, fechas de creación/actualización, estado de pago, límite de empresas y fecha de la prueba.
-- ---------------------------------------------------------------------------------------------

revoke all on public.cuentas, public.empresas, public.miembros_empresa,
              public.evaluaciones, public.fotografias, public.acciones_plan from anon, authenticated;

grant select on public.cuentas to authenticated;
grant update (rol, rol_texto, motivo, motivo_texto, perfil_plan, ciclo_plan) on public.cuentas to authenticated;

grant select, delete on public.empresas to authenticated;
grant insert (creado_por, nombre, actividad, tamano, lectura_rapida) on public.empresas to authenticated;
grant update (nombre, actividad, tamano, lectura_rapida) on public.empresas to authenticated;

grant select on public.miembros_empresa to authenticated;

grant select on public.evaluaciones to authenticated;
grant insert (empresa_id, metodologia, respuestas) on public.evaluaciones to authenticated;
grant update (metodologia, respuestas) on public.evaluaciones to authenticated;

grant select, delete on public.fotografias to authenticated;
grant insert (empresa_id, etiqueta, metodologia, respuestas, resultado) on public.fotografias to authenticated;

grant select, delete on public.acciones_plan to authenticated;
grant insert (empresa_id, titulo, responsable, fecha, estado, nota, origen, indicador, evidencia)
  on public.acciones_plan to authenticated;
grant update (titulo, responsable, fecha, estado, nota, origen, indicador, evidencia)
  on public.acciones_plan to authenticated;

-- Las funciones de ayuda solo las puede ejecutar quien inició sesión (las usan las políticas). Las que se
-- creen en `private` en el futuro tampoco quedan ejecutables por nadie salvo que se conceda a propósito.
revoke all on schema private from public, anon;
grant usage on schema private to authenticated;
revoke execute on all functions in schema private from public, anon, authenticated;
-- Postgres da EXECUTE a todo el mundo (PUBLIC) a cada función nueva, y eso solo se quita con la forma global
-- (no admite «in schema»): así, lo que se cree después con este mismo rol nace cerrado.
alter default privileges revoke execute on functions from public;
alter default privileges in schema private revoke execute on functions from anon, authenticated;
grant execute on function private.es_miembro(uuid), private.puede_editar(uuid),
                          private.es_propietario(uuid), private.cuenta_al_dia(uuid) to authenticated;
