import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import NotificationItem from '../components/NotificationItem';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';

// Mock lucide-react icons to simplify testing
vi.mock('lucide-react', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    CheckCircle: vi.fn(() => <svg data-testid="icon-check-circle" />),
    XCircle: vi.fn(() => <svg data-testid="icon-x-circle" />),
    AlertTriangle: vi.fn(() => <svg data-testid="icon-alert-triangle" />),
    Info: vi.fn(() => <svg data-testid="icon-info" />),
    X: vi.fn(() => <svg data-testid="icon-x" />),
  };
});

describe('NotificationItem', () => {
  const defaultProps = {
    id: '1',
    message: 'Test Message',
    onDismiss: vi.fn(),
  };

  it('renders success notification correctly', () => {
    render(<NotificationItem {...defaultProps} type="success" />);
    expect(screen.getByText('Test Message')).toBeInTheDocument();
    expect(screen.getByRole('alert')).toHaveClass('bg-green-500');
    expect(screen.getByTestId('icon-check-circle')).toBeInTheDocument();
  });

  it('renders error notification correctly', () => {
    render(<NotificationItem {...defaultProps} type="error" />);
    expect(screen.getByText('Test Message')).toBeInTheDocument();
    expect(screen.getByRole('alert')).toHaveClass('bg-red-500');
    expect(screen.getByTestId('icon-x-circle')).toBeInTheDocument();
  });

  it('renders warning notification correctly', () => {
    render(<NotificationItem {...defaultProps} type="warning" />);
    expect(screen.getByText('Test Message')).toBeInTheDocument();
    expect(screen.getByRole('alert')).toHaveClass('bg-yellow-400');
    expect(screen.getByTestId('icon-alert-triangle')).toBeInTheDocument();
  });

  it('renders info notification correctly', () => {
    render(<NotificationItem {...defaultProps} type="info" />);
    expect(screen.getByText('Test Message')).toBeInTheDocument();
    expect(screen.getByRole('alert')).toHaveClass('bg-blue-500');
    expect(screen.getByTestId('icon-info')).toBeInTheDocument();
  });

  it('calls onDismiss when close button is clicked', () => {
    render(<NotificationItem {...defaultProps} type="info" />);
    const dismissButton = screen.getByLabelText('Dismiss notification');
    fireEvent.click(dismissButton);
    expect(defaultProps.onDismiss).toHaveBeenCalledTimes(1);
    expect(defaultProps.onDismiss).toHaveBeenCalledWith('1');
  });
});
