import { JwtPayload } from 'jsonwebtoken';

declare global {
  namespace Express {
    interface Request {
      user: JwtPayload;
      rateLimit?: {
        limit: number;
        used: number;
        remaining: number;
        resetTime?: Date;
      };
    }
  }
}
