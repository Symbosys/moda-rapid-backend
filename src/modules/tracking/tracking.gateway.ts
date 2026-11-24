import { Server as SocketIOServer, Socket } from 'socket.io';
import { logger } from '../../common/utils/logger';

export class TrackingGateway {
  private static io: SocketIOServer | null = null;

  static initialize(ioInstance: SocketIOServer): void {
    this.io = ioInstance;

    this.io.on('connection', (socket: Socket) => {
      logger.info(`WebSocket Client connected: ${socket.id}`);

      // Client joins an order room to receive real-time updates
      socket.on('join_order_tracking', (data: { orderId: string }) => {
        if (data && data.orderId) {
          const room = `order:${data.orderId}`;
          socket.join(room);
          logger.info(`Socket ${socket.id} joined room ${room}`);
          socket.emit('tracking_joined', { room, connected: true });
        }
      });

      socket.on('disconnect', () => {
        logger.info(`WebSocket Client disconnected: ${socket.id}`);
      });
    });
  }

  static emitOrderStatusUpdate(orderId: string, status: string, stepIndex: number): void {
    if (!this.io) return;
    const room = `order:${orderId}`;
    this.io.to(room).emit('order:status_update', {
      orderId,
      status,
      stepIndex,
      timestamp: new Date().toISOString(),
    });
  }

  static emitRiderLocation(orderId: string, latitude: number, longitude: number, bearing = 0): void {
    if (!this.io) return;
    const room = `order:${orderId}`;
    this.io.to(room).emit('partner:location_update', {
      orderId,
      latitude,
      longitude,
      bearing,
      timestamp: new Date().toISOString(),
    });
  }
}
