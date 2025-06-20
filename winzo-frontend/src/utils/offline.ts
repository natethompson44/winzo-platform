// ===================================
// WINZO OFFLINE FUNCTIONALITY
// ===================================

import { timeoutFetch } from './performance';

import React from 'react';

// ===== OFFLINE DETECTION =====

export class OfflineManager {
  private isOnline: boolean = navigator.onLine;
  private listeners: Set<(isOnline: boolean) => void> = new Set();
  private cache: Map<string, { data: any; timestamp: number; ttl: number }> = new Map();

  constructor() {
    this.initializeEventListeners();
  }

  private initializeEventListeners(): void {
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.notifyListeners(true);
      this.syncOfflineData();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      this.notifyListeners(false);
    });
  }

  public getOnlineStatus(): boolean {
    return this.isOnline;
  }

  public addListener(callback: (isOnline: boolean) => void): () => void {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  private notifyListeners(isOnline: boolean): void {
    this.listeners.forEach(callback => callback(isOnline));
  }

  // Cache management
  public setCache(key: string, data: any, ttl: number = 300000): void { // 5 minutes default
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }

  public getCache(key: string): any | null {
    const cached = this.cache.get(key);
    if (!cached) return null;

    if (Date.now() - cached.timestamp > cached.ttl) {
      this.cache.delete(key);
      return null;
    }

    return cached.data;
  }

  public clearCache(): void {
    this.cache.clear();
  }

  // Offline data sync
  private offlineActions: Array<{ action: string; data: any; timestamp: number }> = [];

  public addOfflineAction(action: string, data: any): void {
    this.offlineActions.push({
      action,
      data,
      timestamp: Date.now()
    });
  }

  private async syncOfflineData(): Promise<void> {
    if (!this.isOnline || this.offlineActions.length === 0) return;

    console.log('Syncing offline data...');
    
    const actionsToSync = [...this.offlineActions];
    this.offlineActions = [];

    for (const action of actionsToSync) {
      try {
        await this.processOfflineAction(action);
      } catch (error) {
        console.error('Failed to sync offline action:', error);
        // Re-add failed action to queue
        this.offlineActions.push(action);
      }
    }
  }

  private async processOfflineAction(action: { action: string; data: any; timestamp: number }): Promise<void> {
    // Implement your sync logic here
    console.log('Processing offline action:', action);
    
    // Example: sync bet data
    if (action.action === 'place_bet') {
      // await api.placeBet(action.data);
    }
  }
}

export const offlineManager = new OfflineManager();

// ===== OFFLINE STORAGE =====

export class OfflineStorage {
  private dbName: string = 'winzo-offline';
  private dbVersion: number = 1;
  private db: IDBDatabase | null = null;

  constructor() {
    this.initDB();
  }

  private async initDB(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        // Create stores
        if (!db.objectStoreNames.contains('bets')) {
          db.createObjectStore('bets', { keyPath: 'id' });
        }
        
        if (!db.objectStoreNames.contains('games')) {
          db.createObjectStore('games', { keyPath: 'id' });
        }
        
        if (!db.objectStoreNames.contains('user_data')) {
          db.createObjectStore('user_data', { keyPath: 'key' });
        }
      };
    });
  }

  public async store(storeName: string, data: any): Promise<void> {
    if (!this.db) await this.initDB();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.put(data);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  public async get(storeName: string, key: string): Promise<any> {
    if (!this.db) await this.initDB();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.get(key);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  }

  public async getAll(storeName: string): Promise<any[]> {
    if (!this.db) await this.initDB();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.getAll();
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  }

  public async delete(storeName: string, key: string): Promise<void> {
    if (!this.db) await this.initDB();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.delete(key);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  public async clear(storeName: string): Promise<void> {
    if (!this.db) await this.initDB();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.clear();
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }
}

export const offlineStorage = new OfflineStorage();

// ===== OFFLINE-FIRST API =====

interface OfflineApiOptions {
  cacheFirst?: boolean;
  cacheTTL?: number;
  retryAttempts?: number;
  retryDelay?: number;
}

export class OfflineApi {
  private baseUrl: string;
  private defaultOptions: OfflineApiOptions;

  constructor(baseUrl: string, options: OfflineApiOptions = {}) {
    this.baseUrl = baseUrl;
    this.defaultOptions = {
      cacheFirst: true,
      cacheTTL: 300000, // 5 minutes
      retryAttempts: 3,
      retryDelay: 1000,
      ...options
    };
  }

  public async get(endpoint: string, options: OfflineApiOptions = {}): Promise<any> {
    const opts = { ...this.defaultOptions, ...options };
    const url = `${this.baseUrl}${endpoint}`;
    const cacheKey = `api:${url}`;

    // Try cache first if enabled
    if (opts.cacheFirst) {
      const cachedData = offlineManager.getCache(cacheKey);
      if (cachedData) {
        return cachedData;
      }
    }

    // If offline, return cached data
    if (!offlineManager.getOnlineStatus()) {
      const cachedData = offlineManager.getCache(cacheKey);
      if (cachedData) {
        return cachedData;
      }
      throw new Error('No cached data available offline');
    }

    try {
      const response = await this.fetchWithRetry(url, {}, opts);
      const data = await response.json();
      
      // Cache the response
      offlineManager.setCache(cacheKey, data, opts.cacheTTL);
      
      return data;
    } catch (error) {
      // Fallback to cache on error
      const cachedData = offlineManager.getCache(cacheKey);
      if (cachedData) {
        return cachedData;
      }
      throw error;
    }
  }

  public async post(endpoint: string, body: any, options: OfflineApiOptions = {}): Promise<any> {
    const opts = { ...this.defaultOptions, ...options };
    const url = `${this.baseUrl}${endpoint}`;

    // If offline, queue the action
    if (!offlineManager.getOnlineStatus()) {
      offlineManager.addOfflineAction('post', { endpoint, body });
      return { success: true, queued: true };
    }

    try {
      const response = await this.fetchWithRetry(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      }, opts);
      
      return await response.json();
    } catch (error) {
      // Queue for later if request fails
      offlineManager.addOfflineAction('post', { endpoint, body });
      throw error;
    }
  }

  private async fetchWithRetry(
    url: string, 
    init: RequestInit, 
    options: OfflineApiOptions
  ): Promise<Response> {
    let lastError: Error;
    
    for (let i = 0; i < options.retryAttempts!; i++) {
      try {
        const response = await timeoutFetch(url, init);
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        return response;
      } catch (error) {
        lastError = error as Error;
        
        if (i < options.retryAttempts! - 1) {
          await new Promise(resolve => setTimeout(resolve, options.retryDelay! * (i + 1)));
        }
      }
    }
    
    throw lastError!;
  }
}

// ===== SERVICE WORKER MANAGEMENT =====

export class ServiceWorkerManager {
  private registration: ServiceWorkerRegistration | null = null;

  public async register(swUrl: string = '/sw.js'): Promise<ServiceWorkerRegistration | null> {
    if (!('serviceWorker' in navigator)) {
      console.warn('Service Worker not supported');
      return null;
    }

    try {
      this.registration = await navigator.serviceWorker.register(swUrl);
      
      this.registration.addEventListener('updatefound', () => {
        const newWorker = this.registration!.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              this.showUpdateNotification();
            }
          });
        }
      });

      return this.registration;
    } catch (error) {
      console.error('Service Worker registration failed:', error);
      return null;
    }
  }

  public async unregister(): Promise<boolean> {
    if (this.registration) {
      return await this.registration.unregister();
    }
    return false;
  }

  private showUpdateNotification(): void {
    // Show notification that app update is available
    const event = new CustomEvent('sw-update-available');
    window.dispatchEvent(event);
  }

  public async updateServiceWorker(): Promise<void> {
    if (this.registration && this.registration.waiting) {
      this.registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      window.location.reload();
    }
  }
}

export const serviceWorkerManager = new ServiceWorkerManager();

// ===== BACKGROUND SYNC =====

export class BackgroundSync {
  private syncQueue: Array<{ id: string; data: any; tag: string }> = [];

  public async scheduleSync(tag: string, data: any): Promise<void> {
    const id = this.generateId();
    
    this.syncQueue.push({ id, data, tag });
    
    // If online, process immediately
    if (offlineManager.getOnlineStatus()) {
      await this.processSync(tag);
    } else {
      // Register for background sync if supported
      if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
        const registration = await navigator.serviceWorker.ready;
        // @ts-ignore - sync is not in types but exists in browsers that support it
        await registration.sync.register(tag);
      }
    }
  }

  public async processSync(tag: string): Promise<void> {
    const itemsToSync = this.syncQueue.filter(item => item.tag === tag);
    
    for (const item of itemsToSync) {
      try {
        await this.processSyncItem(item);
        this.syncQueue = this.syncQueue.filter(queued => queued.id !== item.id);
      } catch (error) {
        console.error('Background sync failed:', error);
      }
    }
  }

  private async processSyncItem(item: { id: string; data: any; tag: string }): Promise<void> {
    // Implement your sync logic based on tag
    switch (item.tag) {
      case 'bet-sync':
        // Sync bet data
        break;
      case 'user-sync':
        // Sync user data
        break;
      default:
        console.warn('Unknown sync tag:', item.tag);
    }
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }
}

export const backgroundSync = new BackgroundSync();

// ===== REACT HOOKS =====

// Hook for online status
export const useOnlineStatus = () => {
  const [isOnline, setIsOnline] = React.useState(offlineManager.getOnlineStatus());

  React.useEffect(() => {
    const unsubscribe = offlineManager.addListener(setIsOnline);
    return unsubscribe;
  }, []);

  return isOnline;
};

// Hook for offline storage
export const useOfflineStorage = (storeName: string) => {
  const store = React.useCallback(async (data: any) => {
    return await offlineStorage.store(storeName, data);
  }, [storeName]);

  const get = React.useCallback(async (key: string) => {
    return await offlineStorage.get(storeName, key);
  }, [storeName]);

  const getAll = React.useCallback(async () => {
    return await offlineStorage.getAll(storeName);
  }, [storeName]);

  const remove = React.useCallback(async (key: string) => {
    return await offlineStorage.delete(storeName, key);
  }, [storeName]);

  const clear = React.useCallback(async () => {
    return await offlineStorage.clear(storeName);
  }, [storeName]);

  return { store, get, getAll, remove, clear };
};

// Hook for offline API
export const useOfflineApi = (baseUrl: string, options?: OfflineApiOptions) => {
  const api = React.useMemo(() => new OfflineApi(baseUrl, options), [baseUrl, options]);
  
  return api;
};

export default {
  offlineManager,
  offlineStorage,
  OfflineApi,
  serviceWorkerManager,
  backgroundSync,
  useOnlineStatus,
  useOfflineStorage,
  useOfflineApi
}; 