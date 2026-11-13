import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { AuthController } from './auth.controller.js';
import { validateRequest } from '../../middleware/validate.js';
import { requireAuth } from '../../middleware/auth.js';
import {
  loginSchema,
  refreshTokenSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from './auth.validation.js';

export const authRouter = Router();

// Strict login rate limiter: max 10 attempts per 15 minutes per IP
const loginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 15,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: 'TOO_MANY_REQUESTS',
      message: 'Too many authentication attempts from this IP address. Please try again after 15 minutes.',
    },
  },
});

// Password reset request limiter: max 5 requests per hour
const forgotPasswordLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: 'TOO_MANY_REQUESTS',
      message: 'Too many password reset requests from this IP. Please try again later.',
    },
  },
});

// Authentication Endpoints
authRouter.post('/login', loginRateLimiter, validateRequest({ body: loginSchema }), AuthController.login);
authRouter.post('/refresh', validateRequest({ body: refreshTokenSchema }), AuthController.refresh);
authRouter.post('/logout', AuthController.logout);
authRouter.get('/me', requireAuth, AuthController.me);
authRouter.post(
  '/forgot-password',
  forgotPasswordLimiter,
  validateRequest({ body: forgotPasswordSchema }),
  AuthController.forgotPassword
);
authRouter.post('/reset-password', validateRequest({ body: resetPasswordSchema }), AuthController.resetPassword);

