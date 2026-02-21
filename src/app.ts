import cors from 'cors';
import express, { Request, Response } from 'express';
import globalErrorHandler from './app/middlewares/globalErrorHandler';
import router from './routes';
import { Morgan } from './shared/morgen';
import notFoundRoute from './app/middlewares/notFoundRoute';
import { PaymentController } from './app/modules/payment/payment.controller';
import cookieParser from 'cookie-parser';

const app = express();

//morgan
app.use(Morgan.successHandler);
app.use(Morgan.errorHandler);

//body parser
app.use(
  cors({
    origin: ['*', 'http://localhost:3000', 'http://localhost:3001'],
    credentials: true,
  }),
);

// pase cookies
app.use(cookieParser());

//webhook
app.post(
  '/webhook',
  express.raw({ type: 'application/json' }),
  PaymentController.paymentStripeWebhookController,
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//file retrieve
app.use(express.static('uploads'));

//router
app.use('/api/v1', router);

//live response
app.get('/', (req: Request, res: Response) => {
  res.send(
    '<h1 style="text-align:center; color:#A55FEF; font-family:Verdana;">Jurnee start here....</h1>',
  );
});

//global error handle
app.use(globalErrorHandler);

//*handle not found route;

app.use(notFoundRoute);

export default app;
