import { render, screen } from '@testing-library/react';
import SalesReportView from './SalesReportView';
import useAppStore from '../../../store/useAppStore';

vi.mock('../../../store/useAppStore', () => ({
  __esModule: true,
  default: vi.fn(),
}));

describe('SalesReportView', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders the sales report view with filters', () => {
    useAppStore.default.mockImplementation(() => ({
      salesReport: null,
      fetchSalesReport: vi.fn(),
    }));

    render(<SalesReportView />);

    expect(screen.getByText('Reporte de Ventas')).toBeInTheDocument();
    expect(screen.getByText('Filtros de Reporte')).toBeInTheDocument();
  });

  it('displays summary cards with correct data', () => {
    useAppStore.default.mockImplementation(() => ({
      salesReport: {
        totalSales: 1250.75,
        totalTransactions: 25,
        avgTicket: 50.03,
        profitMargin: 25.5,
        salesByPaymentMethod: [],
        topSellingProducts: [],
      },
      fetchSalesReport: vi.fn(),
    }));

    render(<SalesReportView />);

    expect(screen.getByText('1,250.75')).toBeInTheDocument();
    expect(screen.getByText('25')).toBeInTheDocument();
    expect(screen.getByText('50.03')).toBeInTheDocument();
    expect(screen.getByText('25.50%')).toBeInTheDocument();
  });

  it('shows sales table with data', () => {
    useAppStore.default.mockImplementation(() => ({
      salesReport: {
        totalSales: 1250.75,
        totalTransactions: 25,
        avgTicket: 50.03,
        profitMargin: 25.5,
        salesByPaymentMethod: [
          { payment_method: 'Efectivo', total_sales: 1000 },
          { payment_method: 'Tarjeta', total_sales: 250.75 },
        ],
        topSellingProducts: [
          { name: 'Product A', total_quantity: 10, total_sales: 500 },
          { name: 'Product B', total_quantity: 5, total_sales: 250 },
        ],
      },
      fetchSalesReport: vi.fn(),
    }));

    render(<SalesReportView />);

    expect(screen.getByText('Fecha')).toBeInTheDocument();
    expect(screen.getByText('Efectivo')).toBeInTheDocument();
    expect(screen.getByText('1,000.00')).toBeInTheDocument();
    expect(screen.getByText('Product A')).toBeInTheDocument();
    expect(screen.getByText('10')).toBeInTheDocument();
    expect(screen.getByText('500.00')).toBeInTheDocument();
  });

  it('handles empty report data', () => {
    useAppStore.default.mockImplementation(() => ({
      salesReport: {
        totalSales: 0,
        totalTransactions: 0,
        avgTicket: 0,
        profitMargin: 0,
        salesByPaymentMethod: [],
        topSellingProducts: [],
      },
      fetchSalesReport: vi.fn(),
    }));

    render(<SalesReportView />);

    const noHayDatosElements = screen.getAllByText('No hay datos');
    expect(noHayDatosElements.length).toBeGreaterThan(0);
  });
});