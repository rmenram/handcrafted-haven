import jwt, { type JwtPayload } from 'jsonwebtoken';

export type AuthTokenPayload = JwtPayload & {
  sub: string;
  email: string;
  name: string;
  role: 'purchaser' | 'artisan' | 'admin';
};

export function getJwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('Missing JWT_SECRET environment variable');
  }

  return secret;
}

export function signAuthToken(payload: AuthTokenPayload) {
  return jwt.sign(payload, getJwtSecret(), { expiresIn: '7d' });
}

export function verifyAuthToken(token: string) {
  return jwt.verify(token, getJwtSecret()) as AuthTokenPayload;
}
