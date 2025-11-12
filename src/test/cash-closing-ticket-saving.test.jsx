import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import CashClosingModal from '../features/pos/CashClosingModal';
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

describe('Cash Closing Modal Ticket Saving', () => {
  const mockCashClosingData = {
    date: new Date().toISOString(),
    cashier: 'Test Cashier',
    initialCash: 100,
    totalSalesAmount: 500,
    totalCashSales: 300,
    totalCardSales: 200,
    finalCash: 400,
    sales: [
      { saleId: 'sale-1', total: 100 },
      { saleId: 'sale-2', total: 150 }
    ],
  };

  const mockOnClose = vi.fn();
  const mockAddCashClosing = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    useAppStore.mockReturnValue({
      salesHistory: [],
      currentUser: { name: 'Test Cashier', storeName: 'Test Store' },
      cashClosings: [],
      addCashClosing: mockAddCashClosing,
    });
  });

  it('should save cash closing ticket as PDF when save button is clicked', async () => {
    // Mock canvas
    const mockCanvas = document.createElement('canvas');
    vi.mocked(html2canvas).mockResolvedValue(mockCanvas);

    // Mock the jsPDF constructor
    const mockSave = vi.fn();
    const mockAddImage = vi.fn();
    
    vi.mocked(jsPDF).mockImplementation(() => ({
      addImage: mockAddImage,
      save: mockSave,
    }));

    render(<CashClosingModal onClose={mockOnClose} />);

    // Find and click the save ticket button
    const saveButton = screen.getByText('Guardar Ticket');
    fireEvent.click(saveButton);

    await waitFor(() => {
      // Verify that html2canvas was called
      expect(html2canvas).toHaveBeenCalledTimes(1);
      
      // Verify that jsPDF functions were called
      expect(mockAddImage).toHaveBeenCalledTimes(1);
      
      // Check if the saved file name is correct
      expect(mockSave).toHaveBeenCalledWith(
        expect.stringContaining('cierre_caja_')
      );
    });
  });

  it('should call handlePrint when print ticket button is clicked', () => {
    // Mock useReactToPrint
    const mockHandlePrint = vi.fn();
    vi.mocked(useReactToPrint).mockReturnValue(mockHandlePrint);

    render(<CashClosingModal onClose={mockOnClose} />);

    // Find and click the print ticket button
    const printButton = screen.getByText('Imprimir Ticket');
    fireEvent.click(printButton);

    // Verify that print function was called
    expect(mockHandlePrint).toHaveBeenCalledTimes(1);
  });

  it('should call onClose when close button is clicked', () => {
    render(<CashClosingModal onClose={mockOnClose} />);

    // Find and click the close button
    const closeButton = screen.getByText('Cerrar');
    fireEvent.click(closeButton);

    // Verify that onClose was called
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });
});