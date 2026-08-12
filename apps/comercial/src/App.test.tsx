import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, expect, test } from 'vitest';
import App from './App';

function renderApp() {
  return render(
    <BrowserRouter>
      <App />
    </BrowserRouter>,
  );
}

describe('App', () => {
  test('muestra la marca y los enlaces de navegación de los módulos', () => {
    renderApp();
    expect(screen.getByText('Ditar · Comercial')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Dashboard' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Clientes' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Cotizaciones' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Pedidos' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Solicitudes SAP' })).toBeInTheDocument();
  });

  test('muestra el aviso de Supabase no configurado cuando faltan credenciales', () => {
    renderApp();
    expect(screen.getByText(/Supabase no configurado/)).toBeInTheDocument();
  });

  test('renderiza el Dashboard en la ruta raíz', () => {
    renderApp();
    expect(screen.getByRole('heading', { name: 'Dashboard' })).toBeInTheDocument();
  });
});
