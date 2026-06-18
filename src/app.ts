import cors from 'cors';
import cookieParser from 'cookie-parser';
import express, { Request, Response } from 'express';
import helmet from 'helmet';

import globalErrorHandler from './app/middlewares/globalErrorHandler';
import notFoundRoute from './app/middlewares/notFoundRoute';
import { PaymentController } from './app/modules/payment/payment.controller';
import router from './routes';
import { Morgan } from './shared/morgen';
import { globalLimiter } from './util/limiter';

const app = express();

// Security
app.disable('x-powered-by');
app.set('trust proxy', 1);

app.use(
  helmet({
    crossOriginEmbedderPolicy: false,
    contentSecurityPolicy: false,
  }),
);

// Logging
app.use(Morgan.successHandler);
app.use(Morgan.errorHandler);

// Rate Limiting
// app.use(limiter);
app.use(globalLimiter);

// CORS
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  'https://test.joinjurnee.com',
  'https://joinjurnee.com',
  'https://dashboard.joinjurnee.com',
];

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  }),
);

// Cookies
app.use(cookieParser());

// Stripe Webhook
app.post(
  '/webhook',
  express.raw({ type: 'application/json' }),
  PaymentController.paymentStripeWebhookController,
);

// Body Parser
app.use(
  express.json({
    limit: '1mb',
  }),
);

app.use(
  express.urlencoded({
    extended: true,
    limit: '1mb',
  }),
);

// Static Files
app.use('/uploads', express.static('uploads'));

// API Routes
app.use('/api/v1', router);

// Health Check
app.get('/', (_req: Request, res: Response) => {
  res
    .status(200)
    .send(
      '<h1 style="text-align:center;color:#A55FEF;font-family:Verdana;">Jurnee API Running 🚀</h1>',
    );
});

// Error Handler
app.use(globalErrorHandler);

// 404 Handler
app.use(notFoundRoute);

export default app;
