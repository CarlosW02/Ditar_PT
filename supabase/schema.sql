-- Ditar SAS · Generador de Código de Producto
-- Catálogo de opciones (Nomenclatura PT v1.0)
-- Ejecutar en el SQL Editor del proyecto de Supabase.

create table if not exists public.tipo_producto (
  code text primary key,
  label text not null,
  sort_order int not null
);

create table if not exists public.certificacion (
  code text primary key,
  label text not null,
  sort_order int not null
);

create table if not exists public.material (
  code text primary key,
  label text not null,
  sort_order int not null
);

create table if not exists public.impresion (
  code text primary key,
  label text not null,
  sort_order int not null
);

create table if not exists public.corte (
  code text primary key,
  label text not null,
  sort_order int not null
);

create table if not exists public.manija (
  code text primary key,
  label text not null,
  sort_order int not null
);

create table if not exists public.canal (
  code text primary key,
  label text not null,
  sort_order int not null
);

-- Row Level Security: la app usa la anon key en el navegador, así que solo
-- se permite lectura pública. Nada de INSERT/UPDATE/DELETE desde el cliente.

alter table public.tipo_producto enable row level security;
alter table public.certificacion enable row level security;
alter table public.material enable row level security;
alter table public.impresion enable row level security;
alter table public.corte enable row level security;
alter table public.manija enable row level security;
alter table public.canal enable row level security;

create policy "Lectura pública" on public.tipo_producto for select using (true);
create policy "Lectura pública" on public.certificacion for select using (true);
create policy "Lectura pública" on public.material for select using (true);
create policy "Lectura pública" on public.impresion for select using (true);
create policy "Lectura pública" on public.corte for select using (true);
create policy "Lectura pública" on public.manija for select using (true);
create policy "Lectura pública" on public.canal for select using (true);

-- Seed: mismos valores que estaban hardcodeados en el HTML original.

insert into public.tipo_producto (code, label, sort_order) values
  ('Q','Bolsa fondo cuadrado',1),
  ('V','Bolsa fondo en V',2),
  ('R','Rollos',3),
  ('E','Empaques (exc. bolsas)',4),
  ('L','Láminas',5),
  ('X','Especial / No codificado',6)
on conflict (code) do update set label = excluded.label, sort_order = excluded.sort_order;

insert into public.certificacion (code, label, sort_order) values
  ('SC','Sin certificación',1),
  ('FM','FSC Mix',2),
  ('FR','FSC Recycled',3),
  ('BR','BRGCS (alimentaria)',4),
  ('KS','Kosher (alimentaria)',5),
  ('FC','FSC 100%',6),
  ('XX','Nueva / pendiente',7)
on conflict (code) do update set label = excluded.label, sort_order = excluded.sort_order;

insert into public.material (code, label, sort_order) values
  ('01','Virgen (Kraft estándar)',1),
  ('02','Reciclado',2),
  ('03','Blanco (bleached)',3),
  ('04','Antigrasa Natural',4),
  ('05','Antigrasa Blanco',5),
  ('06','MF Natural',6),
  ('07','MF Blanco',7),
  ('08','Rollo térmico (solo R)',8),
  ('09','Rollo Bond (solo R)',9),
  ('10','Esmaltado',10),
  ('11','Earthpack',11),
  ('00','Especial / No codificado',12)
on conflict (code) do update set label = excluded.label, sort_order = excluded.sort_order;

insert into public.impresion (code, label, sort_order) values
  ('0','Sin impresión',1),
  ('1','Simple 1 color',2),
  ('2','Simple 2 colores',3),
  ('3','Simple 3 colores',4),
  ('4','Simple 4 colores',5),
  ('5','Simple 5 colores',6),
  ('6','Simple 6 colores',7),
  ('7','Simple >6 colores',8),
  ('8','Impresión + Estampado',9),
  ('9','Especial (validar Diseño)',10)
on conflict (code) do update set label = excluded.label, sort_order = excluded.sort_order;

insert into public.corte (code, label, sort_order) values
  ('0','Sin corte',1),
  ('1','Corte liso',2),
  ('2','Corte dentado',3),
  ('3','Corte en J',4),
  ('4','Corte liso por doblez',5),
  ('E','Especial (validar Producción)',6)
on conflict (code) do update set label = excluded.label, sort_order = excluded.sort_order;

insert into public.manija (code, label, sort_order) values
  ('0','Sin manija',1),
  ('1','Entorchada (papel retorcido)',2),
  ('2','Plana (cinta plana)',3),
  ('3','Algodón (alta gama)',4),
  ('4','Diecut (troquelada)',5),
  ('E','Especial (validar Ingeniería)',6)
on conflict (code) do update set label = excluded.label, sort_order = excluded.sort_order;

insert into public.canal (code, label, sort_order) values
  ('N','Nacional',1),
  ('E','Exportación',2),
  ('D','Distribuidor',3),
  ('X','Especial',4)
on conflict (code) do update set label = excluded.label, sort_order = excluded.sort_order;
