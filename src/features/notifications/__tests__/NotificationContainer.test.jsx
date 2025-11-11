import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act, fireEvent } from '@testing-library/react';
import NotificationContainer from '../components/NotificationContainer';
import useNotificationStore from '../store/useNotificationStore';
import { v4 } from 'uuid'; // Import v4 directly

// Mock uuid to control generated IDs
vi.mock('uuid', () => ({
  v4: vi.fn(),
}));

// Mock NotificationItem to simplify testing NotificationContainer's logic
vi.mock('../components/NotificationItem', () => ({
  default: vi.fn(({ message, onDismiss }) => (
    <div data-testid="notification-item" onClick={onDismiss}>
      {message}
    </div>
  )),
}));

describe('NotificationContainer', () => {
  beforeEach(() => {
    useNotificationStore.setState({ notifications: [] });
    vi.useFakeTimers();
    vi.mocked(v4).mockClear(); // Clear previous mock calls
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it('renders no notifications when the store is empty', () => {
    render(<NotificationContainer />);
    expect(screen.queryAllByTestId('notification-item')).toHaveLength(0);
  });

  it('renders notifications present in the store', () => {
    vi.mocked(v4).mockReturnValueOnce('id-1').mockReturnValueOnce('id-2');

    act(() => {
      useNotificationStore.getState().addNotification('info', 'Message 1');
      useNotificationStore.getState().addNotification('success', 'Message 2');
    });

    render(<NotificationContainer />);
    expect(screen.getAllByTestId('notification-item')).toHaveLength(2);
    expect(screen.getByText('Message 1')).toBeInTheDocument();
    expect(screen.getByText('Message 2')).toBeInTheDocument();
  });

  it('calls removeNotification when a notification item is dismissed', () => {
    vi.mocked(v4).mockReturnValue('id-to-dismiss');

    act(() => {
      useNotificationStore.getState().addNotification('info', 'Dismiss me');
    });

    render(<NotificationContainer />);
    expect(screen.getByText('Dismiss me')).toBeInTheDocument();

    // Simulate clicking the dismiss button on NotificationItem
    act(() => {
      fireEvent.click(screen.getByText('Dismiss me'));
    });

    expect(screen.queryByText('Dismiss me')).not.toBeInTheDocument();
    expect(useNotificationStore.getState().notifications).toHaveLength(0);
  });

  it('removes notification from DOM after auto-dismissal', () => {
    vi.mocked(v4).mockReturnValue('auto-dismiss-id');

    act(() => {
      useNotificationStore.getState().addNotification('info', 'Auto dismiss', 1000);
    });

    render(<NotificationContainer />);
    expect(screen.getByText('Auto dismiss')).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(screen.queryByText('Auto dismiss')).not.toBeInTheDocument();
    expect(useNotificationStore.getState().notifications).toHaveLength(0);
  });
});
