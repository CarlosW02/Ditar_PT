const fs = require('fs');
const path = require('path');

const config = {
  url: process.env.SUPABASE_URL || '',
  anonKey: process.env.SUPABASE_ANON_KEY || '',
};

const outDir = path.join(__dirname, 'public');
fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(
  path.join(outDir, 'config.js'),
  `window.__SUPABASE_CONFIG__ = ${JSON.stringify(config)};\n`,
);

if (!config.url || !config.anonKey) {
  console.warn(
    '[build] SUPABASE_URL / SUPABASE_ANON_KEY no definidas — el sitio usará el catálogo local de respaldo.',
  );
} else {
  console.log('[build] public/config.js generado con credenciales de Supabase.');
}
