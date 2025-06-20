// ===================================
// WINZO PUSH NOTIFICATIONS
// ===================================

import React from 'react';

// ===== NOTIFICATION PERMISSIONS =====

export enum NotificationPermissionStatus {
  GRANTED = 'granted',
  DENIED = 'denied',
  DEFAULT = 'default'
}

export class NotificationManager {
  private permission: NotificationPermission = 'default';
  private registration: ServiceWorkerRegistration | null = null;

  constructor() {
    this.permission = this.getPermissionStatus();
  }

  public getPermissionStatus(): NotificationPermission {
    if (!('Notification' in window)) {
      return 'denied';
    }
    return Notification.permission;
  }

  public async requestPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) {
      console.warn('This browser does not support notifications');
      return 'denied';
    }

    if (this.permission === 'granted') {
      return 'granted';
    }

    const permission = await Notification.requestPermission();
    this.permission = permission;
    return permission;
  }

  public async setServiceWorkerRegistration(registration: ServiceWorkerRegistration): Promise<void> {
    this.registration = registration;
  }

  // ===== LOCAL NOTIFICATIONS =====

  public async showLocalNotification(
    title: string,
    options: NotificationOptions = {}
  ): Promise<void> {
    if (this.permission !== 'granted') {
      console.warn('Notification permission not granted');
      return;
    }

    const notification = new Notification(title, {
      icon: '/icons/icon-192x192.png',
      badge: '/icons/badge-72x72.png',
      ...options
    });

    // Auto-close after 5 seconds if not interactive
    if (!options.requireInteraction) {
      setTimeout(() => {
        notification.close();
      }, 5000);
    }

    return new Promise((resolve) => {
      notification.addEventListener('click', () => {
        window.focus();
        notification.close();
        resolve();
      });

      notification.addEventListener('close', () => {
        resolve();
      });
    });
  }

  // ===== PUSH NOTIFICATIONS =====

  public async subscribeToPushNotifications(
    vapidPublicKey: string
  ): Promise<PushSubscription | null> {
    if (!this.registration) {
      console.error('Service Worker not registered');
      return null;
    }

    if (this.permission !== 'granted') {
      await this.requestPermission();
    }

    if (this.permission !== 'granted') {
      return null;
    }

    try {
      const subscription = await this.registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(vapidPublicKey)
      });

      return subscription;
    } catch (error) {
      console.error('Failed to subscribe to push notifications:', error);
      return null;
    }
  }

  public async unsubscribeFromPushNotifications(): Promise<boolean> {
    if (!this.registration) {
      return false;
    }

    try {
      const subscription = await this.registration.pushManager.getSubscription();
      if (subscription) {
        return await subscription.unsubscribe();
      }
    } catch (error) {
      console.error('Failed to unsubscribe from push notifications:', error);
    }

    return false;
  }

  public async getPushSubscription(): Promise<PushSubscription | null> {
    if (!this.registration) {
      return null;
    }

    try {
      return await this.registration.pushManager.getSubscription();
    } catch (error) {
      console.error('Failed to get push subscription:', error);
      return null;
    }
  }

  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }
}

export const notificationManager = new NotificationManager();

// ===== NOTIFICATION TYPES =====

export interface BettingNotification {
  type: 'bet_result' | 'odds_change' | 'game_start' | 'promotion';
  title: string;
  message: string;
  data?: any;
  actions?: NotificationAction[];
}

export interface NotificationAction {
  action: string;
  title: string;
  icon?: string;
}

// ===== NOTIFICATION TEMPLATES =====

export const notificationTemplates = {
  betWin: (amount: number, game: string): BettingNotification => ({
    type: 'bet_result',
    title: '🎉 Bet Won!',
    message: `You won $${amount.toFixed(2)} on ${game}`,
    data: { type: 'win', amount, game },
    actions: [
      { action: 'view', title: 'View Details' },
      { action: 'bet_again', title: 'Bet Again' }
    ]
  }),

  betLoss: (amount: number, game: string): BettingNotification => ({
    type: 'bet_result',
    title: '😔 Bet Lost',
    message: `Your $${amount.toFixed(2)} bet on ${game} didn't win`,
    data: { type: 'loss', amount, game },
    actions: [
      { action: 'view', title: 'View Details' }
    ]
  }),

  oddsChange: (game: string, oldOdds: number, newOdds: number): BettingNotification => ({
    type: 'odds_change',
    title: '📊 Odds Changed',
    message: `${game} odds changed from ${oldOdds} to ${newOdds}`,
    data: { type: 'odds_change', game, oldOdds, newOdds },
    actions: [
      { action: 'view', title: 'View Game' },
      { action: 'bet', title: 'Place Bet' }
    ]
  }),

  gameStart: (game: string, time: string): BettingNotification => ({
    type: 'game_start',
    title: '🏆 Game Starting',
    message: `${game} starts at ${time}`,
    data: { type: 'game_start', game, time },
    actions: [
      { action: 'view', title: 'Watch Live' }
    ]
  }),

  promotion: (title: string, description: string): BettingNotification => ({
    type: 'promotion',
    title: `🎁 ${title}`,
    message: description,
    data: { type: 'promotion' },
    actions: [
      { action: 'view', title: 'View Offer' }
    ]
  })
};

// ===== NOTIFICATION SCHEDULER =====

export class NotificationScheduler {
  private scheduledNotifications: Map<string, NodeJS.Timeout> = new Map();

  public scheduleNotification(
    id: string,
    notification: BettingNotification,
    delay: number
  ): void {
    const timeoutId = setTimeout(() => {
      this.showNotification(notification);
      this.scheduledNotifications.delete(id);
    }, delay);

    this.scheduledNotifications.set(id, timeoutId);
  }

  public cancelNotification(id: string): void {
    const timeoutId = this.scheduledNotifications.get(id);
    if (timeoutId) {
      clearTimeout(timeoutId);
      this.scheduledNotifications.delete(id);
    }
  }

  public cancelAllNotifications(): void {
    this.scheduledNotifications.forEach((timeoutId) => {
      clearTimeout(timeoutId);
    });
    this.scheduledNotifications.clear();
  }

  private async showNotification(notification: BettingNotification): Promise<void> {
    await notificationManager.showLocalNotification(notification.title, {
      body: notification.message,
      icon: '/icons/icon-192x192.png',
      badge: '/icons/badge-72x72.png',
      data: notification.data,
      actions: notification.actions,
      tag: notification.type,
      requireInteraction: true
    });
  }
}

export const notificationScheduler = new NotificationScheduler();

// ===== IN-APP NOTIFICATIONS =====

export interface InAppNotification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
  persistent?: boolean;
  actions?: Array<{
    label: string;
    action: () => void;
    style?: 'primary' | 'secondary';
  }>;
}

export class InAppNotificationManager {
  private notifications: InAppNotification[] = [];
  private listeners: Set<(notifications: InAppNotification[]) => void> = new Set();

  public show(notification: Omit<InAppNotification, 'id'>): string {
    const id = this.generateId();
    const newNotification: InAppNotification = {
      id,
      duration: 5000,
      persistent: false,
      ...notification
    };

    this.notifications.push(newNotification);
    this.notifyListeners();

    if (!newNotification.persistent && newNotification.duration) {
      setTimeout(() => {
        this.remove(id);
      }, newNotification.duration);
    }

    return id;
  }

  public remove(id: string): void {
    this.notifications = this.notifications.filter(n => n.id !== id);
    this.notifyListeners();
  }

  public clear(): void {
    this.notifications = [];
    this.notifyListeners();
  }

  public getNotifications(): InAppNotification[] {
    return [...this.notifications];
  }

  public addListener(callback: (notifications: InAppNotification[]) => void): () => void {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  private notifyListeners(): void {
    this.listeners.forEach(callback => callback(this.getNotifications()));
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }

  // Convenience methods
  public success(title: string, message: string, actions?: InAppNotification['actions']): string {
    return this.show({ type: 'success', title, message, actions });
  }

  public error(title: string, message: string, actions?: InAppNotification['actions']): string {
    return this.show({ type: 'error', title, message, persistent: true, actions });
  }

  public warning(title: string, message: string, actions?: InAppNotification['actions']): string {
    return this.show({ type: 'warning', title, message, actions });
  }

  public info(title: string, message: string, actions?: InAppNotification['actions']): string {
    return this.show({ type: 'info', title, message, actions });
  }
}

export const inAppNotificationManager = new InAppNotificationManager();

// ===== REACT HOOKS =====

// Hook for notification permission
export const useNotificationPermission = () => {
  const [permission, setPermission] = React.useState<NotificationPermission>(
    notificationManager.getPermissionStatus()
  );

  const requestPermission = React.useCallback(async () => {
    const result = await notificationManager.requestPermission();
    setPermission(result);
    return result;
  }, []);

  return { permission, requestPermission };
};

// Hook for in-app notifications
export const useInAppNotifications = () => {
  const [notifications, setNotifications] = React.useState<InAppNotification[]>(
    inAppNotificationManager.getNotifications()
  );

  React.useEffect(() => {
    const unsubscribe = inAppNotificationManager.addListener(setNotifications);
    return unsubscribe;
  }, []);

  return {
    notifications,
    show: inAppNotificationManager.show.bind(inAppNotificationManager),
    remove: inAppNotificationManager.remove.bind(inAppNotificationManager),
    clear: inAppNotificationManager.clear.bind(inAppNotificationManager),
    success: inAppNotificationManager.success.bind(inAppNotificationManager),
    error: inAppNotificationManager.error.bind(inAppNotificationManager),
    warning: inAppNotificationManager.warning.bind(inAppNotificationManager),
    info: inAppNotificationManager.info.bind(inAppNotificationManager)
  };
};

// Hook for push notifications
export const usePushNotifications = (vapidPublicKey?: string) => {
  const [subscription, setSubscription] = React.useState<PushSubscription | null>(null);
  const [isSubscribed, setIsSubscribed] = React.useState(false);

  React.useEffect(() => {
    checkSubscription();
  }, []);

  const checkSubscription = async () => {
    const currentSubscription = await notificationManager.getPushSubscription();
    setSubscription(currentSubscription);
    setIsSubscribed(!!currentSubscription);
  };

  const subscribe = React.useCallback(async () => {
    if (!vapidPublicKey) {
      console.error('VAPID public key not provided');
      return null;
    }

    const newSubscription = await notificationManager.subscribeToPushNotifications(vapidPublicKey);
    setSubscription(newSubscription);
    setIsSubscribed(!!newSubscription);
    return newSubscription;
  }, [vapidPublicKey]);

  const unsubscribe = React.useCallback(async () => {
    const success = await notificationManager.unsubscribeFromPushNotifications();
    if (success) {
      setSubscription(null);
      setIsSubscribed(false);
    }
    return success;
  }, []);

  return {
    subscription,
    isSubscribed,
    subscribe,
    unsubscribe
  };
};

export default {
  notificationManager,
  notificationTemplates,
  notificationScheduler,
  inAppNotificationManager,
  useNotificationPermission,
  useInAppNotifications,
  usePushNotifications
}; 