import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { createApp } from './app';
import { env } from './config/env.config';
import { connectDatabase, disconnectDatabase } from './config/database';
import { TrackingGateway } from './modules/tracking/tracking.gateway';
import { logger } from './common/utils/logger';

async function bootstrap() {
  const app = createApp();

  // Create HTTP server wrapping Express app
  const httpServer = http.createServer(app);

  // Initialize Socket.io Server
  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  });

  // Attach Tracking WebSocket Gateway
  TrackingGateway.initialize(io);

  // Connect to Database
  await connectDatabase();

  const server = httpServer.listen(env.PORT, '0.0.0.0', () => {
    logger.info(`=================================================`);
    logger.info(`🚀 ModarApp Monolithic Server running on PORT: ${env.PORT}`);
    logger.info(`🌐 Environment: ${env.NODE_ENV}`);
    logger.info(`🔗 Base URL: ${env.APP_URL}${env.API_PREFIX}`);
    logger.info(`⚡ Socket.io Real-Time Tracking Server initialized`);
    logger.info(`=================================================`);
  });

  // Graceful Shutdown
  const handleShutdown = async (signal: string) => {
    logger.info(`Received ${signal}. Shutting down gracefully...`);

    io.close(() => {
      logger.info('Socket.io connections closed.');
    });

    server.close(async () => {
      logger.info('HTTP server closed.');
      await disconnectDatabase();
      process.exit(0);
    });

    // Force exit after 10 seconds if hanging
    setTimeout(() => {
      logger.error('Forcefully terminating process after timeout.');
      process.exit(1);
    }, 10000);
  };

  process.on('SIGTERM', () => handleShutdown('SIGTERM'));
  process.on('SIGINT', () => handleShutdown('SIGINT'));

  process.on('unhandledRejection', (reason, promise) => {
    logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  });

  process.on('uncaughtException', (error) => {
    logger.error('Uncaught Exception thrown:', error);
  });
}

bootstrap().catch((error) => {
  logger.error('Failed to start server:', error);
  process.exit(1);
});
