import { render, screen } from '@testing-library/react';
import SalesReportView from './SalesReportView';
import useAppStore from '../../../store/useAppStore';
import { vi } from 'vitest';

vi.mock('../../../store/useAppStore');

describe('SalesReportView', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders the sales report view with filters', () => {
    useAppStore.mockReturnValue({
      salesReport: null,
      fetchSalesReport: vi.fn(),
    });

    render(<SalesReportView />);

    expect(screen.getByText('Reporte de Ventas')).toBeInTheDocument();
    expect(screen.getByText('Filtros de Reporte')).toBeInTheDocument();
  });

  it('displays summary cards with correct data', () => {
    useAppStore.mockReturnValue({
      salesReport: {
        totalSales: 1250.75,
        totalTransactions: 25,
        avgTicket: 50.03,
        profitMargin: 25.5,
        salesByPaymentMethod: [],
        topSellingProducts: [],
      },
      fetchSalesReport: vi.fn(),
    });

    render(<SalesReportView />);

    expect(screen.getByText(/1,250.75/)).toBeInTheDocument();
    expect(screen.getByText('25')).toBeInTheDocument();
    expect(screen.getByText(/50.03/)).toBeInTheDocument();
    expect(screen.getByText(/25.50%/)).toBeInTheDocument();
  });

  it('shows sales table with data', () => {
    useAppStore.mockReturnValue({
      salesReport: {
        sales: [
          {
            date: '2025-11-11',
            store: 'Tienda 1',
            transactions: 10,
            salesAmount: 1000,
            costAmount: 750,
            profitAmount: 250,
            profitMargin: 25,
          },
        ],
      },
      fetchSalesReport: vi.fn(),
    });

    render(<SalesReportView />);

    expect(screen.getByRole('columnheader', { name: /fecha/i })).toBeInTheDocument();
    expect(screen.getByText('Tienda 1')).toBeInTheDocument();
    expect(screen.getByText('10')).toBeInTheDocument();
    expect(screen.getByText(/1,000.00/)).toBeInTheDocument();
  });

  it('handles empty report data', () => {
    useAppStore.mockReturnValue({
      salesReport: {
        totalSales: 0,
        totalTransactions: 0,
        avgTicket: 0,
        profitMargin: 0,
        salesByPaymentMethod: [],
        topSellingProducts: [],
      },
      fetchSalesReport: vi.fn(),
    });

    render(<SalesReportView />);

    const noHayDatosElements = screen.getAllByText('No hay datos');
    expect(noHayDatosElements.length).toBeGreaterThan(0);
  });
});
