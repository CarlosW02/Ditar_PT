# Ditar SAS · Generador de Código de Producto

Sitio estático (HTML/CSS/JS, sin framework) que genera y decodifica el código
de producto según la Nomenclatura PT v1.0. El catálogo de opciones (tipo,
certificación, material, impresión, corte, manija, canal) se sirve desde
Supabase; si no hay conexión o no está configurado, la app cae de vuelta a un
catálogo local embebido para no romper el flujo.

## Estructura

```
public/index.html   # app (HTML + CSS + JS del generador/decodificador)
build.js             # genera public/config.js con las credenciales de Supabase
vercel.json           # build estático: node build.js -> public/
supabase/schema.sql   # tablas de catálogo + RLS + datos semilla
.env.example           # variables de entorno esperadas
```

## 1. Supabase

1. Crea un proyecto (o usa uno existente) en [supabase.com](https://supabase.com).
2. Abre **SQL Editor** y ejecuta el contenido de [`supabase/schema.sql`](supabase/schema.sql).
   Esto crea las 7 tablas de catálogo, habilita Row Level Security y deja una
   política de **solo lectura pública** (la app nunca escribe en la base).
3. En **Settings → API** copia:
   - `Project URL` → `SUPABASE_URL`
   - `anon public` key → `SUPABASE_ANON_KEY`

La anon key es segura para exponer en el cliente porque RLS solo permite
`SELECT`.

## 2. Desarrollo local

Desde la raíz del repo (este proyecto es parte del workspace de npm):

```bash
cp apps/pt-generator/.env.example apps/pt-generator/.env
# edita apps/pt-generator/.env con tus valores de Supabase
export $(grep -v '^#' apps/pt-generator/.env | xargs)   # o cárgalas como prefieras
npm run build --workspace=apps/pt-generator
npm run dev --workspace=apps/pt-generator
```

`npm run dev` regenera `public/config.js` y sirve `public/` en un puerto local.

## 3. Deploy en Vercel

Este proyecto se despliega como su propio proyecto de Vercel, con **Root
Directory** = `apps/pt-generator` (se configura una sola vez en el dashboard
de Vercel al conectar el repo).

```bash
npx vercel login
npx vercel link
npx vercel env add SUPABASE_URL production
npx vercel env add SUPABASE_ANON_KEY production
npx vercel --prod
```

`vercel.json` ya define `buildCommand: node build.js` y `outputDirectory: public`,
así que Vercel genera `config.js` en cada build con las env vars del proyecto.

## Editar el catálogo

Para agregar o modificar opciones (nuevo material, nuevo canal, etc.) basta con
editar las filas de la tabla correspondiente en Supabase — no requiere tocar
el HTML ni redeploy.
