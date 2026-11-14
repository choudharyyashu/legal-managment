import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import { config } from './config/env.js';
import { testDirectMySqlConnection, testPrismaConnection } from './config/database.js';
import { logger } from './utils/logger.js';
import { authRouter } from './modules/auth/auth.routes.js';
import { userRouter } from './modules/users/user.routes.js';
import { clientRouter } from './modules/clients/client.routes.js';
import { matterRouter } from './modules/matters/matter.routes.js';
import { intakeRouter } from './modules/intakes/intake.routes.js';
import { taskRouter } from './modules/tasks/task.routes.js';
import { calendarRouter } from './modules/calendar/calendar.routes.js';
import { documentRouter } from './modules/documents/document.routes.js';
import { timeRouter } from './modules/time/time.routes.js';
import { expenseRouter } from './modules/expenses/expense.routes.js';
import { billingRouter } from './modules/billing/billing.routes.js';
import { trustRouter } from './modules/trust/trust.routes.js';
import { ledgerRouter } from './modules/ledger/ledger.routes.js';
import { reconciliationRouter } from './modules/reconciliation/reconciliation.routes.js';
import { reportRouter } from './modules/reports/report.routes.js';
import { templateRouter } from './modules/templates/template.routes.js';
import { piRouter } from './modules/personal-injury/pi.routes.js';
import { notFoundHandler } from './middleware/notFound.js';
import { errorHandler } from './middleware/errorHandler.js';

// Global BigInt JSON serialization: preserves exact integer precision without float truncation
// Values up to MAX_SAFE_INTEGER (9,007,199,254,740,991, ~9PB) serialize to Number for standard JSON consumers;
// larger values serialize to string to prevent IEEE 754 precision loss.
(BigInt.prototype as any).toJSON = function (): number | string {
  return this <= BigInt(Number.MAX_SAFE_INTEGER) && this >= BigInt(Number.MIN_SAFE_INTEGER)
    ? Number(this)
    : this.toString();
};

export const app = express();

// Security and standard middlewares
app.use(helmet());
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. mobile apps, curl, server-to-server)
      if (!origin) return callback(null, true);
      const normalizedOrigin = origin.replace(/\/+$/, '');
      const isAllowed =
        config.allowedOrigins.includes(normalizedOrigin) ||
        config.allowedOrigins.includes(origin) ||
        normalizedOrigin === 'https://legal-managment.netlify.app' ||
        (config.nodeEnv === 'development' &&
          (origin.startsWith('http://localhost:') || origin.startsWith('http://127.0.0.1:')));
      if (isAllowed) {
        return callback(null, true);
      }
      // Clean CORS denial: omits Access-Control-Allow-Origin header without throwing unhandled HTTP 500 exception
      return callback(null, false);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  })
);
app.use(cookieParser());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Global Rate Limiter: max 300 requests per 15 minutes per IP
// Skips root / and /api/v1/health to ensure system monitoring is never throttled
const globalApiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => req.path === '/' || req.path === '/api/v1/health',
  message: {
    success: false,
    error: {
      code: 'TOO_MANY_REQUESTS',
      message: 'Too many requests from this IP address. Please try again after 15 minutes.',
    },
  },
});
app.use(globalApiLimiter);

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
  const startTime = Date.now();
  const dbStatus = await testDirectMySqlConnection();
  const prismaStatus = await testPrismaConnection();
  const dbLatencyMs = Date.now() - startTime;

  const isHealthy = dbStatus.connected || prismaStatus.connected;
  const memoryUsage = process.memoryUsage();

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
      latencyMs: dbLatencyMs,
      version: dbStatus.version || null,
      error: dbStatus.error || prismaStatus.error || null,
    },
    server: {
      nodeEnv: config.nodeEnv,
      port: config.port,
      uptimeSeconds: Math.floor(process.uptime()),
      memoryMb: {
        rss: Math.round((memoryUsage.rss / 1024 / 1024) * 100) / 100,
        heapUsed: Math.round((memoryUsage.heapUsed / 1024 / 1024) * 100) / 100,
        heapTotal: Math.round((memoryUsage.heapTotal / 1024 / 1024) * 100) / 100,
      },
    },
  });
});

// Primary Domain API Routes
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/clients', clientRouter);
app.use('/api/v1/matters', matterRouter);
app.use('/matters', matterRouter);
app.use('/api/v1/intakes', intakeRouter);
app.use('/api/v1/tasks', taskRouter);
app.use('/api/v1/calendar', calendarRouter);
app.use('/api/v1/documents', documentRouter);
app.use('/documents', documentRouter);
app.use('/api/v1/time', timeRouter);
app.use('/api/v1/expenses', expenseRouter);
app.use('/api/v1/billing', billingRouter);
app.use('/api/v1/trust', trustRouter);
app.use('/api/v1/ledger', ledgerRouter);
app.use('/api/v1/reconciliation', reconciliationRouter);
app.use('/api/v1/reports', reportRouter);
app.use('/api/v1/templates', templateRouter);
app.use('/api/v1/pi', piRouter);

// 404 Catch-All for unmatched API routes
app.use(notFoundHandler);

// Centralized Error Handling Middleware
app.use(errorHandler);
