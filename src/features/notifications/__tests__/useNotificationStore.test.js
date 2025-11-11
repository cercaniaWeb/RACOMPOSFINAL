import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { act } from 'react';
import useNotificationStore from '../store/useNotificationStore';
import { v4 } from 'uuid'; // Import v4 directly

// Mock uuid to control generated IDs
vi.mock('uuid', () => ({
  v4: vi.fn(),
}));

describe('useNotificationStore', () => {
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

  it('should add a notification to the state', () => {
    vi.mocked(v4).mockReturnValue('test-id-1');

    act(() => {
      useNotificationStore.getState().addNotification('success', 'Test message');
    });

    const notifications = useNotificationStore.getState().notifications;
    expect(notifications).toHaveLength(1);
    expect(notifications[0]).toEqual({
      id: 'test-id-1',
      type: 'success',
      message: 'Test message',
      duration: 5000,
    });
  });

  it('should assign a unique ID to each notification', () => {
    vi.mocked(v4).mockReturnValueOnce('id-1').mockReturnValueOnce('id-2');

    act(() => {
      useNotificationStore.getState().addNotification('info', 'Message 1');
      useNotificationStore.getState().addNotification('warning', 'Message 2');
    });

    const notifications = useNotificationStore.getState().notifications;
    expect(notifications).toHaveLength(2);
    expect(notifications[0].id).toBe('id-1');
    expect(notifications[1].id).toBe('id-2');
  });

  it('should automatically remove the notification after its duration', () => {
    vi.mocked(v4).mockReturnValue('timed-id');

    act(() => {
      useNotificationStore.getState().addNotification('success', 'Timed message', 1000);
    });

    expect(useNotificationStore.getState().notifications).toHaveLength(1);

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(useNotificationStore.getState().notifications).toHaveLength(0);
  });

  it('should remove a specific notification by ID', () => {
    vi.mocked(v4).mockReturnValueOnce('id-to-remove').mockReturnValueOnce('id-to-keep');

    act(() => {
      useNotificationStore.getState().addNotification('info', 'Remove me');
      useNotificationStore.getState().addNotification('info', 'Keep me');
    });

    expect(useNotificationStore.getState().notifications).toHaveLength(2);

    act(() => {
      useNotificationStore.getState().removeNotification('id-to-remove');
    });

    const notifications = useNotificationStore.getState().notifications;
    expect(notifications).toHaveLength(1);
    expect(notifications[0].id).toBe('id-to-keep');
  });

  it('should clear all notifications from the state', () => {
    vi.mocked(v4).mockReturnValueOnce('id-1').mockReturnValueOnce('id-2');

    act(() => {
      useNotificationStore.getState().addNotification('info', 'Message 1');
      useNotificationStore.getState().addNotification('warning', 'Message 2');
    });

    expect(useNotificationStore.getState().notifications).toHaveLength(2);

    act(() => {
      useNotificationStore.getState().clearAllNotifications();
    });

    expect(useNotificationStore.getState().notifications).toHaveLength(0);
  });
});
