import express, { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload, JwtHeader, SigningKeyCallback } from 'jsonwebtoken';
import jwksClient from 'jwks-rsa';
import { PrismaClient } from '@prisma/client';


const prisma = new PrismaClient();


const { KEYCLOAK_REALM = '', KEYCLOAK_URL = '', CLIENT_ID = '' } = process.env;

const jwksUri = `${KEYCLOAK_URL}/realms/${KEYCLOAK_REALM}/protocol/openid-connect/certs`;

const client = jwksClient({ jwksUri });

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
        audience: CLIENT_ID,
        issuer: `${KEYCLOAK_URL}/realms/${KEYCLOAK_REALM}`,
      },
      (err, decoded) => {
        if (err) {
          return reject(err);
        }
        resolve(decoded as JwtPayload);
      }
    );
  });
}

export const requireRole = (role: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ message: 'Missing Authorization header' });
    }
    const token = authHeader.split(' ')[1];
    try {
      const decoded = await verifyToken(token);
      const roles = (decoded as any)?.resource_access?.[CLIENT_ID]?.roles || [];
      if (roles.includes(role)) {
        (req as any).user = decoded;
        return next();
      }
      return res.status(403).json({ message: 'Forbidden' });
    } catch (err: any) {
      return res.status(401).json({ message: 'Invalid token', error: err.message });
    }
  };
};

const app = express();

app.get('/', (_req: Request, res: Response) => {
  res.json({ status: 'ok' });
});

app.get('/secure', requireRole('user'), (_req: Request, res: Response) => {
  res.json({ message: 'secure data' });
});

const port = process.env.PORT || 1337;
app.listen(port, () => {
  console.log(`Mothership listening on ${port}`);
});
