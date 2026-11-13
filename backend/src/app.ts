import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { config } from './config/env.js';
import { testDirectMySqlConnection, testPrismaConnection } from './config/database.js';
import { logger } from './utils/logger.js';
import { authRouter } from './modules/auth/auth.routes.js';
import { userRouter } from './modules/users/user.routes.js';
import { notFoundHandler } from './middleware/notFound.js';
import { errorHandler } from './middleware/errorHandler.js';

export const app = express();

// Security and standard middlewares
app.use(helmet());
app.use(
  cors({
    origin: config.clientOrigin,
    credentials: true,
  })
);
app.use(cookieParser());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Lightweight request logging
app.use((req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info(`${req.method} ${req.originalUrl || req.url} ${res.statusCode} - ${duration}ms`, {
      method: req.method,
      url: req.originalUrl || req.url,
      statusCode: res.statusCode,
      durationMs: duration,
      ip: req.ip,
    });
  });
  next();
});

// Root welcome route
app.get('/', (req: Request, res: Response) => {
  res.json({
    success: true,
    data: {
      name: 'HEUGLY & BLUDWORTH Legal Practice Management API',
      version: '1.0.0',
      jurisdiction: 'State of Utah',
      documentation: '/backend-docs',
      healthCheck: '/api/v1/health',
    },
  });
});

// Health Check Endpoint
app.get('/api/v1/health', async (req: Request, res: Response) => {
  const dbStatus = await testDirectMySqlConnection();
  const prismaStatus = await testPrismaConnection();

  const isHealthy = dbStatus.connected || prismaStatus.connected;

  res.status(isHealthy ? 200 : 503).json({
    success: isHealthy,
    status: isHealthy ? 'healthy' : 'unhealthy',
    timestamp: new Date().toISOString(),
    firm: 'Heugly & Bludworth, Attorneys at Law',
    database: {
      provider: 'mysql',
      target: config.dbName,
      directConnection: dbStatus.connected ? 'connected' : 'failed',
      prismaConnection: prismaStatus.connected ? 'connected' : 'pending_or_failed',
      version: dbStatus.version || null,
      error: dbStatus.error || prismaStatus.error || null,
    },
    server: {
      nodeEnv: config.nodeEnv,
      port: config.port,
      uptimeSeconds: Math.floor(process.uptime()),
    },
  });
});

// Primary Domain API Routes
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/users', userRouter);

// 404 Catch-All for unmatched API routes
app.use(notFoundHandler);

// Centralized Error Handling Middleware
app.use(errorHandler);
