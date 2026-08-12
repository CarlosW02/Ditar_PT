import { NavLink, Route, Routes } from 'react-router-dom';
import { isSupabaseConfigured } from './lib/supabaseClient';
import './App.css';

const NAV_ITEMS = [
  { to: '/', label: 'Dashboard', end: true },
  { to: '/clientes', label: 'Clientes' },
  { to: '/cotizaciones', label: 'Cotizaciones' },
  { to: '/pedidos', label: 'Pedidos' },
  { to: '/solicitudes-sap', label: 'Solicitudes SAP' },
];

function PlaceholderPage({ title }: { title: string }) {
  return (
    <section className="page">
      <h1>{title}</h1>
      <p className="page-placeholder">Módulo en construcción.</p>
    </section>
  );
}

export default function App() {
  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand">Ditar · Comercial</div>
        <nav className="nav">
          {NAV_ITEMS.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.end} className="nav-link">
              {item.label}
            </NavLink>
          ))}
        </nav>
        {!isSupabaseConfigured && <span className="pill pill-warn">⚠ Supabase no configurado</span>}
      </header>

      <main>
        <Routes>
          <Route path="/" element={<PlaceholderPage title="Dashboard" />} />
          <Route path="/clientes" element={<PlaceholderPage title="Clientes" />} />
          <Route path="/cotizaciones" element={<PlaceholderPage title="Cotizaciones" />} />
          <Route path="/pedidos" element={<PlaceholderPage title="Pedidos" />} />
          <Route path="/solicitudes-sap" element={<PlaceholderPage title="Solicitudes SAP" />} />
        </Routes>
      </main>
    </div>
  );
}
