import jwt, { JwtPayload, Secret, SignOptions } from 'jsonwebtoken';

const createToken = (payload: object, secret: Secret, expireTime: string) => {
  const options: SignOptions = { expiresIn: expireTime };
  return jwt.sign(payload, secret, options);
};

const verifyToken = (token: string, secret: Secret) => {
  try {
    return jwt.verify(token, secret) as JwtPayload;
  } catch (error) {
    // Optionally handle token verification errors here
    throw new Error('Invalid token');
  }
};

export const jwtHelper = { createToken, verifyToken };
