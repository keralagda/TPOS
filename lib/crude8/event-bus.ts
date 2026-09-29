/**
 * CRUDE8: EVENT BUS & REAL-TIME DISPATCHER
 * Universal reactive pub/sub event pipeline routing entity lifecycle events
 * to Sync8, Audit, and connected operational modules.
 */

import { CRUDBroadcastEvent } from './types';

type EventHandler = (event: CRUDBroadcastEvent) => void | Promise<void>;

export class CRUDE8EventBus {
  private static subscribers: Map<string, Set<EventHandler>> = new Map();
  private static universalSubscribers: Set<EventHandler> = new Set();
  private static eventHistory: CRUDBroadcastEvent[] = [];
  private static readonly MAX_HISTORY = 200;

  /**
   * Subscribe to a specific entity or action event (e.g. 'BOOKING_CONFIRMED' or '*')
   */
  static subscribe(eventPattern: string, handler: EventHandler): () => void {
    if (eventPattern === '*') {
      this.universalSubscribers.add(handler);
      return () => this.universalSubscribers.delete(handler);
    }

    if (!this.subscribers.has(eventPattern)) {
      this.subscribers.set(eventPattern, new Set());
    }
    this.subscribers.get(eventPattern)!.add(handler);

    return () => {
      this.subscribers.get(eventPattern)?.delete(handler);
    };
  }

  /**
   * Emit an event across the event bus
   */
  static emit(event: CRUDBroadcastEvent): void {
    // Record into history
    this.eventHistory.unshift(event);
    if (this.eventHistory.length > this.MAX_HISTORY) {
      this.eventHistory.pop();
    }

    // Notify specific event listeners
    const specific = this.subscribers.get(event.eventId);
    if (specific) {
      specific.forEach(handler => {
        try {
          handler(event);
        } catch (err) {
          console.error(`[CRUDE8EventBus] Error in handler for ${event.eventId}:`, err);
        }
      });
    }

    // Notify action listeners e.g. "Customer:CREATE"
    const actionKey = `${event.entity}:${event.action}`;
    const actionListeners = this.subscribers.get(actionKey);
    if (actionListeners) {
      actionListeners.forEach(handler => {
        try {
          handler(event);
        } catch (err) {
          console.error(`[CRUDE8EventBus] Error in handler for ${actionKey}:`, err);
        }
      });
    }

    // Notify universal listeners
    this.universalSubscribers.forEach(handler => {
      try {
        handler(event);
      } catch (err) {
        console.error(`[CRUDE8EventBus] Error in universal handler:`, err);
      }
    });
  }

  /**
   * Query event history for live telemetry
   */
  static getEventHistory(limit: number = 50): CRUDBroadcastEvent[] {
    return this.eventHistory.slice(0, limit);
  }

  /**
   * Clear event history (for testing)
   */
  static clear(): void {
    this.eventHistory = [];
    this.subscribers.clear();
    this.universalSubscribers.clear();
  }
}
