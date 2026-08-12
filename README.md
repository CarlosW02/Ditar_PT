# Ditar ERP

Monorepo del ERP de Ditar SAS. Cada app vive en `apps/` como su propio
proyecto (dependencias, build, tests, deploy), compartiendo herramientas de
calidad de código (ESLint/Prettier) desde la raíz vía npm workspaces.

## Apps

| App                                                | Descripción                                                                                  | Estado        |
| -------------------------------------------------- | -------------------------------------------------------------------------------------------- | ------------- |
| [`apps/pt-generator`](apps/pt-generator/README.md) | Generador de código de producto (Nomenclatura PT v1.0)                                       | En producción |
| [`apps/comercial`](apps/comercial/README.md)       | Módulo Comercial: CRM, cotizaciones, pedidos, dashboard, solicitudes de código PT / OP a SAP | En desarrollo |

Cada app se despliega como su propio proyecto de Vercel (Root Directory
apuntando a su carpeta), y cada una tiene su propio proyecto de Supabase —
no comparten base de datos.

## Comandos desde la raíz

```bash
npm install         # instala dependencias de todas las apps
npm run lint         # ESLint sobre todo el repo
npm run format       # Prettier --write sobre todo el repo
npm run format:check # Prettier --check (lo que corre en CI)
npm test              # corre los tests de cada app que los tenga
```

Para correr un comando de una sola app: `npm run <script> --workspace=apps/<app>`
(ej. `npm run dev --workspace=apps/pt-generator`).

CI (GitHub Actions) corre lint, format:check y test en cada push/PR a `main`.
