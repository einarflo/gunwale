import { Router, Request, Response } from 'express';
import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { NodeHttpHandler } from '@aws-sdk/node-http-handler';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { requireAuth, getUserId } from '../middleware/auth';
import { prisma } from '../lib/prisma';
import sharp from 'sharp';
import { Readable } from 'stream';
import { logger } from '../lib/logger';
import https from 'https';

export const mediaRouter = Router();

const env = process.env as Record<string, string | undefined>;

const storageConfig = {
  endpoint: env.MINIO_ENDPOINT || 'https://media.tavl.no',
  region: env.MINIO_REGION || 'us-east-1',
  bucket: env.MINIO_BUCKET || 'tavl-media',
  accessKey: env.MINIO_ACCESS_KEY || 'minioadmin',
  secretKey: env.MINIO_SECRET_KEY || 'minioadmin',
  forcePathStyle: String(env.MINIO_FORCE_PATH_STYLE ?? 'true').toLowerCase() === 'true',
  allowInsecure: String(env.MINIO_ALLOW_INSECURE ?? 'true').toLowerCase() === 'true',
};

logger.info('media.storage.config', {
  endpoint: storageConfig.endpoint,
  region: storageConfig.region,
  bucket: storageConfig.bucket,
  forcePathStyle: storageConfig.forcePathStyle,
  allowInsecure: storageConfig.allowInsecure,
  hasCustomCredentials: Boolean(env.MINIO_ACCESS_KEY || env.MINIO_SECRET_KEY),
});

if (!(env.MINIO_ACCESS_KEY || env.MINIO_SECRET_KEY)) {
  logger.warn('MinIO credentials not provided, using defaults (minioadmin). Override with MINIO_ACCESS_KEY/MINIO_SECRET_KEY for production.');
}

const httpsAgent = storageConfig.allowInsecure
  ? new https.Agent({ rejectUnauthorized: false })
  : undefined;
if (storageConfig.allowInsecure) {
  logger.warn('MinIO TLS verification disabled (MINIO_ALLOW_INSECURE=true). Only use this in development.');
}

const s3 = new S3Client({
  region: storageConfig.region,
  endpoint: storageConfig.endpoint,
  credentials: { accessKeyId: storageConfig.accessKey, secretAccessKey: storageConfig.secretKey },
  forcePathStyle: storageConfig.forcePathStyle,
  requestHandler: httpsAgent ? new NodeHttpHandler({ httpsAgent }) : undefined,
});

function extFromType(ct: string) {
  if (!ct) return 'bin';
  if (ct.includes('png')) return 'png';
  if (ct.includes('jpeg')) return 'jpg';
  if (ct.includes('webp')) return 'webp';
  if (ct.includes('gif')) return 'gif';
  return 'bin';
}

function publicUrlForKey(key: string) {
  const base = storageConfig.endpoint || '';
  return base ? `${base.replace(/\/$/, '')}/${storageConfig.bucket}/${key}` : `/${storageConfig.bucket}/${key}`;
}

async function streamToBuffer(stream: Readable | ReadableStream<any> | Blob | null | undefined): Promise<Buffer> {
  if (!stream) return Buffer.from([]);
  if (Buffer.isBuffer(stream)) return stream;
  if (stream instanceof Readable) {
    const chunks: Buffer[] = [];
    for await (const chunk of stream) {
      chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
    }
    return Buffer.concat(chunks);
  }
  if (typeof (stream as any).arrayBuffer === 'function') {
    const arrBuffer = await (stream as any).arrayBuffer();
    return Buffer.from(arrBuffer);
  }
  throw new Error('Unsupported stream type');
}

type OptimizationResult = {
  buffer: Buffer;
  contentType: string;
  extension: string;
  originalSize: number;
  optimizedSize: number;
};

const MAX_DIMENSION = 1600;
const DEFAULT_QUALITY = 78;

async function optimizeImage(buffer: Buffer, mimeType?: string): Promise<OptimizationResult | null> {
  if (!buffer?.length) return null;

  const originalSize = buffer.length;
  const normalizedMime = mimeType?.toLowerCase?.() || '';
  const originalExtension = normalizedMime.includes('png')
    ? 'png'
    : normalizedMime.includes('webp')
    ? 'webp'
    : normalizedMime.includes('gif')
    ? 'gif'
    : normalizedMime.includes('jpeg') || normalizedMime.includes('jpg')
    ? 'jpg'
    : '';

  const instance = sharp(buffer, { failOnError: false }).rotate();
  const metadata = await instance.metadata();

  if (metadata.format === 'gif' && (metadata.pages || 0) > 1) {
    // Skip animated GIFs for now
    return {
      buffer,
      contentType: mimeType || 'image/gif',
      extension: originalExtension || 'gif',
      originalSize,
      optimizedSize: originalSize,
    };
  }

  let pipeline = sharp(buffer, { failOnError: false }).rotate().resize({
    width: MAX_DIMENSION,
    height: MAX_DIMENSION,
    fit: 'inside',
    withoutEnlargement: true,
  });

  let extension = 'webp';
  let contentType = 'image/webp';
  let quality = DEFAULT_QUALITY;

  if (mimeType?.includes('png') && metadata.hasAlpha === false) {
    // Non-transparent PNGs can be converted to JPEG to save more space
    extension = 'jpg';
    contentType = 'image/jpeg';
    quality = 82;
    pipeline = pipeline.jpeg({ quality, mozjpeg: true, progressive: true });
  } else if (mimeType?.includes('jpeg') || mimeType?.includes('jpg')) {
    extension = 'jpg';
    contentType = 'image/jpeg';
    quality = 82;
    pipeline = pipeline.jpeg({ quality, mozjpeg: true, progressive: true });
  } else if (mimeType?.includes('gif')) {
    extension = 'gif';
    contentType = 'image/gif';
    pipeline = sharp(buffer, { failOnError: false }).gif();
  } else if (mimeType?.includes('webp')) {
    extension = 'webp';
    contentType = 'image/webp';
    pipeline = pipeline.webp({ quality });
  } else {
    pipeline = pipeline.webp({ quality });
  }

  const optimized = await pipeline.toBuffer();
  const optimizedSize = optimized.length;

  if (optimizedSize === 0 || optimizedSize > originalSize) {
    return {
      buffer,
      contentType: mimeType || contentType,
      extension: originalExtension || extension,
      originalSize,
      optimizedSize: originalSize,
    };
  }

  return {
    buffer: optimized,
    contentType,
    extension,
    originalSize,
    optimizedSize,
  };
}

async function assertOwnershipForKey(userId: string, key: string) {
  if (!key) throw new Error('invalid_key');
  if (key.startsWith('games/')) {
    const segments = key.split('/');
    if (segments.length < 3) throw new Error('invalid_key');
    const gameSelector = segments[1];
    const game = await prisma.game.findFirst({ where: { uuid: gameSelector } });
    if (!game) throw new Error('not_found');
    if (!game.created_by || game.created_by !== userId) throw new Error('forbidden');
    return { kind: 'game', game };
  }
  if (key.startsWith('questions/')) {
    const segments = key.split('/');
    if (segments.length < 3) throw new Error('invalid_key');
    const selector = segments[1];
    const q = isNaN(Number(selector))
      ? await prisma.game_question.findFirst({ where: { uuid: selector } })
      : await prisma.game_question.findUnique({ where: { id: Number(selector) } });
    if (!q) throw new Error('not_found');
    const game = await prisma.game.findFirst({ where: { uuid: q.game_id } });
    if (!game) throw new Error('not_found');
    if (!game.created_by || game.created_by !== userId) throw new Error('forbidden');
    return { kind: 'question', question: q, game };
  }
  throw new Error('invalid_key');
}

mediaRouter.post('/presign', requireAuth(), async (req: Request, res: Response) => {
  try {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ error: 'unauthorized' });
    const { kind, id, contentType } = req.body || {};
    logger.debug('media.presign.request', { userId, kind, id, contentType, bucket: storageConfig.bucket, endpoint: storageConfig.endpoint });
    if (!kind || !id || !contentType) return res.status(400).json({ error: 'Missing kind/id/contentType' });

    const ct = String(contentType);
    const ext = extFromType(ct);
    let key = '';

    if (kind === 'gameCover') {
      const selector = String(id);
      const game = isNaN(Number(selector))
        ? await prisma.game.findFirst({ where: { uuid: selector } })
        : await prisma.game.findUnique({ where: { id: Number(selector) } });
      if (!game) return res.status(404).json({ error: 'Game not found' });
      if (!game.created_by || game.created_by !== userId) return res.status(403).json({ error: 'Not owner' });
      key = `games/${game.uuid}/cover_v1.${ext}`;
    } else if (kind === 'questionImage') {
      const selector = String(id);
      const q = isNaN(Number(selector))
        ? await prisma.game_question.findFirst({ where: { uuid: selector } })
        : await prisma.game_question.findUnique({ where: { id: Number(selector) } });
      if (!q) return res.status(404).json({ error: 'Question not found' });
      const game = await prisma.game.findFirst({ where: { uuid: q.game_id } });
      if (!game) return res.status(404).json({ error: 'Game not found' });
      if (!game.created_by || game.created_by !== userId) return res.status(403).json({ error: 'Not owner' });
      const ts = Date.now();
      key = `questions/${q.uuid || q.id}/${ts}.${ext}`;
    } else {
      return res.status(400).json({ error: 'Unknown kind' });
    }

    const put = new PutObjectCommand({ Bucket: storageConfig.bucket, Key: key, ContentType: ct, ACL: undefined });
    const putUrl = await getSignedUrl(s3, put, { expiresIn: 300 });
    const publicUrl = publicUrlForKey(key);
    logger.debug('media.presign.success', { key, publicUrl });
    res.json({ putUrl, key, publicUrl });
  } catch (e: any) {
    logger.error('media.presign.error', { message: e?.message || String(e), stack: e?.stack });
    res.status(500).json({ error: 'presign_failed', message: e?.message || String(e) });
  }
});

mediaRouter.post('/optimize', requireAuth(), async (req: Request, res: Response) => {
  try {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ error: 'unauthorized' });
    const { key } = req.body || {};
    logger.debug('media.optimize.request', { userId, key, bucket: storageConfig.bucket });
    if (!key || typeof key !== 'string') {
      return res.status(400).json({ error: 'missing_key' });
    }

    const objectKey = key as string;

    await assertOwnershipForKey(userId, objectKey);

    const originalObject = await s3.send(new GetObjectCommand({ Bucket: storageConfig.bucket, Key: objectKey }));
    const originalBuffer = await streamToBuffer(originalObject.Body as any);
    if (!originalBuffer.length) {
      return res.status(404).json({ error: 'not_found' });
    }

    const optimized = await optimizeImage(originalBuffer, originalObject.ContentType || undefined);
    if (!optimized) {
      return res.status(400).json({ error: 'optimize_failed' });
    }

    let finalKey = objectKey;
    if (optimized.extension && optimized.extension.length > 0) {
      finalKey = objectKey.includes('.')
        ? objectKey.replace(/\.[^/.]+$/, `.${optimized.extension}`)
        : `${objectKey}.${optimized.extension}`;
    }

    await s3.send(
      new PutObjectCommand({
        Bucket: storageConfig.bucket,
        Key: finalKey,
        Body: optimized.buffer,
        ContentType: optimized.contentType,
        CacheControl: 'public, max-age=31536000, immutable',
        ACL: undefined,
      }),
    );

    if (finalKey !== key) {
      try {
        await s3.send(new DeleteObjectCommand({ Bucket: storageConfig.bucket, Key: key }));
      } catch (_) {
        // ignore delete errors
      }
    }

    res.json({
      key: finalKey,
      publicUrl: publicUrlForKey(finalKey),
      contentType: optimized.contentType,
      originalSize: optimized.originalSize,
      optimizedSize: optimized.optimizedSize,
      optimized: optimized.optimizedSize <= optimized.originalSize,
    });
  } catch (e: any) {
    const message = e?.message || String(e);
    if (message === 'forbidden') return res.status(403).json({ error: 'forbidden' });
    if (message === 'not_found') return res.status(404).json({ error: 'not_found' });
    if (message === 'invalid_key') return res.status(400).json({ error: 'invalid_key' });
    logger.error('media.optimize.error', { message, stack: e?.stack });
    res.status(500).json({ error: 'optimize_failed', message });
  }
});
