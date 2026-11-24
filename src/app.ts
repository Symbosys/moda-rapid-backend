import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { env } from './config/env.config';
import { globalRateLimiter } from './common/middlewares/rate-limiter.middleware';
import { errorHandler } from './common/errors/error-handler';
import { NotFoundError } from './common/errors/app-error';
import { apiRouter } from './routes';

export function createApp(): Application {
  const app = express();

  // Security & Request Parsing Middlewares
  app.use(helmet());
  app.use(
    cors({
      origin: '*',
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    })
  );
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // HTTP Request Logging
  app.use(morgan(env.NODE_ENV === 'production' ? 'combined' : 'dev'));

  // Rate Limiting
  app.use(globalRateLimiter);

  // Root Welcome Route
  app.get('/', (req: Request, res: Response) => {
    res.json({
      success: true,
      service: 'ModarApp / StyleExpress Monolithic Backend API',
      version: '1.0.0',
      documentation: `${env.APP_URL}${env.API_PREFIX}/health`,
    });
  });

  // Mount API Versions (/v1)
  app.use(env.API_PREFIX, apiRouter);

  // 404 Route Handler
  app.use((req: Request) => {
    throw new NotFoundError(`Endpoint not found: [${req.method}] ${req.originalUrl}`);
  });

  // Global Error Handler
  app.use(errorHandler);

  return app;
}
