// Lógica pura de generación/decodificación del código de producto terminado
// (Nomenclatura PT v1.0). Sin dependencias del DOM ni de Supabase — se puede
// probar de forma aislada o reutilizar en otro contexto (API, tests, etc.).

export function dimTo3(val) {
  let n = parseFloat(val);
  if (isNaN(n) || n < 0) n = 0;
  let scaled = Math.round(n * 10);
  if (scaled > 999) scaled = 999;
  return String(scaled).padStart(3, '0');
}

export function pad(val, len) {
  return String(val).padStart(len, '0').slice(0, len);
}

// raw: {tipo, cert, mat, gram, ancho, fuelle, alto, imp, corte, manija,
//       contacto, canal, marca, version}
// valores tal cual vienen del formulario (strings/numbers sin normalizar).
//
// Estructura del código: [núcleo]-[canal][marca][versión]
// El núcleo (antes del guión) termina en "contacto" (1 = contacto directo
// con alimento, 0 = no); el canal vive después del guión.
export function computeProductCode(raw) {
  const tipo = raw.tipo;
  const cert = raw.cert;
  const mat = raw.mat;
  const gram = pad(raw.gram || 0, 3);
  const ancho = dimTo3(raw.ancho);
  const fuelle = dimTo3(raw.fuelle);
  const alto = dimTo3(raw.alto);
  const imp = raw.imp;
  const corte = raw.corte;
  const manija = raw.manija;
  const contacto = raw.contacto;
  const canal = raw.canal;
  const marca = (raw.marca || '').toUpperCase().padEnd(3, 'X').slice(0, 3);
  const version = pad(raw.version || 0, 5);

  const core = [tipo, cert, mat, gram, ancho, fuelle, alto, imp, corte, manija, contacto].join('');
  const suffix = [canal, marca, version].join('');
  const fullCode = `${core}-${suffix}`;

  return {
    tipo,
    cert,
    mat,
    gram,
    ancho,
    fuelle,
    alto,
    imp,
    corte,
    manija,
    contacto,
    canal,
    marca,
    version,
    anchoRaw: raw.ancho,
    fuelleRaw: raw.fuelle,
    altoRaw: raw.alto,
    core,
    fullCode,
  };
}

// p: resultado de computeProductCode(); labels: mapas code->label por campo.
export function buildDecodeRows(p, labels) {
  return [
    ['1', 'Tipo', p.tipo, labels.tipo[p.tipo] || '—'],
    ['2', 'Certificación', p.cert, labels.cert[p.cert] || '—'],
    ['3', 'Material', p.mat, labels.mat[p.mat] || '—'],
    ['4', 'Gramaje', p.gram, `${p.gram} g/m² (nominal)`],
    ['5', 'Ancho', p.ancho, `${p.anchoRaw || 0} cm → ×10 → ${p.ancho}`],
    ['6', 'Fuelle', p.fuelle, `${p.fuelleRaw || 0} cm → ×10 → ${p.fuelle}`],
    ['7', 'Alto', p.alto, `${p.altoRaw || 0} cm → ×10 → ${p.alto}`],
    ['8', 'Impresión', p.imp, labels.imp[p.imp] || '—'],
    ['9', 'Corte', p.corte, labels.corte[p.corte] || '—'],
    ['10', 'Manija', p.manija, labels.manija[p.manija] || '—'],
    ['11', 'Contacto alimento', p.contacto, labels.contacto[p.contacto] || '—'],
    ['12', 'Canal', p.canal, labels.canal[p.canal] || '—'],
    ['13', 'Marca', p.marca, 'Cliente / marca comercial'],
    ['14', 'Versión arte', p.version, 'Cambia con cada nuevo diseño'],
  ];
}

// marcaInputLength: longitud del valor de marca tal como lo escribió el
// usuario, antes del padEnd — determina si está incompleto.
export function validateProductCode(p, labels, marcaInputLength) {
  const warnings = [];
  if (p.mat === '08' || p.mat === '09') {
    if (p.tipo !== 'R') {
      warnings.push(
        `Material ${p.mat} (${labels.mat[p.mat] || p.mat}) está reservado solo para Tipo R (Rollos).`,
      );
    }
  }
  if (p.manija !== '0' && p.tipo !== 'Q') {
    warnings.push(
      'Manija distinta de "Sin manija" es atípica fuera de Tipo Q — validar con Ingeniería.',
    );
  }
  if (marcaInputLength < 3) {
    warnings.push('Marca incompleta — debe tener exactamente 3 letras.');
  }
  return warnings;
}
