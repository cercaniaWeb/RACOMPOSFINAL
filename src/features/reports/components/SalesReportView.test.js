import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { vi, describe, it, beforeEach, afterEach, expect } from 'vitest';
import { useAppStore } from '../../../store/useAppStore';
import SalesReportView from './SalesReportView';

// Mock the store
vi.mock('../../../store/useAppStore', () => ({
  useAppStore: vi.fn(),
}));

describe('SalesReportView', () => {
  beforeEach(() => {
    // Setup default mock store
    useAppStore.mockReturnValue({
      salesReport: null,
      currentUser: {
        uid: 'test-user',
        name: 'Test User',
        role: 'admin',
        assigned_stores: [
          { id: 'store-1', name: 'Tienda 1' },
          { id: 'store-2', name: 'Tienda 2' }
        ]
      },
      fetchSalesReport: vi.fn().mockResolvedValue({
        totalSales: 1250.75,
        totalTransactions: 25,
        avgTicket: 50.03,
        profitMargin: 25.5,
        sales: [
          {
            date: '2023-05-01',
            store: 'store-1',
            transactions: 10,
            salesAmount: 500.00,
            costAmount: 375.00,
            profitAmount: 125.00,
            profitMargin: 25.0
          },
          {
            date: '2023-05-02',
            store: 'store-2',
            transactions: 15,
            salesAmount: 750.75,
            costAmount: 563.06,
            profitAmount: 187.69,
            profitMargin: 25.0
          }
        ],
        dateRange: { startDate: '2023-05-01', endDate: '2023-05-31' }
      }),
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders the sales report view with filters', async () => {
    render(<SalesReportView />);

    // Check if the page title is displayed
    expect(screen.getByText('Reporte de Ventas')).toBeInTheDocument();
    expect(screen.getByText('Análisis detallado de las ventas por período')).toBeInTheDocument();

    // Check if filter section is present
    expect(screen.getByText('Filtros de Reporte')).toBeInTheDocument();

    // Check for date inputs
    expect(screen.getByLabelText('Fecha Inicio')).toBeInTheDocument();
    expect(screen.getByLabelText('Fecha Fin')).toBeInTheDocument();

    // Check for store filter
    expect(screen.getByText('Sucursal')).toBeInTheDocument();

    // Check for report type filter
    expect(screen.getByText('Agrupamiento')).toBeInTheDocument();

    // Verify download button
    expect(screen.getByRole('button', { name: /Descargar Reporte/i })).toBeInTheDocument();
  });

  it('displays summary cards with correct data', async () => {
    render(<SalesReportView />);

    // Wait for the report to be loaded
    await waitFor(() => {
      expect(screen.getByText('$1,250.75')).toBeInTheDocument();
    });

    // Verify the summary cards display correct values
    expect(screen.getByText('$1,250.75')).toBeInTheDocument(); // Total Sales
    expect(screen.getByText('25')).toBeInTheDocument(); // Total Transactions
    expect(screen.getByText('$50.03')).toBeInTheDocument(); // Average Ticket
    expect(screen.getByText('25.50%')).toBeInTheDocument(); // Profit Margin
  });

  it('shows sales table with data', async () => {
    render(<SalesReportView />);

    // Wait for the report to be loaded
    await waitFor(() => {
      expect(screen.getByText('Fecha')).toBeInTheDocument();
    });

    // Verify table headers
    expect(screen.getByText('Fecha')).toBeInTheDocument();
    expect(screen.getByText('Sucursal')).toBeInTheDocument();
    expect(screen.getByText('Transacciones')).toBeInTheDocument();
    expect(screen.getByText('Ventas')).toBeInTheDocument();
    expect(screen.getByText('Costo')).toBeInTheDocument();
    expect(screen.getByText('Beneficio')).toBeInTheDocument();
    expect(screen.getByText('Margen')).toBeInTheDocument();

    // Verify data rows are present
    expect(screen.getByText('2023-05-01')).toBeInTheDocument();
    expect(screen.getByText('2023-05-02')).toBeInTheDocument();
    expect(screen.getByText('store-1')).toBeInTheDocument();
    expect(screen.getByText('store-2')).toBeInTheDocument();
    expect(screen.getByText('10')).toBeInTheDocument();
    expect(screen.getByText('15')).toBeInTheDocument();
    expect(screen.getByText('$500.00')).toBeInTheDocument();
    expect(screen.getByText('$750.75')).toBeInTheDocument();
  });

  it('handles empty report data', async () => {
    // Mock empty report
    useAppStore.mockReturnValue({
      salesReport: null,
      currentUser: {
        uid: 'test-user',
        name: 'Test User',
        role: 'admin',
        assigned_stores: [
          { id: 'store-1', name: 'Tienda 1' },
          { id: 'store-2', name: 'Tienda 2' }
        ]
      },
      fetchSalesReport: vi.fn().mockResolvedValue(null),
    });

    render(<SalesReportView />);

    // Wait to see if empty state is shown
    await waitFor(() => {
      expect(screen.getByText('No hay datos')).toBeInTheDocument();
    });

    expect(screen.getByText('No hay datos')).toBeInTheDocument();
    expect(screen.getByText('No se encontraron datos de ventas para el rango de fechas seleccionado')).toBeInTheDocument();
  });
});