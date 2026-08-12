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

create table if not exists public.estampado (
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

create table if not exists public.contacto_alimento (
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
alter table public.estampado enable row level security;
alter table public.corte enable row level security;
alter table public.manija enable row level security;
alter table public.contacto_alimento enable row level security;
alter table public.canal enable row level security;

create policy "Lectura pública" on public.tipo_producto for select using (true);
create policy "Lectura pública" on public.certificacion for select using (true);
create policy "Lectura pública" on public.material for select using (true);
create policy "Lectura pública" on public.impresion for select using (true);
create policy "Lectura pública" on public.estampado for select using (true);
create policy "Lectura pública" on public.corte for select using (true);
create policy "Lectura pública" on public.manija for select using (true);
create policy "Lectura pública" on public.contacto_alimento for select using (true);
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
  ('09','Rollo blanco (solo R)',9),
  ('10','Esmaltado',10),
  ('11','Earthpack',11),
  ('XX','Especial / No codificado',12)
on conflict (code) do update set label = excluded.label, sort_order = excluded.sort_order;

insert into public.impresion (code, label, sort_order) values
  ('0','Sin impresión',1),
  ('1','1 tinta',2),
  ('2','2 tintas',3),
  ('3','3 tintas',4),
  ('4','4 tintas',5),
  ('5','5 tintas',6),
  ('6','6 tintas',7),
  ('7','7 tintas',8),
  ('8','8 tintas',9),
  ('X','Especial / No codificado',10)
on conflict (code) do update set label = excluded.label, sort_order = excluded.sort_order;

insert into public.estampado (code, label, sort_order) values
  ('0','Sin estampado',1),
  ('1','1 foil',2),
  ('2','2 foil',3),
  ('X','Especial / No codificado',4)
on conflict (code) do update set label = excluded.label, sort_order = excluded.sort_order;

insert into public.corte (code, label, sort_order) values
  ('0','Sin corte',1),
  ('1','Corte liso',2),
  ('2','Corte dentado',3),
  ('3','Corte en J',4),
  ('4','Corte liso con doblez',5),
  ('X','Especial / No codificado',6)
on conflict (code) do update set label = excluded.label, sort_order = excluded.sort_order;

insert into public.manija (code, label, sort_order) values
  ('0','Sin manija',1),
  ('1','Entorchada (papel retorcido)',2),
  ('2','Plana (cinta plana)',3),
  ('3','Algodón (alta gama)',4),
  ('4','Troquelado (Diecut)',5),
  ('5','Cordón de tela 5mm',6),
  ('6','Cordón de tela 2cm',7),
  ('X','Especial / No codificado',8)
on conflict (code) do update set label = excluded.label, sort_order = excluded.sort_order;

insert into public.contacto_alimento (code, label, sort_order) values
  ('0','No tiene contacto directo con alimento',1),
  ('1','Sí tiene contacto directo con alimento',2)
on conflict (code) do update set label = excluded.label, sort_order = excluded.sort_order;

insert into public.canal (code, label, sort_order) values
  ('N','Nacional',1),
  ('E','Exportación',2),
  ('D','Distribuidor',3),
  ('X','Especial',4)
on conflict (code) do update set label = excluded.label, sort_order = excluded.sort_order;
