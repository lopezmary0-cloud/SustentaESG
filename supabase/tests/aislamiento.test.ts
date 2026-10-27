// Pruebas de seguridad de la base de datos: ejecuta la migración REAL en una base de datos de prueba
// (PGlite = Postgres en memoria) y comprueba, con dos personas distintas, que cada una solo ve y toca lo suyo.
// `npm test` las corre junto con todas las demás.

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { PGlite } from '@electric-sql/pglite';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';

const raiz = join(__dirname, '..');
const leer = (ruta: string) => readFileSync(join(raiz, ruta), 'utf8');

const ANA = '11111111-1111-4111-8111-111111111111';
const BETO = '22222222-2222-4222-8222-222222222222';

let db: PGlite;

/** Actúa como una persona que inició sesión (o sin sesión si uid es null). */
async function como(uid: string | null, rol: 'authenticated' | 'anon' = 'authenticated') {
  await db.exec('reset role');
  const claims = uid ? JSON.stringify({ sub: uid, role: rol }) : '';
  await db.query(`select set_config('request.jwt.claims', $1, false)`, [claims]);
  await db.exec(`set role ${rol}`);
}

/** Actúa como el servidor (se salta las reglas): solo para preparar datos de prueba. */
async function comoServidor() {
  await db.exec('reset role');
}

async function filas<T = Record<string, unknown>>(sql: string, params: unknown[] = []): Promise<T[]> {
  return (await db.query<T>(sql, params)).rows;
}

/** Ejecuta algo que DEBE ser rechazado y devuelve el mensaje del rechazo. */
async function rechazo(sql: string, params: unknown[] = []): Promise<string> {
  try {
    await db.query(sql, params);
  } catch (e) {
    return (e as Error).message;
  }
  throw new Error(`Se esperaba un rechazo, pero se aceptó: ${sql}`);
}

async function afectadas(sql: string, params: unknown[] = []): Promise<number> {
  return (await db.query(sql, params)).affectedRows ?? 0;
}

/** Lo que hace el servidor (webhook de pago): fija el límite de empresas y el estado de una cuenta. */
async function darLimite(uid: string, limite: number, estado = 'activa') {
  await comoServidor();
  await db.query(`update public.cuentas set limite_empresas = $2, estado = $3 where user_id = $1`, [uid, limite, estado]);
}

const nuevaEmpresa = async (nombre: string, uid: string) =>
  (await filas<{ id: string }>(`insert into public.empresas (creado_por, nombre) values ($1, $2) returning id`, [uid, nombre]))[0].id;

beforeAll(async () => {
  db = new PGlite();
  await db.exec(leer('tests/stub-supabase.sql'));
  await db.exec(leer('migrations/20261026000000_esquema_inicial.sql'));
}, 120_000);

afterAll(async () => {
  await db.close();
});

beforeEach(async () => {
  await comoServidor();
  await db.exec('delete from auth.users');
  await db.query(`insert into auth.users (id, email) values ($1, 'ana@ejemplo.co'), ($2, 'beto@ejemplo.co')`, [ANA, BETO]);
});

describe('cuentas', () => {
  it('se crea sola al registrarse, en estado de prueba y con la fecha del servidor', async () => {
    await comoServidor();
    const [c] = await filas<{ estado: string; perfil_plan: string; segundos: number }>(
      `select estado, perfil_plan, extract(epoch from now() - prueba_inicio)::int as segundos from public.cuentas where user_id = $1`,
      [ANA]
    );
    expect(c.estado).toBe('prueba');
    expect(c.perfil_plan).toBe('empresa');
    expect(c.segundos).toBeLessThan(10);
  });

  it('cada persona ve solo su cuenta', async () => {
    await como(ANA);
    expect((await filas('select user_id from public.cuentas')).length).toBe(1);
    expect(await filas('select * from public.cuentas where user_id = $1', [BETO])).toEqual([]);
  });

  it('puede cambiar sus preferencias, pero no su estado de pago ni su fecha de prueba', async () => {
    await como(ANA);
    expect(await afectadas(`update public.cuentas set perfil_plan = 'consultor', ciclo_plan = 'mensual' where user_id = $1`, [ANA])).toBe(1);
    expect(await rechazo(`update public.cuentas set estado = 'activa' where user_id = $1`, [ANA])).toMatch(/permission denied/);
    expect(await rechazo(`update public.cuentas set prueba_inicio = now() + interval '1 year' where user_id = $1`, [ANA])).toMatch(/permission denied/);
  });

  it('nadie puede tocar la cuenta de otra persona', async () => {
    await como(BETO);
    expect(await afectadas(`update public.cuentas set perfil_plan = 'consultor' where user_id = $1`, [ANA])).toBe(0);
  });

  it('no se puede crear ni borrar una cuenta desde la app', async () => {
    await como(ANA);
    expect(await rechazo(`insert into public.cuentas (user_id) values ($1)`, [crypto.randomUUID()])).toMatch(/permission denied/);
    expect(await rechazo(`delete from public.cuentas where user_id = $1`, [ANA])).toMatch(/permission denied/);
  });
});

describe('aislamiento entre personas', () => {
  it('Ana crea una empresa, la ve y queda como propietaria; Beto no la ve', async () => {
    await como(ANA);
    const id = await nuevaEmpresa('Textiles del Valle', ANA);
    expect((await filas('select id from public.empresas')).length).toBe(1);
    expect(await filas(`select rol from public.miembros_empresa where empresa_id = $1`, [id])).toEqual([{ rol: 'propietario' }]);

    await como(BETO);
    expect(await filas('select id from public.empresas')).toEqual([]);
    expect(await filas('select * from public.miembros_empresa')).toEqual([]);
  });

  it('Beto no puede crear una empresa a nombre de Ana', async () => {
    await como(BETO);
    expect(await rechazo(`insert into public.empresas (creado_por, nombre) values ($1, 'Falsa')`, [ANA])).toMatch(/row-level security/);
  });

  it('Beto no puede leer, escribir ni borrar los datos de la empresa de Ana', async () => {
    await como(ANA);
    const id = await nuevaEmpresa('Textiles del Valle', ANA);
    await db.query(`insert into public.evaluaciones (empresa_id, metodologia, respuestas) values ($1, '0.1-borrador', '{"AMB01":{"tipo":"valor","valor":2}}')`, [id]);
    await db.query(`insert into public.acciones_plan (empresa_id, titulo) values ($1, 'Reunir facturas de energía')`, [id]);
    await db.query(
      `insert into public.fotografias (empresa_id, etiqueta, metodologia, respuestas, resultado) values ($1, 'Línea base', '0.1-borrador', '{}', '{}')`,
      [id]
    );

    await como(BETO);
    expect(await filas('select * from public.evaluaciones')).toEqual([]);
    expect(await filas('select * from public.acciones_plan')).toEqual([]);
    expect(await filas('select * from public.fotografias')).toEqual([]);

    expect(await rechazo(`insert into public.evaluaciones (empresa_id, metodologia) values ($1, 'x')`, [id])).toMatch(/row-level security/);
    expect(await rechazo(`insert into public.acciones_plan (empresa_id, titulo) values ($1, 'Acción intrusa')`, [id])).toMatch(/row-level security/);
    expect(await rechazo(`insert into public.fotografias (empresa_id, etiqueta, metodologia, respuestas, resultado) values ($1, 'x', 'x', '{}', '{}')`, [id])).toMatch(/row-level security/);

    expect(await afectadas(`update public.empresas set nombre = 'Hackeada' where id = $1`, [id])).toBe(0);
    expect(await afectadas(`update public.evaluaciones set respuestas = '{}' where empresa_id = $1`, [id])).toBe(0);
    expect(await afectadas(`update public.acciones_plan set estado = 'hecha' where empresa_id = $1`, [id])).toBe(0);
    expect(await afectadas(`delete from public.acciones_plan where empresa_id = $1`, [id])).toBe(0);
    expect(await afectadas(`delete from public.empresas where id = $1`, [id])).toBe(0);

    await como(ANA);
    const [e] = await filas<{ nombre: string }>('select nombre from public.empresas');
    expect(e.nombre).toBe('Textiles del Valle');
    expect((await filas('select * from public.acciones_plan')).length).toBe(1);
  });

  it('nadie puede cambiar el creador de una empresa ni «regalarla» a otro', async () => {
    await como(ANA);
    const id = await nuevaEmpresa('Textiles del Valle', ANA);
    expect(await rechazo(`update public.empresas set creado_por = $1 where id = $2`, [BETO, id])).toMatch(/permission denied/);
  });

  it('nadie puede apuntar sus datos a la empresa de otra persona (cambiar empresa_id)', async () => {
    await como(ANA);
    const delAna = await nuevaEmpresa('Textiles del Valle', ANA);
    await como(BETO);
    const delBeto = await nuevaEmpresa('Café La Palma', BETO);
    await db.query(`insert into public.acciones_plan (empresa_id, titulo) values ($1, 'Acción de Beto')`, [delBeto]);
    await db.query(`insert into public.evaluaciones (empresa_id, metodologia) values ($1, 'v')`, [delBeto]);
    // Con filas reales que mover: mover una acción o una evaluación a la empresa de Ana debe rechazarse.
    expect(await rechazo(`update public.acciones_plan set empresa_id = $1`, [delAna])).toMatch(/permission denied/);
    expect(await rechazo(`update public.evaluaciones set empresa_id = $1`, [delAna])).toMatch(/permission denied/);
  });

  it('sin sesión no se ve ni se escribe nada', async () => {
    await como(ANA);
    await nuevaEmpresa('Textiles del Valle', ANA);

    await como(null, 'anon');
    for (const tabla of ['cuentas', 'empresas', 'miembros_empresa', 'evaluaciones', 'fotografias', 'acciones_plan']) {
      expect(await rechazo(`select * from public.${tabla}`)).toMatch(/permission denied/);
    }
    expect(await rechazo(`insert into public.empresas (creado_por, nombre) values ($1, 'Anónima')`, [ANA])).toMatch(/permission denied/);

    // con el rol «authenticated» pero SIN identidad (pase vacío) tampoco se ve nada
    await como(null, 'authenticated');
    expect(await filas('select * from public.empresas')).toEqual([]);
    expect(await rechazo(`insert into public.empresas (creado_por, nombre) values ($1, 'Sin pase')`, [BETO])).toMatch(/row-level security/);
  });

  it('las funciones internas no se pueden llamar sin sesión', async () => {
    await como(null, 'anon');
    expect(await rechazo(`select private.es_miembro($1)`, [ANA])).toMatch(/permission denied/);
  });

  it('las funciones de disparadores no se pueden llamar a mano', async () => {
    await como(ANA);
    expect(await rechazo(`select private.crear_cuenta()`)).toMatch(/permission denied/);
    expect(await rechazo(`select private.verificar_limite_empresas()`)).toMatch(/permission denied/);
  });
});

describe('reglas del plan y de los datos', () => {
  it('el límite de empresas lo fija el servidor: 1 (Empresa) o 10 (Consultor)', async () => {
    await darLimite(ANA, 1);
    await como(ANA);
    await nuevaEmpresa('Empresa 1', ANA);
    expect(await rechazo(`insert into public.empresas (creado_por, nombre) values ($1, 'Empresa 2')`, [ANA])).toMatch(/limite_empresas/);

    await darLimite(ANA, 10);
    await como(ANA);
    for (let i = 2; i <= 10; i++) await nuevaEmpresa(`Empresa ${i}`, ANA);
    expect(await rechazo(`insert into public.empresas (creado_por, nombre) values ($1, 'Empresa 11')`, [ANA])).toMatch(/limite_empresas/);
    expect((await filas('select id from public.empresas')).length).toBe(10);
  });

  it('durante la prueba el límite es 3 empresas', async () => {
    await como(ANA);
    for (let i = 1; i <= 3; i++) await nuevaEmpresa(`Empresa ${i}`, ANA);
    expect(await rechazo(`insert into public.empresas (creado_por, nombre) values ($1, 'Empresa 4')`, [ANA])).toMatch(/limite_empresas/);
  });

  it('nadie puede cambiar su estado, su límite ni su fecha de prueba; el plan marcado no da más empresas', async () => {
    await como(ANA);
    for (const col of ['limite_empresas = 10', "estado = 'activa'", 'prueba_inicio = now()', 'user_id = user_id']) {
      expect(await rechazo(`update public.cuentas set ${col}`)).toMatch(/permission denied/);
    }
    await db.query(`update public.cuentas set perfil_plan = 'consultor' where user_id = $1`, [ANA]);
    await darLimite(ANA, 1);
    await como(ANA);
    await nuevaEmpresa('Empresa 1', ANA);
    expect(await rechazo(`insert into public.empresas (creado_por, nombre) values ($1, 'Empresa 2')`, [ANA])).toMatch(/limite_empresas/);
  });

  it('no se puede crear una empresa a nombre de otra persona ni saber si está en su tope', async () => {
    await darLimite(BETO, 1);
    await como(BETO);
    await nuevaEmpresa('Empresa de Beto', BETO);
    await como(ANA);
    const msg = await rechazo(`insert into public.empresas (creado_por, nombre) values ($1, 'Intrusa')`, [BETO]);
    expect(msg).toMatch(/row-level security/);
    expect(msg).not.toMatch(/limite_empresas/);
  });

  it('con la prueba vencida solo se puede leer y borrar, no crear ni editar', async () => {
    await como(ANA);
    const id = await nuevaEmpresa('Textiles del Valle', ANA);
    await db.query(`insert into public.acciones_plan (empresa_id, titulo) values ($1, 'Medir el consumo de agua')`, [id]);
    await db.query(`insert into public.fotografias (empresa_id, etiqueta, metodologia, respuestas, resultado) values ($1, 'Inicial', 'v', '{}', '{}')`, [id]);
    await comoServidor();
    await db.query(`update public.cuentas set prueba_inicio = now() - interval '8 days' where user_id = $1`, [ANA]);

    await como(ANA);
    expect((await filas('select id from public.empresas')).length).toBe(1);
    expect(await rechazo(`insert into public.empresas (creado_por, nombre) values ($1, 'Nueva')`, [ANA])).toMatch(/row-level security/);
    expect(await afectadas(`update public.empresas set nombre = 'Otro nombre' where id = $1`, [id])).toBe(0);
    expect(await rechazo(`insert into public.acciones_plan (empresa_id, titulo) values ($1, 'Otra acción nueva')`, [id])).toMatch(/row-level security/);
    expect(await afectadas(`update public.acciones_plan set estado = 'hecha'`)).toBe(0);
    expect(await afectadas(`delete from public.acciones_plan`)).toBe(1);
    expect(await afectadas(`delete from public.fotografias`)).toBe(1);
    expect(await afectadas(`delete from public.empresas where id = $1`, [id])).toBe(1);
  });

  it('los días de prueba de la base de datos coinciden con los de la app (TRIAL_DIAS)', () => {
    const dias = Number(/TRIAL_DIAS\s*=\s*(\d+)/.exec(readFileSync(join(raiz, '..', 'lib', 'site.ts'), 'utf8'))?.[1]);
    expect(leer('migrations/20261026000000_esquema_inicial.sql')).toContain(`interval '${dias} days'`);
  });

  it('una cuenta que pagó (activa) sigue escribiendo aunque pasen los 7 días', async () => {
    await darLimite(ANA, 1, 'activa');
    await comoServidor();
    await db.query(`update public.cuentas set prueba_inicio = now() - interval '90 days' where user_id = $1`, [ANA]);
    await como(ANA);
    await expect(nuevaEmpresa('Empresa pagada', ANA)).resolves.toBeTruthy();
  });

  it('hay un tope de fotografías (50) y de acciones (500) por empresa, independiente entre empresas', async () => {
    await darLimite(ANA, 2);
    await como(ANA);
    const id = await nuevaEmpresa('Textiles del Valle', ANA);
    const otra = await nuevaEmpresa('Otra empresa', ANA);
    await db.query(
      `insert into public.fotografias (empresa_id, etiqueta, metodologia, respuestas, resultado)
       select $1, 'F' || g, 'v', '{}', '{}' from generate_series(1, 50) g`, [id]);
    expect(await rechazo(`insert into public.fotografias (empresa_id, etiqueta, metodologia, respuestas, resultado) values ($1, 'Extra', 'v', '{}', '{}')`, [id])).toMatch(/tope_filas/);
    await db.query(`insert into public.acciones_plan (empresa_id, titulo) select $1, 'Acción número ' || g from generate_series(1, 500) g`, [id]);
    expect(await rechazo(`insert into public.acciones_plan (empresa_id, titulo) values ($1, 'Una acción de más')`, [id])).toMatch(/tope_filas/);
    await expect(db.query(`insert into public.acciones_plan (empresa_id, titulo) values ($1, 'Primera de la otra')`, [otra])).resolves.toBeTruthy();
  });

  it('las funciones nuevas de private no quedan ejecutables por defecto', async () => {
    await comoServidor();
    await db.exec(`create function private.tmp_prueba() returns int language sql as 'select 1'`);
    await como(ANA);
    expect(await rechazo(`select private.tmp_prueba()`)).toMatch(/permission denied/);
    await comoServidor();
    await db.exec(`drop function private.tmp_prueba()`);
  });

  it('el límite de una persona no afecta a otra', async () => {
    await darLimite(ANA, 1);
    await como(ANA);
    await nuevaEmpresa('Empresa de Ana', ANA);
    await como(BETO);
    await expect(nuevaEmpresa('Empresa de Beto', BETO)).resolves.toBeTruthy();
  });

  it('rechaza nombres repetidos sin distinguir mayúsculas ni espacios de más', async () => {
    await como(ANA);
    await nuevaEmpresa('Textiles del Valle', ANA);
    expect(await rechazo(`insert into public.empresas (creado_por, nombre) values ($1, '  textiles   DEL valle ')`, [ANA])).toMatch(/duplicate key|unique/);
  });

  it('dos personas distintas sí pueden llamar igual a su empresa', async () => {
    await como(ANA);
    await nuevaEmpresa('Textiles del Valle', ANA);
    await como(BETO);
    await expect(nuevaEmpresa('Textiles del Valle', BETO)).resolves.toBeTruthy();
  });

  it('valida los datos en la base: nombre corto, tamaño inválido, estado de acción inválido', async () => {
    await como(ANA);
    expect(await rechazo(`insert into public.empresas (creado_por, nombre) values ($1, 'A')`, [ANA])).toMatch(/check/);
    expect(await rechazo(`insert into public.empresas (creado_por, nombre, tamano) values ($1, 'Empresa válida', '9999')`, [ANA])).toMatch(/check/);
    const id = await nuevaEmpresa('Empresa válida', ANA);
    expect(await rechazo(`insert into public.acciones_plan (empresa_id, titulo, estado) values ($1, 'Una acción', 'inventado')`, [id])).toMatch(/check/);
    expect(await rechazo(`insert into public.acciones_plan (empresa_id, titulo) values ($1, 'abc')`, [id])).toMatch(/check/);
  });

  it('una evaluación enorme se rechaza (protección contra abuso)', async () => {
    await como(ANA);
    const id = await nuevaEmpresa('Empresa válida', ANA);
    const enorme = JSON.stringify({ relleno: 'x'.repeat(70_000) });
    expect(await rechazo(`insert into public.evaluaciones (empresa_id, metodologia, respuestas) values ($1, 'v', $2)`, [id, enorme])).toMatch(/check/);
  });

  it('la evaluación se guarda y se actualiza, y la fecha de actualización cambia sola', async () => {
    await como(ANA);
    const id = await nuevaEmpresa('Empresa válida', ANA);
    await db.query(`insert into public.evaluaciones (empresa_id, metodologia, respuestas) values ($1, '0.1-borrador', '{}')`, [id]);
    await comoServidor();
    await db.query(`update public.evaluaciones set updated_at = now() - interval '1 day' where empresa_id = $1`, [id]);
    await como(ANA);
    await db.query(`update public.evaluaciones set respuestas = '{"AMB01":{"tipo":"valor","valor":3}}' where empresa_id = $1`, [id]);
    const [e] = await filas<{ reciente: boolean }>(`select updated_at > now() - interval '1 minute' as reciente from public.evaluaciones where empresa_id = $1`, [id]);
    expect(e.reciente).toBe(true);
  });

  it('las fotografías del historial no se pueden editar (solo crear y quitar)', async () => {
    await como(ANA);
    const id = await nuevaEmpresa('Empresa válida', ANA);
    await db.query(
      `insert into public.fotografias (empresa_id, etiqueta, metodologia, respuestas, resultado) values ($1, 'Línea base', 'v', '{}', '{"general":{"puntaje":45}}')`,
      [id]
    );
    expect(await rechazo(`update public.fotografias set resultado = '{"general":{"puntaje":99}}' where empresa_id = $1`, [id])).toMatch(/permission denied/);
    expect(await afectadas(`delete from public.fotografias where empresa_id = $1`, [id])).toBe(1);
  });
});

describe('roles dentro de una empresa', () => {
  async function empresaDeAnaConBeto(rol: 'lector' | 'editor'): Promise<string> {
    await como(ANA);
    const id = await nuevaEmpresa('Textiles del Valle', ANA);
    await db.query(`insert into public.acciones_plan (empresa_id, titulo) values ($1, 'Acción de Ana')`, [id]);
    await comoServidor();
    await db.query(`insert into public.miembros_empresa (empresa_id, user_id, rol) values ($1, $2, $3)`, [id, BETO, rol]);
    return id;
  }

  it('un lector puede mirar, pero no escribir ni borrar', async () => {
    const id = await empresaDeAnaConBeto('lector');
    await como(BETO);
    expect((await filas('select id from public.empresas')).length).toBe(1);
    expect((await filas('select titulo from public.acciones_plan')).length).toBe(1);
    expect(await rechazo(`insert into public.acciones_plan (empresa_id, titulo) values ($1, 'Intento de lector')`, [id])).toMatch(/row-level security/);
    expect(await afectadas(`update public.acciones_plan set estado = 'hecha' where empresa_id = $1`, [id])).toBe(0);
    expect(await afectadas(`update public.empresas set nombre = 'Otro nombre' where id = $1`, [id])).toBe(0);
    expect(await afectadas(`delete from public.empresas where id = $1`, [id])).toBe(0);
  });

  it('un editor puede escribir, pero no borrar la empresa', async () => {
    const id = await empresaDeAnaConBeto('editor');
    await como(BETO);
    await db.query(`insert into public.acciones_plan (empresa_id, titulo) values ($1, 'Acción del editor')`, [id]);
    expect(await afectadas(`update public.empresas set actividad = 'Confección' where id = $1`, [id])).toBe(1);
    expect(await afectadas(`delete from public.empresas where id = $1`, [id])).toBe(0);
  });

  it('nadie puede darse a sí mismo un rol en una empresa ajena', async () => {
    await como(ANA);
    const id = await nuevaEmpresa('Textiles del Valle', ANA);
    await como(BETO);
    expect(await rechazo(`insert into public.miembros_empresa (empresa_id, user_id, rol) values ($1, $2, 'propietario')`, [id, BETO])).toMatch(/permission denied/);
    expect(await rechazo(`update public.miembros_empresa set rol = 'propietario' where user_id = $1`, [BETO])).toMatch(/permission denied/);
  });

  it('el propietario borra su empresa y se borra todo lo suyo', async () => {
    await como(ANA);
    const id = await nuevaEmpresa('Textiles del Valle', ANA);
    await db.query(`insert into public.evaluaciones (empresa_id, metodologia) values ($1, 'v')`, [id]);
    await db.query(`insert into public.acciones_plan (empresa_id, titulo) values ($1, 'Acción de Ana')`, [id]);
    expect(await afectadas(`delete from public.empresas where id = $1`, [id])).toBe(1);
    await comoServidor();
    for (const t of ['evaluaciones', 'acciones_plan', 'miembros_empresa']) {
      expect(await filas(`select 1 from public.${t}`)).toEqual([]);
    }
  });

  it('al borrar una persona, desaparece todo lo suyo (derecho de supresión)', async () => {
    await como(ANA);
    await nuevaEmpresa('Textiles del Valle', ANA);
    await como(BETO);
    await nuevaEmpresa('Café La Palma', BETO);
    await comoServidor();
    await db.query('delete from auth.users where id = $1', [ANA]);
    expect(await filas('select 1 from public.cuentas where user_id = $1', [ANA])).toEqual([]);
    expect(await filas('select 1 from public.empresas where creado_por = $1', [ANA])).toEqual([]);
    expect(await filas('select 1 from public.miembros_empresa where user_id = $1', [ANA])).toEqual([]);
    // y lo de Beto sigue intacto
    expect((await filas('select 1 from public.empresas where creado_por = $1', [BETO])).length).toBe(1);
  });
});

describe('inventario de seguridad', () => {
  it('todas las tablas de public tienen la seguridad por filas activada', async () => {
    await comoServidor();
    const sinRls = await filas(`select relname from pg_class c join pg_namespace n on n.oid = c.relnamespace
                                where n.nspname = 'public' and c.relkind = 'r' and not c.relrowsecurity`);
    expect(sinRls).toEqual([]);
  });

  it('todas las tablas de public tienen al menos una política', async () => {
    await comoServidor();
    const sinPolitica = await filas(`select c.relname from pg_class c join pg_namespace n on n.oid = c.relnamespace
                                     where n.nspname = 'public' and c.relkind = 'r'
                                       and not exists (select 1 from pg_policies p where p.schemaname = 'public' and p.tablename = c.relname)`);
    expect(sinPolitica).toEqual([]);
  });

  it('las funciones security definer fijan un search_path vacío', async () => {
    await comoServidor();
    const sueltas = await filas(`select p.proname from pg_proc p join pg_namespace n on n.oid = p.pronamespace
                                 where n.nspname = 'private' and p.prosecdef
                                   and not (coalesce(p.proconfig, '{}'::text[]) @> array['search_path=""'])`);
    expect(sueltas).toEqual([]);
  });

  it('anon no tiene ningún permiso sobre las tablas de public', async () => {
    await comoServidor();
    const permisos = await filas(`select table_name, privilege_type from information_schema.role_table_grants
                                  where grantee = 'anon' and table_schema = 'public'`);
    expect(permisos).toEqual([]);
  });
});
