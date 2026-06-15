/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-undef */
import mongoose from 'mongoose';
import { Server } from 'socket.io';
import app from './app';
import config from './config';
import { socketHelper } from './helpers/socketHelper';
import { errorLogger, logger } from './shared/logger';
import seedAdmin from './DB';
import { startBoostCron } from './util/boostCorn';

mongoose.set('sanitizeFilter', true);

// Uncaught Exception
process.on('uncaughtException', error => {
  errorLogger.error('Uncaught Exception Detected', error);
  process.exit(1);
});

let server: ReturnType<typeof app.listen>;

const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  'https://test.joinjurnee.com',
  'https://joinjurnee.com',
  'https://dashboard.joinjurnee.com',
];

async function main() {
  try {
    await mongoose.connect(config.database_url as string);

    logger.info('🚀 Database connected successfully');

    const port =
      typeof config.port === 'number' ? config.port : Number(config.port);

    server = app.listen(port, '127.0.0.1', () => {
      logger.info(`♻️ Application listening on port: ${port}`);
    });

    await seedAdmin();

    startBoostCron();

    const io = new Server(server, {
      pingTimeout: 60000,
      cors: {
        origin: allowedOrigins,
        credentials: true,
      },
    });

    socketHelper.socket(io);

    // @ts-ignore
    global.io = io;
  } catch (error) {
    errorLogger.error('🤢 Failed to start application', error);
    process.exit(1);
  }
}

main();

// Unhandled Promise Rejection
process.on('unhandledRejection', error => {
  errorLogger.error('Unhandled Rejection Detected', error);

  if (server) {
    server.close(() => {
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
});

// Graceful Shutdown (PM2 / Docker / VPS)
process.on('SIGTERM', async () => {
  logger.info('SIGTERM RECEIVED');

  if (server) {
    server.close(async () => {
      await mongoose.connection.close();
      logger.info('Application terminated');
      process.exit(0);
    });
  }
});

// Ctrl + C
process.on('SIGINT', async () => {
  logger.info('SIGINT RECEIVED');

  await mongoose.connection.close();

  process.exit(0);
});

// /* eslint-disable @typescript-eslint/ban-ts-comment */
// /* eslint-disable @typescript-eslint/no-explicit-any */
// /* eslint-disable no-undef */
// import chalk from 'chalk';
// import mongoose from 'mongoose';
// import { Server } from 'socket.io';
// import app from './app';
// import config from './config';
// import { socketHelper } from './helpers/socketHelper';
// import { errorLogger, logger } from './shared/logger';
// import seedAdmin from './DB';
// import { startBoostCron } from './util/boostCorn';

// //uncaught exception
// process.on('uncaughtException', error => {
//   errorLogger.error('UnhandleException Detected', error);
//   process.exit(1);
// });

// let server: any;
// async function main() {
//   try {
//     await mongoose.connect(config.database_url as string);
//     logger.info(chalk.green('🚀 Database connected successfully'));

//     const port =
//       typeof config.port === 'number' ? config.port : Number(config.port);

//     server = app.listen(port, '0.0.0.0', () => {
//       logger.info(
//         chalk.yellow(`♻️  Application listening on port:${config.port}`),
//       );
//     });

//     await seedAdmin();
//     startBoostCron();

//     // update all posts  boostActivatedAt add this field and new date

//     //socket
//     const io = new Server(server, {
//       pingTimeout: 60000,
//       cors: {
//         origin: '*',
//       },
//     });
//     socketHelper.socket(io);
//     //@ts-ignore
//     global.io = io;
//   } catch (error) {
//     errorLogger.error(chalk.red('🤢 Failed to connect Database'));
//   }
// }

// main();

// //SIGTERM
// process.on('SIGTERM', () => {
//   logger.info('SIGTERM IS RECEIVE');
//   if (server) {
//     server.close();
//   }
// });
