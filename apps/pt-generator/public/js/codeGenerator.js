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

// Convierte el gramaje real (g/m²) a la banda de un dígito que va en el
// código — el código nunca lleva el gramaje exacto, solo la banda a la que
// pertenece. Rangos portados de codigoPt.ts (ditar-commercial-system,
// puerto fiel de Cotizador_Ditar_piloto V20·R3) — PENDIENTE de validar
// contra la fuente oficial: el propio piloto admite que no coinciden con
// la hoja Catalogos_Gramajes de Ditar_MDM_Sheet_v3.0.xlsx.
export function gramajeABanda(gramaje) {
  const g = parseFloat(gramaje);
  if (!g || g <= 0) return '0';
  if (g <= 39) return '1';
  if (g <= 59) return '2';
  if (g <= 79) return '3';
  if (g <= 94) return '4';
  if (g <= 104) return '5';
  if (g <= 114) return '6';
  if (g <= 129) return '7';
  if (g <= 145) return '8';
  return '9';
}

// raw: {tipo, cert, mat, contacto, gram, ancho, fuelle, alto, imp, estampado,
//       corte, manija, canal, marca, version}
// valores tal cual vienen del formulario (strings/numbers sin normalizar).
//
// Estructura del código: [núcleo]-[canal][marca][versión]
// El núcleo empieza en tipo/cert/material y el dígito de "contacto con
// alimento" va justo después del material (no al final); el canal vive
// después del guión.
export function computeProductCode(raw) {
  const tipo = raw.tipo;
  const cert = raw.cert;
  const mat = raw.mat;
  const contacto = raw.contacto;
  const ancho = dimTo3(raw.ancho);
  const fuelle = dimTo3(raw.fuelle);
  const alto = dimTo3(raw.alto);
  const gramajeBanda = gramajeABanda(raw.gram);
  const imp = raw.imp;
  const estampado = raw.estampado;
  const corte = raw.corte;
  const manija = raw.manija;
  const canal = raw.canal;
  const marca = (raw.marca || '').toUpperCase().padEnd(3, 'X').slice(0, 3);
  const version = pad(raw.version || 0, 5);

  const core = [
    tipo,
    cert,
    mat,
    contacto,
    ancho,
    fuelle,
    alto,
    gramajeBanda,
    imp,
    estampado,
    corte,
    manija,
  ].join('');
  const suffix = [canal, marca, version].join('');
  const fullCode = `${core}-${suffix}`;

  return {
    tipo,
    cert,
    mat,
    contacto,
    ancho,
    fuelle,
    alto,
    gramajeBanda,
    imp,
    estampado,
    corte,
    manija,
    canal,
    marca,
    version,
    gramajeRaw: raw.gram,
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
    ['4', 'Contacto alimento', p.contacto, labels.contacto[p.contacto] || '—'],
    ['5', 'Gramaje', p.gramajeBanda, `${p.gramajeRaw || 0} g/m² → banda ${p.gramajeBanda}`],
    ['6', 'Ancho', p.ancho, `${p.anchoRaw || 0} cm → ×10 → ${p.ancho}`],
    ['7', 'Fuelle', p.fuelle, `${p.fuelleRaw || 0} cm → ×10 → ${p.fuelle}`],
    ['8', 'Alto', p.alto, `${p.altoRaw || 0} cm → ×10 → ${p.alto}`],
    ['9', 'Impresión', p.imp, labels.imp[p.imp] || '—'],
    ['10', 'Estampado', p.estampado, labels.estampado[p.estampado] || '—'],
    ['11', 'Corte', p.corte, labels.corte[p.corte] || '—'],
    ['12', 'Manija', p.manija, labels.manija[p.manija] || '—'],
    ['13', 'Canal', p.canal, labels.canal[p.canal] || '—'],
    ['14', 'Marca', p.marca, 'Cliente / marca comercial'],
    ['15', 'Versión arte', p.version, 'Cambia con cada nuevo diseño'],
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
