import { SocketMessage, VibeSession, WorkState, PatternType } from '../types';

type MessageHandler = (message: any) => void;

export class SocketService {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private messageHandlers = new Map<string, MessageHandler[]>();
  private connectionId: string | null = null;
  private isConnecting = false;

  constructor(private url: string = 'ws://localhost:3003') {}

  // Robust connection with automatic retry
  async connect(): Promise<void> {
    if (this.isConnecting) return;
    this.isConnecting = true;

    try {
      this.ws = new WebSocket(this.url);
      
      this.ws.onopen = () => {
        console.log('WebSocket connected');
        this.reconnectAttempts = 0;
        this.isConnecting = false;
        this.emit('connected', null);
      };

      this.ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          this.handleMessage(message);
        } catch (error) {
          console.error('Failed to parse message:', error);
        }
      };

      this.ws.onclose = () => {
        console.log('WebSocket disconnected');
        this.ws = null;
        this.isConnecting = false;
        this.emit('disconnected', null);
        this.attemptReconnect();
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        this.emit('error', error);
      };

    } catch (error) {
      console.error('Failed to connect:', error);
      this.isConnecting = false;
      this.attemptReconnect();
    }
  }

  // Automatic reconnection with exponential backoff
  private attemptReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached');
      return;
    }

    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
    
    console.log(`Attempting reconnect ${this.reconnectAttempts}/${this.maxReconnectAttempts} in ${delay}ms`);
    
    setTimeout(() => {
      this.connect();
    }, delay);
  }

  // Message handling with type safety
  private handleMessage(message: any): void {
    const { type, payload } = message;
    
    // Handle special connection messages
    if (type === 'connection_established') {
      this.connectionId = payload.connectionId;
    }
    
    this.emit(type, payload);
  }

  // Send message with connection verification
  private sendMessage(message: SocketMessage): boolean {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      console.warn('WebSocket not connected, message queued or dropped');
      return false;
    }

    try {
      this.ws.send(JSON.stringify(message));
      return true;
    } catch (error) {
      console.error('Failed to send message:', error);
      return false;
    }
  }

  // Public API methods
  
  startPatternSession(patternType: PatternType, taskCount: number, description?: string): void {
    this.sendMessage({
      type: 'pattern_start',
      payload: { type: patternType, taskCount, description },
      timestamp: Date.now()
    });
  }

  updateTaskProgress(sessionId: string, taskId: string, progress: number): void {
    this.sendMessage({
      type: 'task_progress',
      payload: { sessionId, taskId, progress },
      timestamp: Date.now()
    });
  }

  completeTask(sessionId: string, taskId: string, description?: string): void {
    this.sendMessage({
      type: 'task_complete',
      payload: { sessionId, taskId, description },
      timestamp: Date.now()
    });
  }

  updateWorkStatus(status: WorkState['status'], context?: string, intensity?: number): void {
    this.sendMessage({
      type: 'status_update',
      payload: { status, context, intensity },
      timestamp: Date.now()
    });
  }

  // Connection health check
  ping(): void {
    this.sendMessage({
      type: 'ping',
      payload: {},
      timestamp: Date.now()
    });
  }

  // Event system for handling server messages
  on(eventType: string, handler: MessageHandler): void {
    if (!this.messageHandlers.has(eventType)) {
      this.messageHandlers.set(eventType, []);
    }
    this.messageHandlers.get(eventType)!.push(handler);
  }

  off(eventType: string, handler: MessageHandler): void {
    const handlers = this.messageHandlers.get(eventType);
    if (handlers) {
      const index = handlers.indexOf(handler);
      if (index > -1) {
        handlers.splice(index, 1);
      }
    }
  }

  private emit(eventType: string, payload: any): void {
    const handlers = this.messageHandlers.get(eventType);
    if (handlers) {
      handlers.forEach(handler => {
        try {
          handler(payload);
        } catch (error) {
          console.error(`Error in message handler for ${eventType}:`, error);
        }
      });
    }
  }

  // Connection status
  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }

  getConnectionId(): string | null {
    return this.connectionId;
  }

  // Cleanup
  disconnect(): void {
    this.reconnectAttempts = this.maxReconnectAttempts; // Prevent reconnection
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
}

// Create singleton instance
export const socketService = new SocketService();