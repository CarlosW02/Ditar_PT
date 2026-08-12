// Catálogo de opciones (tipo, certificación, material, ...): fuente de
// verdad en Supabase, con respaldo local para cuando no hay conexión o el
// proyecto no está configurado.
//
// material/corte/manija/impresion/estampado se alinearon con
// catalogosCaptura.ts de ditar-commercial-system (extraído directo de
// Cotizador_Ditar_piloto V20·R3 — el propio repo anterior documenta que el
// Excel MDM quedó desactualizado frente al piloto, así que el piloto es la
// fuente de verdad).

export const FALLBACK_LABELS = {
  tipo: {
    Q: 'Bolsa fondo cuadrado',
    V: 'Bolsa fondo en V',
    R: 'Rollos',
    E: 'Empaques',
    L: 'Láminas',
    X: 'Especial',
  },
  cert: {
    SC: 'Sin certificación',
    FM: 'FSC Mix',
    FR: 'FSC Recycled',
    BR: 'BRGCS',
    KS: 'Kosher',
    FC: 'FSC 100%',
    XX: 'Nueva/pendiente',
  },
  mat: {
    '01': 'Virgen',
    '02': 'Reciclado',
    '03': 'Blanco',
    '04': 'Antigrasa Natural',
    '05': 'Antigrasa Blanco',
    '06': 'MF Natural',
    '07': 'MF Blanco',
    '08': 'Rollo térmico',
    '09': 'Rollo blanco',
    10: 'Esmaltado',
    11: 'Earthpack',
    XX: 'Especial/No codificado',
  },
  imp: {
    0: 'Sin impresión',
    1: '1 tinta',
    2: '2 tintas',
    3: '3 tintas',
    4: '4 tintas',
    5: '5 tintas',
    6: '6 tintas',
    7: '7 tintas',
    8: '8 tintas',
    X: 'Especial/No codificado',
  },
  estampado: {
    0: 'Sin estampado',
    1: '1 foil',
    2: '2 foil',
    X: 'Especial/No codificado',
  },
  corte: {
    0: 'Sin corte',
    1: 'Corte liso',
    2: 'Corte dentado',
    3: 'Corte en J',
    4: 'Corte liso con doblez',
    X: 'Especial/No codificado',
  },
  manija: {
    0: 'Sin manija',
    1: 'Entorchada',
    2: 'Plana',
    3: 'Algodón',
    4: 'Troquelado (Diecut)',
    5: 'Cordón de tela 5mm',
    6: 'Cordón de tela 2cm',
    X: 'Especial/No codificado',
  },
  contacto: {
    0: 'No tiene contacto directo con alimento',
    1: 'Sí tiene contacto directo con alimento',
  },
  canal: { N: 'Nacional', E: 'Exportación', D: 'Distribuidor', X: 'Especial' },
};

export const CATALOG_TABLES = [
  { table: 'tipo_producto', key: 'tipo', selectId: 'tipo' },
  { table: 'certificacion', key: 'cert', selectId: 'cert' },
  { table: 'material', key: 'mat', selectId: 'mat' },
  { table: 'impresion', key: 'imp', selectId: 'imp' },
  { table: 'estampado', key: 'estampado', selectId: 'estampado' },
  { table: 'corte', key: 'corte', selectId: 'corte' },
  { table: 'manija', key: 'manija', selectId: 'manija' },
  { table: 'contacto_alimento', key: 'contacto', selectId: 'contacto' },
  { table: 'canal', key: 'canal', selectId: 'canal' },
];

export const CATALOG_FETCH_TIMEOUT_MS = 8000;

function withTimeout(promise, ms, tableName) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error(`Tiempo de espera agotado (${ms}ms) al cargar "${tableName}"`));
    }, ms);
    Promise.resolve(promise).then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (err) => {
        clearTimeout(timer);
        reject(err);
      },
    );
  });
}

export async function fetchCatalogTable(client, tableName, timeoutMs = CATALOG_FETCH_TIMEOUT_MS) {
  const { data, error } = await withTimeout(
    client.from(tableName).select('code,label').order('sort_order', { ascending: true }),
    timeoutMs,
    tableName,
  );
  if (error) throw error;
  if (!data || !data.length) throw new Error(`Tabla "${tableName}" vacía`);
  return data;
}
