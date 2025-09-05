import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload, JwtHeader, SigningKeyCallback } from 'jsonwebtoken';
import { logger } from '../lib/logger';
import jwksClient from 'jwks-rsa';
import https from 'https';

const { KEYCLOAK_REALM = '', KEYCLOAK_URL = '', CLIENT_ID = '' } = process.env;

// Build JWKS URI and client lazily so missing envs are detected clearly
const jwksUri = `${KEYCLOAK_URL}/realms/${KEYCLOAK_REALM}/protocol/openid-connect/certs`;
const allowInsecure = process.env.ALLOW_INSECURE_JWKS === 'true';
const requestAgent = allowInsecure ? new https.Agent({ rejectUnauthorized: false }) : undefined;
if (allowInsecure) {
  logger.warn('JWKS TLS verification disabled for development', { jwksUri });
}
const client = jwksClient({ jwksUri, requestAgent });

function getKey(header: JwtHeader, callback: SigningKeyCallback) {
  client.getSigningKey(header.kid as string, (err, key) => {
    const signingKey = key?.getPublicKey();
    callback(err, signingKey);
  });
}

function verifyToken(token: string): Promise<JwtPayload | string> {
  return new Promise((resolve, reject) => {
    jwt.verify(
      token,
      getKey,
      {
        algorithms: ['RS256'],
        issuer: `${KEYCLOAK_URL}/realms/${KEYCLOAK_REALM}`,
      },
      (err, decoded) => {
        if (err) return reject(err);
        resolve(decoded as JwtPayload);
      }
    );
  });
}

export const requireAuth = () => {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!KEYCLOAK_URL || !KEYCLOAK_REALM || !CLIENT_ID) {
      return res.status(500).json({
        message: 'Auth not configured',
        error: 'Missing KEYCLOAK_URL/KEYCLOAK_REALM/CLIENT_ID env vars',
      });
    }
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ message: 'Missing Authorization header' });
    const token = authHeader.split(' ')[1];
    try {
      const decodedHeader = jwt.decode(token, { complete: true }) as any;
      if (!decodedHeader?.header?.kid) {
        return res.status(401).json({ message: 'Invalid token', error: 'Missing kid in token header' });
      }
      const decoded = await verifyToken(token);
      const allowedAudiences = (process.env.ALLOWED_AUDIENCES || CLIENT_ID)
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      const audClaim = (decoded as any)?.aud;
      const audList = Array.isArray(audClaim) ? audClaim : audClaim ? [audClaim] : [];
      const audOk = audList.some((a) => allowedAudiences.includes(a));
      if (!audOk) {
        logger.warn('JWT audience mismatch', { expected: allowedAudiences, got: audList });
        return res.status(401).json({ message: 'Invalid token', error: `jwt audience invalid. expected one of: ${allowedAudiences.join(', ')}, got: ${audList.join(', ') || '(none)'}` });
      }
      const decodedAny = decoded as any;
      const clients = Object.keys(decodedAny?.resource_access || {});
      logger.debug('Auth token decoded', { sub: decodedAny?.sub, aud: audList, clients });
      (req as any).user = decoded;
      return next();
    } catch (err: any) {
      return res.status(401).json({ message: 'Invalid token', error: err.message || String(err) });
    }
  };
};

// Keep role-based version for later use, but it's currently unused
export const requireRole = (role: string) => {
  const auth = requireAuth();
  return async (req: Request, res: Response, next: NextFunction) => {
    // First, authenticate
    await auth(req, res, async (err?: any) => {
      if (err) return; // response already sent
      try {
        const decodedAny = (req as any).user as any;
        const roles = decodedAny?.resource_access?.[CLIENT_ID]?.roles || [];
        if (roles.includes(role)) return next();
        logger.warn('Forbidden: required role missing', { clientId: CLIENT_ID, requiredRole: role, roles });
        return res.status(403).json({ message: 'Forbidden' });
      } catch (e: any) {
        return res.status(401).json({ message: 'Invalid token', error: e.message || String(e) });
      }
    });
  };
};

export function getUserId(req: Request): string | null {
  const user = (req as any).user as any;
  if (!user) return null;
  return user.sub || user.email || user.preferred_username || null;
}
