# Ditar · Comercial

Primer módulo del ERP de Ditar SAS. React + TypeScript + Vite, con Supabase
(Postgres + Auth + RLS) como backend. No comparte base de datos con
`apps/pt-generator` — las cotizaciones/pedidos referencian el código de
producto (31 caracteres) como texto, no como llave foránea.

## Alcance v1

- Dashboard de métricas
- Clientes (CRM básico)
- Cotizaciones y Pedidos / Órdenes de venta
- Solicitudes de creación de código PT y de OP en SAP, con seguimiento de
  estado e historial (flujo manual — sin integración por API a SAP todavía)

Roles: `vendedor`, `gerente_comercial`, `ejecutor_sap`, `admin` (ver
`supabase/migrations/0001_init.sql` para las políticas de RLS de cada uno).

## 1. Supabase

Este módulo necesita **dos proyectos de Supabase separados**: uno de
desarrollo y otro de producción — nunca desarrollar contra producción.

1. Crea los dos proyectos en [supabase.com](https://supabase.com).
2. Instala el [Supabase CLI](https://supabase.com/docs/guides/cli) y aplica
   la migración inicial contra cada uno:
   ```bash
   supabase link --project-ref <ref-del-proyecto>
   supabase db push
   ```
3. En **Authentication → Users**, invita a los usuarios internos (no hay
   registro público) y asígnales su fila correspondiente en `profiles` con
   el `rol` correcto.
4. En **Settings → API** copia `Project URL` y `anon public key` a tu `.env.local`
   (ver `.env.example`).

## 2. Desarrollo local

Desde la raíz del repo:

```bash
cp apps/comercial/.env.example apps/comercial/.env.local
# edita apps/comercial/.env.local con las credenciales del proyecto de DEV
npm run dev --workspace=apps/comercial
```

## 3. Tests

```bash
npm run test --workspace=apps/comercial
```

Usa Vitest + Testing Library (a diferencia de `apps/pt-generator`, que usa
`node:test` porque no tiene componentes que renderizar).

## 4. Deploy

Proyecto propio de Vercel con **Root Directory** = `apps/comercial`, variables
de entorno `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` apuntando al
proyecto de Supabase de **producción**.
