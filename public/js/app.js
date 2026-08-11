// Wiring de interfaz: lee el formulario, llama a la lógica pura de
// codeGenerator.js, pinta el resultado, y sincroniza el catálogo con
// Supabase (catalog.js) al cargar la página.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { FALLBACK_LABELS, CATALOG_TABLES, fetchCatalogTable } from './catalog.js';
import { computeProductCode, buildDecodeRows, validateProductCode } from './codeGenerator.js';

const FIELD_IDS = ['tipo','cert','mat','gram','ancho','fuelle','alto','imp','corte','manija','contacto','canal','marca','version'];

const LEGEND_HTML = `<span><i class="dot" style="background:#b5491f"></i>Tipo/Impresión</span>
     <span><i class="dot" style="background:#3a6b4a"></i>Cert/Corte</span>
     <span><i class="dot" style="background:#9c7a1f"></i>Material/Manija</span>
     <span><i class="dot" style="background:#1f5c87"></i>Gramaje/Canal</span>
     <span><i class="dot" style="background:#7a3a8f"></i>Dimensiones</span>`;

let labels = JSON.parse(JSON.stringify(FALLBACK_LABELS));

function val(id) {
  return document.getElementById(id).value;
}

function readRawFields() {
  return {
    tipo: val('tipo'), cert: val('cert'), mat: val('mat'), gram: val('gram'),
    ancho: val('ancho'), fuelle: val('fuelle'), alto: val('alto'),
    imp: val('imp'), corte: val('corte'), manija: val('manija'),
    contacto: val('contacto'), canal: val('canal'),
    marca: val('marca'), version: val('version'),
  };
}

function render() {
  const p = computeProductCode(readRawFields());

  document.getElementById('codeOut').innerHTML =
    `<span class="seg">${p.tipo}</span><span class="seg">${p.cert}</span><span class="seg">${p.mat}</span>` +
    `<span class="seg">${p.gram}</span><span class="seg">${p.ancho}</span><span class="seg">${p.fuelle}</span>` +
    `<span class="seg">${p.alto}</span><span class="seg">${p.imp}</span><span class="seg">${p.corte}</span>` +
    `<span class="seg">${p.manija}</span><span class="seg">${p.contacto}</span>-<span class="seg">${p.canal}</span>` +
    `<span class="seg">${p.marca}</span><span class="seg">${p.version}</span>`;

  document.getElementById('legend').innerHTML = LEGEND_HTML;

  const rows = buildDecodeRows(p, labels);
  let tbody = '<tr><th>#</th><th>Campo</th><th>Valor</th><th>Significado</th></tr>';
  rows.forEach(r => {
    tbody += `<tr><td>${r[0]}</td><td>${r[1]}</td><td class="val">${r[2]}</td><td>${r[3]}</td></tr>`;
  });
  document.getElementById('decodeTable').innerHTML = tbody;

  const marcaInputLength = document.getElementById('marca').value.length;
  const warnings = validateProductCode(p, labels, marcaInputLength);
  const statusBar = document.getElementById('statusBar');
  statusBar.innerHTML = warnings.length
    ? `<div class="status-bar status-warn">⚠ ${warnings.join(' · ')}</div>`
    : `<div class="status-bar status-ok">✓ Código válido — estructura conforme a Nomenclatura PT v1.0 (${p.fullCode.length} caracteres totales)</div>`;
}

function copyCode() {
  const text = document.getElementById('codeOut').innerText;
  navigator.clipboard.writeText(text).then(() => {
    const label = document.querySelector('.copy-btn-label');
    const orig = label.textContent;
    label.textContent = '✓ Copiado';
    setTimeout(() => { label.textContent = orig; }, 1500);
  });
}

function populateSelect(selectId, rows) {
  const sel = document.getElementById(selectId);
  const prevValue = sel.value;
  sel.innerHTML = '';
  rows.forEach(row => {
    const opt = document.createElement('option');
    opt.value = row.code;
    opt.textContent = `${row.code} — ${row.label}`;
    sel.appendChild(opt);
  });
  if (rows.some(r => r.code === prevValue)) sel.value = prevValue;
}

const CATALOG_STATUS_PILL = { ok: 'pill-ok', local: 'pill-warn', loading: 'pill-loading' };

function setCatalogStatus(mode, detail) {
  const el = document.getElementById('catalogStatus');
  el.className = 'pill ' + (CATALOG_STATUS_PILL[mode] || 'pill-loading');
  if (mode === 'ok') el.textContent = '✓ Catálogo cargado desde Supabase';
  else if (mode === 'local') el.textContent = '⚠ Catálogo local' + (detail ? ' — ' + detail : '');
  else el.textContent = 'Cargando catálogo…';
}

async function loadCatalogFromSupabase(client) {
  for (const t of CATALOG_TABLES) {
    const data = await fetchCatalogTable(client, t.table);
    const map = {};
    data.forEach(row => { map[row.code] = row.label; });
    labels[t.key] = map;
    populateSelect(t.selectId, data);
  }
}

function wireEvents() {
  FIELD_IDS.forEach(id => {
    const el = document.getElementById(id);
    const evt = el.tagName === 'SELECT' ? 'change' : 'input';
    el.addEventListener(evt, () => {
      if (id === 'marca') el.value = el.value.toUpperCase();
      render();
    });
  });
  document.querySelector('.copy-btn').addEventListener('click', copyCode);
  document.getElementById('themeToggle').addEventListener('click', toggleTheme);
}

function toggleTheme() {
  const root = document.documentElement;
  const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
  root.setAttribute('data-theme', next);
  try { localStorage.setItem('ditar-theme', next); } catch (e) {}
}

async function init() {
  wireEvents();
  render();

  const config = window.__SUPABASE_CONFIG__ || {};
  if (!config.url || !config.anonKey) {
    setCatalogStatus('local', 'sin credenciales en config.js');
    return;
  }
  try {
    const client = createClient(config.url, config.anonKey);
    await loadCatalogFromSupabase(client);
    setCatalogStatus('ok');
  } catch (e) {
    console.warn('No se pudo cargar el catálogo desde Supabase:', e);
    setCatalogStatus('local', e.message || 'error de conexión');
  }
  render();
}

init();
