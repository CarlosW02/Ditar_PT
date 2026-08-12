# Ditar_PT

Repo del generador de código de producto (Nomenclatura PT v1.0) de Ditar SAS —
ver [`apps/pt-generator`](apps/pt-generator/README.md) para el detalle.

Estructura de monorepo (npm workspaces) por si en el futuro se agrega otra
app relacionada con el generador de código; el módulo Comercial del ERP se
desarrolla en un repo aparte (`ditar-commercial-system`), no aquí.

## Comandos desde la raíz

```bash
npm install         # instala dependencias
npm run lint         # ESLint sobre todo el repo
npm run format       # Prettier --write sobre todo el repo
npm run format:check # Prettier --check (lo que corre en CI)
npm test              # corre los tests
```

CI (GitHub Actions) corre lint, format:check y test en cada push/PR a `main`.
