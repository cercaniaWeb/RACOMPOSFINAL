import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import POSPage from '../pages/POSPage';
import useAppStore from '../store/useAppStore';

// Mock html2canvas and jsPDF
vi.mock('html2canvas', () => ({
  default: vi.fn()
}));

vi.mock('jspdf', () => ({
  default: vi.fn(() => ({
    addImage: vi.fn(),
    save: vi.fn(),
  }))
}));

vi.mock('react-to-print', () => ({
  useReactToPrint: vi.fn(() => vi.fn())
}));

// Mock the store
vi.mock('../store/useAppStore');

describe('POS Page Ticket Saving', () => {
  const mockLastSale = {
    saleId: 'test-sale-id',
    cart: [
      { 
        id: 1, 
        name: 'Test Product 1', 
        price: 10.99, 
        quantity: 2,
        unit: 'unidad'
      },
      { 
        id: 2, 
        name: 'Test Product 2', 
        price: 25.50, 
        quantity: 1,
        unit: 'unidad'
      }
    ],
    subtotal: 47.48,
    total: 47.48,
    discount: { type: 'none', value: 0 },
    note: 'Test note',
    date: new Date().toISOString(),
    cashier: 'Test Cashier',
    storeId: '1',
    cash: 50,
    card: 0,
    cardCommission: 0,
    commissionInCash: false
  };

  beforeEach(() => {
    vi.clearAllMocks();

    useAppStore.mockReturnValue({
      currentUser: { name: 'Test Cashier', storeName: 'Test Store' },
      cart: [],
      searchTerm: '',
      setSearchTerm: vi.fn(),
      categories: [],
      products: [],
      inventoryBatches: [],
      addToCart: vi.fn(),
      removeFromCart: vi.fn(),
      updateCartItemQuantity: vi.fn(),
      handleCheckout: vi.fn(),
      lastSale: mockLastSale,
      darkMode: true,
      isOnline: true,
      offlineMode: false,
      isWeightModalOpen: false,
      weighingProduct: null,
      openWeightModal: vi.fn(),
      closeWeightModal: vi.fn(),
      addToCartWithWeight: vi.fn(),
    });
  });

  it('should render post payment modal when lastSale exists and postPaymentModalOpen is true', () => {
    const { container } = render(<POSPage />);
    
    // Since we have a lastSale, the modal should render
    expect(container.querySelector('[role="dialog"]')).toBeInTheDocument();
  });

  it('should call handleSaveTicket when save ticket button is clicked', async () => {
    // Mock canvas and image data
    const mockCanvas = document.createElement('canvas');
    const mockContext = mockCanvas.getContext('2d');
    vi.mocked(html2canvas).mockResolvedValue(mockCanvas);

    // Mock the jsPDF constructor
    const mockSave = vi.fn();
    const mockAddImage = vi.fn();
    
    vi.mocked(jsPDF).mockImplementation(() => ({
      addImage: mockAddImage,
      save: mockSave,
    }));

    render(<POSPage />);

    // Find and click the save ticket button
    const saveButton = screen.getByText('Guardar Ticket');
    fireEvent.click(saveButton);

    await waitFor(() => {
      // Verify that html2canvas was called
      expect(html2canvas).toHaveBeenCalledTimes(1);
      
      // Verify that jsPDF functions were called
      expect(mockAddImage).toHaveBeenCalledTimes(1);
      expect(mockSave).toHaveBeenCalledWith(`ticket_venta_${mockLastSale.saleId}.pdf`);
    });
  });

  it('should call handlePrint when print ticket button is clicked', () => {
    // Mock useReactToPrint
    const mockHandlePrint = vi.fn();
    vi.mocked(useReactToPrint).mockReturnValue(mockHandlePrint);

    render(<POSPage />);

    // Find and click the print ticket button
    const printButton = screen.getByText('Imprimir Ticket');
    fireEvent.click(printButton);

    // Verify that print function was called
    expect(mockHandlePrint).toHaveBeenCalledTimes(1);
  });
});