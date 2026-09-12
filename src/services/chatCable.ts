// src/services/chatCable.ts

// Polyfill for @rails/actioncable DOM dependencies in React Native
const noop = () => {};
if (typeof global !== 'undefined') {
  global.addEventListener = global.addEventListener || noop;
  global.removeEventListener = global.removeEventListener || noop;
}
if (typeof window !== 'undefined') {
  window.addEventListener = window.addEventListener || noop;
  window.removeEventListener = window.removeEventListener || noop;
}
if (typeof document !== 'undefined') {
  document.addEventListener = document.addEventListener || noop;
  document.removeEventListener = document.removeEventListener || noop;
}

import { createConsumer } from '@rails/actioncable';
import { getAuthToken } from '../api/client';

const WS_BASE = 'wss://uplift-backend.pixoatic.com/cable';

type MessageCallback = (message: any) => void;

class ChatCableService {
  private consumer: any = null;
  private subscription: any = null;
  private onMessageCallback: MessageCallback | null = null;

  /**
   * Connect to Action Cable and subscribe to HelpRequestChatChannel.
   */
  connect(helpRequestId: number, assignmentId: number) {
    this.disconnect(); // Clean up any previous connection

    const token = getAuthToken();
    if (!token) {
      console.warn('[ChatCable] No auth token available');
      return;
    }

    const wsUrl = `${WS_BASE}?token=${token}`;
    this.consumer = createConsumer(wsUrl);

    this.subscription = this.consumer.subscriptions.create(
      {
        channel: 'HelpRequestChatChannel',
        help_request_id: helpRequestId,
        assignment_id: assignmentId,
      },
      {
        connected: () => {
          console.log('[ChatCable] Connected to HelpRequestChatChannel');
        },
        disconnected: () => {
          console.log('[ChatCable] Disconnected from HelpRequestChatChannel');
        },
        received: (data: any) => {
          console.log('[ChatCable] Received message:', data);
          if (this.onMessageCallback) {
            this.onMessageCallback(data);
          }
        },
        rejected: () => {
          console.warn('[ChatCable] Subscription rejected');
        },
      }
    );
  }

  /**
   * Register a callback for incoming messages.
   */
  onMessage(callback: MessageCallback) {
    this.onMessageCallback = callback;
  }

  /**
   * Disconnect from Action Cable.
   */
  disconnect() {
    if (this.subscription) {
      this.subscription.unsubscribe();
      this.subscription = null;
    }
    if (this.consumer) {
      this.consumer.disconnect();
      this.consumer = null;
    }
    this.onMessageCallback = null;
  }
}

// Export a singleton instance
export const chatCable = new ChatCableService();
