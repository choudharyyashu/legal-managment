/**
 * HEUGLY & BLUDWORTH Legal Practice Management SaaS
 * In-Process Typed Event Bus for Document Automation Triggers
 * Provides non-blocking, asynchronous event dispatch across practice area workflows.
 */

import { EventEmitter } from 'events';
import { DOCUMENT_EVENT, DocumentEventType } from './event.types.js';
import { AuthenticatedUser } from '../../auth/auth.types.js';

export interface DomainEventContext {
  user: AuthenticatedUser;
  ipAddress?: string;
  userAgent?: string;
}

export type DomainEventHandler<T = any> = (
  payload: T,
  context: DomainEventContext
) => Promise<any> | any;

class DocumentEventBusImpl {
  private emitter = new EventEmitter();

  constructor() {
    // Prevent unhandled error crashes from crashing the process
    this.emitter.on('error', (err) => {
      console.error('[DocumentEventBus] Unhandled bus error:', err);
    });
    this.emitter.setMaxListeners(50);
  }

  /**
   * Register a subscriber for a domain event.
   */
  subscribe<T = any>(event: DocumentEventType, handler: DomainEventHandler<T>): void {
    this.emitter.on(event, async (payload: T, context: DomainEventContext) => {
      try {
        await handler(payload, context);
      } catch (err: any) {
        console.error(`[DocumentEventBus] Error in handler for event '${event}':`, err?.message || err);
      }
    });
  }

  /**
   * Dispatches an event asynchronously to all registered subscribers.
   * Execution is non-blocking to protect the primary matter/record transaction.
   */
  emitAsync<T = any>(
    event: DocumentEventType,
    payload: T,
    context: DomainEventContext
  ): void {
    setImmediate(async () => {
      try {
        this.emitter.emit(event, payload, context);
      } catch (err) {
        console.error(`[DocumentEventBus] Failed to emit event '${event}':`, err);
      }
    });
  }

  /**
   * Synchronous dispatch with await for test suites or synchronous API responses.
   */
  async dispatchDirect<T = any, R = any>(
    event: DocumentEventType,
    payload: T,
    context: DomainEventContext,
    directHandler: (payload: T, context: DomainEventContext) => Promise<R>
  ): Promise<R> {
    return await directHandler(payload, context);
  }
}

export const DocumentEventBus = new DocumentEventBusImpl();

