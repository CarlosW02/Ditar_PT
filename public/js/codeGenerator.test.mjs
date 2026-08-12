import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { dimTo3, pad, computeProductCode, buildDecodeRows, validateProductCode } from './codeGenerator.js';

describe('dimTo3', () => {
  test('escala un valor entero por 10 y rellena a 3 dígitos', () => {
    assert.equal(dimTo3('20'), '200');
  });

  test('escala un valor decimal por 10', () => {
    assert.equal(dimTo3('5.5'), '055');
    assert.equal(dimTo3('28.5'), '285');
  });

  test('redondea al entero más cercano tras escalar', () => {
    assert.equal(dimTo3('20.04'), '200');
    assert.equal(dimTo3('20.06'), '201');
  });

  test('trata 0 como "000"', () => {
    assert.equal(dimTo3('0'), '000');
    assert.equal(dimTo3(0), '000');
  });

  test('trata valores negativos como 0', () => {
    assert.equal(dimTo3('-5'), '000');
  });

  test('trata valores no numéricos como 0', () => {
    assert.equal(dimTo3(''), '000');
    assert.equal(dimTo3('abc'), '000');
    assert.equal(dimTo3(undefined), '000');
  });

  test('satura en 999 cuando el valor escalado excede el rango de 3 dígitos', () => {
    assert.equal(dimTo3('150'), '999');
    assert.equal(dimTo3('99.99'), '999');
  });
});

describe('pad', () => {
  test('rellena con ceros a la izquierda hasta la longitud pedida', () => {
    assert.equal(pad('5', 3), '005');
    assert.equal(pad(123, 3), '123');
  });

  test('no rellena si el valor ya alcanza la longitud', () => {
    assert.equal(pad('123', 3), '123');
  });

  test('trunca al final si el valor excede la longitud', () => {
    assert.equal(pad('12345', 3), '123');
  });

  test('rellena 0 a la longitud pedida', () => {
    assert.equal(pad(0, 3), '000');
  });
});

function baseRaw(overrides = {}) {
  return {
    tipo: 'Q', cert: 'SC', mat: '01', gram: '100',
    ancho: '20', fuelle: '12', alto: '25',
    imp: '0', corte: '0', manija: '0',
    contacto: '0', canal: 'N', marca: 'nor', version: '1',
    ...overrides,
  };
}

describe('computeProductCode', () => {
  test('arma el núcleo y el código completo con el guión en la posición correcta', () => {
    const p = computeProductCode(baseRaw());
    assert.equal(p.core, 'QSC011002001202500000');
    assert.equal(p.fullCode, 'QSC011002001202500000-NNOR00001');
  });

  test('el contacto con alimento va antes del guión y el canal después', () => {
    const p = computeProductCode(baseRaw({ contacto: '1', canal: 'E' }));
    assert.ok(p.core.endsWith('1'));
    assert.ok(p.fullCode.split('-')[1].startsWith('E'));
  });

  test('convierte la marca a mayúsculas', () => {
    const p = computeProductCode(baseRaw({ marca: 'abc' }));
    assert.equal(p.marca, 'ABC');
  });

  test('rellena la marca incompleta con X hasta 3 caracteres', () => {
    const p = computeProductCode(baseRaw({ marca: 'ab' }));
    assert.equal(p.marca, 'ABX');
  });

  test('trunca la marca a 3 caracteres si es más larga', () => {
    const p = computeProductCode(baseRaw({ marca: 'abcdef' }));
    assert.equal(p.marca, 'ABC');
  });

  test('rellena la versión a 5 dígitos', () => {
    const p = computeProductCode(baseRaw({ version: '7' }));
    assert.equal(p.version, '00007');
  });

  test('usa 0 cuando el gramaje o la versión vienen vacíos', () => {
    const p = computeProductCode(baseRaw({ gram: '', version: '' }));
    assert.equal(p.gram, '000');
    assert.equal(p.version, '00000');
  });

  test('conserva los valores crudos de las dimensiones para mostrarlos en la decodificación', () => {
    const p = computeProductCode(baseRaw({ ancho: '5.5' }));
    assert.equal(p.anchoRaw, '5.5');
    assert.equal(p.ancho, '055');
  });
});

describe('buildDecodeRows', () => {
  const labels = {
    tipo: { Q: 'Bolsa fondo cuadrado' },
    cert: { SC: 'Sin certificación' },
    mat: { '01': 'Virgen' },
    imp: { '0': 'Sin impresión' },
    corte: { '0': 'Sin corte' },
    manija: { '0': 'Sin manija' },
    contacto: { '0': 'No tiene contacto directo con alimento' },
    canal: { N: 'Nacional' },
  };

  test('arma 14 filas con el código y la etiqueta de cada campo', () => {
    const p = computeProductCode(baseRaw());
    const rows = buildDecodeRows(p, labels);
    assert.equal(rows.length, 14);
    assert.deepEqual(rows[0], ['1', 'Tipo', 'Q', 'Bolsa fondo cuadrado']);
  });

  test('usa "—" cuando no hay etiqueta para un código', () => {
    const p = computeProductCode(baseRaw({ tipo: 'X' }));
    const rows = buildDecodeRows(p, labels);
    assert.equal(rows[0][3], '—');
  });
});

describe('validateProductCode', () => {
  const labels = { mat: { '08': 'Rollo térmico', '09': 'Rollo Bond' } };

  test('no genera advertencias para un código válido y completo', () => {
    const p = computeProductCode(baseRaw());
    const warnings = validateProductCode(p, labels, 3);
    assert.deepEqual(warnings, []);
  });

  test('advierte si el material de rollo (08/09) se usa fuera de Tipo R', () => {
    const p = computeProductCode(baseRaw({ tipo: 'Q', mat: '08' }));
    const warnings = validateProductCode(p, labels, 3);
    assert.equal(warnings.length, 1);
    assert.match(warnings[0], /reservado solo para Tipo R/);
  });

  test('no advierte sobre material de rollo cuando el tipo es R', () => {
    const p = computeProductCode(baseRaw({ tipo: 'R', mat: '08' }));
    const warnings = validateProductCode(p, labels, 3);
    assert.deepEqual(warnings, []);
  });

  test('advierte si hay manija fuera de Tipo Q', () => {
    const p = computeProductCode(baseRaw({ tipo: 'V', manija: '1' }));
    const warnings = validateProductCode(p, labels, 3);
    assert.equal(warnings.length, 1);
    assert.match(warnings[0], /Manija distinta/);
  });

  test('no advierte sobre manija cuando el tipo es Q', () => {
    const p = computeProductCode(baseRaw({ tipo: 'Q', manija: '1' }));
    const warnings = validateProductCode(p, labels, 3);
    assert.deepEqual(warnings, []);
  });

  test('advierte si la marca quedó incompleta', () => {
    const p = computeProductCode(baseRaw({ marca: 'ab' }));
    const warnings = validateProductCode(p, labels, 2);
    assert.equal(warnings.length, 1);
    assert.match(warnings[0], /Marca incompleta/);
  });

  test('acumula varias advertencias a la vez', () => {
    const p = computeProductCode(baseRaw({ tipo: 'V', mat: '08', manija: '1', marca: 'a' }));
    const warnings = validateProductCode(p, labels, 1);
    assert.equal(warnings.length, 3);
  });
});
