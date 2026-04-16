# Jurnee App

Jurnee App is a TypeScript backend built with Express, MongoDB, Redis, Socket.IO, and Cloudinary. It powers a social and services marketplace style platform with authentication, user profiles, posts, comments, chat, bookings, offers, reviews, payments, notifications, and real-time updates.

**Developed by:** Md. Abdul Satter | Back-end Developer |

## Overview

The application is structured as a modular REST API with a single Express server, centralized error handling, request validation, caching utilities, file upload helpers, and a payment webhook entry point. It also seeds an initial admin account on startup and runs scheduled background jobs for post boosting.

## What This Project Does

- User registration, login, JWT-based authorization, and role-based access control.
- Profile management with file upload support through Cloudinary.
- Social features such as posts, likes, saves, followers, comments, and comment replies.
- Direct chat and real-time socket messaging.
- Notifications, support requests, reports, reviews, and interest management.
- Booking and offer workflows for marketplace-style transactions.
- Stripe checkout, webhook processing, and connected account setup.
- Redis-backed caching utilities for faster reads and lower database pressure.
- Scheduled cron jobs for post boosting and other background tasks.
- Content pages and policy routes for about, privacy, terms, and guidelines.

## Tech Stack

- Runtime: Node.js
- Framework: Express.js
- Language: TypeScript
- Database: MongoDB with Mongoose
- Cache: Redis via ioredis
- Realtime: Socket.IO
- File storage: Cloudinary and local upload access from the uploads directory
- Payments: Stripe and PayPal configuration support
- Validation: Zod
- Logging: Morgan and Winston

## Project Structure

```text
src/
├── app.ts
├── server.ts
├── app/
│   ├── builder/
│   ├── errors/
│   ├── interface/
│   ├── middlewares/
│   └── modules/
├── config/
├── DB/
├── enums/
├── helpers/
├── lib/
├── routes/
├── shared/
├── types/
└── util/
```

## API Modules

The API is mounted under `/api/v1` and includes these route groups:

- `/auth`
- `/user`
- `/follower`
- `/notification`
- `/terms`
- `/privacy`
- `/about`
- `/guidelines`
- `/post`
- `/like`
- `/save`
- `/report`
- `/review`
- `/comments`
- `/replies`
- `/chat`
- `/support`
- `/payments`
- `/bookings`
- `/interest`
- `/offer`

The root route `/` returns a simple health-style HTML response, and `/webhook` is reserved for Stripe webhook events.

## Key Features

### Authentication and Users

- JWT access and refresh token support.
- Admin seed creation on server start when no admin exists.
- User profile fields for location, payment accounts, and verification state.
- Password handling and account management helpers.

### Social and Content Features

- Post creation and management.
- Likes, saves, comments, and comment replies.
- Follower relationships.
- Interest tagging and reporting workflows.
- Review and support modules.

### Realtime and Messaging

- Socket.IO server attached to the HTTP server.
- Real-time chat event handling.
- Notification-related helpers and socket broadcast hooks.

### Payments and Monetization

- Stripe checkout session creation.
- Stripe webhook verification and payment persistence.
- Stripe Connect account setup for users.
- Offer payment transfer support.
- PayPal configuration support in the app config.

### Files and Media

- Cloudinary upload and delete helpers.
- Multer-based in-memory file handling.
- Public serving of the uploads directory.

### Caching and Performance

- Redis client setup with reusable cache helpers.
- GET response caching middleware with cache bypass support.
- Cache key utilities and pattern-based deletion.

### Background Jobs

- Cron-based boost job startup during application boot.

## Environment Variables

Create a `.env` file in the project root and provide the values used by `src/config/index.ts`:

- `PORT`
- `NODE_ENV`
- `IP_ADDRESS`
- `DATABASE_URL`
- `BCRYPT_SALT_ROUNDS`
- `JWT_SECRET`
- `JWT_EXPIRE_IN`
- `JWT_REFRESH_SECRET`
- `JWT_REFRESH_EXPIRES_IN`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `PAYPAL_CLIENT_ID`
- `PAYPAL_CLIENT_SECRET`
- `EMAIL_FROM`
- `EMAIL_USER`
- `EMAIL_PASS`
- `EMAIL_HOST`
- `EMAIL_PORT`
- `ADMIN_EMAIL`
- `ADMIN_PASSWORD`
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`
- `GOOGLE_MAPS`
- `GPT_API`
- `GPT_MODEL_URL`

Depending on the features you use, you may also need Redis connection settings in your local environment or container setup.

## Installation

### Prerequisites

- Node.js 18 or newer
- MongoDB
- Redis
- A Cloudinary account for file uploads
- Stripe credentials if you want to test payment flows

### Install Dependencies

```bash
npm install
```

### Configure Environment

Add a `.env` file with the variables listed above.

### Run Locally

```bash
npm run dev
```

This starts the app with `ts-node-dev` and reloads on file changes.

### Build for Production

```bash
npm run build
npm start
```

## Available Scripts

- `npm run dev` - Start the server in development mode.
- `npm run build` - Compile TypeScript to `dist`.
- `npm start` - Run the compiled server.
- `npm run lint` - Check source files with ESLint.
- `npm run lint:fix` - Auto-fix lint issues.
- `npm run prettier` - Format source files with Prettier.
- `npm run prettier:fix` - Format source files using the project Prettier command.

## Runtime Notes

- The app listens on `0.0.0.0` and uses the configured `PORT` value.
- CORS is enabled for local development and the production Jurnee domains configured in `src/app.ts`.
- The payment webhook is mounted before the JSON body parser so Stripe can read the raw request body.
- Static files are served from `uploads`.

## API Base URL

All versioned routes are served from:

```text
/api/v1
```

Example:

```text
/api/v1/auth
```

## Notes For Contributors

- Keep module logic inside the matching feature folder under `src/app/modules`.
- Add validation beside the route or module that owns the endpoint.
- Prefer shared helpers for cross-cutting concerns such as logging, file handling, caching, and response formatting.
- Preserve the existing error handling pipeline when adding new endpoints.

## License

ISC

## Author

Md. Abdul Satter
