import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act, fireEvent } from '@testing-library/react';
import React from 'react';
import NotificationProvider from '../NotificationProvider';
import useNotification from '../hooks/useNotification';
import useNotificationStore from '../store/useNotificationStore';
import { v4 } from 'uuid'; // Import v4 directly

// Mock uuid to control generated IDs
vi.mock('uuid', () => ({
  v4: vi.fn(),
}));

// A test component to trigger notifications
const TestComponent = () => {
  const { showSuccess, showError, showWarning, showInfo } = useNotification();
  return (
    <div>
      <button onClick={() => showSuccess('Success message!')}>Show Success</button>
      <button onClick={() => showError('Error message!')}>Show Error</button>
      <button onClick={() => showWarning('Warning message!')}>Show Warning</button>
      <button onClick={() => showInfo('Info message!')}>Show Info</button>
    </div>
  );
};

describe('Notification System Integration', () => {
  beforeEach(() => {
    useNotificationStore.setState({ notifications: [] });
    vi.useFakeTimers();
    vi.mocked(v4).mockClear(); // Clear previous mock calls
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it('should display and auto-dismiss a success notification', () => {
    vi.mocked(v4).mockReturnValue('success-integration-id');

    render(
      <NotificationProvider>
        <TestComponent />
      </NotificationProvider>
    );

    act(() => {
      fireEvent.click(screen.getByText('Show Success'));
    });

    expect(screen.getByText('Success message!')).toBeInTheDocument();
    expect(screen.getByRole('alert')).toHaveClass('bg-green-500');

    act(() => {
      vi.advanceTimersByTime(5000);
    });

    expect(screen.queryByText('Success message!')).not.toBeInTheDocument();
    expect(useNotificationStore.getState().notifications).toHaveLength(0);
  });

  it('should display and manually dismiss an error notification', () => {
    vi.mocked(v4).mockReturnValue('error-integration-id');

    render(
      <NotificationProvider>
        <TestComponent />
      </NotificationProvider>
    );

    act(() => {
      fireEvent.click(screen.getByText('Show Error'));
    });

    expect(screen.getByText('Error message!')).toBeInTheDocument();
    expect(screen.getByRole('alert')).toHaveClass('bg-red-500');

    act(() => {
      fireEvent.click(screen.getByLabelText('Dismiss notification'));
    });

    expect(screen.queryByText('Error message!')).not.toBeInTheDocument();
    expect(useNotificationStore.getState().notifications).toHaveLength(0);
  });

  it('should display multiple notifications simultaneously', () => {
    vi.mocked(v4).mockReturnValueOnce('id-1').mockReturnValueOnce('id-2');

    render(
      <NotificationProvider>
        <TestComponent />
      </NotificationProvider>
    );

    act(() => {
      fireEvent.click(screen.getByText('Show Info'));
      fireEvent.click(screen.getByText('Show Warning'));
    });

    expect(screen.getByText('Info message!')).toBeInTheDocument();
    expect(screen.getByText('Warning message!')).toBeInTheDocument();
    expect(useNotificationStore.getState().notifications).toHaveLength(2);

    act(() => {
      vi.advanceTimersByTime(5000);
    });

    expect(screen.queryByText('Info message!')).not.toBeInTheDocument();
    expect(screen.queryByText('Warning message!')).not.toBeInTheDocument();
    expect(useNotificationStore.getState().notifications).toHaveLength(0);
  });
});
