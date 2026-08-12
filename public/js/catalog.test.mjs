import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { fetchCatalogTable } from './catalog.js';

function makeClient(queryResult) {
  return {
    from(table) {
      return {
        select(cols) {
          return {
            order(col, opts) {
              return queryResult;
            },
          };
        },
      };
    },
  };
}

describe('fetchCatalogTable', () => {
  test('devuelve los datos cuando la consulta responde a tiempo', async () => {
    const client = makeClient(Promise.resolve({ data: [{ code: 'A', label: 'Alpha' }], error: null }));
    const rows = await fetchCatalogTable(client, 'tabla', 50);
    assert.deepEqual(rows, [{ code: 'A', label: 'Alpha' }]);
  });

  test('lanza el error de Supabase si la consulta falla', async () => {
    const client = makeClient(Promise.resolve({ data: null, error: new Error('conexión rechazada') }));
    await assert.rejects(() => fetchCatalogTable(client, 'tabla', 50), /conexión rechazada/);
  });

  test('lanza un error si la tabla está vacía', async () => {
    const client = makeClient(Promise.resolve({ data: [], error: null }));
    await assert.rejects(() => fetchCatalogTable(client, 'tabla', 50), /vacía/);
  });

  test('lanza un error de timeout si la consulta no responde dentro del límite', async () => {
    const neverResolves = new Promise(() => {});
    const client = makeClient(neverResolves);
    await assert.rejects(
      () => fetchCatalogTable(client, 'material', 20),
      /Tiempo de espera agotado \(20ms\) al cargar "material"/,
    );
  });

  test('no lanza timeout si la consulta responde antes del límite', async () => {
    const slowButInTime = new Promise((resolve) => {
      setTimeout(() => resolve({ data: [{ code: 'A', label: 'Alpha' }], error: null }), 10);
    });
    const client = makeClient(slowButInTime);
    const rows = await fetchCatalogTable(client, 'tabla', 100);
    assert.deepEqual(rows, [{ code: 'A', label: 'Alpha' }]);
  });
});
