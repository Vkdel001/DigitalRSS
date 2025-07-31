import jwt, { JwtPayload, SignOptions } from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'supersecret';

export function generateToken(payload: object, expiresIn: string = '1d'): string {
  const options: SignOptions = { expiresIn: expiresIn as SignOptions['expiresIn'] };
  return jwt.sign(payload, JWT_SECRET, options);
}

export function verifyToken(token: string): string | JwtPayload {
  return jwt.verify(token, JWT_SECRET);
}
