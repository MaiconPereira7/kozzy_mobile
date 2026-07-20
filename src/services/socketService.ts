import { io, Socket } from 'socket.io-client';

class SocketService {
  private socket: Socket | null = null;

  connect(backendUrl: string, token?: string): void {
    if (this.socket?.connected) return;
    const socketUrl = backendUrl.replace(/\/api\/?$/, '');

    this.socket = io(socketUrl, {
      transports: ['websocket', 'polling'],
      autoConnect: true,
      auth: token ? { token } : undefined,
    });

    this.socket.on('connect', () =>
      console.log('[Socket] Conectado:', this.socket?.id)
    );
    this.socket.on('disconnect', (reason) =>
      console.log('[Socket] Desconectado:', reason)
    );
    this.socket.on('connect_error', (err) =>
      console.warn('[Socket] Erro de conexão:', err.message)
    );
  }

  joinUserRoom(userId: string): void {
    this.socket?.emit('join:user', userId);
  }

  on<T = any>(event: string, callback: (data: T) => void): void {
    this.socket?.on(event, callback);
  }

  off(event: string, callback?: (...args: any[]) => void): void {
    this.socket?.off(event, callback);
  }

  emit(event: string, data?: any): void {
    this.socket?.emit(event, data);
  }

  disconnect(): void {
    this.socket?.disconnect();
    this.socket = null;
  }

  isConnected(): boolean {
    return this.socket?.connected ?? false;
  }
}

export const socketService = new SocketService();
