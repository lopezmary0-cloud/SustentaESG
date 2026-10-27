-- SOLO PARA PRUEBAS LOCALES (no se ejecuta en Supabase): imita lo que Supabase ya trae de fábrica
-- para poder probar la migración de verdad en una base de datos de prueba.

create role anon nologin;
create role authenticated nologin;
create role service_role nologin bypassrls;

create schema auth;
create table auth.users (
  id uuid primary key default gen_random_uuid(),
  email text,
  created_at timestamptz not null default now()
);

-- Igual que Supabase: lee el usuario del «pase» (JWT) de la sesión.
create function auth.uid() returns uuid language sql stable as $$
  select nullif(coalesce(
    current_setting('request.jwt.claim.sub', true),
    (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'sub')
  ), '')::uuid
$$;

-- Supabase da por defecto permisos amplios en `public` a anon/authenticated: se imita para que las
-- revocaciones de la migración se prueben de verdad.
grant usage on schema public to anon, authenticated, service_role;
alter default privileges in schema public grant all on tables to anon, authenticated, service_role;
alter default privileges in schema public grant all on functions to anon, authenticated, service_role;
grant usage on schema auth to authenticated, service_role;
grant execute on function auth.uid() to anon, authenticated, service_role;
