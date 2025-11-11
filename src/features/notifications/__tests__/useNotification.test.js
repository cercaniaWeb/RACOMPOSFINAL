import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import useNotification from '../hooks/useNotification';
import useNotificationStore from '../store/useNotificationStore';
import { v4 } from 'uuid'; // Import v4 directly

// Mock uuid to control generated IDs
vi.mock('uuid', () => ({
  v4: vi.fn(),
}));

describe('useNotification', () => {
  beforeEach(() => {
    // Reset the store before each test
    useNotificationStore.setState({ notifications: [] });
    vi.useFakeTimers(); // Use fake timers for setTimeout
    vi.mocked(v4).mockClear(); // Clear previous mock calls
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers(); // Restore real timers
  });

  it('showSuccess should add a success notification', () => {
    vi.mocked(v4).mockReturnValue('success-id');

    const { result } = renderHook(() => useNotification());

    act(() => {
      result.current.showSuccess('Operation successful');
    });

    const notifications = useNotificationStore.getState().notifications;
    expect(notifications).toHaveLength(1);
    expect(notifications[0]).toEqual({
      id: 'success-id',
      type: 'success',
      message: 'Operation successful',
      duration: 5000,
    });
  });

  it('showError should add an error notification', () => {
    vi.mocked(v4).mockReturnValue('error-id');

    const { result } = renderHook(() => useNotification());

    act(() => {
      result.current.showError('Operation failed');
    });

    const notifications = useNotificationStore.getState().notifications;
    expect(notifications).toHaveLength(1);
    expect(notifications[0]).toEqual({
      id: 'error-id',
      type: 'error',
      message: 'Operation failed',
      duration: 5000,
    });
  });

  it('showWarning should add a warning notification', () => {
    vi.mocked(v4).mockReturnValue('warning-id');

    const { result } = renderHook(() => useNotification());

    act(() => {
      result.current.showWarning('Warning message');
    });

    const notifications = useNotificationStore.getState().notifications;
    expect(notifications).toHaveLength(1);
    expect(notifications[0]).toEqual({
      id: 'warning-id',
      type: 'warning',
      message: 'Warning message',
      duration: 5000,
    });
  });

  it('showInfo should add an info notification', () => {
    vi.mocked(v4).mockReturnValue('info-id');

    const { result } = renderHook(() => useNotification());

    act(() => {
      result.current.showInfo('Info message');
    });

    const notifications = useNotificationStore.getState().notifications;
    expect(notifications).toHaveLength(1);
    expect(notifications[0]).toEqual({
      id: 'info-id',
      type: 'info',
      message: 'Info message',
      duration: 5000,
    });
  });

  it('should use provided duration if specified', () => {
    vi.mocked(v4).mockReturnValue('custom-duration-id');

    const { result } = renderHook(() => useNotification());

    act(() => {
      result.current.showSuccess('Custom duration', 1000);
    });

    const notifications = useNotificationStore.getState().notifications;
    expect(notifications[0].duration).toBe(1000);
  });

  it('removeNotification should remove a notification from the store', () => {
    vi.mocked(v4).mockReturnValue('remove-this-id');

    const { result } = renderHook(() => useNotification());

    act(() => {
      result.current.showInfo('To be removed');
    });
    expect(useNotificationStore.getState().notifications).toHaveLength(1);

    act(() => {
      result.current.removeNotification('remove-this-id');
    });
    expect(useNotificationStore.getState().notifications).toHaveLength(0);
  });
});
