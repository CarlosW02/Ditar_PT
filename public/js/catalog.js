// Catálogo de opciones (tipo, certificación, material, ...): fuente de
// verdad en Supabase, con respaldo local para cuando no hay conexión o el
// proyecto no está configurado.

export const FALLBACK_LABELS = {
  tipo:    {Q:"Bolsa fondo cuadrado",V:"Bolsa fondo en V",R:"Rollos",E:"Empaques",L:"Láminas",X:"Especial"},
  cert:    {SC:"Sin certificación",FM:"FSC Mix",FR:"FSC Recycled",BR:"BRGCS",KS:"Kosher",FC:"FSC 100%",XX:"Nueva/pendiente"},
  mat:     {"01":"Virgen","02":"Reciclado","03":"Blanco","04":"Antigrasa Natural","05":"Antigrasa Blanco","06":"MF Natural","07":"MF Blanco","08":"Rollo térmico","09":"Rollo Bond","10":"Esmaltado","11":"Earthpack","00":"Especial/No codificado"},
  imp:     {0:"Sin impresión",1:"Simple 1 color",2:"Simple 2 colores",3:"Simple 3 colores",4:"Simple 4 colores",5:"Simple 5 colores",6:"Simple 6 colores",7:"Simple >6 colores",8:"Impresión + Estampado",9:"Especial"},
  corte:   {0:"Sin corte",1:"Corte liso",2:"Corte dentado",3:"Corte en J",4:"Corte liso por doblez",E:"Especial"},
  manija:  {0:"Sin manija",1:"Entorchada",2:"Plana",3:"Algodón",4:"Diecut",E:"Especial"},
  contacto:{0:"No tiene contacto directo con alimento",1:"Sí tiene contacto directo con alimento"},
  canal:   {N:"Nacional",E:"Exportación",D:"Distribuidor",X:"Especial"},
};

export const CATALOG_TABLES = [
  {table:'tipo_producto',     key:'tipo',     selectId:'tipo'},
  {table:'certificacion',     key:'cert',     selectId:'cert'},
  {table:'material',          key:'mat',      selectId:'mat'},
  {table:'impresion',         key:'imp',      selectId:'imp'},
  {table:'corte',             key:'corte',    selectId:'corte'},
  {table:'manija',            key:'manija',   selectId:'manija'},
  {table:'contacto_alimento', key:'contacto', selectId:'contacto'},
  {table:'canal',             key:'canal',    selectId:'canal'},
];

export async function fetchCatalogTable(client, tableName) {
  const { data, error } = await client
    .from(tableName)
    .select('code,label')
    .order('sort_order', { ascending: true });
  if (error) throw error;
  if (!data || !data.length) throw new Error(`Tabla "${tableName}" vacía`);
  return data;
}
