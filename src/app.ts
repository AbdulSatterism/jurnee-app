import cors from 'cors';
import cookieParser from 'cookie-parser';
import express, { Request, Response } from 'express';
import helmet from 'helmet';

import globalErrorHandler from './app/middlewares/globalErrorHandler';
import notFoundRoute from './app/middlewares/notFoundRoute';
import { PaymentController } from './app/modules/payment/payment.controller';
import router from './routes';
import { Morgan } from './shared/morgen';
import { limiter } from './util/limiter';

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
app.use(limiter);

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

// import cors from 'cors';
// import express, { Request, Response } from 'express';
// import globalErrorHandler from './app/middlewares/globalErrorHandler';
// import router from './routes';
// import { Morgan } from './shared/morgen';
// import notFoundRoute from './app/middlewares/notFoundRoute';
// import { PaymentController } from './app/modules/payment/payment.controller';
// import cookieParser from 'cookie-parser';
// import helmet from 'helmet';
// import { limiter } from './util/limiter';

// const app = express();

// //morgan
// app.use(Morgan.successHandler);
// app.use(Morgan.errorHandler);

// app.use(
//   helmet({
//     crossOriginEmbedderPolicy: false,
//     contentSecurityPolicy: false,
//   }),
// );

// app.use(limiter);

// app.use(
//   express.json({
//     limit: '1mb',
//   }),
// );

// app.use(
//   express.urlencoded({
//     extended: true,
//     limit: '1mb',
//   }),
// );

// app.disable('x-powered-by');

// //body parser
// // app.use(
// //   cors({
// //     origin: [
// //       '*',
// //       'http://localhost:3000',
// //       'http://localhost:3001',
// //       'https://test.joinjurnee.com',
// //       'https://joinjurnee.com',
// //       'https://dashboard.joinjurnee.com',
// //     ],
// //     credentials: true,
// //   }),
// // );

// const allowedOrigins = [
//   'http://localhost:3000',
//   'http://localhost:3001',
//   'https://test.joinjurnee.com',
//   'https://joinjurnee.com',
//   'https://dashboard.joinjurnee.com',
// ];

// app.use(
//   cors({
//     origin(origin, callback) {
//       if (!origin || allowedOrigins.includes(origin)) {
//         callback(null, true);
//       } else {
//         callback(new Error('Not allowed by CORS'));
//       }
//     },
//     credentials: true,
//   }),
// );

// // pase cookies
// app.use(cookieParser());

// //webhook
// app.post(
//   '/webhook',
//   express.raw({ type: 'application/json' }),
//   PaymentController.paymentStripeWebhookController,
// );

// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));

// //file retrieve
// app.use(express.static('uploads'));

// //router
// app.use('/api/v1', router);

// //live response
// app.get('/', (req: Request, res: Response) => {
//   res.send(
//     '<h1 style="text-align:center; color:#A55FEF; font-family:Verdana;">Jurnee start here....</h1>',
//   );
// });

// //global error handle
// app.use(globalErrorHandler);

// //*handle not found route;

// app.use(notFoundRoute);

// export default app;
