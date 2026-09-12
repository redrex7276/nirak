import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'shramik-super-secret-persistent-jwt-key-2026';

export interface TokenPayload {
  userId: string;
  role: 'customer' | 'freelancer' | 'admin';
  email?: string;
  phone: string;
  name: string;
}

export function generateToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
  } catch {
    return null;
  }
}
