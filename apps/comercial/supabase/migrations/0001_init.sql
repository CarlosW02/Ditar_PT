-- Ditar Comercial · Esquema inicial
-- Aplicar con Supabase CLI (supabase db push) contra el proyecto de dev,
-- luego el mismo archivo contra el de producción. No editar a mano en el
-- SQL Editor salvo para explorar — cualquier cambio de esquema debe entrar
-- como una migración nueva en este mismo directorio.

-- === Perfiles y roles ===
-- Un perfil por usuario de auth.users. El rol determina qué puede ver/editar
-- cada quién (ver políticas de RLS más abajo).

create type public.rol_comercial as enum ('vendedor', 'gerente_comercial', 'ejecutor_sap', 'admin');

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  nombre text not null,
  rol public.rol_comercial not null default 'vendedor',
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Los usuarios ven su propio perfil" on public.profiles for select using (auth.uid () = id);

-- Función helper: evita repetir "select rol from profiles where id = auth.uid()"
-- en cada política. security definer para poder leer profiles sin depender
-- de la política de select de arriba (que solo deja ver el propio perfil).
create function public.current_user_role () returns public.rol_comercial language sql stable security definer as $$
  select rol from public.profiles where id = auth.uid();
$$;

create policy "Gerentes y admins ven todos los perfiles" on public.profiles for select using (
  public.current_user_role () in ('gerente_comercial', 'admin')
);

-- === Clientes (CRM básico) ===

create table public.clientes (
  id uuid primary key default gen_random_uuid (),
  nombre text not null,
  nit text,
  contacto_nombre text,
  telefono text,
  email text,
  direccion text,
  vendedor_id uuid not null references public.profiles (id),
  created_at timestamptz not null default now()
);

alter table public.clientes enable row level security;

create policy "Vendedor ve y edita sus propios clientes" on public.clientes for all using (vendedor_id = auth.uid ())
with
  check (vendedor_id = auth.uid ());

create policy "Gerente/Admin ven todos los clientes" on public.clientes for select using (
  public.current_user_role () in ('gerente_comercial', 'admin')
);

-- === Cotizaciones ===

create type public.estado_cotizacion as enum (
  'borrador',
  'enviada',
  'aprobada',
  'rechazada',
  'vencida'
);

create table public.cotizaciones (
  id uuid primary key default gen_random_uuid (),
  numero serial,
  cliente_id uuid not null references public.clientes (id),
  vendedor_id uuid not null references public.profiles (id),
  estado public.estado_cotizacion not null default 'borrador',
  fecha_emision date not null default current_date,
  fecha_vencimiento date,
  notas text,
  created_at timestamptz not null default now()
);

-- producto_pt_code referencia el código de 31 caracteres del generador PT
-- (apps/pt-generator) como texto plano, no como foreign key: los dos módulos
-- no comparten base de datos, así que la integridad referencial es a nivel
-- de aplicación, no de Postgres.
create table public.cotizacion_items (
  id uuid primary key default gen_random_uuid (),
  cotizacion_id uuid not null references public.cotizaciones (id) on delete cascade,
  producto_pt_code text,
  descripcion text not null,
  cantidad numeric not null check (cantidad > 0),
  precio_unitario numeric not null check (precio_unitario >= 0),
  subtotal numeric generated always as (cantidad * precio_unitario) stored
);

alter table public.cotizaciones enable row level security;
alter table public.cotizacion_items enable row level security;

create policy "Vendedor ve y edita sus propias cotizaciones" on public.cotizaciones for all using (vendedor_id = auth.uid ())
with
  check (vendedor_id = auth.uid ());

create policy "Gerente/Admin ven todas las cotizaciones" on public.cotizaciones for select using (
  public.current_user_role () in ('gerente_comercial', 'admin')
);

create policy "Items visibles si la cotización es visible" on public.cotizacion_items for all using (
  exists (
    select 1
    from public.cotizaciones c
    where
      c.id = cotizacion_id
      and (
        c.vendedor_id = auth.uid ()
        or public.current_user_role () in ('gerente_comercial', 'admin')
      )
  )
);

-- === Pedidos / Órdenes de venta ===

create type public.estado_pedido as enum (
  'pendiente',
  'confirmado',
  'en_produccion',
  'despachado',
  'cerrado',
  'cancelado'
);

create table public.pedidos (
  id uuid primary key default gen_random_uuid (),
  numero serial,
  cotizacion_id uuid references public.cotizaciones (id),
  cliente_id uuid not null references public.clientes (id),
  vendedor_id uuid not null references public.profiles (id),
  estado public.estado_pedido not null default 'pendiente',
  fecha date not null default current_date,
  created_at timestamptz not null default now()
);

create table public.pedido_items (
  id uuid primary key default gen_random_uuid (),
  pedido_id uuid not null references public.pedidos (id) on delete cascade,
  producto_pt_code text,
  descripcion text not null,
  cantidad numeric not null check (cantidad > 0),
  precio_unitario numeric not null check (precio_unitario >= 0),
  subtotal numeric generated always as (cantidad * precio_unitario) stored
);

alter table public.pedidos enable row level security;
alter table public.pedido_items enable row level security;

create policy "Vendedor ve y edita sus propios pedidos" on public.pedidos for all using (vendedor_id = auth.uid ())
with
  check (vendedor_id = auth.uid ());

create policy "Gerente/Admin ven todos los pedidos" on public.pedidos for select using (
  public.current_user_role () in ('gerente_comercial', 'admin')
);

create policy "Items visibles si el pedido es visible" on public.pedido_items for all using (
  exists (
    select 1
    from public.pedidos p
    where
      p.id = pedido_id
      and (
        p.vendedor_id = auth.uid ()
        or public.current_user_role () in ('gerente_comercial', 'admin')
      )
  )
);

-- === Solicitudes a SAP (código PT y orden de producción) ===
-- Flujo manual v1 (sin API a SAP): Comercial crea la solicitud → queda
-- "pendiente" → un ejecutor_sap la crea en SAP y la marca "creada" con la
-- referencia real asignada → solicitud_sap_historial guarda cada cambio de
-- estado para trazabilidad ("con estados de seguimiento y versiones").

create type public.tipo_solicitud_sap as enum ('codigo_pt', 'orden_produccion');

create type public.estado_solicitud_sap as enum ('pendiente', 'en_proceso', 'creada', 'rechazada');

create table public.solicitudes_sap (
  id uuid primary key default gen_random_uuid (),
  tipo public.tipo_solicitud_sap not null,
  pedido_id uuid references public.pedidos (id),
  producto_pt_code text,
  descripcion text not null,
  estado public.estado_solicitud_sap not null default 'pendiente',
  solicitado_por uuid not null references public.profiles (id),
  asignado_a uuid references public.profiles (id),
  sap_referencia text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.solicitud_sap_historial (
  id uuid primary key default gen_random_uuid (),
  solicitud_id uuid not null references public.solicitudes_sap (id) on delete cascade,
  estado_anterior public.estado_solicitud_sap,
  estado_nuevo public.estado_solicitud_sap not null,
  comentario text,
  usuario_id uuid not null references public.profiles (id),
  created_at timestamptz not null default now()
);

alter table public.solicitudes_sap enable row level security;
alter table public.solicitud_sap_historial enable row level security;

create policy "Solicitante ve sus propias solicitudes" on public.solicitudes_sap for select using (solicitado_por = auth.uid ());

create policy "Solicitante crea solicitudes" on public.solicitudes_sap for insert
with
  check (solicitado_por = auth.uid ());

create policy "Ejecutor SAP ve y resuelve todas las solicitudes" on public.solicitudes_sap for all using (
  public.current_user_role () in ('ejecutor_sap', 'admin')
)
with
  check (
    public.current_user_role () in ('ejecutor_sap', 'admin')
  );

create policy "Gerente/Admin ven todas las solicitudes" on public.solicitudes_sap for select using (
  public.current_user_role () in ('gerente_comercial', 'admin')
);

create policy "Historial visible si la solicitud es visible" on public.solicitud_sap_historial for select using (
  exists (
    select 1
    from public.solicitudes_sap s
    where
      s.id = solicitud_id
      and (
        s.solicitado_por = auth.uid ()
        or public.current_user_role () in (
          'ejecutor_sap', 'gerente_comercial', 'admin'
        )
      )
  )
);

create policy "Quien ve la solicitud puede registrar un cambio de estado" on public.solicitud_sap_historial for insert
with
  check (
    exists (
      select 1
      from public.solicitudes_sap s
      where
        s.id = solicitud_id
        and (
          s.solicitado_por = auth.uid ()
          or public.current_user_role () in (
            'ejecutor_sap', 'gerente_comercial', 'admin'
          )
        )
    )
  );

create function public.set_updated_at () returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger solicitudes_sap_set_updated_at before update on public.solicitudes_sap for each row
execute function public.set_updated_at ();
