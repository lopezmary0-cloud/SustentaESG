-- SustentaESG — verificación del esquema en Supabase. SOLO LEE: no cambia nada y no muestra datos de nadie.
-- Se ejecuta DESPUÉS de la migración, en el SQL Editor. Cada bloque debe dar el resultado que dice el comentario.

-- 1) Las 6 tablas existen y todas tienen la seguridad por filas ACTIVADA (rls = true).
select c.relname as tabla, c.relrowsecurity as rls
from pg_class c join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public' and c.relkind = 'r'
order by c.relname;
-- Esperado: acciones_plan, cuentas, empresas, evaluaciones, fotografias, miembros_empresa, todas con rls = true.

-- 2) Cada tabla tiene sus políticas (número de políticas por tabla).
select tablename as tabla, count(*) as politicas
from pg_policies where schemaname = 'public'
group by tablename order by tablename;
-- Esperado: acciones_plan 4, cuentas 2, empresas 4, evaluaciones 3, fotografias 3, miembros_empresa 1.

-- 3) La persona SIN sesión (anon) no tiene ningún permiso sobre tus tablas.
select count(*) as permisos_de_anon
from information_schema.role_table_grants
where grantee = 'anon' and table_schema = 'public'
  and table_name in ('acciones_plan','cuentas','empresas','evaluaciones','fotografias','miembros_empresa');
-- Esperado: 0

-- 4) Lista blanca: solo estas columnas se pueden MODIFICAR desde la app (debe salir 0 filas = no hay ninguna de más).
select table_name, column_name
from information_schema.column_privileges
where grantee = 'authenticated' and table_schema = 'public' and privilege_type = 'UPDATE'
  and (table_name, column_name) not in (
    ('cuentas','rol'),('cuentas','rol_texto'),('cuentas','motivo'),('cuentas','motivo_texto'),
    ('cuentas','perfil_plan'),('cuentas','ciclo_plan'),
    ('empresas','nombre'),('empresas','actividad'),('empresas','tamano'),('empresas','lectura_rapida'),
    ('evaluaciones','metodologia'),('evaluaciones','respuestas'),
    ('acciones_plan','titulo'),('acciones_plan','responsable'),('acciones_plan','fecha'),('acciones_plan','estado'),
    ('acciones_plan','nota'),('acciones_plan','origen'),('acciones_plan','indicador'),('acciones_plan','evidencia'));
-- Esperado: sin filas. (Si sale «estado» o «limite_empresas» de la tabla cuentas, algo está mal: avísame.)

-- 5) Las funciones internas fijan un camino de búsqueda vacío (debe salir 0 filas).
select p.proname as funcion_insegura
from pg_proc p join pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'private' and p.prosecdef
  and not (coalesce(p.proconfig, '{}'::text[]) @> array['search_path=""']);
-- Esperado: sin filas.

-- 6) Existe el disparador que crea la cuenta al registrarse una persona.
select tgname as disparador from pg_trigger
where tgrelid = 'auth.users'::regclass and not tgisinternal;
-- Esperado: aparece crear_cuenta_al_registrarse.
